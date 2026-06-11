// src/components/SNOC/store/snocStore.ts
import { configureStore } from "@reduxjs/toolkit";

import alertReducer from "../redux/Alert/alertSlice";
import dnsReducer from "../redux/Dns/dnsSlice";
import psCoreReducer from "../redux/Healthcheck/healthcheckSlice";
import dhttReducer from "../redux/Healthcheck/dhttSlice";
import platformDeviceReducer from "../redux/Healthcheck/platformDeviceSlice";
import snocReducer from "../redux/Healthcheck/snocSlice";
import hostsReducer from "../redux/Hosts/hostsSlice";
import genericScheduleReducer from "../redux/KPI/genericScheduleSlice";
import kpiReducer from "../redux/KPI/kpiSlice";
import kpiScheduleReducer from "../redux/KPI/kpiScheduleSlice";

// ✅ Auth slice (account)
import accountReducer, {
  ACCOUNT_INITIALIZE,
  LOGOUT,
} from "../redux/User/authSlice";

// ✅ Unauthorized hook (401) từ API
import { getSnocToken, onSnocUnauthorized } from "../api/snocApiWithAutoToken";
import outputIgnoreReducer from "../redux/Healthcheck/outputIgnoreSlice";
import kpiPinnedReducer from "../redux/KPI/kpiPinnedSlice";
import pinnedReducer from "../redux/KPI/pinnedKpisSlice";
import sbcConnectionReducer from "./../redux/Sbc/sbcConnectionSlice"; // 👈 slice mới
import departmentReducer from "./../redux/User/departmentSlice";
import groupReducer from "./../redux/User/groupSlice";
import userReducer from "./../redux/User/userSlice";
import outputIgnoreV2Reducer from "../redux/Healthcheck/outputIgnoreSliceV2";
import blackoutReducer from "../redux/Healthcheck/blackoutSlice";
import precheckReducer from "../redux/Healthcheck/precheckSlice";
import analysisParamReducer from "../redux/Healthcheck/analysisParamSlice";
import alertConfigReducer from "../redux/Healthcheck/alertConfigSlice";
import retentionConfigReducer from "../redux/Healthcheck/retentionConfigSlice";
import notifChannelConfigReducer from "../redux/Healthcheck/notifChannelConfigSlice";
import regionReducer from "../redux/User/regionSlice";
import accessScopeReducer from "../redux/User/accessScopeSlice";
const snocStore = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128, // mặc định 32ms, tăng lên do state lớn (5000 items)
      },
    }),
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
    kpiSchedule: kpiScheduleReducer,
    user: userReducer,
    group: groupReducer,
    department: departmentReducer,
    kpiPinned: kpiPinnedReducer,
    pinned: pinnedReducer,
    sbcConnection: sbcConnectionReducer,
    // ✅ NEW: output ignore rules
    outputIgnore: outputIgnoreReducer,
    dhtt: dhttReducer,
    outputIgnoreV2: outputIgnoreV2Reducer,
    blackout: blackoutReducer,
    precheck: precheckReducer,
    analysisParam: analysisParamReducer,
    alertConfig: alertConfigReducer,
    retentionConfig: retentionConfigReducer,
    notifChannelConfig: notifChannelConfigReducer,
    region: regionReducer,
    accessScope: accessScopeReducer,
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
