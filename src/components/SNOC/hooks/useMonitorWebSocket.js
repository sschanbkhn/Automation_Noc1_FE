// src/hooks/useMonitorWebSocket.js  — FILE MỚI
// Theo đúng pattern của useScheduleWebSocket.js
import { useEffect, useRef, useState } from "react";
import { getSnocToken } from "../api/snocApiWithAutoToken";

const BASE_WS_URL = process.env.REACT_APP_SNOC_WS_URL || "ws://localhost:8000/ws";
const RECONNECT_INTERVAL = 5000;

/**
 * Hook WebSocket live cho admin monitor dashboard.
 * ws://<server>/ws/monitor/?token=<jwt>
 *
 * @param {Function} onSnapshot - callback(data, trigger) khi nhận snapshot mới
 * @param {Function} onJobDone  - callback(job_id) khi job async xong
 */
const useMonitorWebSocket = (onSnapshot, onJobDone) => {
  const [isConnected,     setIsConnected]     = useState(false);
  const [hasEverConnected,setHasEverConnected] = useState(false);

  const socketRef    = useRef(null);
  const timerRef     = useRef(null);
  const isMountedRef = useRef(true);

  const connect = () => {
    const token  = getSnocToken();
    const WS_URL = `${BASE_WS_URL}/monitor/?token=${token}`;

    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      if (!isMountedRef.current) return;
      console.log("✅ Monitor WebSocket connected");
      setIsConnected(true);
      setHasEverConnected(true);
    };

    socket.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "snapshot") {
          onSnapshot?.(msg.data, msg.trigger || "");
        }
        if (msg.type === "job.done") {
          onJobDone?.(msg.job_id);
        }
      } catch (err) {
        console.error("❌ Monitor WS parse error:", err);
      }
    };

    socket.onclose = () => {
      if (!isMountedRef.current) return;
      console.warn("⚠️ Monitor WebSocket closed — reconnecting in 5s");
      setIsConnected(false);
      reconnect();
    };

    socket.onerror = () => {
      // onerror luôn được theo bởi onclose → để reconnect xử lý
      try { socket.close(); } catch (_) {}
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
      try { if (socketRef.current) socketRef.current.close(); } catch (_) {}
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendRefresh = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "refresh" }));
    }
  };

  return { isConnected, hasEverConnected, sendRefresh };
};

export default useMonitorWebSocket;
