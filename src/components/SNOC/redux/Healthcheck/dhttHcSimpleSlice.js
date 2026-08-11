import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// HLR/CUDB có lệnh chờ cứng theo thiết kế (vài phút/lệnh) nên backend luôn
// queue Celery async và trả job_id ngay (202) — không còn chờ kết quả trong
// cùng request HTTP. Client phải poll fetchDhttHcSimpleJobStatus cho tới khi
// job đạt trạng thái "done"/"failed"/"locked".
export const runDhttHcSimple = createAsyncThunk(
  "dhttHcSimple/runManual",
  async ({ platform, node_names }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post("/nornirps/ManualDhttHcSimpleView/", { platform, node_names });
      return res.data; // { job_id, status: "queued", poll_url, ... }
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền chạy thiết bị này."
          : error?.response?.data?.error || "Lỗi khi chạy HC Simple manual";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchDhttHcSimpleJobStatus = createAsyncThunk(
  "dhttHcSimple/fetchJobStatus",
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(`/nornirps/dhtt-hc-simple/job/${jobId}/`);
      return res.data; // { status, result, error, ... }
    } catch (error) {
      return rejectWithValue(error?.response?.data?.error || error.message);
    }
  }
);

export const fetchDhttHcSimpleHistory = createAsyncThunk(
  "dhttHcSimple/fetchHistory",
  async ({ host, hours, start, end, page = 1, page_size = 10 } = {}, { dispatch, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (host)      params.append("host",      host);
      if (hours)     params.append("hours",     String(hours));
      if (start)     params.append("start",     start);
      if (end)       params.append("end",       end);
      params.append("page",      String(page));
      params.append("page_size", String(page_size));
      const res = await snocApi.get(`/nornirps/DhttHcSimpleHistoryView/?${params.toString()}`);
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Không thể tải lịch sử HC Simple";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

const dhttHcSimpleSlice = createSlice({
  name: "dhttHcSimple",
  initialState: {
    running:        false, // đang submit job hoặc đang poll chờ kết quả
    jobId:          null,
    jobStatus:      null,  // queued | pending | running | done | failed | locked
    manualResult:   null,
    history:        [],
    historyCount:   0,
    historyLoading: false,
    loading:        false,
    error:          null,
  },
  reducers: {
    resetDhttHcSimpleJob(state) {
      state.running      = false;
      state.jobId        = null;
      state.jobStatus    = null;
      state.manualResult = null;
      state.error        = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runDhttHcSimple.pending, (state) => {
        state.running      = true;
        state.jobId        = null;
        state.jobStatus    = null;
        state.manualResult = null;
        state.error        = null;
      })
      .addCase(runDhttHcSimple.fulfilled, (state, action) => {
        state.jobId     = action.payload?.job_id || null;
        state.jobStatus = action.payload?.status || "queued";
        // running vẫn giữ true — sẽ chỉ tắt khi job poll xong (done/failed/locked)
      })
      .addCase(runDhttHcSimple.rejected, (state, action) => {
        state.running = false;
        state.error   = action.payload || "Lỗi khi chạy HC Simple manual";
      })
      .addCase(fetchDhttHcSimpleJobStatus.fulfilled, (state, action) => {
        const job = action.payload || {};
        state.jobStatus = job.status || state.jobStatus;
        if (job.status === "done") {
          state.running      = false;
          state.manualResult = job.result || null;
        } else if (["failed", "locked", "cancelled"].includes(job.status)) {
          state.running = false;
          state.error   = job.error || `Job ${job.status}`;
        }
      })
      .addCase(fetchDhttHcSimpleJobStatus.rejected, (state, action) => {
        state.running = false;
        state.error   = action.payload || "Không lấy được trạng thái job";
      })
      .addCase(fetchDhttHcSimpleHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchDhttHcSimpleHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history        = action.payload?.results || [];
        state.historyCount   = action.payload?.count   || 0;
      })
      .addCase(fetchDhttHcSimpleHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.history        = [];
        state.error          = action.payload;
      });
  },
});

export const { resetDhttHcSimpleJob } = dhttHcSimpleSlice.actions;
export default dhttHcSimpleSlice.reducer;
