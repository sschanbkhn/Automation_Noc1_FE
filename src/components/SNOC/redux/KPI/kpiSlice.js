// redux/KPI/kpiSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";

// ====================== Thunks ======================

function kpiRouterPrefix(platform = "") {
  if (/mme/i.test(platform)) return "mme";
  return "pgw";
}

export const fetchAvailableKPIs = createAsyncThunk(
  "kpi/fetchAvailableKPIs",
  async ({ selectedPlatform, selectedDevices = [] }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("platform", selectedPlatform);
      selectedDevices.forEach((d) => params.append("device", d));
      const url = `/fastapi/${kpiRouterPrefix(selectedPlatform)}/kpi-list?${params.toString()}`;
      const response = await snocApi.get(url);
      return response.data; // { kpis: [...] }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        return rejectWithValue({ code: 403, message: "Không có quyền truy cập thiết bị này" });
      }
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
      const url = `/fastapi/${kpiRouterPrefix(selectedPlatform)}/kpi-data?${params.toString()}`;
      const response = await snocApi.get(url);
      return { kpi: selectedKPI, data: response.data };
    } catch (error) {
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

function _buildKpiDataParams(platforms, kpis, startDate, endDate, devices, bucket) {
  const p = new URLSearchParams();
  platforms.forEach((x) => p.append("platform", x));
  kpis.forEach((k) => p.append("kpi", k));
  p.append("start", startDate);
  p.append("end", endDate);
  if (devices?.length) devices.forEach((d) => p.append("device", d));
  if (bucket) p.append("bucket", bucket);
  return p.toString();
}

export const fetchKPIChartDataBatch = createAsyncThunk(
  "kpi/fetchKPIChartDataBatch",
  async (
    { selectedPlatform, selectedPlatforms, selectedDevice, selectedKPIs, startDate, endDate, bucket },
    { rejectWithValue }
  ) => {
    try {
      const platforms = selectedPlatforms || (selectedPlatform ? [selectedPlatform] : []);
      const mmePlats = platforms.filter((p) => /mme/i.test(p));
      const pgwPlats = platforms.filter((p) => !/mme/i.test(p));

      let allRows = [];

      if (mmePlats.length > 0 && pgwPlats.length > 0) {
        // Mixed MME + non-MME: query song song cả hai bảng
        const [pgwResp, mmeResp] = await Promise.all([
          snocApi.get(`/fastapi/pgw/kpi-data?${_buildKpiDataParams(pgwPlats, selectedKPIs, startDate, endDate, selectedDevice, bucket)}`),
          snocApi.get(`/fastapi/mme/kpi-data?${_buildKpiDataParams(mmePlats, selectedKPIs, startDate, endDate, selectedDevice, bucket)}`),
        ]);
        allRows = [...(pgwResp.data || []), ...(mmeResp.data || [])];
      } else {
        const prefix = mmePlats.length > 0 ? "mme" : "pgw";
        const resp = await snocApi.get(
          `/fastapi/${prefix}/kpi-data?${_buildKpiDataParams(platforms, selectedKPIs, startDate, endDate, selectedDevice, bucket)}`
        );
        allRows = resp.data || [];
      }

      const grouped = {};
      for (const row of allRows) {
        if (!grouped[row.kpi]) grouped[row.kpi] = [];
        grouped[row.kpi].push(row);
      }
      return { grouped };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        return rejectWithValue({ code: 403, message: "Không có quyền truy cập thiết bị này" });
      }
      return rejectWithValue(error?.response?.data || {});
    }
  }
);

// ====================== Slice ======================

const initialState = {
  availableKPIs: { kpis: [] },
  kpiChartData: {}, // { [kpi]: Array<{ device, platform, kpi, value, timestamp }> }
  embeddedData: {}, // embed: { [embedKey]: { [kpi]: rows[] } } — tránh conflict giữa các pin instances
  loading: false,
  loadingByKey: {}, // { [embedKey]: true } — per-pin loading state cho embed mode
  error: null,
  accessError: null, // 403 code khi bị RBAC block
  pruneHours: 72,
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

        // Merge vào embeddedData cho các embed instances đang hiển thị KPI này
        for (const eKey of Object.keys(state.embeddedData)) {
          const firstColon = eKey.indexOf(":");
          const secondColon = eKey.indexOf(":", firstColon + 1);
          if (firstColon < 0 || secondColon < 0) continue;
          const ePlatform = eKey.slice(0, firstColon);
          const eDevice   = eKey.slice(firstColon + 1, secondColon);
          const eKpi      = eKey.slice(secondColon + 1);

          if (eKpi !== kpi) continue;
          if (ePlatform && ePlatform !== (p.platform || platform)) continue;
          if (eDevice && eDevice !== dev) continue;

          const embedBucket = state.embeddedData[eKey];
          if (!embedBucket[kpi]) embedBucket[kpi] = [];
          const embedArr = embedBucket[kpi];
          const ei = embedArr.findIndex((r) => r.device === dev && r.timestamp === tsIso);
          if (ei === -1) embedArr.push(row);
          else embedArr[ei] = row;

          embedBucket[kpi] = embedArr
            .filter((r) => { const t = Date.parse(r.timestamp); return !Number.isNaN(t) && t >= cutoff; })
            .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
        }
      }
    },

    resetKPIData: (state, action) => {
      const kpi = action.payload;
      if (kpi) state.kpiChartData[kpi] = [];
    },
    clearEmbeddedData: (state, action) => {
      const embedKey = action.payload;
      if (embedKey) delete state.embeddedData[embedKey];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableKPIs.pending, (state) => {
        state.loading = true;
        state.accessError = null;
      })
      .addCase(fetchAvailableKPIs.fulfilled, (state, action) => {
        state.loading = false;
        state.accessError = null;
        state.availableKPIs =
          action.payload && Array.isArray(action.payload.kpis)
            ? action.payload
            : { kpis: [] };
      })
      .addCase(fetchAvailableKPIs.rejected, (state, action) => {
        state.loading = false;
        state.availableKPIs = { kpis: [] };
        state.accessError = action.payload?.code === 403 ? 403 : null;
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
              .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
          : [];
      })
      .addCase(fetchKPIChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load KPI data";
      })
      .addCase(fetchKPIChartDataBatch.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const { embedKey } = action.meta.arg || {};
        if (embedKey) state.loadingByKey[embedKey] = true;
      })
      .addCase(fetchKPIChartDataBatch.fulfilled, (state, action) => {
        const { grouped } = action.payload;
        state.loading = false;
        const { embedKey } = action.meta.arg || {};

        for (const [kpi, rows] of Object.entries(grouped)) {
          const normalizedRows = Array.isArray(rows)
            ? rows
                .map((r) => ({ ...r, timestamp: new Date(r.timestamp).toISOString() }))
                .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
            : [];

          if (embedKey) {
            if (!state.embeddedData[embedKey]) state.embeddedData[embedKey] = {};
            state.embeddedData[embedKey][kpi] = normalizedRows;
          } else {
            state.kpiChartData[kpi] = normalizedRows;
          }
        }

        if (embedKey) delete state.loadingByKey[embedKey];
      })
      .addCase(fetchKPIChartDataBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load KPI batch data";
        if (action.payload?.code === 403) state.accessError = 403;
        const { embedKey } = action.meta.arg || {};
        if (embedKey) delete state.loadingByKey[embedKey];
      });
  },
});

export const { wsMergeKpiPoints, resetKPIData, clearEmbeddedData } = kpiSlice.actions;
export default kpiSlice.reducer;
