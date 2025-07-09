// src/redux/Healthcheck/psCoreSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_SERVER } from "../../config/constant";
import { showTemporaryAlert } from "../Alert/alertSlice";

export const createHealthcheckSchedule = createAsyncThunk(
  "pscore/createHealthcheckSchedule",
  async (
    { name, selectedPlatform, selectedDevices, cron, startTime },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const { account } = getState();

      const response = await axios.post(
        `${API_SERVER}nornirps/schedulerhealth/`,
        {
          name,
          platform: selectedPlatform,
          node_names: selectedDevices,
          cron,
          start_time: startTime, // ISO format: '2025-07-08T10:00:00Z'
        },
        {
          headers: {
            Authorization: `${account.token}`,
          },
        }
      );
      dispatch(
        showTemporaryAlert({ message: "Đặt lịch thành công!", type: "success" })
      );
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi đặt lịch";
      dispatch(showTemporaryAlert({ message, type: "danger" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchPSCoreStatus = createAsyncThunk(
  "pscore/fetchPSCoreStatus",
  async (
    { host, page = 1, platform = [], option = "" },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const { account } = getState();
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (option) params.append("option", option);
      params.append("page", page);
      platform.forEach((p) => params.append("platform", p));

      const response = await axios.get(
        `${API_SERVER}nornirps/healthcheck/history/?${params.toString()}`,
        {
          headers: {
            Authorization: `${account.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchLatestHealthcheckView = createAsyncThunk(
  "pscore/fetchLatestHealthcheckView",
  async (
    { host, page = 1, platform = [], option = "" },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const { account } = getState();
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (option) params.append("option", option);
      params.append("page", page);
      platform.forEach((p) => params.append("platform", p));

      const response = await axios.get(
        `${API_SERVER}nornirps/healthcheck/latest/?${params.toString()}`,
        {
          headers: {
            Authorization: `${account.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchSystemStatus = createAsyncThunk(
  "pscore/fetchSystemStatus",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const { account } = getState();

      const response = await axios.get(`${API_SERVER}nornirps/systemhealth/`, {
        headers: {
          Authorization: `${account.token}`,
        },
      });
      dispatch(
        showTemporaryAlert({
          message: "Get System health successfully!",
          type: "success",
        })
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu System Healch";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const GenericHealthCheckView = createAsyncThunk(
  "healthcheck/GenericHealthCheckView",
  async (
    { selectedPlatform, selectedDevice },
    { getState, rejectWithValue, dispatch }
  ) => {
    // console.log(subData)
    try {
      // dispatch(clearGenericHealthCheckView());
      const { account } = getState();

      const response = await axios.post(
        API_SERVER + "nornirps/GenericHealthCheckView/",
        {
          selectedPlatform: selectedPlatform,
          selectedDevice: selectedDevice, // Add profile value here
        },
        {
          headers: {
            Authorization: `${account.token}`,
          },
        }
      );
      dispatch(
        showTemporaryAlert({
          message: "Nodes is healthcheck successfully!",
          type: "success",
        })
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail || "Failed to healthcheck nodes.";

      dispatch(showTemporaryAlert({ message: errorMessage, type: "danger" }));

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
    refresh: false, // Add a refresh state
    systemStatus: {}, // <-- thêm dòng này
    scheduleCreating: false,
  },
  reducers: {},
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
        // Nếu bạn muốn lưu kết quả system health
        state.systemStatus = action.payload; // <-- cần thêm vào initialState nữa
      })
      .addCase(fetchSystemStatus.rejected, (state) => {
        state.loading = false;
        state.systemStatus = {};
      })

      .addCase(GenericHealthCheckView.pending, (state) => {
        state.loading = true;
      })
      .addCase(GenericHealthCheckView.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.healthchecknodes = action.payload;
        state.refresh = !state.refresh; // Toggle refresh state on sub creations
      })
      .addCase(GenericHealthCheckView.rejected, (state, action) => {
        state.loading = false;
        state.refresh = !state.refresh;
        state.healthchecknodes = [];
      })
      .addCase(createHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true;
      })
      .addCase(createHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(createHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      });
  },
});

export default psCoreSlice.reducer;
