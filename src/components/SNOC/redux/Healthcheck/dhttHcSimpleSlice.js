import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

export const runDhttHcSimple = createAsyncThunk(
  "dhttHcSimple/runManual",
  async ({ platform, node_names }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post("/nornirps/ManualDhttHcSimpleView/", { platform, node_names });
      dispatch(showTemporaryAlert({
        message: `✅ Hoàn thành HC Simple manual: ${platform}`,
        type: "success",
      }));
      return res.data;
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
    running:        false,
    manualResult:   null,
    history:        [],
    historyCount:   0,
    historyLoading: false,
    loading:        false,
    error:          null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runDhttHcSimple.pending, (state) => {
        state.running      = true;
        state.manualResult = null;
      })
      .addCase(runDhttHcSimple.fulfilled, (state, action) => {
        state.running      = false;
        state.manualResult = action.payload;
      })
      .addCase(runDhttHcSimple.rejected, (state) => {
        state.running = false;
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

export default dhttHcSimpleSlice.reducer;
