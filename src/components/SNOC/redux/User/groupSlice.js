// src/redux/Group/groupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import snocApi from '../../api/snocApiWithAutoToken';
import { showTemporaryAlert } from '../Alert/alertSlice';

// ============ Thunks ============

export const fetchGroups = createAsyncThunk(
  'group/fetchGroups',
  async (_arg, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.get('users/groups', { signal });
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to fetch groups.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const createGroup = createAsyncThunk(
  'group/createGroup',
  async (groupData, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.post('users/groups', groupData, { signal });
      dispatch(showTemporaryAlert({ message: 'create group successfully!', type: 'success' }));
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to create group.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'group/updateGroup',
  async ({ groupId, groupData }, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.put(`users/groups/${groupId}`, groupData, { signal });
      dispatch(showTemporaryAlert({ message: 'update group successfully!', type: 'success' }));
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to update group.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'group/deleteGroup',
  async (groupId, { rejectWithValue, dispatch, signal }) => {
    try {
      await snocApi.delete(`users/groups/${groupId}`, { signal });
      dispatch(showTemporaryAlert({ message: 'delete group successfully!', type: 'success' }));
      return groupId;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete group.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// ============ Slice ============

const groupSlice = createSlice({
  name: 'group',
  initialState: {
    groups: [],
    showModalCreateGroup: false,
    showModalUpdateGroup: false,
    showModalDeleteGroup: false,
    errorGroupGroupFetchgroup: false, // giữ nguyên key như code cũ để không vỡ UI
    statusGroup: 'idle',
    errorGroup: null,
    refreshGroup: false,
    selectedGroup: null,
  },
  reducers: {
    toggleModalCreateGroup: (state) => {
      state.showModalCreateGroup = !state.showModalCreateGroup;
    },
    toggleModalUpdateGroup: (state) => {
      state.showModalUpdateGroup = !state.showModalUpdateGroup;
      if (!state.showModalUpdateGroup) state.selectedGroup = null;
    },
    toggleModalDeleteGroup: (state) => {
      state.showModalDeleteGroup = !state.showModalDeleteGroup;
      if (!state.showModalDeleteGroup) state.selectedGroup = null;
    },
    selectGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchGroups.pending, (state) => {
        state.statusGroup = 'loading';
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.statusGroup = 'succeeded';
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.statusGroup = 'failed';
        state.errorGroupGroupFetchgroup = action.error?.message || 'Fetch groups failed';
      })

      // Create
      .addCase(createGroup.pending, (state) => {
        state.statusGroup = 'loading';
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        state.statusGroup = 'succeeded';
        // ✅ đóng modal + refresh khi thành công
        state.showModalCreateGroup = false;
        state.refreshGroup = !state.refreshGroup;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.statusGroup = 'failed';
        state.errorGroup = action.error?.message || 'Create group failed';
      })

      // Update
      .addCase(updateGroup.pending, (state) => {
        state.statusGroup = 'loading';
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const idx = state.groups.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.groups[idx] = action.payload;
        state.statusGroup = 'succeeded';
        state.refreshGroup = !state.refreshGroup;
        state.showModalUpdateGroup = false;
        state.selectedGroup = null;
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.statusGroup = 'failed';
        state.errorGroup = action.error?.message || 'Update group failed';
      })

      // Delete
      .addCase(deleteGroup.pending, (state) => {
        state.statusGroup = 'loading';
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g.id !== action.payload);
        state.statusGroup = 'succeeded';
        state.showModalDeleteGroup = false;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.statusGroup = 'failed';
        state.errorGroup = action.error?.message || 'Delete group failed';
      });
  },
});

export const {
  toggleModalCreateGroup,
  toggleModalUpdateGroup,
  toggleModalDeleteGroup,
  selectGroup,
} = groupSlice.actions;

export default groupSlice.reducer;
