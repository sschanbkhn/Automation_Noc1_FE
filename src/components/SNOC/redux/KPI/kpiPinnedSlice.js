// src/redux/KPI/kpiPinnedSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchKPIChartData } from "./kpiSlice"; // cùng folder KPI

const LS_KEY = "pinned_kpis_by_platform";

const loadPinned = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const savePinned = (obj) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch {}
};

/**
 * Lấy “latest” cho các KPI đã ghim của 1 platform (trong window mặc định 120 phút)
 * - Dùng lại thunk fetchKPIChartData để kéo dữ liệu (per KPI)
 * - Trả về map latestByPlatform[platform][device][kpi] = { value, ts }
 */
export const fetchLatestForPinnedKpis = createAsyncThunk(
  "kpiPinned/fetchLatestForPinnedKpis",
  async (
    { platform, devices, windowMinutes = 120 },
    { dispatch, getState, rejectWithValue }
  ) => {
    if (!platform || !Array.isArray(devices) || devices.length === 0) {
      return rejectWithValue("Missing platform/devices");
    }
    const state = getState();
    const pinned =
      state.kpiPinned?.pinnedByPlatform?.[platform] ||
      state.kpiPinned?.pinnedByPlatform?.[platform?.toString()] ||
      [];

    if (!pinned.length) return { platform, results: {} };

    const end = new Date();
    const start = new Date(end.getTime() - windowMinutes * 60 * 1000);

    const results = {}; // { [kpi]: { [device]: {value, ts} } }

    for (const kpi of pinned) {
      try {
        // unwrap() để lấy payload của fetchKPIChartData
        const rows = await dispatch(
          fetchKPIChartData({
            selectedPlatform: platform,
            selectedDevice: devices, // array of names
            selectedKPI: kpi,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          })
        ).unwrap();

        const latestPerDevice = {};
        const arr = Array.isArray(rows) ? rows : rows?.data || [];
        for (const row of arr) {
          const dev = row?.device;
          const ts = Date.parse(row?.timestamp);
          const val = Number(row?.value);
          if (!dev || !Number.isFinite(ts) || !Number.isFinite(val)) continue;
          if (!latestPerDevice[dev] || ts > latestPerDevice[dev].ts) {
            latestPerDevice[dev] = { value: val, ts };
          }
        }
        results[kpi] = latestPerDevice;
      } catch (e) {
        // bỏ qua KPI lỗi để phần còn lại vẫn cập nhật
      }
    }

    return { platform, results };
  }
);

const kpiPinnedSlice = createSlice({
  name: "kpiPinned",
  initialState: {
    pinnedByPlatform: loadPinned(), // { [platform]: string[] }
    latestByPlatform: {},           // { [platform]: { [device]: { [kpi]: {value, ts} } } }
    loading: false,
    error: null,
  },
  reducers: {
    setPinnedKPIs: (state, action) => {
      const { platform, kpis } = action.payload || {};
      if (!platform) return;
      const uniq = Array.from(new Set((kpis || []).filter(Boolean)));
      state.pinnedByPlatform[platform] = uniq;
      savePinned(state.pinnedByPlatform);
    },
    // (tuỳ chọn) toggle 1 KPI
    togglePinnedKPI: (state, action) => {
      const { platform, kpi } = action.payload || {};
      if (!platform || !kpi) return;
      const cur = new Set(state.pinnedByPlatform[platform] || []);
      if (cur.has(kpi)) cur.delete(kpi);
      else cur.add(kpi);
      state.pinnedByPlatform[platform] = Array.from(cur);
      savePinned(state.pinnedByPlatform);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestForPinnedKpis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestForPinnedKpis.fulfilled, (state, action) => {
        state.loading = false;
        const { platform, results } = action.payload || {};
        if (!platform || !results) return;
        const dest = (state.latestByPlatform[platform] ||= {}); // per device
        // results[kpi][device] = {value, ts}
        Object.entries(results).forEach(([kpi, byDev]) => {
          Object.entries(byDev || {}).forEach(([dev, obj]) => {
            const devBucket = (dest[dev] ||= {});
            devBucket[kpi] = obj;
          });
        });
      })
      .addCase(fetchLatestForPinnedKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "error";
      });
  },
});

export const { setPinnedKPIs, togglePinnedKPI } = kpiPinnedSlice.actions;
export default kpiPinnedSlice.reducer;
