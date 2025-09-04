// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import snocApi from "../../api/snocApiWithAutoToken";
// import { showTemporaryAlert } from "../Alert/alertSlice";

// // ✅ Fetch danh sách host (không còn phân trang từ backend)
// export const fetchHosts = createAsyncThunk(
//   "hosts/fetchHosts",
//   async ({ search = "" } = {}, { rejectWithValue, dispatch }) => {
//     try {
//       const res = await snocApi.get("/nornirps/list-hosts/", {
//         params: { search },
//       });
//       return res.data; // mảng thiết bị: [{name, hostname, platform, groups}]
//     } catch (error) {
//       const msg =
//         error?.response?.data?.detail || "Không thể tải danh sách thiết bị";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(msg);
//     }
//   }
// );

// export const addHost = createAsyncThunk(
//   "hosts/addHost",
//   async (payload, { rejectWithValue, dispatch }) => {
//     try {
//       await snocApi.post("/nornirps/add-host/", payload);
//       dispatch(fetchHosts());
//     } catch (error) {
//       const msg = error?.response?.data?.error || "Không thể thêm thiết bị";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(msg);
//     }
//   }
// );

// export const updateHost = createAsyncThunk(
//   "hosts/updateHost",
//   async ({ name, data }, { rejectWithValue, dispatch }) => {
//     try {
//       await snocApi.put(`/nornirps/update-host/${name}/`, data);
//       dispatch(fetchHosts());
//     } catch (error) {
//       const msg = error?.response?.data?.error || "Không thể cập nhật thiết bị";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(msg);
//     }
//   }
// );

// export const deleteHost = createAsyncThunk(
//   "hosts/deleteHost",
//   async (name, { rejectWithValue, dispatch }) => {
//     try {
//       await snocApi.delete(`/nornirps/delete-host/${name}/`);
//       dispatch(fetchHosts());
//     } catch (error) {
//       const msg = error?.response?.data?.error || "Không thể xoá thiết bị";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(msg);
//     }
//   }
// );

// const hostsSlice = createSlice({
//   name: "hosts",
//   initialState: {
//     devices: [],
//     loading: false,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchHosts.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchHosts.fulfilled, (state, action) => {
//         state.loading = false;
//         state.devices = action.payload || [];
//       })
//       .addCase(fetchHosts.rejected, (state) => {
//         state.loading = false;
//       });
//   },
// });

// export default hostsSlice.reducer;


// redux/Hosts/hostsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// 🔧 Helper: loại bỏ field rỗng/undefined + ép kiểu hợp lý
const sanitizeHostPayload = (obj = {}) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "" && k !== "password") return; // password rỗng -> không gửi

    if (k === "port" && v !== "") {
      out.port = Number(v);
      return;
    }
    if (k === "license_throughput" && v !== "") {
      out.license_throughput = Number(v);
      return;
    }
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
    // platform có thể là id (number) hoặc name (string) -> giữ nguyên
    out[k] = v;
  });
  return out;
};

// ✅ Fetch danh sách host
export const fetchHosts = createAsyncThunk(
  "hosts/fetchHosts",
  async ({ search = "" } = {}, { rejectWithValue, dispatch }) => {
    try {
      const res = await snocApi.get("/nornirps/list-hosts/", {
        params: { search },
      });

      // Chuẩn hóa groups luôn là mảng + pass-through các field mới
      const devices = (res.data || []).map((d) => ({
        name: d.name,
        hostname: d.hostname,
        platform: d.platform, // string platform name từ backend
        groups: Array.isArray(d.groups)
          ? d.groups
          : typeof d.groups === "string"
          ? d.groups.split(",").map((x) => x.trim()).filter(Boolean)
          : [],
        all_groups: d.all_groups || [],
        username: d.username ?? "—",
        // 🔹 option fields
        port: d.port,
        site_code: d.site_code,
        vendor: d.vendor,
        license_throughput: d.license_throughput,
      }));

      return devices;
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
      const body = sanitizeHostPayload(payload);
      await snocApi.post("/nornirps/add-host/", body);
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
      const body = sanitizeHostPayload(data);
      await snocApi.put(`/nornirps/update-host/${name}/`, body);
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
