// src/hooks/useScheduleKpiWebSocket.js
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
// Banner WS (tuỳ chọn dùng khi silent=false) vẫn dùng từ Healthcheck slice:
import { setWebSocketStatus } from "../redux/Healthcheck/healthcheckSlice";
// Cập nhật trạng thái schedule (last_run_at/status) vào GenericSchedule slice:
import { wsUpsertScheduleStatus } from "../redux/KPI/genericScheduleSlice";

const BASE_WS = "ws://10.155.43.201:8000/ws/";

/**
 * WS chỉ nghe trạng thái schedule:
 *  - endpoint: "schedule"  -> khớp với re_path(r"^ws/schedule/$", ...)
 *  - silent: true          -> không động vào banner toàn cục
 *
 * Server message chấp nhận (ví dụ):
 *  {
 *    "type": "schedule_status",
 *    "usecase": "kpi" | "causecode",
 *    "schedule_name": "pgw_cc_native",
 *    "platform": "pgw",
 *    "last_run_at": "2025-08-23T10:22:00+07:00",
 *    "status": "success",
 *    "result_summary": "..."
 *  }
 */
export default function useScheduleKpiWebSocket({
  endpoint = "schedule",
  silent = true,
} = {}) {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(null);
  const [hasEverConnected, setHasEverConnected] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const hbRef = useRef(null);
  const isMountedRef = useRef(true);

  // exponential backoff
  const attemptRef = useRef(0);
  const baseDelay = 1500;
  const maxDelay = 15000;

  const log = (...args) => {
    // BỎ điều kiện nếu muốn log cả ở production
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hbRef.current) clearInterval(hbRef.current);
  };

  const scheduleReconnect = () => {
    clearTimers();
    const n = ++attemptRef.current;
    const delay = Math.min(maxDelay, baseDelay * Math.pow(2, n - 1));
    const jitter = Math.floor(Math.random() * 500);
    const wait = delay + jitter;
    log(`🕘 WS(schedule) retry #${n} in ${wait}ms`);
    timerRef.current = setTimeout(connect, wait);
  };

  const startHeartbeat = (ws) => {
    hbRef.current = setInterval(() => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }
      } catch (_) {}
    }, 30000);
  };

  const connect = () => {
    const url = `${BASE_WS}${endpoint}/`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      if (!silent) dispatch(setWebSocketStatus(true));
      setIsConnected(true);
      setHasEverConnected(true);
      attemptRef.current = 0;
      startHeartbeat(ws);
      log(`✅ WS(schedule) connected: ${url}`);
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;

      // Log raw message trước khi parse
      log("📥 WS(schedule) raw:", event.data);

      try {
        const data = JSON.parse(event.data);

        // Log payload đã parse để kiểm tra backend gửi gì (đặc biệt 'usecase')
        log("📦 WS(schedule) parsed:", data);

        const isScheduleMsg = data?.type === "schedule_status";
        const scheduleName =
          data?.schedule_name || data?.name || data?.task_name || null;
        const lastRunAt =
          data?.last_run_at || data?.finished_at || data?.timestamp || null;
        const status = data?.status || data?.last_run_status || null;
        const usecase = data?.usecase || null;
        const result_summary = data?.result_summary;
        const platform = data?.platform;

        // Log các field đã trích xuất
        log("🔎 extracted:", {
          usecase,
          scheduleName,
          lastRunAt,
          status,
          platform,
          has_summary: !!result_summary,
        });

        // Chỉ cần có tên + (type=schedule_status hoặc có lastRunAt) là cập nhật
        if ((isScheduleMsg || (scheduleName && lastRunAt)) && scheduleName) {
          dispatch(
            wsUpsertScheduleStatus({
              usecase,
              name: scheduleName,
              last_run_at: lastRunAt,
              status,
              result_summary,
              platform,
            })
          );
          log("🛠️ dispatched wsUpsertScheduleStatus()");
        } else {
          log("ℹ️ message ignored (not a schedule status or missing fields)");
        }
      } catch (err) {
        console.error("❌ WS(schedule) JSON parse error:", err);
      }
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      if (!silent) dispatch(setWebSocketStatus(false));
      setIsConnected(false);
      clearTimers();
      log(`⚠️ WS(schedule) closed: ${endpoint}`);
      scheduleReconnect();
    };

    ws.onerror = () => {
      // Cho onclose xử lý retry
      try {
        ws.close();
      } catch (_) {}
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    // Reconnect ngay khi mạng trở lại
    const onOnline = () => {
      if (!isMountedRef.current) return;
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        attemptRef.current = 0;
        clearTimers();
        log("🌐 browser online → reconnect now");
        connect();
      }
    };
    window.addEventListener("online", onOnline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("online", onOnline);
      clearTimers();
      try {
        socketRef.current?.close();
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, silent]);

  return { isConnected, hasEverConnected };
}
