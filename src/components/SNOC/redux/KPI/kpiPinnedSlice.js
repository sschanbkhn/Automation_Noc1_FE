// src/redux/KPI/kpiPinnedSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchKPIChartDataBatch } from "./kpiSlice";

const LS_KEY = "pinned_kpis_by_platform";
const LS_DEVICES_KEY = "pinned_devices_by_platform";

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
const loadPinnedDevices = () => {
  try {
    const raw = localStorage.getItem(LS_DEVICES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const savePinnedDevices = (obj) => {
  try {
    localStorage.setItem(LS_DEVICES_KEY, JSON.stringify(obj));
  } catch {}
};

// Lay "latest" cho cac KPI da ghim cua 1 platform (window mac dinh 120 phut)
// Dung fetchKPIChartDataBatch de gop tat ca KPI vao 1 request
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

    try {
      const { grouped = {} } = await dispatch(
        fetchKPIChartDataBatch({
          selectedPlatform: platform,
          selectedDevice: devices,
          selectedKPIs: pinned,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
      ).unwrap();

      const results = {};
      for (const [kpi, rows] of Object.entries(grouped)) {
        const latestPerDevice = {};
        for (const row of Array.isArray(rows) ? rows : []) {
          const dev = row?.device;
          const ts = Date.parse(row?.timestamp);
          const val = Number(row?.value);
          if (!dev || !Number.isFinite(ts) || !Number.isFinite(val)) continue;
          if (!latestPerDevice[dev] || ts > latestPerDevice[dev].ts) {
            latestPerDevice[dev] = { value: val, ts };
          }
        }
        results[kpi] = latestPerDevice;
      }

      return { platform, results };
    } catch (e) {
      return rejectWithValue(e?.message || "Batch fetch failed");
    }
  }
);

const kpiPinnedSlice = createSlice({
  name: "kpiPinned",
  initialState: {
    pinnedByPlatform: loadPinned(),
    savedDevicesByPlatform: loadPinnedDevices(),
    latestByPlatform: {},
    loading: false,
    error: null,
  },
  reducers: {
    setPinnedKPIs: (state, action) => {
      const { platform, kpis, devices } = action.payload || {};
      if (!platform) return;
      const uniq = Array.from(new Set((kpis || []).filter(Boolean)));
      state.pinnedByPlatform[platform] = uniq;
      savePinned(state.pinnedByPlatform);
      if (Array.isArray(devices)) {
        state.savedDevicesByPlatform[platform] = devices;
        savePinnedDevices(state.savedDevicesByPlatform);
      }
    },
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
        if (!state.latestByPlatform[platform]) state.latestByPlatform[platform] = {};
        const dest = state.latestByPlatform[platform];
        Object.entries(results).forEach(([kpi, byDev]) => {
          Object.entries(byDev || {}).forEach(([dev, obj]) => {
            if (!dest[dev]) dest[dev] = {};
            const devBucket = dest[dev];
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
