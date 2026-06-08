import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE_URL  = "/nornirps/healthcheck/alert-configs/";
const LOG_URL   = "/nornirps/healthcheck/alert-logs/";
const STATE_URL = "/nornirps/healthcheck/alert-states/";

export const fetchAlertConfigs = createAsyncThunk(
  "alertConfig/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE_URL);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tải alert configs";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createAlertConfig = createAsyncThunk(
  "alertConfig/create",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(BASE_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã tạo alert config", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tạo";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateAlertConfig = createAsyncThunk(
  "alertConfig/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(`${BASE_URL}${id}/`, data);
      dispatch(showTemporaryAlert({ message: "Đã cập nhật", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể cập nhật";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteAlertConfig = createAsyncThunk(
  "alertConfig/delete",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${BASE_URL}${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã xóa", type: "success" }));
      return id;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể xóa";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const testAlertConfig = createAsyncThunk(
  "alertConfig/test",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.post(`${BASE_URL}${id}/test/`);
      dispatch(showTemporaryAlert({ message: "Test đã gửi tới tất cả targets", type: "success" }));
    } catch (err) {
      const msg = err?.response?.data?.detail || "Gửi test thất bại";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const resetAlertConfigState = createAsyncThunk(
  "alertConfig/resetState",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${id}/reset-state/`);
      dispatch(showTemporaryAlert({ message: `Đã xóa ${res.data.deleted} alert states`, type: "success" }));
      return { id };
    } catch (err) {
      const msg = err?.response?.data?.detail || "Reset thất bại";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchAlertLogs = createAsyncThunk(
  "alertConfig/fetchLogs",
  async ({ configId, device } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (configId) params.config_id = configId;
      if (device)   params.device    = device;
      const res = await snocApi.get(LOG_URL, { params });
      return { configId, logs: res.data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || "Không thể tải logs");
    }
  }
);

export const fetchAlertStates = createAsyncThunk(
  "alertConfig/fetchStates",
  async (configId, { rejectWithValue }) => {
    try {
      const params = configId ? { config_id: configId } : {};
      const res = await snocApi.get(STATE_URL, { params });
      return { configId, states: res.data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || "Không thể tải states");
    }
  }
);

const alertConfigSlice = createSlice({
  name: "alertConfig",
  initialState: {
    configs: [],
    logs:    {},   // { [configId]: [] }
    states:  {},   // { [configId]: [] }
    loading: false,
    saving:  false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertConfigs.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAlertConfigs.fulfilled, (s, a) => { s.loading = false; s.configs = a.payload; })
      .addCase(fetchAlertConfigs.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createAlertConfig.pending,   (s) => { s.saving = true; })
      .addCase(createAlertConfig.fulfilled, (s, a) => {
        s.saving = false;
        s.configs.push(a.payload);
      })
      .addCase(createAlertConfig.rejected,  (s) => { s.saving = false; })

      .addCase(updateAlertConfig.pending,   (s) => { s.saving = true; })
      .addCase(updateAlertConfig.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.configs.findIndex((c) => c.id === a.payload.id);
        if (idx !== -1) s.configs[idx] = a.payload;
      })
      .addCase(updateAlertConfig.rejected,  (s) => { s.saving = false; })

      .addCase(deleteAlertConfig.pending,   (s) => { s.saving = true; })
      .addCase(deleteAlertConfig.fulfilled, (s, a) => {
        s.saving = false;
        s.configs = s.configs.filter((c) => c.id !== a.payload);
      })
      .addCase(deleteAlertConfig.rejected,  (s) => { s.saving = false; })

      .addCase(testAlertConfig.pending,    (s) => { s.saving = true; })
      .addCase(testAlertConfig.fulfilled,  (s) => { s.saving = false; })
      .addCase(testAlertConfig.rejected,   (s) => { s.saving = false; })

      .addCase(resetAlertConfigState.pending,   (s) => { s.saving = true; })
      .addCase(resetAlertConfigState.fulfilled, (s) => { s.saving = false; })
      .addCase(resetAlertConfigState.rejected,  (s) => { s.saving = false; })

      .addCase(fetchAlertLogs.fulfilled, (s, a) => {
        s.logs[a.payload.configId] = a.payload.logs;
      })

      .addCase(fetchAlertStates.fulfilled, (s, a) => {
        s.states[a.payload.configId] = a.payload.states;
      });
  },
});

export default alertConfigSlice.reducer;
