import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateLastRunAt } from "../redux/Healthcheck/healthcheckSlice";

/*
const useScheduleWebSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("⚠️ WebSocket tạm thời được disable");

    // Tạm thời không làm gì, chỉ return cleanup function rỗng
    return () => {
      // Cleanup rỗng
    };
  }, [dispatch]);

  // Return empty object hoặc null
  return {};
};

export default useScheduleWebSocket;

*/

const useScheduleWebSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {

  }, [dispatch]);
};

export default useScheduleWebSocket;

// const socket = new WebSocket("ws://localhost:8000/ws/healthcheck/");

// socket.onopen = () => console.log("✅ Connected to backend WebSocket");
// socket.onmessage = (e) => {
//   console.log("📡 Message from backend:", e.data);
// };
// socket.onerror = (err) => console.error("❌ WebSocket error:", err);
// socket.onclose = () => console.warn("⚠️ WebSocket closed");
