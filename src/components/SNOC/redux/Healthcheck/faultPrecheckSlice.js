// redux/Healthcheck/faultPrecheckSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchFCPHistory = createAsyncThunk(
  "faultPrecheck/fetchHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.host)      query.set("host",      params.host);
      if (params.fcp_id)    query.set("fcp_id",    params.fcp_id);
      if (params.platform)  query.set("platform",  params.platform);
      if (params.hours)     query.set("hours",      params.hours);
      if (params.start)     query.set("start",      params.start);
      if (params.end)       query.set("end",        params.end);
      if (params.page)      query.set("page",       params.page);
      if (params.page_size) query.set("page_size",  params.page_size);
      const res = await snocApi.get(`/nornirps/fcp/history/?${query.toString()}`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || "Lỗi khi tải lịch sử FCP");
    }
  }
);

export const pollFCPJob = createAsyncThunk(
  "faultPrecheck/pollJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(`/nornirps/fcp/job/${jobId}/`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || "Lỗi khi poll FCP job");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────
const faultPrecheckSlice = createSlice({
  name: "faultPrecheck",
  initialState: {
    historyItems:   [],
    historyCount:   0,
    historyLoading: false,
    historyError:   null,
    jobData:        null,
    jobLoading:     false,
    jobError:       null,
  },
  reducers: {
    clearHistory: (s) => { s.historyItems = []; s.historyCount = 0; },
    clearJob:     (s) => { s.jobData = null; s.jobError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFCPHistory.pending,   (s) => { s.historyLoading = true;  s.historyError = null; })
      .addCase(fetchFCPHistory.fulfilled, (s, a) => {
        s.historyLoading = false;
        s.historyItems   = a.payload.results || [];
        s.historyCount   = a.payload.count   || 0;
      })
      .addCase(fetchFCPHistory.rejected,  (s, a) => {
        s.historyLoading = false;
        s.historyError   = a.payload;
      })

      .addCase(pollFCPJob.pending,   (s) => { s.jobLoading = true; s.jobError = null; })
      .addCase(pollFCPJob.fulfilled, (s, a) => { s.jobLoading = false; s.jobData = a.payload; })
      .addCase(pollFCPJob.rejected,  (s, a) => { s.jobLoading = false; s.jobError = a.payload; });
  },
});

export const { clearHistory, clearJob } = faultPrecheckSlice.actions;
export default faultPrecheckSlice.reducer;
