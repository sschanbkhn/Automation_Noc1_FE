import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const GROUPS_URL = "/nornirps/healthcheck/platform-groups/";
const SUBSYSTEMS_URL = "/nornirps/healthcheck/subsystems/";

const extractError = (err, fallback) =>
  err?.response?.data?.detail || JSON.stringify(err?.response?.data || {}) || fallback;

// ── Groups ───────────────────────────────────────────────────────────────

export const fetchGroupEntities = createAsyncThunk(
  "platformTaxonomy/fetchGroups",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(GROUPS_URL);
      return res.data;
    } catch (err) {
      const msg = extractError(err, "Không thể tải danh sách group");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createGroupEntity = createAsyncThunk(
  "platformTaxonomy/createGroup",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(GROUPS_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã tạo group", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = extractError(err, "Không thể tạo group");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateGroupEntity = createAsyncThunk(
  "platformTaxonomy/updateGroup",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(`${GROUPS_URL}${id}/`, data);
      dispatch(showTemporaryAlert({ message: "Đã cập nhật group", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = extractError(err, "Không thể cập nhật group");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteGroupEntity = createAsyncThunk(
  "platformTaxonomy/deleteGroup",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${GROUPS_URL}${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã xóa group", type: "success" }));
      return id;
    } catch (err) {
      const msg = extractError(err, "Không thể xóa group");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

// ── Subsystems ───────────────────────────────────────────────────────────

export const fetchSubsystemEntities = createAsyncThunk(
  "platformTaxonomy/fetchSubsystems",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(SUBSYSTEMS_URL);
      return res.data;
    } catch (err) {
      const msg = extractError(err, "Không thể tải danh sách subsystem");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createSubsystemEntity = createAsyncThunk(
  "platformTaxonomy/createSubsystem",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(SUBSYSTEMS_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã tạo subsystem", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = extractError(err, "Không thể tạo subsystem");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateSubsystemEntity = createAsyncThunk(
  "platformTaxonomy/updateSubsystem",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(`${SUBSYSTEMS_URL}${id}/`, data);
      dispatch(showTemporaryAlert({ message: "Đã cập nhật subsystem", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = extractError(err, "Không thể cập nhật subsystem");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteSubsystemEntity = createAsyncThunk(
  "platformTaxonomy/deleteSubsystem",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${SUBSYSTEMS_URL}${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã xóa subsystem", type: "success" }));
      return id;
    } catch (err) {
      const msg = extractError(err, "Không thể xóa subsystem");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const platformTaxonomySlice = createSlice({
  name: "platformTaxonomy",
  initialState: {
    groups: [],       // [{id, name}]
    subsystems: [],    // [{id, group, group_name, name}]
    loading: false,
    saving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupEntities.pending,   (s) => { s.loading = true; })
      .addCase(fetchGroupEntities.fulfilled, (s, a) => { s.loading = false; s.groups = a.payload || []; })
      .addCase(fetchGroupEntities.rejected,  (s) => { s.loading = false; })

      .addCase(createGroupEntity.pending,   (s) => { s.saving = true; })
      .addCase(createGroupEntity.fulfilled, (s, a) => { s.saving = false; s.groups.push(a.payload); })
      .addCase(createGroupEntity.rejected,  (s) => { s.saving = false; })

      .addCase(updateGroupEntity.pending,   (s) => { s.saving = true; })
      .addCase(updateGroupEntity.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.groups.findIndex((g) => g.id === a.payload.id);
        if (idx !== -1) s.groups[idx] = a.payload;
      })
      .addCase(updateGroupEntity.rejected,  (s) => { s.saving = false; })

      .addCase(deleteGroupEntity.pending,   (s) => { s.saving = true; })
      .addCase(deleteGroupEntity.fulfilled, (s, a) => {
        s.saving = false;
        s.groups = s.groups.filter((g) => g.id !== a.payload);
      })
      .addCase(deleteGroupEntity.rejected,  (s) => { s.saving = false; })

      .addCase(fetchSubsystemEntities.pending,   (s) => { s.loading = true; })
      .addCase(fetchSubsystemEntities.fulfilled, (s, a) => { s.loading = false; s.subsystems = a.payload || []; })
      .addCase(fetchSubsystemEntities.rejected,  (s) => { s.loading = false; })

      .addCase(createSubsystemEntity.pending,   (s) => { s.saving = true; })
      .addCase(createSubsystemEntity.fulfilled, (s, a) => { s.saving = false; s.subsystems.push(a.payload); })
      .addCase(createSubsystemEntity.rejected,  (s) => { s.saving = false; })

      .addCase(updateSubsystemEntity.pending,   (s) => { s.saving = true; })
      .addCase(updateSubsystemEntity.fulfilled, (s, a) => {
        s.saving = false;
        const idx = s.subsystems.findIndex((sub) => sub.id === a.payload.id);
        if (idx !== -1) s.subsystems[idx] = a.payload;
      })
      .addCase(updateSubsystemEntity.rejected,  (s) => { s.saving = false; })

      .addCase(deleteSubsystemEntity.pending,   (s) => { s.saving = true; })
      .addCase(deleteSubsystemEntity.fulfilled, (s, a) => {
        s.saving = false;
        s.subsystems = s.subsystems.filter((sub) => sub.id !== a.payload);
      })
      .addCase(deleteSubsystemEntity.rejected,  (s) => { s.saving = false; });
  },
});

export default platformTaxonomySlice.reducer;
