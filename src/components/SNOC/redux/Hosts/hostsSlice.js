import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// ✅ Fetch danh sách host (không còn phân trang từ backend)
export const fetchHosts = createAsyncThunk(
  "hosts/fetchHosts",
  async ({ search = "" } = {}, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/list-hosts/", {
        params: { search },
      });
      return res.data; // mảng thiết bị: [{name, hostname, platform, groups}]
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải danh sách thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const addHost = createAsyncThunk(
  "hosts/addHost",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.post("/nornirps/add-host/", payload);
      dispatch(fetchHosts());
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể thêm thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateHost = createAsyncThunk(
  "hosts/updateHost",
  async ({ name, data }, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.put(`/nornirps/update-host/${name}/`, data);
      dispatch(fetchHosts());
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể cập nhật thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteHost = createAsyncThunk(
  "hosts/deleteHost",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`/nornirps/delete-host/${name}/`);
      dispatch(fetchHosts());
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể xoá thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const hostsSlice = createSlice({
  name: "hosts",
  initialState: {
    devices: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHosts.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload || [];
      })
      .addCase(fetchHosts.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default hostsSlice.reducer;
