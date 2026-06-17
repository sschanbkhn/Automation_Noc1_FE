// src/redux/KPI/kpiPinnedSlice.js
// Pin KPI theo user, lưu trên backend (không dùng localStorage).
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAllKpiPreferences,
  upsertKpiPreference,
  deleteKpiPreferenceApi,
} from "../../api/kpiPreferences";
import { fetchKPIChartDataBatch } from "./kpiSlice";
import { showTemporaryAlert } from "../Alert/alertSlice";

// ─── Legacy localStorage keys (dùng 1 lần để migrate) ────────────────────────
const LS_PIN_KEY = (uid) => `pinned_kpis_by_platform_${uid || "anon"}`;
const LS_DEV_KEY = (uid) => `pinned_devices_by_platform_${uid || "anon"}`;

function readLegacyLocalStorage(uid) {
  try {
    const pins = JSON.parse(localStorage.getItem(LS_PIN_KEY(uid)) || "null");
    const devs = JSON.parse(localStorage.getItem(LS_DEV_KEY(uid)) || "null");
    return { pins, devs };
  } catch {
    return { pins: null, devs: null };
  }
}

function clearLegacyLocalStorage(uid) {
  try {
    localStorage.removeItem(LS_PIN_KEY(uid));
    localStorage.removeItem(LS_DEV_KEY(uid));
    localStorage.removeItem("pinned_kpis_by_platform");
    localStorage.removeItem("pinned_devices_by_platform");
  } catch {}
}

// ─── Async thunks ─────────────────────────────────────────────────────────────

// Load tất cả preferences từ backend. Nếu backend trả rỗng mà localStorage
// còn data thì migrate lên backend (1 lần duy nhất), sau đó xóa localStorage.
export const fetchKpiPreferences = createAsyncThunk(
  "kpiPinned/fetchKpiPreferences",
  async (_, { getState, rejectWithValue }) => {
    try {
      const prefs = await fetchAllKpiPreferences();
      const uid = getState().account?.user?.id;

      if (Array.isArray(prefs) && prefs.length === 0) {
        // Backend rỗng → kiểm tra legacy localStorage
        // Guard: bỏ qua migration nếu uid chưa load để tránh migrate data của user khác
        if (!uid) return prefs;
        const { pins, devs } = readLegacyLocalStorage(uid);
        if (pins && Object.keys(pins).length > 0) {
          // Migrate từng platform lên backend
          await Promise.all(
            Object.entries(pins).map(([platform, pinned_kpis]) =>
              upsertKpiPreference(platform, {
                pinned_kpis: Array.isArray(pinned_kpis) ? pinned_kpis : [],
                pinned_devices: (devs && Array.isArray(devs[platform])) ? devs[platform] : [],
              }).catch(() => null)
            )
          );
          clearLegacyLocalStorage(uid);
          // Trả về dữ liệu đã migrate
          return Object.entries(pins).map(([platform, pinned_kpis]) => ({
            platform,
            pinned_kpis: Array.isArray(pinned_kpis) ? pinned_kpis : [],
            pinned_devices: (devs && Array.isArray(devs[platform])) ? devs[platform] : [],
          }));
        }
        clearLegacyLocalStorage(uid);
      }
      return prefs;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e?.message || "fetch failed");
    }
  }
);

export const saveKpiPreference = createAsyncThunk(
  "kpiPinned/saveKpiPreference",
  async ({ platform, kpis, devices }, { rejectWithValue }) => {
    try {
      return await upsertKpiPreference(platform, {
        pinned_kpis: kpis,
        pinned_devices: devices,
      });
    } catch (e) {
      return rejectWithValue(e?.response?.data || e?.message || "save failed");
    }
  }
);

export const clearKpiPreference = createAsyncThunk(
  "kpiPinned/clearKpiPreference",
  async (platform, { rejectWithValue }) => {
    try {
      await deleteKpiPreferenceApi(platform);
      return platform;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e?.message || "delete failed");
    }
  }
);

// Lấy giá trị latest cho các KPI đã ghim (window mặc định 120 phút)
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

// ─── Slice ────────────────────────────────────────────────────────────────────

const kpiPinnedSlice = createSlice({
  name: "kpiPinned",
  initialState: {
    pinnedByPlatform: {},
    savedDevicesByPlatform: {},
    latestByPlatform: {},
    loading: false,
    error: null,
  },
  reducers: {
    // Ghi đè danh sách KPI và devices cho 1 platform, rồi save lên backend
    setPinnedKPIs: (state, action) => {
      const { platform, kpis, devices } = action.payload || {};
      if (!platform) return;
      state.pinnedByPlatform[platform] = Array.from(new Set((kpis || []).filter(Boolean)));
      if (Array.isArray(devices)) {
        state.savedDevicesByPlatform[platform] = devices;
      }
    },
    // Toggle 1 KPI trong platform (optimistic)
    togglePinnedKPI: (state, action) => {
      const { platform, kpi } = action.payload || {};
      if (!platform || !kpi) return;
      const cur = new Set(state.pinnedByPlatform[platform] || []);
      if (cur.has(kpi)) cur.delete(kpi);
      else cur.add(kpi);
      state.pinnedByPlatform[platform] = Array.from(cur);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("account/LOGOUT", (state) => {
        state.pinnedByPlatform = {};
        state.savedDevicesByPlatform = {};
        state.latestByPlatform = {};
        state.loading = false;
        state.error = null;
      })

      // fetchKpiPreferences
      .addCase(fetchKpiPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKpiPreferences.fulfilled, (state, action) => {
        state.loading = false;
        const prefs = action.payload || [];
        const byPlatform = {};
        const devsByPlatform = {};
        for (const p of prefs) {
          if (p.platform) {
            byPlatform[p.platform] = Array.isArray(p.pinned_kpis) ? p.pinned_kpis : [];
            devsByPlatform[p.platform] = Array.isArray(p.pinned_devices) ? p.pinned_devices : [];
          }
        }
        state.pinnedByPlatform = byPlatform;
        state.savedDevicesByPlatform = devsByPlatform;
      })
      .addCase(fetchKpiPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "error";
      })

      // saveKpiPreference — cập nhật lại state từ response server
      .addCase(saveKpiPreference.fulfilled, (state, action) => {
        const p = action.payload;
        if (p?.platform) {
          state.pinnedByPlatform[p.platform] = Array.isArray(p.pinned_kpis) ? p.pinned_kpis : [];
          state.savedDevicesByPlatform[p.platform] = Array.isArray(p.pinned_devices) ? p.pinned_devices : [];
        }
      })

      // clearKpiPreference
      .addCase(clearKpiPreference.fulfilled, (state, action) => {
        const platform = action.payload;
        if (platform) {
          delete state.pinnedByPlatform[platform];
          delete state.savedDevicesByPlatform[platform];
        }
      })

      // fetchLatestForPinnedKpis
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
            dest[dev][kpi] = obj;
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

// Thunks tiện lợi: cập nhật state ngay (optimistic) rồi lưu lên backend.
// Nếu save thất bại (network/RBAC/...), ROLLBACK lại state cũ + báo lỗi —
// tránh tình trạng UI báo "đã bỏ ghim" nhưng backend chưa nhận được, nên
// refresh lại thấy KPI cũ quay về (silent failure, trước đây không bắt .rejected).
export const setPinnedKPIsAndSave = (payload) => async (dispatch, getState) => {
  const { platform, kpis, devices } = payload || {};
  if (!platform) return;
  const prevState = getState().kpiPinned;
  const prevKpis = prevState.pinnedByPlatform[platform] ?? [];
  const prevDevices = prevState.savedDevicesByPlatform[platform] ?? [];

  dispatch(setPinnedKPIs(payload));
  const state = getState().kpiPinned;
  const result = await dispatch(
    saveKpiPreference({
      platform,
      kpis: kpis ?? state.pinnedByPlatform[platform] ?? [],
      devices: devices ?? state.savedDevicesByPlatform[platform] ?? [],
    })
  );
  if (saveKpiPreference.rejected.match(result)) {
    dispatch(setPinnedKPIs({ platform, kpis: prevKpis, devices: prevDevices }));
    dispatch(
      showTemporaryAlert({
        type: "danger",
        message: "Lưu KPI ghim thất bại, vui lòng thử lại.",
        timeout: 3000,
      })
    );
  }
};

export const togglePinnedKPIAndSave = (payload) => async (dispatch, getState) => {
  const { platform } = payload || {};
  if (!platform) return;
  const prevKpis = getState().kpiPinned.pinnedByPlatform[platform] ?? [];

  dispatch(togglePinnedKPI(payload));
  const state = getState().kpiPinned;
  const result = await dispatch(
    saveKpiPreference({
      platform,
      kpis: state.pinnedByPlatform[platform] ?? [],
      devices: state.savedDevicesByPlatform[platform] ?? [],
    })
  );
  if (saveKpiPreference.rejected.match(result)) {
    // Rollback đúng danh sách trước khi toggle (không toggle lại — tránh lệch nếu có
    // thay đổi khác xảy ra song song).
    dispatch(setPinnedKPIs({ platform, kpis: prevKpis }));
    dispatch(
      showTemporaryAlert({
        type: "danger",
        message: "Bỏ ghim/Ghim KPI thất bại, vui lòng thử lại.",
        timeout: 3000,
      })
    );
  }
};

export default kpiPinnedSlice.reducer;
