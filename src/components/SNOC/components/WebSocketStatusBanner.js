import React from "react";
import { useSelector } from "react-redux";

const WebSocketStatusBanner = () => {
  const websocketConnected = useSelector(
    (state) => state.pscore.websocketConnected
  );

  // Khi vừa khởi động, chưa biết gì thì không hiển thị
  if (websocketConnected === null) return null;

  if (!websocketConnected) {
    return (
      <div className="alert alert-danger text-center m-0 py-2">
        🔌 Mất kết nối WebSocket! Đang thử kết nối lại...
      </div>
    );
  }

  return null;
};

export default WebSocketStatusBanner;
