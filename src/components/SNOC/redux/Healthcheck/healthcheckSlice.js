import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// ######## toggle device excluded

export const toggleDeviceExcluded = createAsyncThunk(
  "pscore/toggleDeviceExcluded",
  async ({ host, excluded }, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.post(
        `/nornirps/systemhealth/toggle-exclude/`,
        { host, excluded }
      );

      dispatch(
        showTemporaryAlert({
          message: `Thiết bị ${host} ${
            excluded ? "đã loại trừ" : "bỏ loại trừ"
          } khỏi cảnh báo`,
          type: "success",
        })
      );

      return { host, excluded };
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Không thể cập nhật trạng thái excluded";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// ######################### scheduler chung
// ######################### scheduler chung #########################

// 1️⃣ Lấy danh sách schedule generic
export const fetchGenericSchedule = createAsyncThunk(
  "pscore/fetchGenericSchedules",
  async ({ usecase_type = "causecode" }, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.get(
        `/nornirps/scheduler/generic/list/?usecase=${usecase_type}`
      );
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Lỗi khi tải danh sách lịch generic";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// 2️⃣ Tạo schedule generic
export const createGenericSchedule = createAsyncThunk(
  "pscore/createGenericSchedule",
  async (
    { name, platform, node_names, cron, start_time, usecase_type },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await snocApi.post("/nornirps/scheduler/generic/", {
        name,
        platform,
        node_names,
        cron,
        start_time,
        usecase_type, // ✅ gửi đúng key backend yêu cầu
      });
      dispatch(
        showTemporaryAlert({
          message: "Tạo lịch generic thành công!",
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Lỗi khi tạo lịch generic";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// 3️⃣ Bật / tắt schedule generic
export const toggleGenericSchedule = createAsyncThunk(
  "pscore/toggleGenericScheduleEnabled",
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.patch(`/nornirps/scheduler/generic/${id}/toggle/`, {
        enabled,
      });
      dispatch(
        showTemporaryAlert({
          message: `Đã ${enabled ? "bật" : "tắt"} lịch generic`,
          type: "success",
        })
      );
      return { id, enabled };
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Lỗi bật/tắt lịch generic";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// 4️⃣ Xoá schedule generic
export const deleteGenericSchedule = createAsyncThunk(
  "pscore/deleteGenericSchedule",
  async ({ id, usecase_type }, { dispatch, rejectWithValue }) => {
    try {
      // ✅ truyền usecase_type dưới dạng query param
      await snocApi.delete(
        `/nornirps/scheduler/generic/${id}/delete/?usecase_type=${usecase_type}`
      );

      dispatch(
        showTemporaryAlert({ message: "Đã xóa lịch generic", type: "success" })
      );
      // ✅ Fetch lại danh sách theo đúng usecase_type
      dispatch(fetchGenericSchedule({ usecase_type }));

      return { id, usecase_type };
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi xóa lịch generic";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// 5️⃣ Cập nhật schedule generic
export const updateGenericSchedule = createAsyncThunk(
  "pscore/updateGenericSchedule",
  async (
    { id, name, platform, node_names, cron, start_time, usecase_type },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await snocApi.put(`/nornirps/scheduler/generic/${id}/update/`, {
        name,
        platform,
        node_names,
        cron,
        start_time,
        usecase_type, // ✅ gửi đúng key backend yêu cầu
      });
      dispatch(fetchGenericSchedule({ usecase_type }));
      dispatch(
        showTemporaryAlert({
          message: "Đã cập nhật lịch thành công",
          type: "success",
        })
      );
      return id;
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Lỗi khi cập nhật lịch generic";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// ######################### kpi

export const fetchAvailableKPIs = createAsyncThunk(
  "pscore/fetchAvailableKPIs",
  async ({ selectedPlatform, selectedDevices = [] }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("platform", selectedPlatform);
      selectedDevices.forEach((d) => params.append("device", d));

      const url = `/nornirps/kpi/list/?${params.toString()}`;
      const response = await snocApi.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const fetchKPIChartData = createAsyncThunk(
  "pscore/fetchKPIChartData",
  async (
    { selectedPlatform, selectedDevice, selectedKPI, startDate, endDate },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("platform", selectedPlatform);
      params.append("kpi", selectedKPI);
      params.append("start", startDate);
      params.append("end", endDate);
      if (selectedDevice && selectedDevice.length > 0) {
        for (const d of selectedDevice) {
          params.append("device", d);
        }
      }
      const url = `/nornirps/kpi/query/?${params.toString()}`;
      console.log("[fetchKPIChartData] Request URL:", url);
      const response = await snocApi.get(url);
      console.log("[fetchKPIChartData] Response Data:", response.data);
      return { kpi: selectedKPI, data: response.data };
    } catch (error) {
      console.error("[fetchKPIChartData] Error:", error);
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

// ##########################end kpi

export const fetchPlatformGroupSchema = createAsyncThunk(
  "systemHealth/fetchPlatformGroupSchema",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get("/nornirps/systemhealth/schema/");
      return res.data; // object: { "OCS": { "SDP": [...], ... } }
    } catch (err) {
      return rejectWithValue(err.response?.data || {});
    }
  }
);

export const fetchHealthcheckSchedules = createAsyncThunk(
  "pscore/fetchHealthcheckSchedules",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.get("/nornirps/schedulerhealth/list/");
      return response.data; // là mảng các task
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        "Lỗi khi tải danh sách lịch healthcheck";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const createHealthcheckSchedule = createAsyncThunk(
  "pscore/createHealthcheckSchedule",
  async (
    { name, platform, node_names, cron, start_time },
    { dispatch, rejectWithValue }
  ) => {
    try {
      console.log("🛰 Payload gửi từ slice:", {
        name,
        platform,
        node_names,
        cron,
        start_time,
      });
      const response = await snocApi.post("/nornirps/schedulerhealth/", {
        name,
        platform,
        node_names,
        cron,
        start_time,
      });

      dispatch(
        showTemporaryAlert({ message: "Đặt lịch thành công!", type: "success" })
      );
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi đặt lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// on off schedule
export const toggleScheduleEnabled = createAsyncThunk(
  "pscore/toggleScheduleEnabled",
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.patch(`/nornirps/schedulerhealth/${id}/toggle/`, {
        enabled,
      });
      dispatch(fetchHealthcheckSchedules());
      dispatch(
        showTemporaryAlert({
          message: `Đã ${enabled ? "bật" : "tắt"} lịch thành công`,
          type: "success",
        })
      );
      return { id, enabled };
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi bật/tắt lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Xóa lịch
export const deleteHealthcheckSchedule = createAsyncThunk(
  "pscore/deleteHealthcheckSchedule",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`/nornirps/schedulerhealth/${id}/delete/`);
      dispatch(fetchHealthcheckSchedules());
      dispatch(
        showTemporaryAlert({
          message: "Đã xóa lịch thành công",
          type: "success",
        })
      );
      return id;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi xóa lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Cập nhật lịch
export const updateHealthcheckSchedule = createAsyncThunk(
  "pscore/updateHealthcheckSchedule",
  async (
    { id, name, platform, node_names, cron, start_time },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await snocApi.put(`/nornirps/schedulerhealth/${id}/update/`, {
        name,
        platform,
        node_names,
        cron,
        start_time,
      });
      dispatch(fetchHealthcheckSchedules());
      dispatch(
        showTemporaryAlert({
          message: "Đã cập nhật lịch thành công",
          type: "success",
        })
      );
      return id;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi cập nhật lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// export const fetchPSCoreStatus = createAsyncThunk(
//   "pscore/fetchPSCoreStatus",
//   async (
//     { host, page = 1, platform = [], option = "" },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const params = new URLSearchParams();
//       if (host) params.append("host", host);
//       if (option) params.append("option", option);
//       params.append("page", page);
//       platform.forEach((p) => params.append("platform", p));

//       const response = await snocApi.get(
//         `/nornirps/healthcheck/history/?${params.toString()}`
//       );
//       return response.data;
//     } catch (error) {
//       const msg =
//         error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(error?.response?.data);
//     }
//   }
// );

// export const fetchPSCoreStatus = createAsyncThunk(
//   "pscore/fetchPSCoreStatus",
//   async (
//     { host, page = 1, platform = [], option = "", storeKey, hours, page_size },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const params = new URLSearchParams();
//       if (host) params.append("host", host);
//       if (option) params.append("option", option);
//       params.append("page", String(page));
//       platform.forEach((p) => params.append("platform", p));
//       // ✅ bổ sung mới (tương thích ngược)
//       if (hours) params.append("hours", String(hours));
//       if (page_size) params.append("page_size", String(page_size));

//       const response = await snocApi.get(
//         `/nornirps/healthcheck/history/?${params.toString()}`
//       );
//       return response.data; // KHÔNG đổi payload
//     } catch (error) {
//       const msg =
//         error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(error?.response?.data);
//     }
//   }
// );

export const fetchPSCoreStatus = createAsyncThunk(
  "pscore/fetchPSCoreStatus",
  async (
    { host, page = 1, platform = [], option = "", storeKey, hours, page_size },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();

      if (host) params.append("host", host);
      if (option) params.append("option", option);
      params.append("page", String(page));
      platform.forEach((p) => params.append("platform", p));

      const hasHours =
        hours !== undefined && hours !== null && `${hours}` !== "";
      if (hasHours) params.append("hours", String(hours));
      if (page_size) params.append("page_size", String(page_size));

      // ✅ Quy tắc: có hours -> KHÔNG gửi notes; không có hours -> gửi notes
      if (!hasHours) {
        params.append("include_notes", "1");
      }

      const response = await snocApi.get(
        `/nornirps/healthcheck/history/?${params.toString()}`
      );
      return response.data; // giữ nguyên payload
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchLatestHealthcheckView = createAsyncThunk(
  "pscore/fetchLatestHealthcheckView",
  async (
    { host, page = 1, platform = [], option = "" },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (option) params.append("option", option);
      params.append("page", page);
      platform.forEach((p) => params.append("platform", p));

      const response = await snocApi.get(
        `/nornirps/healthcheck/latest/?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchSystemStatus = createAsyncThunk(
  "pscore/fetchSystemStatus",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get("/nornirps/systemhealth/");
      dispatch(
        showTemporaryAlert({
          message: "Get System health successfully!",
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu System Health";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchSystemStatusByGroup = createAsyncThunk(
  "pscore/fetchSystemStatusByGroup",
  async (group, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get(`/nornirps/systemhealth/${group}/`);
      return { group, data: response.data };
    } catch (error) {
      const msg =
        error?.response?.data?.detail || `Không thể tải dữ liệu group ${group}`;
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue({ group, error: error?.response?.data });
    }
  }
);

export const fetchSystemStatusBySubsystem = createAsyncThunk(
  "pscore/fetchSystemStatusBySubsystem",
  async ({ group, subsystem }, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get(
        `/nornirps/systemhealth/${group}/${subsystem}/`
      );
      return { group, subsystem, data: response.data };
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        `Không thể tải dữ liệu subsystem ${subsystem}`;
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue({
        group,
        subsystem,
        error: error?.response?.data,
      });
    }
  }
);

export const GenericHealthCheckView = createAsyncThunk(
  "healthcheck/GenericHealthCheckView",
  async (
    { selectedPlatform, selectedDevice },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await snocApi.post("/nornirps/GenericHealthCheckView/", {
        selectedPlatform,
        selectedDevice,
      });
      dispatch(
        showTemporaryAlert({
          message: "Nodes is healthcheck successfully!",
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail || "Failed to healthcheck nodes.";
      dispatch(showTemporaryAlert({ message: errorMessage, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

const psCoreSlice = createSlice({
  name: "pscore",
  initialState: {
    items: [],
    lastestitems: [],
    loading: false,
    count: 0,
    next: null,
    previous: null,
    countlastest: 0,
    nextlastest: null,
    previouslastest: null,
    healthchecknodes: [],
    status: "idle",
    error: null,
    refresh: false,
    systemStatus: {},
    scheduleCreating: false,
    scheduledTasks: [],
    loadingScheduledTasks: false,
    groupStatus: {}, // từng group như OCS, PS Core
    subsystemStatus: {}, // từng subsystem trong từng group
    platformSchema: {},
    websocketConnected: true, // ✅ trạng thái kết nối WebSocket
    recentlyUpdated: {}, // Lưu thông tin các hệ thống vừa cập nhật
    availableKPIs: [], // ✅ Danh sách KPI có sẵn
    kpiChartData: {}, // Updated to object keyed by KPI
    genericSchedules: {}, // { healthcheck: [], causecode: [], ... }
    // ✅ Lịch generic đang tải
    loadingGenericSchedules: {},
    hostHistoryLoading: false,
    hostHistoryItems: [],
    hostHistoryCount: 0,
    hostHistoryNext: null,
    hostHistoryPrevious: null,
    hourlyLoading: false,
    hourlyItems: [],
    hourlyByKey: {}, // { [storeKey]: items[] }
    hourlyLoadingByKey: {}, // { [storeKey]: boolean }
  },
  reducers: {
    updateLastRunAt: (state, action) => {
      const { name, last_run_at, status } = action.payload;
      const task = state.scheduledTasks.find((t) => t.name === name);
      if (task) {
        task.last_run_status = status;
        task.last_run_at = last_run_at;
      }
    },
    setWebSocketStatus: (state, action) => {
      state.websocketConnected = action.payload;
    },
    updateSystemStatusPatch: (state, action) => {
      const { group, subsystem, data } = action.payload;

      // Nếu group chưa có thì khởi tạo
      if (!state.systemStatus[group]) {
        state.systemStatus[group] = {
          status: "Unknown",
          children: {},
          ok_count: 0,
          nok_count: 0,
          total_devices: 0,
        };
      }

      if (!state.systemStatus[group].children) {
        state.systemStatus[group].children = {};
      }

      // ✅ Gộp (merge) thông tin mới với thông tin cũ
      const oldData = state.systemStatus[group].children[subsystem] || {};
      state.systemStatus[group].children[subsystem] = {
        ...oldData,
        ...data,
      };

      // ✅ Tính lại tổng theo group sau khi cập nhật 1 subsystem
      const children = state.systemStatus[group].children;
      let ok = 0,
        nok = 0,
        total = 0;

      for (const key in children) {
        ok += children[key].ok_count || 0;
        nok += children[key].nok_count || 0;
        total += children[key].total_devices || 0;
      }

      state.systemStatus[group].ok_count = ok;
      state.systemStatus[group].nok_count = nok;
      state.systemStatus[group].total_devices = total;

      state.systemStatus[group].status =
        nok > 0 ? "Warning" : ok > 0 ? "Normal" : "Unknown";

      // ✅ Ghi nhận thời điểm cập nhật
      if (!state.recentlyUpdated[group]) state.recentlyUpdated[group] = {};
      state.recentlyUpdated[group][subsystem] = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(fetchPSCoreStatus.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(fetchPSCoreStatus.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.items = action.payload.results || [];
      //   state.count = action.payload.count || 0;
      //   state.next = action.payload.next;
      //   state.previous = action.payload.previous;
      // })
      // .addCase(fetchPSCoreStatus.rejected, (state) => {
      //   state.loading = false;
      //   state.items = [];
      // })

      // .addCase(fetchPSCoreStatus.pending, (state, action) => {
      //   const storeKey = action.meta?.arg?.storeKey;
      //   if (storeKey === "hostHistory") {
      //     state.hostHistoryLoading = true;
      //   } else {
      //     state.loading = true;
      //   }
      // })
      // .addCase(fetchPSCoreStatus.fulfilled, (state, action) => {
      //   const storeKey = action.meta?.arg?.storeKey;
      //   if (storeKey === "hostHistory") {
      //     state.hostHistoryLoading = false;
      //     state.hostHistoryItems = action.payload.results || [];
      //     state.hostHistoryCount = action.payload.count || 0;
      //     state.hostHistoryNext = action.payload.next || null;
      //     state.hostHistoryPrevious = action.payload.previous || null;
      //   } else {
      //     state.loading = false;
      //     state.items = action.payload.results || [];
      //     state.count = action.payload.count || 0;
      //     state.next = action.payload.next;
      //     state.previous = action.payload.previous;
      //   }
      // })
      // .addCase(fetchPSCoreStatus.rejected, (state, action) => {
      //   const storeKey = action.meta?.arg?.storeKey;
      //   if (storeKey === "hostHistory") {
      //     state.hostHistoryLoading = false;
      //     state.hostHistoryItems = [];
      //     state.hostHistoryCount = 0;
      //     state.hostHistoryNext = null;
      //     state.hostHistoryPrevious = null;
      //   } else {
      //     state.loading = false;
      //     state.items = [];
      //   }
      // })

      // .addCase(fetchPSCoreStatus.pending, (state, action) => {
      //   const key = action.meta?.arg?.storeKey;
      //   if (key === "hourly") {
      //     state.hourlyLoading = true;
      //   } else if (key === "hostHistory") {
      //     state.hostHistoryLoading = true;
      //   } else {
      //     state.loading = true;
      //   }
      // })
      // .addCase(fetchPSCoreStatus.fulfilled, (state, action) => {
      //   const key = action.meta?.arg?.storeKey;
      //   if (key === "hourly") {
      //     state.hourlyLoading = false;
      //     state.hourlyItems = action.payload?.results || [];
      //   } else if (key === "hostHistory") {
      //     state.hostHistoryLoading = false;
      //     state.hostHistoryItems = action.payload.results || [];
      //     state.hostHistoryCount = action.payload.count || 0;
      //     state.hostHistoryNext = action.payload.next || null;
      //     state.hostHistoryPrevious = action.payload.previous || null;
      //   } else {
      //     state.loading = false;
      //     state.items = action.payload.results || [];
      //     state.count = action.payload.count || 0;
      //     state.next = action.payload.next;
      //     state.previous = action.payload.previous;
      //   }
      // })
      // .addCase(fetchPSCoreStatus.rejected, (state, action) => {
      //   const key = action.meta?.arg?.storeKey;
      //   if (key === "hourly") {
      //     state.hourlyLoading = false;
      //     state.hourlyItems = [];
      //   } else if (key === "hostHistory") {
      //     state.hostHistoryLoading = false;
      //     state.hostHistoryItems = [];
      //     state.hostHistoryCount = 0;
      //     state.hostHistoryNext = null;
      //     state.hostHistoryPrevious = null;
      //   } else {
      //     state.loading = false;
      //     state.items = [];
      //   }
      // })

      .addCase(fetchPSCoreStatus.pending, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        if (key === "hourly") {
          state.hourlyLoading = true; // ✅ modal cũ vẫn OK
        } else if (key === "hostHistory") {
          state.hostHistoryLoading = true;
        } else if (key?.startsWith("hourly_")) {
          state.hourlyLoadingByKey[key] = true; // ✅ chart trong card
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchPSCoreStatus.fulfilled, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        const results = action.payload?.results || [];
        if (key === "hourly") {
          state.hourlyLoading = false; // ✅ modal cũ
          state.hourlyItems = results;
        } else if (key === "hostHistory") {
          state.hostHistoryLoading = false;
          state.hostHistoryItems = results;
          state.hostHistoryCount = action.payload?.count || 0;
          state.hostHistoryNext = action.payload?.next || null;
          state.hostHistoryPrevious = action.payload?.previous || null;
        } else if (key?.startsWith("hourly_")) {
          state.hourlyLoadingByKey[key] = false; // ✅ chart trong card
          state.hourlyByKey[key] = results;
        } else {
          state.loading = false;
          state.items = results;
          state.count = action.payload?.count || 0;
          state.next = action.payload?.next;
          state.previous = action.payload?.previous;
        }
      })
      .addCase(fetchPSCoreStatus.rejected, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        if (key === "hourly") {
          state.hourlyLoading = false; // ✅ modal cũ
          state.hourlyItems = [];
        } else if (key === "hostHistory") {
          state.hostHistoryLoading = false;
          state.hostHistoryItems = [];
          state.hostHistoryCount = 0;
          state.hostHistoryNext = null;
          state.hostHistoryPrevious = null;
        } else if (key?.startsWith("hourly_")) {
          state.hourlyLoadingByKey[key] = false; // ✅ chart trong card
          state.hourlyByKey[key] = [];
        } else {
          state.loading = false;
          state.items = [];
        }
      })

      .addCase(fetchLatestHealthcheckView.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLatestHealthcheckView.fulfilled, (state, action) => {
        state.loading = false;
        state.lastestitems = action.payload.results || [];
        state.countlastest = action.payload.count || 0;
        state.nextlastest = action.payload.next;
        state.previouslastest = action.payload.previous;
      })
      .addCase(fetchLatestHealthcheckView.rejected, (state) => {
        state.loading = false;
        state.lastestitems = [];
      })

      .addCase(fetchSystemStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSystemStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStatus = action.payload;
      })
      .addCase(fetchSystemStatus.rejected, (state) => {
        state.loading = false;
        state.systemStatus = {};
      })

      // --- Fetch system status theo group ---
      .addCase(fetchSystemStatusByGroup.fulfilled, (state, action) => {
        const { group, data } = action.payload;
        state.groupStatus[group] = data[group] || data;
      })
      .addCase(fetchSystemStatusByGroup.rejected, (state, action) => {
        const { group } = action.payload || {};
        if (group) state.groupStatus[group] = null;
      })

      // --- Fetch theo subsystem ---
      .addCase(fetchSystemStatusBySubsystem.fulfilled, (state, action) => {
        const { group, subsystem, data } = action.payload;
        if (!state.subsystemStatus[group]) state.subsystemStatus[group] = {};
        state.subsystemStatus[group][subsystem] = data[subsystem] || data;
      })
      .addCase(fetchSystemStatusBySubsystem.rejected, (state, action) => {
        const { group, subsystem } = action.payload || {};
        if (group && subsystem) {
          if (!state.subsystemStatus[group]) state.subsystemStatus[group] = {};
          state.subsystemStatus[group][subsystem] = null;
        }
      })

      .addCase(GenericHealthCheckView.pending, (state) => {
        state.loading = true;
      })
      .addCase(GenericHealthCheckView.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.healthchecknodes = action.payload;
        state.refresh = !state.refresh;
      })
      .addCase(GenericHealthCheckView.rejected, (state) => {
        state.loading = false;
        state.refresh = !state.refresh;
        state.healthchecknodes = [];
      })
      // --- Tạo lịch ---
      .addCase(createHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true;
      })
      .addCase(createHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(createHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      })
      // --- Xóa lịch ---
      .addCase(deleteHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true; // Có thể dùng chung loading flag
      })
      .addCase(deleteHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(deleteHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      })

      // --- Cập nhật lịch ---
      .addCase(updateHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true;
      })
      .addCase(updateHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(updateHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      })
      // --- featch  lịch ---

      .addCase(fetchHealthcheckSchedules.pending, (state) => {
        state.loadingScheduledTasks = true;
      })
      .addCase(fetchHealthcheckSchedules.fulfilled, (state, action) => {
        state.loadingScheduledTasks = false;
        state.scheduledTasks = action.payload || [];
      })
      .addCase(fetchHealthcheckSchedules.rejected, (state) => {
        state.loadingScheduledTasks = false;
        state.scheduledTasks = [];
      })
      // --- Load schema nhóm platform từ backend ---
      .addCase(fetchPlatformGroupSchema.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformGroupSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.platformSchema = action.payload;
      })
      .addCase(fetchPlatformGroupSchema.rejected, (state) => {
        state.loading = false;
        state.platformSchema = {};
      })

      // ############# kpi
      .addCase(fetchAvailableKPIs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableKPIs.fulfilled, (state, action) => {
        state.availableKPIs =
          action.payload && Array.isArray(action.payload.kpis)
            ? action.payload
            : { kpis: [] };
      })
      .addCase(fetchAvailableKPIs.rejected, (state) => {
        state.loading = false;
        state.availableKPIs = [];
      })
      .addCase(fetchKPIChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKPIChartData.fulfilled, (state, action) => {
        const { kpi, data } = action.payload;
        state.loading = false;
        state.kpiChartData[kpi] = data;
      })
      .addCase(fetchKPIChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- FETCH generic schedule ---
      .addCase(fetchGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(fetchGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
        // API trả về mảng -> gán trực tiếp
        state.genericSchedules[type] = action.payload || [];
      })
      .addCase(fetchGenericSchedule.rejected, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
        state.genericSchedules[type] = [];
      })

      // --- CREATE generic schedule ---
      .addCase(createGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(createGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
        // Sau khi tạo thành công, thunk đã dispatch fetchGenericSchedule -> list sẽ update sau
      })
      .addCase(createGenericSchedule.rejected, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })

      // --- UPDATE generic schedule ---
      .addCase(updateGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(updateGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })
      .addCase(updateGenericSchedule.rejected, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })

      // --- DELETE generic schedule ---
      .addCase(deleteGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(deleteGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })
      .addCase(deleteGenericSchedule.rejected, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })

      // --- TOGGLE generic schedule ---
      .addCase(toggleGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(toggleGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })
      .addCase(toggleGenericSchedule.rejected, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })

      // --- TOGGLE device excluded ---
      .addCase(toggleDeviceExcluded.fulfilled, (state, action) => {
        const { host, excluded } = action.payload;
        // cập nhật vào lastestitems
        state.lastestitems = state.lastestitems.map((item) =>
          item.host === host ? { ...item, excluded } : item
        );
      });
  },
});
export const { updateLastRunAt, setWebSocketStatus, updateSystemStatusPatch } =
  psCoreSlice.actions;
export default psCoreSlice.reducer;
