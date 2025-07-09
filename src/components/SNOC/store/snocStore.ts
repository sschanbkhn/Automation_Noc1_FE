import { configureStore } from "@reduxjs/toolkit";
import snocReducer from "../redux/Healthcheck/snocSlice";
import psCoreReducer from "../redux/Healthcheck/healthcheckSlice";
import alertReducer from "../redux/Alert/alertSlice";
const snocStore = configureStore({
  reducer: {
    snoc: snocReducer,
    pscore: psCoreReducer,
    alert: alertReducer,
  },
});

// 👇 Xuất kiểu RootState để dùng ở component
export type RootState = ReturnType<typeof snocStore.getState>;
export type AppDispatch = typeof snocStore.dispatch;

export default snocStore;
