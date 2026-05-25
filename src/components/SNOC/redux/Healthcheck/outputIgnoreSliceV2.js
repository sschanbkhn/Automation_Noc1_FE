// src/redux/Healthcheck/outputIgnoreSliceV2.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";  // ← đúng như bản cũ
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE = "/nornirps/healthcheck/output-ignore-rules/v2/";

export const fetchOutputIgnoreRulesV2 = createAsyncThunk(
  "outputIgnoreV2/fetchAll",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get(BASE, { params });
      const data = res.data;
      return Array.isArray(data) ? data : data?.items || [];
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Không thể tải danh sách rules V2";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createOutputIgnoreRuleV2 = createAsyncThunk(
  "outputIgnoreV2/create",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.post(BASE, payload);
      dispatch(showTemporaryAlert({ message: "Tạo rule thành công", type: "success" }));
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 400
          ? error?.response?.data?.error || "Dữ liệu không hợp lệ"
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Không thể tạo rule";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const patchOutputIgnoreRuleV2 = createAsyncThunk(
  "outputIgnoreV2/patch",
  async ({ id, patch }, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.patch(`${BASE}${id}/`, patch);
      dispatch(showTemporaryAlert({ message: "Cập nhật rule thành công", type: "success" }));
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền sửa rule của phòng ban khác."
          : status === 400
          ? error?.response?.data?.error || "Dữ liệu không hợp lệ"
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Không thể cập nhật rule";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteOutputIgnoreRuleV2 = createAsyncThunk(
  "outputIgnoreV2/delete",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`${BASE}${id}/`);
      dispatch(showTemporaryAlert({ message: "Xóa rule thành công", type: "success" }));
      return id;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền xóa rule của phòng ban khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Không thể xóa rule";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const outputIgnoreSliceV2 = createSlice({
  name: "outputIgnoreV2",
  initialState: {
    items:   [],
    loading: false,
    saving:  false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOutputIgnoreRulesV2.pending,   (state) => { state.loading = true; })
      .addCase(fetchOutputIgnoreRulesV2.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload || [];
      })
      .addCase(fetchOutputIgnoreRulesV2.rejected,  (state) => { state.loading = false; })

      .addCase(createOutputIgnoreRuleV2.pending,   (state) => { state.saving = true; })
      .addCase(createOutputIgnoreRuleV2.fulfilled, (state, action) => {
        state.saving = false;
        state.items  = [action.payload, ...(state.items || [])];
      })
      .addCase(createOutputIgnoreRuleV2.rejected,  (state) => { state.saving = false; })

      .addCase(patchOutputIgnoreRuleV2.pending,   (state) => { state.saving = true; })
      .addCase(patchOutputIgnoreRuleV2.fulfilled, (state, action) => {
        state.saving = false;
        state.items  = (state.items || []).map((x) =>
          x.id === action.payload.id ? action.payload : x
        );
      })
      .addCase(patchOutputIgnoreRuleV2.rejected,  (state) => { state.saving = false; })

      .addCase(deleteOutputIgnoreRuleV2.pending,   (state) => { state.saving = true; })
      .addCase(deleteOutputIgnoreRuleV2.fulfilled, (state, action) => {
        state.saving = false;
        state.items  = (state.items || []).filter((x) => x.id !== action.payload);
      })
      .addCase(deleteOutputIgnoreRuleV2.rejected,  (state) => { state.saving = false; });
  },
});

export default outputIgnoreSliceV2.reducer;