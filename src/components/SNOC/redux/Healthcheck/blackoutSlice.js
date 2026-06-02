// src/redux/Healthcheck/blackoutSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE = "/nornirps/blackout-configs/";

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchBlackouts = createAsyncThunk(
  "blackout/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE);
      return res.data.items || [];
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể tải danh sách blackout";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createBlackout = createAsyncThunk(
  "blackout/create",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(BASE, payload);
      dispatch(showTemporaryAlert({ message: "Tạo blackout thành công", type: "success" }));
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể tạo blackout";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const patchBlackout = createAsyncThunk(
  "blackout/patch",
  async ({ id, patch }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(`${BASE}${id}/`, patch);
      dispatch(showTemporaryAlert({ message: "Cập nhật thành công", type: "success" }));
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền sửa blackout này."
          : error?.response?.data?.error || "Không thể cập nhật blackout";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteBlackout = createAsyncThunk(
  "blackout/delete",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${BASE}${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã xóa blackout", type: "success" }));
      return id;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền xóa blackout này."
          : error?.response?.data?.error || "Không thể xóa blackout";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// Toggle enabled nhanh
export const toggleBlackout = createAsyncThunk(
  "blackout/toggle",
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(`${BASE}${id}/`, { enabled });
      dispatch(showTemporaryAlert({
        message: enabled ? "Đã bật blackout" : "Đã tắt blackout",
        type: "success",
      }));
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể thay đổi trạng thái";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const blackoutSlice = createSlice({
  name: "blackout",
  initialState: {
    items:   [],
    loading: false,
    saving:  false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchBlackouts.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBlackouts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchBlackouts.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      // create
      .addCase(createBlackout.pending,   (s) => { s.saving = true; })
      .addCase(createBlackout.fulfilled, (s, a) => {
        s.saving = false;
        s.items  = [a.payload, ...s.items];
      })
      .addCase(createBlackout.rejected,  (s) => { s.saving = false; })

      // patch
      .addCase(patchBlackout.pending,   (s) => { s.saving = true; })
      .addCase(patchBlackout.fulfilled, (s, a) => {
        s.saving = false;
        s.items  = s.items.map((x) => x.id === a.payload.id ? a.payload : x);
      })
      .addCase(patchBlackout.rejected,  (s) => { s.saving = false; })

      // toggle
      .addCase(toggleBlackout.pending,   (s) => { s.saving = true; })
      .addCase(toggleBlackout.fulfilled, (s, a) => {
        s.saving = false;
        s.items  = s.items.map((x) => x.id === a.payload.id ? a.payload : x);
      })
      .addCase(toggleBlackout.rejected,  (s) => { s.saving = false; })

      // delete
      .addCase(deleteBlackout.pending,   (s) => { s.saving = true; })
      .addCase(deleteBlackout.fulfilled, (s, a) => {
        s.saving = false;
        s.items  = s.items.filter((x) => x.id !== a.payload);
      })
      .addCase(deleteBlackout.rejected,  (s) => { s.saving = false; })
  },
});

export default blackoutSlice.reducer;