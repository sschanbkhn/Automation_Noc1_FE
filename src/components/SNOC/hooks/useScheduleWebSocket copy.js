// src/hooks/useScheduleWebSocket.js
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { showTemporaryAlert } from "../redux/Alert/alertSlice";
import {
  setWebSocketStatus,
  updateLastRunAt,
  updateSystemStatusPatch,
  upsertLatestFromClient,
  wsMergeHourlyItems, // 👈 NHẬN GÓI CHART REALTIME
} from "../redux/Healthcheck/healthcheckSlice";


const BASE_WS_URL =
  process.env.REACT_APP_SNOC_WS_URL || "ws://localhost:8000/ws";
const WS_URL = `${BASE_WS_URL}/healthcheck/`;

const RECONNECT_INTERVAL = 5000;

const useScheduleWebSocket = () => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(null);
  const [hasEverConnected, setHasEverConnected] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = () => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      if (!isMountedRef.current) return;

      setIsConnected(true);
      setHasEverConnected(true);
      dispatch(setWebSocketStatus(true));
    };

    socket.onmessage = (event) => {
      if (!isMountedRef.current) return;

      try {
        const data = JSON.parse(event.data);
        console.log("📥 WebSocket message:", data);

        // 1) Cập nhật last_run_at của schedule (nếu có)
        if (data.schedule_name && data.last_run_at) {
          dispatch(
            updateLastRunAt({
              name: data.schedule_name,
              status: data.status,
              last_run_at: data.last_run_at,
            })
          );
        }

        // 2) Patch subsystem trên dashboard (system_status_patch)
        if (data.type === "system_status_patch" && data.payload) {
          dispatch(updateSystemStatusPatch(data.payload));
          dispatch(
            showTemporaryAlert({
              type: "success",
              message: `🔁 Subsystem "${data.payload.subsystem}" trong nhóm "${data.payload.group}" vừa được cập nhật.`,
            })
          );
          return; // tránh rơi qua các nhánh khác
        }

        // 3) 🔥 Dữ liệu biểu đồ NOK theo giờ (realtime) từ schedule/manual
        if (data.type === "hourly_items" && Array.isArray(data.items)) {
          // Merge theo platform; reducer sẽ dedup host|hour|platform + prune > 24h
          dispatch(
            wsMergeHourlyItems({ items: data.items, platform: data.platform })
          );
          return;
        }

        // 4) ✅ Last Test (delta): cập nhật bảng latest theo WS
        //    BE có thể gửi ở top-level hoặc lồng trong { data: {...} } → unwrap nhẹ:
        const d = data?.type ? data : data?.data || {};
        if (d?.type === "lasttest_patch" && d?.mode === "delta") {
          const items = Array.isArray(d.items) ? d.items : [];
          for (const it of items) {
            // Đảm bảo platform có giá trị (fallback từ frame ngoài)
            const platform =
              (typeof it.platform === "string" && it.platform) ||
              (typeof d.platform === "string" && d.platform) ||
              "";
            dispatch(
              upsertLatestFromClient({
                host: it.host,
                ip: it.ip ?? "",
                platform,
                status: it.status,
                notes: it.notes,
                result_file: it.result_file,
                starttime: it.starttime,
                endtime: it.endtime,
                excluded:
                  typeof it.excluded === "boolean" ? it.excluded : false,
              })
            );
          }
          return;
        }

        // (tuỳ chọn) xử lý thêm các loại message khác (causecode_result, logs, ...)
      } catch (err) {
        console.error("❌ JSON parse error:", err);
      }
    };

    socket.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      if (!isMountedRef.current) return;

      setIsConnected(false);
      dispatch(setWebSocketStatus(false));
      reconnect();
    };

    socket.onerror = () => {
      // Kích hoạt onclose để reconnect
      try {
        socket.close();
      } catch (_) {}
    };
  };

  const reconnect = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
  };

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      try {
        if (socketRef.current) socketRef.current.close();
      } catch (_) {}
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isConnected, hasEverConnected };
};

export default useScheduleWebSocket;
