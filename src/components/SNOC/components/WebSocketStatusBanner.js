// import React from "react";
// import { useSelector } from "react-redux";

// const WebSocketStatusBanner = () => {
//   const websocketConnected = useSelector(
//     (state) => state.pscore.websocketConnected
//   );

//   // Khi vừa khởi động, chưa biết gì thì không hiển thị
//   if (websocketConnected === null) return null;

//   if (!websocketConnected) {
//     return (
//       <div className="alert alert-danger text-center m-0 py-2">
//         🔌 Mất kết nối WebSocket! Đang thử kết nối lại...
//       </div>
//     );
//   }

//   return null;
// };

// export default WebSocketStatusBanner;


import React from "react";
import { useSelector } from "react-redux";

/**
 * Hiển thị banner trạng thái WebSocket.
 * - Đọc an toàn từ nhiều key slice khác nhau để tránh undefined khi slice chưa mount.
 * - Không hiển thị gì khi trạng thái chưa xác định (null/undefined).
 */
const WebSocketStatusBanner = () => {
  // Thử nhiều đường dẫn state để tránh crash nếu đổi tên slice/field
  const selectWebsocketConnected = (state) =>
    state.pscore?.websocketConnected ??
    state.websocket?.websocketConnected ?? // nếu slice tên 'websocket'
    state.websocket?.connected ??          // nếu field là 'connected'
    null;

  const websocketConnected = useSelector(selectWebsocketConnected);

  // Khi chưa biết gì (null/undefined) thì không hiển thị
  if (websocketConnected == null) return null;

  // Mất kết nối
  if (!websocketConnected) {
    return (
      <div className="alert alert-danger text-center m-0 py-2" role="alert">
        🔌 Mất kết nối WebSocket! Đang thử kết nối lại...
      </div>
    );
  }

  // Đang/đã kết nối: không hiển thị banner
  return null;
};

export default WebSocketStatusBanner;
