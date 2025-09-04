// src/redux/User/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import snocApi from '../../api/snocApiWithAutoToken';
import { showTemporaryAlert } from '../Alert/alertSlice';

// ================= Thunks =================

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.post('users/register', userData, { signal });
      dispatch(showTemporaryAlert({ message: 'User created successfully!', type: 'success' }));
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to create user.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_ignored, { rejectWithValue, dispatch, signal }) => {
    try {
      // Theo code hiện tại bạn đang GET users/register (giữ nguyên)
      const res = await snocApi.get('users/register', { signal });
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to fetch user.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId, { rejectWithValue, dispatch, signal }) => {
    try {
      await snocApi.delete(`users/register/${userId}/admin_delete_user`, { signal });
      dispatch(showTemporaryAlert({ message: 'User deleted successfully!', type: 'success' }));
      return userId;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete user.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.put(`users/register/${userId}`, userData, { signal });
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to update user.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const changePassword = createAsyncThunk(
  'users/changePassword',
  async (passwordData, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.patch(
        `users/register/${passwordData.id}/admin_change_password`,
        passwordData,
        { signal }
      );
      dispatch(showTemporaryAlert({ message: 'Change password successfully!', type: 'success' }));
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to change password user.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const uploadUsersCSV = createAsyncThunk(
  'user/uploadUsersCSV',
  async (file, { rejectWithValue, signal }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await snocApi.post('users/upload-users/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

// ================= Slice =================

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    usersadds: [],
    showModalCreate: false,
    showModalUpdate: false,
    showModalDelete: false,
    showChangePasswordModal: false,
    status: 'idle',
    selectedUser: null,

    fetchStatus: 'idle',
    createStatus: 'idle',
    deleteStatus: 'idle',

    error: null,
    errorCreateUser: null,
    errorFetchUser: null,
    erroruploadUsersCSV: null,
    loading: false,
    refresh: false, // Add a refresh state
    roles: [
      { key: 'admin', value: 'Admin' },
      { key: 'user', value: 'User' },
      { key: 'super', value: 'Super' }
    ],
    nocs: [
      { key: 'noc1', value: 'NOC1' },
      { key: 'noc2', value: 'NOC2' },
      { key: 'noc3', value: 'NOC3' },
      { key: '_', value: '_' }
    ],
    departs: [
      { key: 'inoc', value: 'INOC' },
      { key: 'rnoc', value: 'RNOC' },
      { key: 'snoc', value: 'SNOC' },
      { key: 'tnoc', value: 'TNOC' },
      { key: '_', value: '_' }
    ],
  },
  reducers: {
    toggleModalCreate: (state) => {
      state.showModalCreate = !state.showModalCreate;
      state.errorCreateUser = null;
    },
    toggleModalUpdate: (state) => {
      state.showModalUpdate = !state.showModalUpdate;
      if (!state.showModalUpdate) {
        state.selectedUser = null;
      }
    },
    toggleModalDelete: (state) => {
      state.showModalDelete = !state.showModalDelete;
      if (!state.showModalDelete) {
        state.selectedUser = null;
      }
    },
    toggleChangePasswordModal: (state, action) => {
      state.showChangePasswordModal = !state.showChangePasswordModal;
      state.selectedUser = action.payload || null;
    },
    toggleRefresh: (state) => {
      state.refresh = !state.refresh;
    },
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.errorFetchUser = action.error?.message || 'Fetch users failed';
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.push(action.payload);
        state.showModalCreate = false;
        state.refresh = !state.refresh;
        state.errorCreateUser = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.errorCreateUser = action.payload;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Delete user failed';
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.status = 'idle';
        state.refresh = !state.refresh;
        state.showModalUpdate = false;
        state.selectedUser = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Update user failed';
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Change password failed';
      })

      // Upload CSV
      .addCase(uploadUsersCSV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadUsersCSV.fulfilled, (state, action) => {
        state.loading = false;
        state.usersadds = action.payload;
        state.refresh = !state.refresh;
      })
      .addCase(uploadUsersCSV.rejected, (state, action) => {
        state.loading = false;
        state.erroruploadUsersCSV = action.payload;
      });
  },
});

export const {
  toggleModalCreate,
  toggleModalUpdate,
  toggleRefresh,
  selectUser,
  toggleModalDelete,
  toggleChangePasswordModal,
  resetError,
} = userSlice.actions;

export default userSlice.reducer;
