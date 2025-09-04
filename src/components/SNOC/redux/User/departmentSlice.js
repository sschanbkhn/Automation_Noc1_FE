// src/redux/Department/departmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import snocApi from '../../api/snocApiWithAutoToken';
import { showTemporaryAlert } from '../Alert/alertSlice';

// =============== Thunks ===============

export const fetchDepartments = createAsyncThunk(
  'department/fetchDepartments',
  async (_arg, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.get('users/departments', { signal });
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to fetch department.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'department/createDepartment',
  async (departmentData, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.post('users/departments', departmentData, { signal });
      dispatch(showTemporaryAlert({ message: 'create department successfully!', type: 'success' }));
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to create department.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'department/updateDepartment',
  async ({ departmentId, departmentData }, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.put(`users/departments/${departmentId}`, departmentData, { signal });
      dispatch(showTemporaryAlert({ message: 'update department successfully!', type: 'success' }));
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to update department.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'department/deleteDepartment',
  async (departmentId, { rejectWithValue, dispatch, signal }) => {
    try {
      await snocApi.delete(`users/departments/${departmentId}`, { signal });
      dispatch(showTemporaryAlert({ message: 'delete department successfully!', type: 'success' }));
      return departmentId;
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete department.';
      dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// =============== Slice ===============

const departmentSlice = createSlice({
  name: 'department',
  initialState: {
    departments: [],
    showModalCreateDepartment: false,
    showModalUpdateDepartment: false,
    showModalDeleteDepartment: false,
    statusDepartment: 'idle',
    errorDepartment: null,
    refreshDepart: false,
    selectedDepartment: null,
  },
  reducers: {
    toggleModalCreateDepartment: (state) => {
      state.showModalCreateDepartment = !state.showModalCreateDepartment;
    },
    toggleModalUpdateDepartment: (state) => {
      state.showModalUpdateDepartment = !state.showModalUpdateDepartment;
      if (!state.showModalUpdateDepartment) {
        state.selectedDepartment = null;
      }
    },
    toggleModalDeleteDepartment: (state) => {
      state.showModalDeleteDepartment = !state.showModalDeleteDepartment;
      if (!state.showModalDeleteDepartment) {
        state.selectedDepartment = null;
      }
    },
    // sửa dùng đúng key refreshDepart
    toggleRefresh: (state) => {
      state.refreshDepart = !state.refreshDepart;
    },
    selectDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDepartments.pending, (state) => {
        state.statusDepartment = 'loading';
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.statusDepartment = 'succeeded';
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.statusDepartment = 'failed';
        state.errorDepartment = action.error?.message || 'Fetch departments failed';
      })

      // Create
      .addCase(createDepartment.pending, (state) => {
        state.statusDepartment = 'loading';
      })
      .addCase(createDepartment.fulfilled, (state) => {
        state.statusDepartment = 'succeeded';
        state.refreshDepart = !state.refreshDepart;
        state.showModalCreateDepartment = false; // đóng modal khi tạo thành công
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.statusDepartment = 'failed';
        state.errorDepartment = action.error?.message || 'Create department failed';
      })

      // Update
      .addCase(updateDepartment.pending, (state) => {
        state.statusDepartment = 'loading';
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.departments.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.departments[idx] = action.payload;
        state.statusDepartment = 'succeeded';
        state.refreshDepart = !state.refreshDepart;
        state.showModalUpdateDepartment = false;
        // giữ nguyên ý định cũ: không clear selectedDepartment ở đây
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.statusDepartment = 'failed';
        state.errorDepartment = action.error?.message || 'Update department failed';
      })

      // Delete
      .addCase(deleteDepartment.pending, (state) => {
        state.statusDepartment = 'loading';
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d.id !== action.payload);
        state.statusDepartment = 'succeeded';
        state.selectedDepartment = null;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.statusDepartment = 'failed';
        state.errorDepartment = action.error?.message || 'Delete department failed';
      });
  },
});

export const {
  toggleModalCreateDepartment,
  toggleModalUpdateDepartment,
  toggleModalDeleteDepartment,
  toggleRefresh,
  selectDepartment,
} = departmentSlice.actions;

export default departmentSlice.reducer;
