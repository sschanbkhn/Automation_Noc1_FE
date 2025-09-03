// import { configureStore } from "@reduxjs/toolkit";
// import alertReducer from "../redux/Alert/alertSlice";
// import dnsReducer from "../redux/Dns/dnsSlice";
// import psCoreReducer from "../redux/Healthcheck/healthcheckSlice";
// import platformDeviceReducer from "../redux/Healthcheck/platformDeviceSlice";
// import snocReducer from "../redux/Healthcheck/snocSlice";
// import hostsReducer from "../redux/Hosts/hostsSlice";
// import kpiReducer from "../redux/KPI/kpiSlice"; // 👈 mới
// import genericScheduleReducer from "../redux/KPI/genericScheduleSlice";
// const snocStore = configureStore({
//   reducer: {
//     snoc: snocReducer,
//     pscore: psCoreReducer,
//     alert: alertReducer,
//     platformDevice: platformDeviceReducer,
//     dns: dnsReducer,
//     hosts: hostsReducer,
//     kpi: kpiReducer,
//     genericSchedule: genericScheduleReducer,
//   },
// });

// // 👇 Xuất kiểu RootState để dùng ở component
// export type RootState = ReturnType<typeof snocStore.getState>;
// export type AppDispatch = typeof snocStore.dispatch;

// export default snocStore;

// src/components/SNOC/store/snocStore.ts
import { configureStore } from "@reduxjs/toolkit";

import alertReducer from "../redux/Alert/alertSlice";
import dnsReducer from "../redux/Dns/dnsSlice";
import psCoreReducer from "../redux/Healthcheck/healthcheckSlice";
import platformDeviceReducer from "../redux/Healthcheck/platformDeviceSlice";
import snocReducer from "../redux/Healthcheck/snocSlice";
import hostsReducer from "../redux/Hosts/hostsSlice";
import genericScheduleReducer from "../redux/KPI/genericScheduleSlice";
import kpiReducer from "../redux/KPI/kpiSlice";

// ✅ Auth slice (account)
import accountReducer, {
  ACCOUNT_INITIALIZE,
  LOGOUT,
} from "../redux/User/authSlice";

// ✅ Unauthorized hook (401) từ API
import { getSnocToken, onSnocUnauthorized } from "../api/snocApiWithAutoToken";
import departmentReducer from "./../redux/User/departmentSlice";
import groupReducer from "./../redux/User/groupSlice";
import userReducer from "./../redux/User/userSlice";
import modalReducer from "./modalReducer";

const snocStore = configureStore({
  reducer: {
    account: accountReducer, // KHÔNG persist ở store (token đã được API persist trong sessionStorage)
    snoc: snocReducer,
    pscore: psCoreReducer,
    alert: alertReducer,
    platformDevice: platformDeviceReducer,
    dns: dnsReducer,
    hosts: hostsReducer,
    kpi: kpiReducer,
    genericSchedule: genericScheduleReducer,
    userStates: userReducer,
    group: groupReducer,
    department: departmentReducer,
    modalState: modalReducer,
  },
});

// Khi API trả 401 -> tự logout FE
onSnocUnauthorized(() => snocStore.dispatch(LOGOUT()));

// (Tuỳ chọn) Khởi tạo trạng thái đăng nhập từ sessionStorage của snocApi
const bootToken = getSnocToken();
if (bootToken) {
  snocStore.dispatch(
    ACCOUNT_INITIALIZE({
      isLoggedIn: true,
      token: bootToken,
      // user: null, // có thể gọi API /me để lấy user sau
    })
  );
}

export type RootState = ReturnType<typeof snocStore.getState>;
export type AppDispatch = typeof snocStore.dispatch;
export default snocStore;
