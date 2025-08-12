import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import snocApi from '../api/snocApi';

// Ví dụ lấy dữ liệu sau khi login
export const fetchSnocProtectedData = createAsyncThunk(
  'snoc/fetchProtectedData',
  async () => {
    const response = await snocApi.get('/protected-endpoint'); // endpoint bảo mật cần token
    return response.data;
  }
);

const snocSlice = createSlice({
  name: 'snoc',
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSnocProtectedData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSnocProtectedData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSnocProtectedData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default snocSlice.reducer;
