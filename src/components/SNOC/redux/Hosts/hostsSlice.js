// redux/Hosts/hostsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

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
        platform: d.platform,      // Tên platform
        group: d.group || "—",     // 🔹 Mới: Device Group
        department: d.department || "—", // 🔹 Mới: Department
        groups: Array.isArray(d.groups)
          ? d.groups
          : typeof d.groups === "string"
          ? d.groups.split(",").map((x) => x.trim()).filter(Boolean)
          : [],
        all_groups: d.all_groups || [], // Danh sách gộp tất cả nhãn (platform, group, dept, tags)
        username: d.username ?? "—",
        port: d.port,
        site_code: d.site_code,
        vendor: d.vendor,
        license_throughput: d.license_throughput,
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




const hostsSlice = createSlice({
  name: "hosts",
  initialState: {
    devices: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Hosts
      .addCase(fetchHosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHosts.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload || [];
      })
      .addCase(fetchHosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default hostsSlice.reducer;