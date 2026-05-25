// redux/Healthcheck/precheckSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// ✅ dùng snocApiWithAutoToken — có JWT interceptor tự động
import snocApi from "../../api/snocApiWithAutoToken";

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchPrecheckParamConfig = createAsyncThunk(
  "precheck/fetchParamConfig",
  async (platform, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(
        `/nornirps/PrecheckParamConfigView/?platform=${platform}`
      );
      return { platform, ...res.data };
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.error || "Không thể tải cấu hình Precheck"
      );
    }
  }
);

export const runManualPrecheck = createAsyncThunk(
  "precheck/runManual",
  async ({ platform, node_names }, { rejectWithValue }) => {
    try {
      const res = await snocApi.post("/nornirps/ManualPrecheckView/", {
        platform,
        node_names,
      });
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.error || "Lỗi khi chạy Precheck"
      );
    }
  }
);

export const fetchPrecheckHistory = createAsyncThunk(
  "precheck/fetchHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.host)      query.set("host",      params.host);
      if (params.platform)  query.set("platform",  params.platform);
      if (params.hours)     query.set("hours",      params.hours);
      if (params.start)     query.set("start",      params.start);
      if (params.end)       query.set("end",        params.end);
      if (params.page)      query.set("page",       params.page);
      if (params.page_size) query.set("page_size",  params.page_size);
      const res = await snocApi.get(
        `/nornirps/precheck/history/?${query.toString()}`
      );
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.error || "Lỗi khi tải lịch sử Precheck"
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const precheckSlice = createSlice({
  name: "precheck",
  initialState: {
    // Manual
    running:             false,
    manualResult:        null,
    manualError:         null,
    // Param config
    paramConfig:         [],
    paramConfigPlatform: null,
    paramConfigReady:    false,
    // History
    historyItems:        [],
    historyCount:        0,
    historyLoading:      false,
    historyError:        null,
  },
  reducers: {
    clearManualResult: (s) => { s.manualResult = null; s.manualError = null; },
    clearHistory:      (s) => { s.historyItems = []; s.historyCount = 0;   },
  },
  extraReducers: (builder) => {
    builder
      // ── Param config
      .addCase(fetchPrecheckParamConfig.pending,   (s) => { s.paramConfigReady = false; })
      .addCase(fetchPrecheckParamConfig.fulfilled, (s, a) => {
        s.paramConfig         = a.payload.groups || [];
        s.paramConfigPlatform = a.payload.platform;
        s.paramConfigReady    = true;
      })
      .addCase(fetchPrecheckParamConfig.rejected,  (s) => { s.paramConfigReady = false; })

      // ── Manual run
      .addCase(runManualPrecheck.pending,   (s) => {
        s.running = true; s.manualResult = null; s.manualError = null;
      })
      .addCase(runManualPrecheck.fulfilled, (s, a) => {
        s.running      = false;
        s.manualResult = a.payload;
      })
      .addCase(runManualPrecheck.rejected,  (s, a) => {
        s.running     = false;
        s.manualError = a.payload;
      })

      // ── History
      .addCase(fetchPrecheckHistory.pending,   (s) => {
        s.historyLoading = true; s.historyError = null;
      })
      .addCase(fetchPrecheckHistory.fulfilled, (s, a) => {
        s.historyLoading = false;
        s.historyItems   = a.payload.results || [];
        s.historyCount   = a.payload.count   || 0;
      })
      .addCase(fetchPrecheckHistory.rejected,  (s, a) => {
        s.historyLoading = false;
        s.historyError   = a.payload;
      });
  },
});

export const { clearManualResult, clearHistory } = precheckSlice.actions;
export default precheckSlice.reducer;
