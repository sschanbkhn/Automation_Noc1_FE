// redux/Hosts/hostsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";
import { fetchPlatforms } from "../Healthcheck/platformDeviceSlice";
/**
 * 🔧 Helper: Loại bỏ các field rỗng/undefined và ép kiểu dữ liệu chuẩn trước khi gửi API
 */
const sanitizeHostPayload = (obj = {}) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    // Không gửi các giá trị undefined hoặc null
    if (v === undefined || v === null) return;
    
    // Xử lý chuỗi rỗng (trừ password vì đôi khi cần gửi rỗng để xóa - tùy logic backend, 
    // nhưng ở đây ta giữ nguyên k !== "password" theo code cũ của bạn)
    if (typeof v === "string" && v.trim() === "" && k !== "password") return;

    // Ép kiểu số cho các trường định lượng
    if (k === "port" && v !== "") {
      out.port = Number(v);
      return;
    }
    if (k === "license_throughput" && v !== "") {
      out.license_throughput = Number(v);
      return;
    }

    // Xử lý mảng groups (Tags phụ)
    if (k === "groups") {
      if (Array.isArray(v)) {
        out.groups = v.map((x) => String(x).trim()).filter(Boolean);
      } else if (typeof v === "string") {
        out.groups = v
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
      return;
    }

    // Các trường platform, group, department có thể là ID (số) hoặc Name (chuỗi)
    out[k] = v;
  });
  return out;
};

/**
 * ✅ Fetch danh sách host
 */
export const fetchHosts = createAsyncThunk(
  "hosts/fetchHosts",
  async ({ search = "" } = {}, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/list-hosts/", {
        params: { search },
      });

      // Chuẩn hóa dữ liệu trả về từ Backend để hiển thị trên UI
      const devices = (res.data || []).map((d) => ({
        name: d.name,
        hostname: d.hostname,
        platform: d.platform,
        group: d.group || "—",
        department: d.department || "—",
        groups: Array.isArray(d.groups)
          ? d.groups
          : typeof d.groups === "string"
          ? d.groups.split(",").map((x) => x.trim()).filter(Boolean)
          : [],
        all_groups: d.all_groups || [],
        username: d.username ?? "—",
        port: d.port,
        site_code: d.site_code,
        vendor: d.vendor,
        license_throughput: d.license_throughput,
        app_role: d.app_role ?? null,
        nfvi_host: d.nfvi_host ?? null,
      }));

      return devices;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Không thể tải danh sách thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

/**
 * ➕ Thêm mới thiết bị
 */
export const addHost = createAsyncThunk(
  "hosts/addHost",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const body = sanitizeHostPayload(payload);
      await snocApi.post("/nornirps/add-host/", body);
      dispatch(showTemporaryAlert({ message: "Thêm thiết bị thành công", type: "success" }));
      dispatch(fetchHosts());
      dispatch(fetchPlatforms());
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể thêm thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

/**
 * ✏️ Cập nhật thiết bị
 */
export const updateHost = createAsyncThunk(
  "hosts/updateHost",
  async ({ name, data }, { rejectWithValue, dispatch }) => {
    try {
      const body = sanitizeHostPayload(data);
      await snocApi.put(`/nornirps/update-host/${name}/`, body);
      dispatch(showTemporaryAlert({ message: "Cập nhật thiết bị thành công", type: "success" }));
      dispatch(fetchHosts());
      dispatch(fetchPlatforms());
      dispatch(fetchAllDeviceApps());
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể cập nhật thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

/**
 * 🗑️ Xoá thiết bị
 */
export const deleteHost = createAsyncThunk(
  "hosts/deleteHost",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      await snocApi.delete(`/nornirps/delete-host/${name}/`);
      dispatch(showTemporaryAlert({ message: "Đã xoá thiết bị", type: "success" }));
      dispatch(fetchHosts());
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể xoá thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);


export const cloneDevice = createAsyncThunk(
  "hosts/cloneDevice",
  async ({ sourceName, payload }, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.post(`/nornirps/hosts/${sourceName}/clone/`, payload);
      dispatch(showTemporaryAlert({ message: res.data.message, type: "success" }));
      dispatch(fetchHosts());
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền clone thiết bị của đơn vị khác."
          : status === 400
          ? error?.response?.data?.error || "Dữ liệu không hợp lệ"
          : error?.response?.data?.error || "Không thể clone thiết bị";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);




// ─── NfviHost thunks ──────────────────────────────────────────────────────
export const fetchNfviHosts = createAsyncThunk(
  "hosts/fetchNfviHosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get("/nornirps/nfvi-hosts/list/");
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Lỗi tải NfviHost");
    }
  }
);

export const addNfviHost = createAsyncThunk(
  "hosts/addNfviHost",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.post("/nornirps/nfvi-hosts/", payload);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Thêm NfviHost thành công", type: "success" }));
      dispatch(fetchNfviHosts());
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi thêm NfviHost";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateNfviHost = createAsyncThunk(
  "hosts/updateNfviHost",
  async ({ name, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.put(`/nornirps/nfvi-hosts/${name}/`, data);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Cập nhật thành công", type: "success" }));
      dispatch(fetchNfviHosts());
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi cập nhật NfviHost";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteNfviHost = createAsyncThunk(
  "hosts/deleteNfviHost",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.delete(`/nornirps/nfvi-hosts/${name}/delete/`);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Đã xóa NfviHost", type: "success" }));
      dispatch(fetchNfviHosts());
      return name;
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi xóa NfviHost";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

// ─── K8sCluster thunks ────────────────────────────────────────────────────
export const fetchK8sClusters = createAsyncThunk(
  "hosts/fetchK8sClusters",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get("/nornirps/k8s-clusters/list/");
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Lỗi tải K8sClusters");
    }
  }
);

export const addK8sCluster = createAsyncThunk(
  "hosts/addK8sCluster",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.post("/nornirps/k8s-clusters/", payload);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Thêm K8sCluster thành công", type: "success" }));
      dispatch(fetchK8sClusters());
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi thêm K8sCluster";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteK8sCluster = createAsyncThunk(
  "hosts/deleteK8sCluster",
  async (name, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.delete(`/nornirps/k8s-clusters/${name}/delete/`);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Đã xóa", type: "success" }));
      dispatch(fetchK8sClusters());
      return name;
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi xóa K8sCluster";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

// ─── DeviceApplication thunks ─────────────────────────────────────────────
export const fetchAllDeviceApps = createAsyncThunk(
  "hosts/fetchAllDeviceApps",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get("/nornirps/hosts/apps/all/");
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Lỗi tải all apps");
    }
  }
);


export const fetchDeviceApps = createAsyncThunk(
  "hosts/fetchDeviceApps",
  async (deviceName, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(`/nornirps/hosts/${deviceName}/apps/`);
      return { deviceName, apps: res.data || [] };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Lỗi tải apps");
    }
  }
);

export const addDeviceApp = createAsyncThunk(
  "hosts/addDeviceApp",
  async ({ deviceName, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.post(`/nornirps/hosts/${deviceName}/apps/add/`, data);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Thêm app thành công", type: "success" }));
      dispatch(fetchDeviceApps(deviceName));
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi thêm app";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteDeviceApp = createAsyncThunk(
  "hosts/deleteDeviceApp",
  async ({ deviceName, appName }, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.delete(`/nornirps/hosts/${deviceName}/apps/${appName}/`);
      dispatch(showTemporaryAlert({ message: res.data?.message || "✅ Đã xóa app", type: "success" }));
      dispatch(fetchDeviceApps(deviceName));
      return { deviceName, appName };
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi xóa app";
      dispatch(showTemporaryAlert({ message: msg, type: "danger" }));
      return rejectWithValue(msg);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────
const hostsSlice = createSlice({
  name: "hosts",
  initialState: {
    devices: [],
    loading: false,
    error: null,
    nfviHosts: [],
    loadingNfvi: false,
    k8sClusters: [],
    loadingK8s: false,
    deviceApps: {},   // { [deviceName]: [...] }
    allDeviceApps: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Hosts
      .addCase(fetchHosts.pending, (state) => { state.loading = true; })
      .addCase(fetchHosts.fulfilled, (state, action) => { state.loading = false; state.devices = action.payload || []; })
      .addCase(fetchHosts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // NfviHost
      .addCase(fetchNfviHosts.pending, (state) => { state.loadingNfvi = true; })
      .addCase(fetchNfviHosts.fulfilled, (state, action) => { state.loadingNfvi = false; state.nfviHosts = action.payload; })
      .addCase(fetchNfviHosts.rejected, (state) => { state.loadingNfvi = false; })
      // K8sCluster
      .addCase(fetchK8sClusters.pending, (state) => { state.loadingK8s = true; })
      .addCase(fetchK8sClusters.fulfilled, (state, action) => { state.loadingK8s = false; state.k8sClusters = action.payload; })
      .addCase(fetchK8sClusters.rejected, (state) => { state.loadingK8s = false; })
      // DeviceApps
      .addCase(fetchDeviceApps.fulfilled, (state, action) => {
        state.deviceApps[action.payload.deviceName] = action.payload.apps;
      })
      .addCase(fetchAllDeviceApps.fulfilled, (state, action) => {
        state.allDeviceApps = action.payload;
      });
  },
});

export default hostsSlice.reducer;