// src/redux/SNOC/snocSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "./../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";
import { AppDispatch } from "./../../store/snocStore"; // cập nhật đường dẫn chính xác tới store của bạn nếu cần
export const fetchSNOCPlatformView = createAsyncThunk<
  any, // kiểu return data
  void, // kiểu input argument
  {
    dispatch: AppDispatch;
    rejectValue: string;
  }
>("snoc/fetchPlatformView", async (_, { rejectWithValue, dispatch }) => {
  try {
    const response = await snocApi.get("/nornirps/NornirGetPlatformView/");
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.detail || "Không thể tải dữ liệu platform SNOC";
    dispatch(showTemporaryAlert({ message, type: "error" }));
    return rejectWithValue(message);
  }
});

const snocSlice = createSlice({
  name: "snoc",
  initialState: {
    platforms: [],
    loading: false,
    error: null,
    data: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSNOCPlatformView.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.platforms = [];
      })
      .addCase(fetchSNOCPlatformView.fulfilled, (state, action) => {
        state.loading = false;
        state.platforms = action.payload || [];
      })
      .addCase(fetchSNOCPlatformView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export default snocSlice.reducer;
