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
    const socket = new WebSocket("ws://localhost:8000/ws/healthcheck/");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.schedule_name && data.last_run_at) {
        console.log("✅ Dispatching updateLastRunAt:", data);
        dispatch(
          updateLastRunAt({
            name: data.schedule_name,
            status: data.status,
            last_run_at: data.last_run_at,
          })
        );
      } else {
        console.warn("⚠️ Không có last_run_at hoặc schedule_name", data);
      }
    };

    return () => socket.close();
  }, [dispatch]);
};

export default useScheduleWebSocket;

const socket = new WebSocket("ws://localhost:8000/ws/healthcheck/");

socket.onopen = () => console.log("✅ Connected to backend WebSocket");
socket.onmessage = (e) => {
  console.log("📡 Message from backend:", e.data);
};
socket.onerror = (err) => console.error("❌ WebSocket error:", err);
socket.onclose = () => console.warn("⚠️ WebSocket closed");
