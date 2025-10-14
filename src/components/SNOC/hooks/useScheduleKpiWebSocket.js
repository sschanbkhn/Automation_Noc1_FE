import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setWebSocketStatus } from "../redux/Healthcheck/healthcheckSlice";
import { wsUpsertScheduleStatus } from "../redux/KPI/genericScheduleSlice"; // chỉnh path nếu khác

const BASE_WS = process.env.REACT_APP_SNOC_WS_URL || "ws://localhost:8000/ws";
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

  const attemptRef = useRef(0);
  const baseDelay = 1500;
  const maxDelay = 15000;

  const log = (...args) => {
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

      log("📥 WS(schedule) raw:", event.data);

      try {
        const data = JSON.parse(event.data);
        log("📦 WS(schedule) parsed:", data);

        const isScheduleMsg = data?.type === "schedule_status";
        const scheduleName =
          data?.schedule_name || data?.name || data?.task_name || null;
        const lastRunAt =
          data?.last_run_at || data?.finished_at || data?.timestamp || null;
        const status = data?.status || data?.last_run_status || null;
        const usecase = data?.usecase || null; // "kpi"
        const action = data?.action || null;   // "causecode" | ...
        const result_summary = data?.result_summary;
        const platform = data?.platform;

        log("🔎 extracted:", {
          usecase,
          action,
          scheduleName,
          lastRunAt,
          status,
          platform,
          has_summary: !!result_summary,
        });

        if ((isScheduleMsg || (scheduleName && lastRunAt)) && scheduleName) {
          dispatch(
            wsUpsertScheduleStatus({
              usecase,
              action,
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
      try {
        ws.close();
      } catch (_) {}
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    connect();

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
