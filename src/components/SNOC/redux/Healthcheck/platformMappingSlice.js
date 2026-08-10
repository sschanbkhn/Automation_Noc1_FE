import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE_URL = "/nornirps/healthcheck/platform-mapping/";
const PROFILE_REGISTRY_URL = "/nornirps/healthcheck/profile-registry/";
const PLATFORM_GROUP_KEYS_URL = "/nornirps/healthcheck/platform-group-keys/";
const PLATFORM_GROUP_SCHEMA_URL = "/nornirps/systemhealth/schema/";

export const fetchPlatformMappings = createAsyncThunk(
  "platformMapping/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE_URL);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tải platform mapping";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createPlatformMapping = createAsyncThunk(
  "platformMapping/create",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(BASE_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã tạo platform mapping", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || JSON.stringify(err?.response?.data || {}) || "Không thể tạo";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updatePlatformMapping = createAsyncThunk(
  "platformMapping/update",
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

export const deletePlatformMapping = createAsyncThunk(
  "platformMapping/delete",
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

export const fetchProfileRegistry = createAsyncThunk(
  "platformMapping/fetchProfileRegistry",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(PROFILE_REGISTRY_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || "Không thể tải profile registry");
    }
  }
);

export const fetchPlatformGroupKeys = createAsyncThunk(
  "platformMapping/fetchPlatformGroupKeys",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(PLATFORM_GROUP_KEYS_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || "Không thể tải danh sách platform-group");
    }
  }
);

export const fetchPlatformGroupSchema = createAsyncThunk(
  "platformMapping/fetchPlatformGroupSchema",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(PLATFORM_GROUP_SCHEMA_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || "Không thể tải schema group/subsystem");
    }
  }
);

const platformMappingSlice = createSlice({
  name: "platformMapping",
  initialState: {
    mappings: [],
    profiles: [],       // [{key, task_func, command_file}]
    groupKeys: [],       // ["CS Core", "UDC Core", ...]
    groupSchema: {},      // {group: {subsystem: [platform, ...]}}
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformMappings.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPlatformMappings.fulfilled, (s, a) => { s.loading = false; s.mappings = a.payload; })
      .addCase(fetchPlatformMappings.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createPlatformMapping.pending,   (s) => { s.saving = true; })
      .addCase(createPlatformMapping.fulfilled, (s, a) => { s.saving = false; s.mappings.push(a.payload); })
      .addCase(createPlatformMapping.rejected,  (s) => { s.saving = false; })

      .addCase(updatePlatformMapping.pending,   (s) => { s.saving = true; })
      .addCase(updatePlatformMapping.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.mappings.findIndex((m) => m.id === a.payload.id);
        if (idx !== -1) s.mappings[idx] = a.payload;
      })
      .addCase(updatePlatformMapping.rejected,  (s) => { s.saving = false; })

      .addCase(deletePlatformMapping.pending,   (s) => { s.saving = true; })
      .addCase(deletePlatformMapping.fulfilled, (s, a) => {
        s.saving = false;
        s.mappings = s.mappings.filter((m) => m.id !== a.payload);
      })
      .addCase(deletePlatformMapping.rejected,  (s) => { s.saving = false; })

      .addCase(fetchProfileRegistry.fulfilled, (s, a) => { s.profiles = a.payload || []; })
      .addCase(fetchPlatformGroupKeys.fulfilled, (s, a) => { s.groupKeys = a.payload || []; })
      .addCase(fetchPlatformGroupSchema.fulfilled, (s, a) => { s.groupSchema = a.payload || {}; });
  },
});

export default platformMappingSlice.reducer;
