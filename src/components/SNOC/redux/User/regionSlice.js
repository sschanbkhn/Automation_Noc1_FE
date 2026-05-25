// src/redux/User/regionSlice.js  — FILE MỚI
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import snocApi from '../../api/snocApiWithAutoToken';
import { showTemporaryAlert } from '../Alert/alertSlice';

export const fetchRegions = createAsyncThunk(
  'region/fetchRegions',
  async (_arg, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.get('users/regions', { signal });
      return res.data;
    } catch (error) {
      dispatch(showTemporaryAlert({ message: error?.response?.data?.detail || 'Failed to fetch regions.', type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const createRegion = createAsyncThunk(
  'region/createRegion',
  async (regionData, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.post('users/regions', regionData, { signal });
      dispatch(showTemporaryAlert({ message: 'Tạo vùng thành công!', type: 'success' }));
      return res.data;
    } catch (error) {
      dispatch(showTemporaryAlert({ message: error?.response?.data?.detail || 'Failed to create region.', type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateRegion = createAsyncThunk(
  'region/updateRegion',
  async ({ regionId, regionData }, { rejectWithValue, dispatch, signal }) => {
    try {
      const res = await snocApi.put(`users/regions/${regionId}`, regionData, { signal });
      dispatch(showTemporaryAlert({ message: 'Cập nhật vùng thành công!', type: 'success' }));
      return res.data;
    } catch (error) {
      dispatch(showTemporaryAlert({ message: error?.response?.data?.detail || 'Failed to update region.', type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteRegion = createAsyncThunk(
  'region/deleteRegion',
  async (regionId, { rejectWithValue, dispatch, signal }) => {
    try {
      await snocApi.delete(`users/regions/${regionId}`, { signal });
      dispatch(showTemporaryAlert({ message: 'Xóa vùng thành công!', type: 'success' }));
      return regionId;
    } catch (error) {
      dispatch(showTemporaryAlert({ message: error?.response?.data?.detail || 'Failed to delete region.', type: 'danger' }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

const regionSlice = createSlice({
  name: 'region',
  initialState: {
    regions: [],
    statusRegion: 'idle',
    errorRegion: null,
    selectedRegion: null,
    showModalCreateRegion: false,
    showModalUpdateRegion: false,
    showModalDeleteRegion: false,
  },
  reducers: {
    selectRegion:              (s, a) => { s.selectedRegion = a.payload; },
    toggleModalCreateRegion:   (s) => { s.showModalCreateRegion = !s.showModalCreateRegion; },
    toggleModalUpdateRegion:   (s) => {
      s.showModalUpdateRegion = !s.showModalUpdateRegion;
      if (!s.showModalUpdateRegion) s.selectedRegion = null;
    },
    toggleModalDeleteRegion:   (s) => {
      s.showModalDeleteRegion = !s.showModalDeleteRegion;
      if (!s.showModalDeleteRegion) s.selectedRegion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending,   (s) => { s.statusRegion = 'loading'; })
      .addCase(fetchRegions.fulfilled, (s, a) => { s.statusRegion = 'succeeded'; s.regions = a.payload; })
      .addCase(fetchRegions.rejected,  (s, a) => { s.statusRegion = 'failed'; s.errorRegion = a.error?.message; })
      .addCase(createRegion.fulfilled, (s, a) => {
        s.regions.push(a.payload); s.showModalCreateRegion = false;
      })
      .addCase(updateRegion.fulfilled, (s, a) => {
        const i = s.regions.findIndex((r) => r.id === a.payload.id);
        if (i !== -1) s.regions[i] = a.payload;
        s.showModalUpdateRegion = false; s.selectedRegion = null;
      })
      .addCase(deleteRegion.fulfilled, (s, a) => {
        s.regions = s.regions.filter((r) => r.id !== a.payload);
        s.showModalDeleteRegion = false; s.selectedRegion = null;
      });
  },
});

export const {
  selectRegion, toggleModalCreateRegion,
  toggleModalUpdateRegion, toggleModalDeleteRegion,
} = regionSlice.actions;

export default regionSlice.reducer;
