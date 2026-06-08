import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE_URL = "/nornirps/notification-channel-config/";

export const fetchNotifChannelConfig = createAsyncThunk(
  "notifChannelConfig/fetch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE_URL);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Không thể tải cấu hình thông báo";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const saveNotifChannelConfig = createAsyncThunk(
  "notifChannelConfig/save",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.patch(BASE_URL, data);
      dispatch(showTemporaryAlert({ message: "Đã lưu cấu hình thông báo", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Lưu thất bại";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const testNotifChannel = createAsyncThunk(
  "notifChannelConfig/test",
  async ({ channel, target }, { dispatch, rejectWithValue }) => {
    const bodyKey = channel === "telegram" ? "chat_id" : channel === "sms" ? "phone" : "email";
    try {
      await snocApi.post(`${BASE_URL}test-${channel}/`, { [bodyKey]: target });
      dispatch(showTemporaryAlert({ message: `✅ Gửi test ${channel} thành công!`, type: "success" }));
    } catch (err) {
      const detail = err?.response?.data?.error || err?.response?.data?.detail || "Gửi test thất bại";
      dispatch(showTemporaryAlert({ message: `❌ ${detail}`, type: "error" }));
      return rejectWithValue(detail);
    }
  }
);

const notifChannelConfigSlice = createSlice({
  name: "notifChannelConfig",
  initialState: {
    config:  null,
    loading: false,
    saving:  false,
    testing: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifChannelConfig.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchNotifChannelConfig.fulfilled, (s, a) => { s.loading = false; s.config = a.payload; })
      .addCase(fetchNotifChannelConfig.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(saveNotifChannelConfig.pending,   (s) => { s.saving = true; })
      .addCase(saveNotifChannelConfig.fulfilled, (s, a) => { s.saving = false; s.config = a.payload; })
      .addCase(saveNotifChannelConfig.rejected,  (s) => { s.saving = false; })

      .addCase(testNotifChannel.pending,   (s) => { s.testing = true; })
      .addCase(testNotifChannel.fulfilled, (s) => { s.testing = false; })
      .addCase(testNotifChannel.rejected,  (s) => { s.testing = false; });
  },
});

export default notifChannelConfigSlice.reducer;
