import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Toast } from "react-bootstrap";
import { hideAlert } from "../../redux/Alert/alertSlice";
import styles from "./../../styles/SystemHealth.module.scss"; // ✅ import scss module

const Alert = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alert.alerts);

  if (!alerts.length) return null;

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
            : styles.toastInfo;

        return (
          <Toast
            key={alert.id}
            className={toastClass}
            onClose={() => dispatch(hideAlert(alert.id))}
            show={true}
            delay={5000}
            autohide
          >
            <Toast.Body>{alert.message}</Toast.Body>
          </Toast>
        );
      })}
    </div>
  );
};

export default Alert;
