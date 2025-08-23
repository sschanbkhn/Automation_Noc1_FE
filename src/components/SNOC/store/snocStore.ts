import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "../redux/Alert/alertSlice";
import dnsReducer from "../redux/Dns/dnsSlice";
import psCoreReducer from "../redux/Healthcheck/healthcheckSlice";
import platformDeviceReducer from "../redux/Healthcheck/platformDeviceSlice";
import snocReducer from "../redux/Healthcheck/snocSlice";
import hostsReducer from "../redux/Hosts/hostsSlice";
import kpiReducer from "../redux/KPI/kpiSlice"; // 👈 mới
import genericScheduleReducer from "../redux/KPI/genericScheduleSlice";
const snocStore = configureStore({
  reducer: {
    snoc: snocReducer,
    pscore: psCoreReducer,
    alert: alertReducer,
    platformDevice: platformDeviceReducer,
    dns: dnsReducer,
    hosts: hostsReducer,
    kpi: kpiReducer,
    genericSchedule: genericScheduleReducer,
  },
});

// 👇 Xuất kiểu RootState để dùng ở component
export type RootState = ReturnType<typeof snocStore.getState>;
export type AppDispatch = typeof snocStore.dispatch;

export default snocStore;
