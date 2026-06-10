import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE_URL = "/nornirps/healthcheck/retention-configs/";

export const fetchRetentionConfigs = createAsyncThunk(
  "retentionConfig/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE_URL);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tải cấu hình lưu giữ";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createRetentionConfig = createAsyncThunk(
  "retentionConfig/create",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(BASE_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã tạo cấu hình lưu giữ", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tạo";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateRetentionConfig = createAsyncThunk(
  "retentionConfig/update",
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

export const deleteRetentionConfig = createAsyncThunk(
  "retentionConfig/delete",
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

const retentionConfigSlice = createSlice({
  name: "retentionConfig",
  initialState: {
    items:   [],
    loading: false,
    saving:  false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRetentionConfigs.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchRetentionConfigs.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchRetentionConfigs.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createRetentionConfig.pending,   (s) => { s.saving = true; })
      .addCase(createRetentionConfig.fulfilled, (s, a) => {
        s.saving = false;
        s.items.push(a.payload);
      })
      .addCase(createRetentionConfig.rejected,  (s) => { s.saving = false; })

      .addCase(updateRetentionConfig.pending,   (s) => { s.saving = true; })
      .addCase(updateRetentionConfig.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.items.findIndex((c) => c.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(updateRetentionConfig.rejected,  (s) => { s.saving = false; })

      .addCase(deleteRetentionConfig.pending,   (s) => { s.saving = true; })
      .addCase(deleteRetentionConfig.fulfilled, (s, a) => {
        s.saving = false;
        s.items = s.items.filter((c) => c.id !== a.payload);
      })
      .addCase(deleteRetentionConfig.rejected,  (s) => { s.saving = false; });
  },
});

export default retentionConfigSlice.reducer;
