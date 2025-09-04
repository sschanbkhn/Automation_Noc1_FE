import React from "react";
import { useSelector } from "react-redux";

const WebSocketStatusBanner = () => {
  const websocketConnected = useSelector((state) => {
    // Kiểm tra xem store có SNOC structure không
    if (!state || !state.pscore) {
      console.warn('SNOC Redux store not found, WebSocketStatusBanner disabled');
      return null;
    }
    return state.pscore.websocketConnected;
  });

  // Khi vừa khởi động hoặc không có store, chưa biết gì thì không hiển thị
  if (websocketConnected === null || websocketConnected === undefined) return null;

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
