// alertSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./../../store/snocStore"; // cập nhật đường dẫn chính xác tới store của bạn nếu cần

// Định nghĩa kiểu dữ liệu alert
interface Alert {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
}

// Kiểu state
interface AlertState {
  alerts: Alert[];
}

const initialState: AlertState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (
      state,
      action: PayloadAction<Omit<Alert, "id" | "visible"> & { id?: number }>
    ) => {
      const newAlert: Alert = {
        id: action.payload.id ?? Date.now(),
        message: action.payload.message,
        type: action.payload.type,
        visible: true,
      };
      state.alerts.push(newAlert);
    },
    hideAlert: (state, action: PayloadAction<number>) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;

// Thunk action để hiển thị alert tạm thời
export const showTemporaryAlert =
  (alertData: Omit<Alert, "id" | "visible">, timeout = 3000) =>
  (dispatch: AppDispatch) => {
    const id = Date.now();
    dispatch(showAlert({ ...alertData, id }));
    setTimeout(() => {
      dispatch(hideAlert(id));
    }, timeout);
  };

export default alertSlice.reducer;
