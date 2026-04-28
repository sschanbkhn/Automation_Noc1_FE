// src/redux/Dhtt/dhttSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// Thunk lấy dữ liệu lịch sử DHTT
export const fetchDhttHistory = createAsyncThunk(
  "dhtt/fetchDhttHistory",
  async ({ host, page = 1, page_size = 10 }, { dispatch, rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      params.append("page", String(page));
      params.append("page_size", String(page_size));

      // ⚠️ Đổi endpoint này theo API thực tế của DHTT
      const response = await snocApi.get(`/nornirps/DhttSyncHistoryView/?${params.toString()}`);
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Không thể tải dữ liệu lịch sử DHTT";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

const dhttSlice = createSlice({
  name: "dhtt",
  initialState: {
    items: [],
    loading: false,
    count: 0,
    error: null,
  },
  reducers: {
    // Thêm các reducer đồng bộ ở đây nếu cần (VD: WebSocket cho DHTT)
  },
  extraReducers: (builder) => {
    builder
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