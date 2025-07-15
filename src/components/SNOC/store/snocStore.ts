import { configureStore } from "@reduxjs/toolkit";
import snocReducer from "../redux/Healthcheck/snocSlice";
import psCoreReducer from "../redux/Healthcheck/healthcheckSlice";
import alertReducer from "../redux/Alert/alertSlice";
import platformDeviceReducer from "../redux/Healthcheck/platformDeviceSlice";
import dnsReducer from "../redux/Dns/dnsSlice";
const snocStore = configureStore({
  reducer: {
    snoc: snocReducer,
    pscore: psCoreReducer,
    alert: alertReducer,
    platformDevice: platformDeviceReducer,
    dns: dnsReducer,
  },
});

// 👇 Xuất kiểu RootState để dùng ở component
export type RootState = ReturnType<typeof snocStore.getState>;
export type AppDispatch = typeof snocStore.dispatch;

export default snocStore;
