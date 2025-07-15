import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk để gọi API trạng thái hệ thống
export const fetchSystemStatus = createAsyncThunk('systemStatus/fetch', async () => {
  const response = await axios.get('/api/healthcheck/status'); // sửa đường dẫn API nếu khác
  return response.data; // ví dụ: { "CS Core": "Normal", "PS Core": "Warning", ... }
});

const systemStatusSlice = createSlice({
  name: 'systemStatus',
  initialState: {
    statusMap: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStatus.fulfilled, (state, action) => {
        state.statusMap = action.payload;
        state.loading = false;
      })
      .addCase(fetchSystemStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default systemStatusSlice.reducer;
