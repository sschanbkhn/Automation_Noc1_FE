import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  updateLastRunAt,
  setWebSocketStatus,
  updateSystemStatusPatch, // ✅ Thêm action mới
} from "../redux/Healthcheck/healthcheckSlice";
import { showTemporaryAlert } from "../redux/Alert/alertSlice"; // ✅ Thêm action mới
const WS_URL = "ws://10.155.43.201:8000/ws/healthcheck/";
const RECONNECT_INTERVAL = 5000;

const useScheduleWebSocket = () => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(null);
  const [hasEverConnected, setHasEverConnected] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true); // ✅ để kiểm tra còn mounted không

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
        console.log("📥 WebSocket message:", data); // ✅ Debug mọi gói tin

        // ✅ Cập nhật last_run_at của schedule
        if (data.schedule_name && data.last_run_at) {
          dispatch(
            updateLastRunAt({
              name: data.schedule_name,
              status: data.status,
              last_run_at: data.last_run_at,
            })
          );
        }

        // ✅ Cập nhật dashboard subsystem (patch update)
        if (data.type === "system_status_patch" && data.payload) {
          dispatch(updateSystemStatusPatch(data.payload));
          dispatch(
            showTemporaryAlert({
              type: "success",
              message: `🔁 Subsystem "${data.payload.subsystem}" trong nhóm "${data.payload.group}" vừa được cập nhật.`,
            })
          );
        }
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
      socket.close(); // Kích hoạt onclose để reconnect
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
      if (socketRef.current) socketRef.current.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isConnected, hasEverConnected };
};

export default useScheduleWebSocket;
