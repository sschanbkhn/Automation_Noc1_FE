import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

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

export const fetchPSCoreStatus = createAsyncThunk(
  "pscore/fetchPSCoreStatus",
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
        `/nornirps/healthcheck/history/?${params.toString()}`
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
  },
  reducers: {
    updateLastRunAt: (state, action) => {
      const { name, last_run_at, status } = action.payload;
      const task = state.scheduledTasks.find((t) => t.name === name);
      if (task) {
        task.last_run_status = status;
        task.last_run_at = last_run_at;
      }
    }, // ← kiểm tra dấu phẩy ở đây
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPSCoreStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPSCoreStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || [];
        state.count = action.payload.count || 0;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchPSCoreStatus.rejected, (state) => {
        state.loading = false;
        state.items = [];
      })

      .addCase(fetchLatestHealthcheckView.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLatestHealthcheckView.fulfilled, (state, action) => {
        state.loading = false;
        state.lastestitems = action.payload.results || [];
        state.count = action.payload.count || 0;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
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
      });
  },
});
export const { updateLastRunAt } = psCoreSlice.actions;
export default psCoreSlice.reducer;
