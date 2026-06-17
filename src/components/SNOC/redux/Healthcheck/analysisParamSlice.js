import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const SCHEMA_URL        = "/nornirps/healthcheck/analysis-params/schema/";
const PARAMS_URL        = "/nornirps/healthcheck/analysis-params/";
const DEVICE_SUMMARY_URL = "/nornirps/healthcheck/analysis-params/device-summary/";

export const fetchAnalysisSchema = createAsyncThunk(
  "analysisParam/fetchSchema",
  async (platform = "", { dispatch, rejectWithValue }) => {
    try {
      const queryParams = platform ? { platform } : {};
      const res = await snocApi.get(SCHEMA_URL, { params: queryParams });
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể tải schema";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// payload: { platform, device_name? }
export const fetchAnalysisParams = createAsyncThunk(
  "analysisParam/fetchParams",
  async ({ platform, device_name = "" } = {}, { dispatch, rejectWithValue }) => {
    try {
      const params = { platform };
      if (device_name) params.device_name = device_name;
      const res = await snocApi.get(PARAMS_URL, { params });
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể tải params";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// Returns [{device_name, count}] — devices with device-level overrides for the given platform
export const fetchDeviceSummary = createAsyncThunk(
  "analysisParam/fetchDeviceSummary",
  async (platform, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(DEVICE_SUMMARY_URL, { params: { platform } });
      return res.data;
    } catch {
      return rejectWithValue([]);
    }
  }
);

// payload: { platform, device_name?, function_name, param_name, value }
export const saveAnalysisParam = createAsyncThunk(
  "analysisParam/save",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(PARAMS_URL, payload);
      dispatch(showTemporaryAlert({ message: "Đã lưu override", type: "success" }));
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể lưu";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteAnalysisParam = createAsyncThunk(
  "analysisParam/delete",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${PARAMS_URL}${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã reset về default", type: "success" }));
      return id;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể xóa override";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const analysisParamSlice = createSlice({
  name: "analysisParam",
  initialState: {
    schema: {},
    params: [],
    deviceSummary: [],
    selectedPlatform: "",
    selectedDevice: "",
    loadingSchema: false,
    loadingParams: false,
    loadingDeviceSummary: false,
    saving: false,
    error: null,
  },
  reducers: {
    setSelectedPlatform(state, action) {
      state.selectedPlatform = action.payload;
      state.selectedDevice = ""; // reset device khi đổi platform
      state.deviceSummary = [];  // clear summary khi đổi platform
    },
    setSelectedDevice(state, action) {
      state.selectedDevice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalysisSchema.pending,   (s) => { s.loadingSchema = true; })
      .addCase(fetchAnalysisSchema.fulfilled, (s, a) => { s.loadingSchema = false; s.schema = a.payload; })
      .addCase(fetchAnalysisSchema.rejected,  (s) => { s.loadingSchema = false; })

      .addCase(fetchAnalysisParams.pending,   (s) => { s.loadingParams = true; s.error = null; })
      .addCase(fetchAnalysisParams.fulfilled, (s, a) => { s.loadingParams = false; s.params = a.payload; })
      .addCase(fetchAnalysisParams.rejected,  (s, a) => { s.loadingParams = false; s.error = a.payload; })

      .addCase(fetchDeviceSummary.pending,   (s) => { s.loadingDeviceSummary = true; })
      .addCase(fetchDeviceSummary.fulfilled, (s, a) => { s.loadingDeviceSummary = false; s.deviceSummary = a.payload; })
      .addCase(fetchDeviceSummary.rejected,  (s) => { s.loadingDeviceSummary = false; s.deviceSummary = []; })

      .addCase(saveAnalysisParam.pending,   (s) => { s.saving = true; })
      .addCase(saveAnalysisParam.fulfilled, (s) => { s.saving = false; })
      .addCase(saveAnalysisParam.rejected,  (s) => { s.saving = false; })

      .addCase(deleteAnalysisParam.pending,   (s) => { s.saving = true; })
      .addCase(deleteAnalysisParam.fulfilled, (s) => { s.saving = false; })
      .addCase(deleteAnalysisParam.rejected,  (s) => { s.saving = false; });
  },
});

export const { setSelectedPlatform, setSelectedDevice } = analysisParamSlice.actions;
export default analysisParamSlice.reducer;
