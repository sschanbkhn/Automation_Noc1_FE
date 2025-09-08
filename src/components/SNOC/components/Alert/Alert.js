// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Toast } from "react-bootstrap";
// import { hideAlert } from "../../redux/Alert/alertSlice";
// import styles from "./../../styles/SystemHealth.module.scss"; // ✅ import scss module

// const Alert = () => {
//   const dispatch = useDispatch();
//   const alerts = useSelector((state) => state.alert.alerts);

//   if (!alerts.length) return null;

//   return (
//     <div
//       className="toast-container position-fixed top-0 end-0 p-3"
//       style={{ zIndex: 1050 }}
//     >
//       {alerts.map((alert) => {
//         const toastClass =
//           alert.type === "success"
//             ? styles.toastSuccess
//             : alert.type === "warning"
//             ? styles.toastWarning
//             : alert.type === "error"
//             ? styles.toastDanger
//             : styles.toastInfo;

//         return (
//           <Toast
//             key={alert.id}
//             className={toastClass}
//             onClose={() => dispatch(hideAlert(alert.id))}
//             show={true}
//             delay={5000}
//             autohide
//           >
//             <Toast.Body>{alert.message}</Toast.Body>
//           </Toast>
//         );
//       })}
//     </div>
//   );
// };

// export default Alert;

import React from "react";
import { Toast } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert } from "../../redux/Alert/alertSlice";
import styles from "./../../styles/SystemHealth.module.scss";

/**
 * Hiển thị toast alerts (success / warning / error / info).
 * - Đọc an toàn từ state.alert?.alerts; fallback về state.alerts nếu cấu trúc khác.
 * - Không crash khi slice chưa mount (mặc định mảng rỗng).
 */
const Alert = () => {
  const dispatch = useDispatch();

  // Đọc an toàn + fallback
  const alerts = useSelector(
    (state) => state.alert?.alerts ?? state.alerts ?? []
  );

  if (!alerts || alerts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1050 }}
    >
      {alerts.map((alert) => {
        const toastClass =
          alert.type === "success"
            ? styles.toastSuccess
            : alert.type === "warning"
            ? styles.toastWarning
            : alert.type === "error"
            ? styles.toastDanger
            : styles.toastInfo; // default: info

        return (
          <Toast
            key={alert.id}
            className={toastClass}
            onClose={() => dispatch(hideAlert(alert.id))}
            show={true}
            delay={5000}
            autohide
            role="alert"
          >
            <Toast.Body>{alert.message}</Toast.Body>
          </Toast>
        );
      })}
    </div>
  );
};

export default Alert;
