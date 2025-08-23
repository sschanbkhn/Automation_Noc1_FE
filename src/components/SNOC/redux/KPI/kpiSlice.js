// redux/KPI/kpiSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";

// ====================== Thunks ======================

export const fetchAvailableKPIs = createAsyncThunk(
  "kpi/fetchAvailableKPIs",
  async ({ selectedPlatform, selectedDevices = [] }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("platform", selectedPlatform);
      selectedDevices.forEach((d) => params.append("device", d));
      const url = `/nornirps/kpi/list/?${params.toString()}`;
      const response = await snocApi.get(url);
      return response.data; // { kpis: [...] }
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

export const fetchKPIChartData = createAsyncThunk(
  "kpi/fetchKPIChartData",
  async (
    { selectedPlatform, selectedDevice, selectedKPI, startDate, endDate },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("platform", selectedPlatform);
      params.append("kpi", selectedKPI);
      params.append("start", startDate);
      params.append("end", endDate);
      if (selectedDevice && selectedDevice.length > 0) {
        for (const d of selectedDevice) params.append("device", d);
      }
      const url = `/nornirps/kpi/query/?${params.toString()}`;
      const response = await snocApi.get(url);
      return { kpi: selectedKPI, data: response.data };
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

// ====================== Slice ======================

const initialState = {
  availableKPIs: { kpis: [] },
  kpiChartData: {}, // { [kpi]: Array<{ device, platform, kpi, value, timestamp }> }
  loading: false,
  error: null,
  pruneHours: 48,
};

function _cutoffMs(hours) {
  return Date.now() - (hours || 48) * 60 * 60 * 1000;
}

export const kpiSlice = createSlice({
  name: "kpi",
  initialState,
  reducers: {
    /**
     * Merge realtime points từ WS vào store.
     * payload = {
     *   platform, points: Array<{device, platform, kpi, value, timestamp}>
     *   filter: { platform?: string, devices?: string[], kpis?: string[] }
     * }
     */
    wsMergeKpiPoints: (state, action) => {
      const { platform, points = [], filter = {} } = action.payload || {};
      const needPlatform = filter.platform || null;
      const allowKpis = Array.isArray(filter.kpis) ? filter.kpis : [];
      const allowDevices = Array.isArray(filter.devices) ? filter.devices : [];
      const cutoff = _cutoffMs(state.pruneHours);

      // BẮT BUỘC đã có KPI filter => nếu chưa chọn KPI, KHÔNG merge (tránh "không đúng KPI")
      if (!allowKpis.length) return;

      // Nếu bắt buộc cùng platform mà WS khác platform => bỏ qua
      if (needPlatform && platform && platform !== needPlatform) return;

      for (const p of points) {
        const kpi = p.kpi;
        const dev = p.device;
        const tsStrRaw = p.timestamp; // backend chỉ gửi 'timestamp'

        if (!kpi || !dev || !tsStrRaw) continue;

        // Lọc theo KPI & device đã chọn
        if (allowKpis.length && !allowKpis.includes(kpi)) continue;
        if (allowDevices.length && !allowDevices.includes(dev)) continue;

        // Chuẩn hoá timestamp về UTC ISO để dedup/sort ổn định
        const tsMs = Date.parse(tsStrRaw);
        if (Number.isNaN(tsMs)) continue;
        const tsIso = new Date(tsMs).toISOString();

        const arr = state.kpiChartData[kpi] || (state.kpiChartData[kpi] = []);

        // Dedup theo (device, tsIso)
        const idx = arr.findIndex(
          (r) => r.device === dev && r.timestamp === tsIso
        );
        const row = {
          device: dev,
          platform: p.platform,
          kpi,
          value: Number(p.value || 0),
          timestamp: tsIso, // luôn lưu UTC ISO; Recharts -> new Date() sẽ hiển thị local
        };
        if (idx === -1) arr.push(row);
        else arr[idx] = row;

        // Prune & sort
        state.kpiChartData[kpi] = arr
          .filter((r) => {
            const t = Date.parse(r.timestamp);
            return !Number.isNaN(t) && t >= cutoff;
          })
          .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
      }
    },

    resetKPIData: (state, action) => {
      const kpi = action.payload;
      if (kpi) state.kpiChartData[kpi] = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableKPIs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableKPIs.fulfilled, (state, action) => {
        state.loading = false;
        state.availableKPIs =
          action.payload && Array.isArray(action.payload.kpis)
            ? action.payload
            : { kpis: [] };
      })
      .addCase(fetchAvailableKPIs.rejected, (state) => {
        state.loading = false;
        state.availableKPIs = { kpis: [] };
      })
      .addCase(fetchKPIChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKPIChartData.fulfilled, (state, action) => {
        const { kpi, data } = action.payload;
        state.loading = false;
        state.kpiChartData[kpi] = Array.isArray(data)
          ? data
              .map((r) => ({
                ...r,
                // chuẩn hoá luôn khi load từ DB
                timestamp: new Date(r.timestamp).toISOString(),
              }))
              .sort(
                (a, b) =>
                  Date.parse(a.timestamp) - Date.parse(b.timestamp)
              )
          : [];
      })
      .addCase(fetchKPIChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load KPI data";
      });
  },
});

export const { wsMergeKpiPoints, resetKPIData } = kpiSlice.actions;
export default kpiSlice.reducer;
