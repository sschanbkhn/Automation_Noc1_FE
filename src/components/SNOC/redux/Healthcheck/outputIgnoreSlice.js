// src/redux/Healthcheck/outputIgnoreSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE = "/nornirps/healthcheck/output-ignore-rules/";

// GET list rules
export const fetchOutputIgnoreRules = createAsyncThunk(
  "outputIgnore/fetchOutputIgnoreRules",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get(BASE, { params });

      // backend có thể trả {items:[...]} hoặc list raw
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.items || [];
      return items;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tải danh sách output ignore rules";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// POST create rule
export const createOutputIgnoreRule = createAsyncThunk(
  "outputIgnore/createOutputIgnoreRule",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.post(BASE, payload);
      dispatch(
        showTemporaryAlert({ message: "Tạo rule thành công", type: "success" })
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể tạo output ignore rule";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// PATCH update rule
export const patchOutputIgnoreRule = createAsyncThunk(
  "outputIgnore/patchOutputIgnoreRule",
  async ({ id, patch }, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.patch(`${BASE}${id}/`, patch);
      dispatch(
        showTemporaryAlert({
          message: "Cập nhật rule thành công",
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể cập nhật output ignore rule";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// DELETE rule
export const deleteOutputIgnoreRule = createAsyncThunk(
  "outputIgnore/deleteOutputIgnoreRule",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`${BASE}${id}/`);
      dispatch(
        showTemporaryAlert({ message: "Xóa rule thành công", type: "success" })
      );
      return id;
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Không thể xóa output ignore rule";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const outputIgnoreSlice = createSlice({
  name: "outputIgnore",
  initialState: {
    items: [],
    loading: false,
    saving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- LIST ----
      .addCase(fetchOutputIgnoreRules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOutputIgnoreRules.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchOutputIgnoreRules.rejected, (state) => {
        state.loading = false;
      })

      // ---- CREATE ----
      .addCase(createOutputIgnoreRule.pending, (state) => {
        state.saving = true;
      })
      .addCase(createOutputIgnoreRule.fulfilled, (state, action) => {
        state.saving = false;
        state.items = [action.payload, ...(state.items || [])];
      })
      .addCase(createOutputIgnoreRule.rejected, (state) => {
        state.saving = false;
      })

      // ---- PATCH ----
      .addCase(patchOutputIgnoreRule.pending, (state) => {
        state.saving = true;
      })
      .addCase(patchOutputIgnoreRule.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        state.items = (state.items || []).map((x) =>
          x.id === updated.id ? updated : x
        );
      })
      .addCase(patchOutputIgnoreRule.rejected, (state) => {
        state.saving = false;
      })

      // ---- DELETE ----
      .addCase(deleteOutputIgnoreRule.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteOutputIgnoreRule.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload;
        state.items = (state.items || []).filter((x) => x.id !== id);
      })
      .addCase(deleteOutputIgnoreRule.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default outputIgnoreSlice.reducer;
