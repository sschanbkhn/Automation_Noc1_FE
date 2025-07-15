// src/redux/Healthcheck/platformDeviceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

export const fetchPlatforms = createAsyncThunk(
  "platformDevice/fetchPlatforms",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get("/nornirps/NornirGetPlatformView/");

      // Đảm bảo response trả về đúng định dạng [{ name, device_count }]
      const platforms = response.data.map((p) =>
        typeof p === "object" && p.name ? p : { name: p, device_count: 0 }
      );

      return platforms;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải danh sách platform";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchDevicesByPlatform = createAsyncThunk(
  "platformDevice/fetchDevicesByPlatform",
  async (platformName, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.post(
        "/nornirps/NornirGetDevicebyPlatformView/",
        { platform: platformName }
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải thiết bị theo platform";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const platformDeviceSlice = createSlice({
  name: "platformDevice",
  initialState: {
    platforms: [],
    devices: [],
    loadingPlatforms: false,
    loadingDevices: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.loadingPlatforms = true;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.loadingPlatforms = false;
        state.platforms = action.payload || [];
      })
      .addCase(fetchPlatforms.rejected, (state) => {
        state.loadingPlatforms = false;
      })
      .addCase(fetchDevicesByPlatform.pending, (state) => {
        state.loadingDevices = true;
      })
      .addCase(fetchDevicesByPlatform.fulfilled, (state, action) => {
        state.loadingDevices = false;
        state.devices = action.payload || [];
      })
      .addCase(fetchDevicesByPlatform.rejected, (state) => {
        state.loadingDevices = false;
      });
  },
});

export default platformDeviceSlice.reducer;
