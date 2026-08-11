import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE_URL = "/nornirps/healthcheck/group-schema-permissions/";

export const fetchGroupSchemaPermissions = createAsyncThunk(
  "groupSchemaPermission/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE_URL);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tải phân quyền theo group";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createGroupSchemaPermission = createAsyncThunk(
  "groupSchemaPermission/create",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(BASE_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã tạo phân quyền", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || JSON.stringify(err?.response?.data || {}) || "Không thể tạo";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateGroupSchemaPermission = createAsyncThunk(
  "groupSchemaPermission/update",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(`${BASE_URL}${id}/`, data);
      dispatch(showTemporaryAlert({ message: "Đã cập nhật", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || JSON.stringify(err?.response?.data || {}) || "Không thể cập nhật";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteGroupSchemaPermission = createAsyncThunk(
  "groupSchemaPermission/delete",
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

const groupSchemaPermissionSlice = createSlice({
  name: "groupSchemaPermission",
  initialState: {
    permissions: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupSchemaPermissions.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGroupSchemaPermissions.fulfilled, (s, a) => { s.loading = false; s.permissions = a.payload; })
      .addCase(fetchGroupSchemaPermissions.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createGroupSchemaPermission.pending,   (s) => { s.saving = true; })
      .addCase(createGroupSchemaPermission.fulfilled, (s, a) => { s.saving = false; s.permissions.push(a.payload); })
      .addCase(createGroupSchemaPermission.rejected,  (s) => { s.saving = false; })

      .addCase(updateGroupSchemaPermission.pending,   (s) => { s.saving = true; })
      .addCase(updateGroupSchemaPermission.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.permissions.findIndex((p) => p.id === a.payload.id);
        if (idx !== -1) s.permissions[idx] = a.payload;
      })
      .addCase(updateGroupSchemaPermission.rejected,  (s) => { s.saving = false; })

      .addCase(deleteGroupSchemaPermission.pending,   (s) => { s.saving = true; })
      .addCase(deleteGroupSchemaPermission.fulfilled, (s, a) => {
        s.saving = false;
        s.permissions = s.permissions.filter((p) => p.id !== a.payload);
      })
      .addCase(deleteGroupSchemaPermission.rejected,  (s) => { s.saving = false; });
  },
});

export default groupSchemaPermissionSlice.reducer;
