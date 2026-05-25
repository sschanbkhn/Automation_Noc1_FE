// src/redux/User/accessScopeSlice.js  — THAY THẾ TOÀN BỘ (FINAL)
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import snocApi from '../../api/snocApiWithAutoToken';
import { showTemporaryAlert } from '../Alert/alertSlice';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAccessScopes = createAsyncThunk(
  'accessScope/fetch',
  async (_arg, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get('users/access-scopes');
      return res.data;
    } catch (e) {
      dispatch(showTemporaryAlert({ message: e?.response?.data?.detail || 'Lỗi tải phạm vi.', type: 'danger' }));
      return rejectWithValue(e?.response?.data);
    }
  }
);

export const createAccessScope = createAsyncThunk(
  'accessScope/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      // ✅ data phải bao gồm: name, code, description, modules, department_ids, group_ids
      const res = await snocApi.post('users/access-scopes', data);
      dispatch(showTemporaryAlert({ message: 'Tạo phạm vi thành công!', type: 'success' }));
      return res.data;
    } catch (e) {
      dispatch(showTemporaryAlert({ message: e?.response?.data?.detail || 'Lỗi tạo phạm vi.', type: 'danger' }));
      return rejectWithValue(e?.response?.data);
    }
  }
);

export const updateAccessScope = createAsyncThunk(
  'accessScope/update',
  async ({ scopeId, scopeData }, { rejectWithValue, dispatch }) => {
    try {
      // ✅ scopeData phải bao gồm: name, code, description, modules, department_ids, group_ids
      const res = await snocApi.put(`users/access-scopes/${scopeId}`, scopeData);
      dispatch(showTemporaryAlert({ message: 'Cập nhật thành công!', type: 'success' }));
      return res.data;
    } catch (e) {
      dispatch(showTemporaryAlert({ message: e?.response?.data?.detail || 'Lỗi cập nhật.', type: 'danger' }));
      return rejectWithValue(e?.response?.data);
    }
  }
);

export const deleteAccessScope = createAsyncThunk(
  'accessScope/delete',
  async (scopeId, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`users/access-scopes/${scopeId}`);
      dispatch(showTemporaryAlert({ message: 'Đã xóa phạm vi.', type: 'success' }));
      return scopeId;
    } catch (e) {
      dispatch(showTemporaryAlert({ message: e?.response?.data?.detail || 'Lỗi xóa.', type: 'danger' }));
      return rejectWithValue(e?.response?.data);
    }
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────
const accessScopeSlice = createSlice({
  name: 'accessScope',
  initialState: {
    scopes:     [],
    status:     'idle',
    error:      null,
    selected:   null,
    showCreate: false,
    showUpdate: false,
    showDelete: false,
  },
  reducers: {
    selectScope:      (s, a) => { s.selected = a.payload; },
    toggleShowCreate: (s) => { s.showCreate = !s.showCreate; },
    toggleShowUpdate: (s) => { s.showUpdate = !s.showUpdate; if (!s.showUpdate) s.selected = null; },
    toggleShowDelete: (s) => { s.showDelete = !s.showDelete; if (!s.showDelete) s.selected = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchAccessScopes.pending,   (s) => { s.status = 'loading'; })
      .addCase(fetchAccessScopes.fulfilled, (s, a) => { s.status = 'succeeded'; s.scopes = a.payload; })
      .addCase(fetchAccessScopes.rejected,  (s, a) => { s.status = 'failed'; s.error = a.error?.message; })
      .addCase(createAccessScope.fulfilled, (s, a) => {
        s.scopes.push(a.payload); s.showCreate = false;
      })
      .addCase(updateAccessScope.fulfilled, (s, a) => {
        const i = s.scopes.findIndex((sc) => sc.id === a.payload.id);
        if (i !== -1) s.scopes[i] = a.payload;
        s.showUpdate = false; s.selected = null;
      })
      .addCase(deleteAccessScope.fulfilled, (s, a) => {
        s.scopes = s.scopes.filter((sc) => sc.id !== a.payload);
        s.showDelete = false; s.selected = null;
      });
  },
});

export const { selectScope, toggleShowCreate, toggleShowUpdate, toggleShowDelete } = accessScopeSlice.actions;
export default accessScopeSlice.reducer;
