// src/redux/Dhtt/dhttSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

export const fetchDhttHistory = createAsyncThunk(
  "dhtt/fetchDhttHistory",
  async (
    { host, hours, start, end, page = 1, page_size = 10 },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (hours) params.append("hours", String(hours));
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      params.append("page", String(page));
      params.append("page_size", String(page_size));

      const response = await snocApi.get(
        `/nornirps/DhttSyncHistoryView/?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu lịch sử DHTT";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

// Thêm thunk
export const runManualDhtt = createAsyncThunk(
  "dhtt/runManual",
  async ({ platform, node_names }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post("/nornirps/ManualDhttCheckView/", {
        platform,
        node_names,
      });
      dispatch(
        showTemporaryAlert({
          message: `✅ Hoàn thành DHTT manual: ${platform}`,
          type: "success",
        }),
      );
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền chạy thiết bị này."
          : error?.response?.data?.error || "Lỗi khi chạy DHTT manual";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  },
);

export const fetchDhttParamConfig = createAsyncThunk(
  "dhtt/fetchParamConfig",
  async (platform, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(
        `/nornirps/DhttParamConfigView/?platform=${platform}`,
      );
      return { platform, ...res.data };
    } catch (error) {
      return rejectWithValue("Không thể tải cấu hình tham số DHTT");
    }
  },
);




const dhttSlice = createSlice({
  name: "dhtt",
  initialState: {
    items: [],
    loading: false,
    count: 0,
    error: null,
    running: false, // ← thêm
    manualResult: null, // ← thêm
    paramConfig: [],
    paramConfigPlatform: null,
    paramConfigReady: false,
  },
  reducers: {
    // Thêm các reducer đồng bộ ở đây nếu cần (VD: WebSocket cho DHTT)
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDhttParamConfig.pending, (s) => {
        s.paramConfigReady = false;
      })
      .addCase(fetchDhttParamConfig.fulfilled, (s, a) => {
        s.paramConfig = a.payload.items || [];
        s.paramConfigPlatform = a.payload.platform;
        s.paramConfigReady = true;
      })
      .addCase(fetchDhttParamConfig.rejected, (s) => {
        s.paramConfigReady = false;
      })
      // ---- MANUAL DHTT ----
      .addCase(runManualDhtt.pending, (state) => {
        state.running = true;
        state.manualResult = null;
      })
      .addCase(runManualDhtt.fulfilled, (state, action) => {
        state.running = false;
        state.manualResult = action.payload;
      })
      .addCase(runManualDhtt.rejected, (state) => {
        state.running = false;
      })

      .addCase(fetchDhttHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDhttHistory.fulfilled, (state, action) => {
        state.loading = false;
        // Giả định API trả về format: { results: [...], count: number }
        state.items = action.payload?.results || [];
        state.count = action.payload?.count || 0;
      })
      .addCase(fetchDhttHistory.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload;
      });
  },
});

export default dhttSlice.reducer;
