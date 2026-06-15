// src/redux/Healthcheck/healthcheckSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";
import axios from "axios";
/* =========================
 * Helpers (không export)
 * ========================= */
function _minuteKeyISO(starttime) {
  const d = new Date(starttime);
  if (Number.isNaN(d.getTime())) return null;
  d.setSeconds(0, 0); // Chỉ cắt bỏ giây và mili-giây, GIỮ NGUYÊN PHÚT
  return d.toISOString();
}

function _pruneCutoff(hours = 24) {
  return Date.now() - (hours || 24) * 60 * 60 * 1000;
}
function _normPlatform(p) {
  return (p ?? "").toString().trim();
}

/* =========================
 * Thunk: toggle excluded
 * ========================= */
export const toggleDeviceExcluded = createAsyncThunk(
  "pscore/toggleDeviceExcluded",
  async ({ host, excluded }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.post(`/nornirps/systemhealth/toggle-exclude/`, {
        host,
        excluded,
      });
      dispatch(
        showTemporaryAlert({
          message: `Thiết bị ${host} ${
            excluded ? "đã loại trừ" : "bỏ loại trừ"
          } khỏi cảnh báo`,
          type: "success",
        }),
      );
      // 🔥 THÊM ĐOẠN NÀY: Bắn tín hiệu cho các Tab khác biết!
      // Dùng Date.now() để tạo timestamp, đảm bảo sự kiện luôn được trigger kể cả khi toggle cùng 1 thiết bị nhiều lần
      localStorage.setItem(
        "cross_tab_sync_exclude",
        JSON.stringify({ host, excluded, _ts: Date.now() }),
      );
      return { host, excluded };
    } catch (error) {
      // const msg =
      //   error?.response?.data?.detail ||
      //   "Không thể cập nhật trạng thái excluded";
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền thay đổi thiết bị này."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Không thể cập nhật trạng thái excluded";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

/* =========================
 * Thunk: System Health & Healthcheck
 * ========================= */
export const fetchPlatformGroupSchema = createAsyncThunk(
  "systemHealth/fetchPlatformGroupSchema",
  async (_, { rejectWithValue }) => {
    try {
      const res = await snocApi.get("/nornirps/systemhealth/schema/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || {});
    }
  },
);

export const fetchHealthcheckSchedules = createAsyncThunk(
  "pscore/fetchHealthcheckSchedules",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.get("/nornirps/schedulerhealth/list/");
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        "Lỗi khi tải danh sách lịch healthcheck";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

// export const createHealthcheckSchedule = createAsyncThunk(
//   "pscore/createHealthcheckSchedule",
//   async (
//     { name, platform, node_names, cron, start_time },
//     { dispatch, rejectWithValue },
//   ) => {
//     try {
//       const response = await snocApi.post("/nornirps/schedulerhealth/", {
//         name,
//         platform,
//         node_names,
//         cron,
//         start_time,
//       });
//       dispatch(
//         showTemporaryAlert({
//           message: "Đặt lịch thành công!",
//           type: "success",
//         }),
//       );
//       return response.data;
//     } catch (error) {
//       const message = error?.response?.data?.detail || "Lỗi khi đặt lịch";
//       dispatch(showTemporaryAlert({ message, type: "error" }));
//       return rejectWithValue(error?.response?.data);
//     }
//   },
// );


// export const updateHealthcheckSchedule = createAsyncThunk(
//   "pscore/updateHealthcheckSchedule",
//   async (
//     { id, name, platform, node_names, cron, start_time },
//     { dispatch, rejectWithValue },
//   ) => {
//     try {
//       await snocApi.put(`/nornirps/schedulerhealth/${id}/update/`, {
//         name,
//         platform,
//         node_names,
//         cron,
//         start_time,
//       });
//       dispatch(fetchHealthcheckSchedules());
//       dispatch(
//         showTemporaryAlert({
//           message: "Đã cập nhật lịch thành công",
//           type: "success",
//         }),
//       );
//       return id;
//     } catch (error) {
//       const message = error?.response?.data?.detail || "Lỗi khi cập nhật lịch";
//       dispatch(showTemporaryAlert({ message, type: "error" }));
//       return rejectWithValue(error?.response?.data);
//     }
//   },
// );


// 1. Sửa hàm CREATE
export const createHealthcheckSchedule = createAsyncThunk(
  "pscore/createHealthcheckSchedule",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      // Đẩy nguyên cục payload xuống (bao gồm cả group, department...)
      const response = await snocApi.post("/nornirps/schedulerhealth/", payload);
      dispatch(showTemporaryAlert({ message: "Đặt lịch thành công!", type: "success" }));
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi đặt lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// 2. Sửa hàm UPDATE
export const updateHealthcheckSchedule = createAsyncThunk(
  "pscore/updateHealthcheckSchedule",
  async ({ id, ...payload }, { dispatch, rejectWithValue }) => {
    try {
      // Đẩy nguyên cục payload xuống API update
      await snocApi.put(`/nornirps/schedulerhealth/${id}/update/`, payload);
      dispatch(fetchHealthcheckSchedules());
      dispatch(showTemporaryAlert({ message: "Đã cập nhật lịch thành công", type: "success" }));
      return id;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi cập nhật lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const toggleScheduleEnabled = createAsyncThunk(
  "pscore/toggleScheduleEnabled",
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.patch(`/nornirps/schedulerhealth/${id}/toggle/`, {
        enabled,
      });
      dispatch(fetchHealthcheckSchedules());
      dispatch(
        showTemporaryAlert({
          message: `Đã ${enabled ? "bật" : "tắt"} lịch thành công`,
          type: "success",
        }),
      );
      return { id, enabled };
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi bật/tắt lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const deleteHealthcheckSchedule = createAsyncThunk(
  "pscore/deleteHealthcheckSchedule",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`/nornirps/schedulerhealth/${id}/delete/`);
      dispatch(fetchHealthcheckSchedules());
      dispatch(
        showTemporaryAlert({
          message: "Đã xóa lịch thành công",
          type: "success",
        }),
      );
      return id;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi xóa lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

// export const fetchPSCoreStatus = createAsyncThunk(
//   "pscore/fetchPSCoreStatus",
//   async (
//     { host, page = 1, platform = [], option = "", storeKey, hours, page_size },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const params = new URLSearchParams();
//       if (host) params.append("host", host);
//       if (option) params.append("option", option);
//       params.append("page", String(page));
//       platform.forEach((p) => params.append("platform", p));

//       const hasHours =
//         hours !== undefined && hours !== null && `${hours}` !== "";
//       if (hasHours) params.append("hours", String(hours));
//       if (page_size) params.append("page_size", String(page_size));

//       // có hours -> KHÔNG gửi notes; không có hours -> gửi notes
//       if (!hasHours) params.append("include_notes", "1");

//       const response = await snocApi.get(
//         `/nornirps/healthcheck/history/?${params.toString()}`
//       );
//       return response.data;
//     } catch (error) {
//       const msg =
//         error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
//       dispatch(showTemporaryAlert({ message: msg, type: "error" }));
//       return rejectWithValue(error?.response?.data);
//     }
//   }
// );

export const fetchPSCoreStatus = createAsyncThunk(
  "pscore/fetchPSCoreStatus",
  async (
    { host, page = 1, platform = [], option = "", storeKey, hours, page_size },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (option) params.append("option", option);

      // NOTE: page sẽ set trong loop, không set cố định ở đây nữa
      platform.forEach((p) => params.append("platform", p));

      const hasHours =
        hours !== undefined && hours !== null && `${hours}` !== "";
      if (hasHours) params.append("hours", String(hours));
      if (page_size) params.append("page_size", String(page_size));

      // có hours -> KHÔNG gửi notes; không có hours -> gửi notes
      params.append("include_notes", "1");

      const baseUrl = `/nornirps/healthcheck/history/?${params.toString()}`;

      // ---- Nếu không phải chart/history dài thì giữ nguyên gọi 1 page ----
      // (Bạn có thể bỏ nhánh này nếu muốn ALWAYS fetch all)
      const shouldFetchAllPages =
        !!hasHours ||
        storeKey === "hourly" ||
        (storeKey || "").startsWith("hourly_");

      if (!shouldFetchAllPages) {
        const response = await snocApi.get(`${baseUrl}&page=${page}`);
        return response.data;
      }

      // ---- Fetch ALL pages bằng Promise.all (Tối ưu tốc độ) ----
      const MAX_PAGES = 80;
      const curPage = page || 1;

      // 1. Fetch trang đầu tiên để lấy meta (tổng số count, next)
      const firstResponse = await snocApi.get(`${baseUrl}&page=${curPage}`);
      const firstData = firstResponse.data || {};
      const mergedResults = Array.isArray(firstData.results)
        ? [...firstData.results]
        : [];

      // Nếu không có trang tiếp theo (next = null), trả về luôn
      if (!firstData.next) {
        return {
          count: firstData.count ?? mergedResults.length,
          next: null,
          previous: firstData.previous ?? null,
          results: mergedResults,
        };
      }

      // 2. Tính toán số trang cần gọi API
      const totalCount = firstData.count || 0;
      const itemsPerPage = mergedResults.length || 50; // Dự phòng fallback chia cho 50
      const totalPagesToFetch = Math.ceil(totalCount / itemsPerPage);

      const maxPagesLimit = Math.min(totalPagesToFetch, MAX_PAGES);
      const promises = [];

      // Tạo mảng Promise cho các trang còn lại (từ trang 2 đến limit)
      for (let i = curPage + 1; i <= maxPagesLimit; i++) {
        promises.push(
          snocApi.get(`${baseUrl}&page=${i}`).catch((err) => {
            // Bọc catch để nếu 1 trang lỗi mạng, nó không làm sập toàn bộ các trang khác
            console.warn(`Lỗi khi tải trang ${i}:`, err);
            return null;
          }),
        );
      }

      // 3. Tải song song tất cả các trang cùng lúc
      if (promises.length > 0) {
        const responses = await Promise.all(promises);
        responses.forEach((res) => {
          if (res?.data?.results && Array.isArray(res.data.results)) {
            mergedResults.push(...res.data.results);
          }
        });
      }

      // Cảnh báo nếu dữ liệu gốc vượt quá 80 trang (MAX_PAGES)
      if (totalPagesToFetch > MAX_PAGES) {
        dispatch(
          showTemporaryAlert({
            message:
              "Dữ liệu history quá nhiều, đã tải song song một phần (vượt giới hạn trang).",
            type: "warning",
          }),
        );
      }

      return {
        count: firstData.count ?? mergedResults.length,
        next: null,
        previous: firstData.previous ?? null,
        results: mergedResults,
      };
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const fetchLatestHealthcheckView = createAsyncThunk(
  "pscore/fetchLatestHealthcheckView",
  async (
    // { host, page = 1, platform = [], option = "" },
    { host, platform = [], option = "" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (option) params.append("option", option);
      // params.append("page", page);
      platform.forEach((p) => params.append("platform", p));

      const response = await snocApi.get(
        `/nornirps/healthcheck/latest/?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const fetchSystemStatus = createAsyncThunk(
  "pscore/fetchSystemStatus",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get("/nornirps/systemhealth/");
      dispatch(
        showTemporaryAlert({
          message: "Get System health successfully!",
          type: "success",
        }),
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu System Health";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const fetchSystemStatusByGroup = createAsyncThunk(
  "pscore/fetchSystemStatusByGroup",
  async (group, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get(`/nornirps/systemhealth/${group}/`);
      return { group, data: response.data };
    } catch (error) {
      const msg =
        error?.response?.data?.detail || `Không thể tải dữ liệu group ${group}`;
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue({ group, error: error?.response?.data });
    }
  },
);

export const fetchSystemStatusBySubsystem = createAsyncThunk(
  "pscore/fetchSystemStatusBySubsystem",
  async ({ group, subsystem }, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get(
        `/nornirps/systemhealth/${group}/${subsystem}/`,
      );
      return { group, subsystem, data: response.data };
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        `Không thể tải dữ liệu subsystem ${subsystem}`;
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue({
        group,
        subsystem,
        error: error?.response?.data,
      });
    }
  },
);

export const GenericHealthCheckView = createAsyncThunk(
  "healthcheck/GenericHealthCheckView",
  async (
    { selectedPlatform, selectedDevice },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await snocApi.post(
        "/nornirps/GenericHealthCheckView/",
        { selectedPlatform, selectedDevice },
        {
          // ⏳ chờ 2 phút
          timeout: 120000,
          // tránh bị abort bởi AbortController ở nơi khác
          signal: undefined,
          // (tuỳ thích) thông điệp khi quá thời gian
          timeoutErrorMessage: "Healthcheck timed out after 2 minutes.",
          // (an toàn) vô hiệu cancel token cũ nếu có (axios<1) — không bắt buộc
          cancelToken: undefined,
        },
      );

      dispatch(
        showTemporaryAlert({
          message: "Nodes is healthcheck successfully!",
          type: "success",
        }),
      );
      return response.data;
    } catch (error) {
        // 1. Log để debug (đã thấy trong log của bạn là OK)
          console.log("SERVER DATA:", error?.response?.data);

          // 2. Trích xuất message an toàn
          const data = error?.response?.data;
          const serverDetail = data?.detail || data?.msg;
          
          // Ép kiểu về string để Alert không bị crash
          const finalDetail = typeof serverDetail === 'string' 
              ? serverDetail 
              : (typeof serverDetail === 'object' ? JSON.stringify(serverDetail) : null);

          // 3. Kiểm tra cancel/timeout (Dùng optional chaining cho axios để an toàn)
          const isCanceled = axios?.isCancel?.(error) || error?.code === "ERR_CANCELED";
          const isTimeout = error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "");

          const errorMessage = isCanceled
              ? "Request was canceled."
              : isTimeout
                  ? "Healthcheck timed out after 2 minutes."
                  : finalDetail || error?.message || "Failed to healthcheck nodes.";

          // 4. Bắn Alert - Bây giờ chắc chắn sẽ chạy vì không còn lỗi ReferenceError
          dispatch(showTemporaryAlert({ message: String(errorMessage), type: "error" }));

          return rejectWithValue(data ?? { detail: errorMessage });
    }
  },
);

/* =========================
 * Thunk: fetchNokSeries
 * ========================= */
export const fetchNokSeries = createAsyncThunk(
  "pscore/fetchNokSeries",
  async ({ platform = [], hours = 24, storeKey }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      platform.forEach((p) => params.append("platform", p));
      params.append("hours", String(hours));
      const bm = hours <= 24 ? 5 : hours <= 72 ? 30 : 60;
      params.append("bucket_minutes", String(bm));
      const resp = await snocApi.get(
        `/nornirps/healthcheck/nok-series/?${params.toString()}`,
      );
      return { series: resp.data, storeKey, platforms: platform };
    } catch (err) {
      return rejectWithValue(err?.response?.data);
    }
  },
);

export const fetchLockedDevices = createAsyncThunk(
  "pscore/fetchLockedDevices",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await snocApi.get("/nornirps/healthcheck/locked-devices/");
      return Array.isArray(resp.data) ? resp.data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data);
    }
  },
);

/* =========================
 * Slice
 * ========================= */
const psCoreSlice = createSlice({
  name: "pscore",
  initialState: {
    items: [],
    lastestitems: [],
    loading: false,
    count: 0,
    next: null,
    previous: null,
    countlastest: 0,
    nextlastest: null,
    previouslastest: null,
    healthchecknodes: [],
    status: "idle",
    error: null,
    refresh: false,

    systemStatus: {},
    scheduleCreating: false,
    scheduledTasks: [],
    loadingScheduledTasks: false,

    groupStatus: {},
    subsystemStatus: {},
    platformSchema: {},

    websocketConnected: true,
    recentlyUpdated: {},

    // ❌ đã gỡ genericSchedules và loadingGenericSchedules

    hostHistoryLoading: false,
    hostHistoryItems: [],
    hostHistoryCount: 0,
    hostHistoryNext: null,
    hostHistoryPrevious: null,

    hourlyLoading: false,
    hourlyItems: [],
    hourlyByKey: {}, // { [storeKey]: items[] }
    hourlyLoadingByKey: {}, // { [storeKey]: boolean }
    hourlyByPlatform: {}, // { [platform]: HourlyItem[] }
    hourPruneHours: 24,
    nokSeriesByKey: {}, // { [storeKey]: [{time, total_nok, by_platform, devices}] }
    nokSeriesLoadingByKey: {}, // { [storeKey]: boolean }
    nokSeriesStalePlatforms: [], // platforms có WS update mới, chờ re-fetch
    globalLatestItems: [], // <- 🔥 THÊM MỚI: Độc quyền cho Dashboard (không bị ghi đè)
    lockedDevices: [],     // [{device_name, platform, last_fail_reason, locked_at, fail_count}]
  },
  reducers: {
    wsMergeHourlyItems: (state, action) => {
      const { items = [], platform: fallbackPlatform } = action.payload || {};
      const byPlat = state.hourlyByPlatform || (state.hourlyByPlatform = {});
      const cutoff = _pruneCutoff(state.hourPruneHours);

      // group theo platform
      const grouped = {};
      for (const it of items) {
        const p = it?.platform || fallbackPlatform;
        if (!p || !it?.starttime) continue;
        (grouped[p] ||= []).push(it);
      }

      // merge từng platform
      for (const [p, arr] of Object.entries(grouped)) {
        const existing = byPlat[p] || [];
        const map = new Map();

        // nạp sẵn existing để dedup (Sửa từ hourISO thành minuteISO)
        for (const it of existing) {
          const minuteISO = _minuteKeyISO(it.starttime);
          if (!minuteISO) continue;
          map.set(`${p}|${it.host}|${minuteISO}`, it);
        }

        // add/update new items
        for (const it of arr) {
          const minuteISO = _minuteKeyISO(it.starttime);
          if (!minuteISO) continue;
          map.set(`${p}|${it.host}|${minuteISO}`, it);
        }

        // prune và sort
        const merged = Array.from(map.values())
          .filter((it) => {
            const ts = new Date(it.starttime).getTime();
            return !Number.isNaN(ts) && ts >= cutoff;
          })
          .sort((a, b) => new Date(a.starttime) - new Date(b.starttime));

        byPlat[p] = merged;
      }

      // Đánh dấu stale cho GroupNokChart để trigger re-fetch nok-series
      const stale = state.nokSeriesStalePlatforms || [];
      for (const p of Object.keys(grouped)) {
        if (!stale.includes(p)) stale.push(p);
      }
      state.nokSeriesStalePlatforms = stale.slice(-20);
    },
    updateLastRunAt: (state, action) => {
      const { name, last_run_at, status } = action.payload;
      const task = state.scheduledTasks.find((t) => t.name === name);
      if (task) {
        task.last_run_status = status;
        task.last_run_at = last_run_at;
      }
    },

    setWebSocketStatus: (state, action) => {
      state.websocketConnected = action.payload;
    },

    updateSystemStatusPatch: (state, action) => {
      const { group, subsystem, data } = action.payload;

      // init group if missing
      if (!state.systemStatus[group]) {
        state.systemStatus[group] = {
          status: "Unknown",
          children: {},
          ok_count: 0,
          nok_count: 0,
          total_devices: 0,
        };
      }
      if (!state.systemStatus[group].children) {
        state.systemStatus[group].children = {};
      }

      // merge child
      const oldData = state.systemStatus[group].children[subsystem] || {};
      state.systemStatus[group].children[subsystem] = { ...oldData, ...data };

      // recalc group totals
      const children = state.systemStatus[group].children;
      let ok = 0,
        nok = 0,
        total = 0;
      for (const key in children) {
        ok += children[key].ok_count || 0;
        nok += children[key].nok_count || 0;
        total += children[key].total_devices || 0;
      }
      state.systemStatus[group].ok_count = ok;
      state.systemStatus[group].nok_count = nok;
      state.systemStatus[group].total_devices = total;
      state.systemStatus[group].status =
        nok > 0 ? "Warning" : ok > 0 ? "Normal" : "Unknown";

      // mark recently updated
      if (!state.recentlyUpdated[group]) state.recentlyUpdated[group] = {};
      state.recentlyUpdated[group][subsystem] = Date.now();
    },

    upsertLatestFromClient: (state, { payload }) => {
      const host = payload?.host?.trim?.();
      if (!host) return;

      const plat = _normPlatform(payload?.platform || payload?.platform_name);

      // notes: đảm bảo luôn là string để render ổn
      const notesStr = Array.isArray(payload?.notes)
        ? payload.notes.map((n) => n?.note ?? "").join(" | ")
        : (payload?.notes ?? "");

      // 🔥 BƯỚC 1: TÌM TRẠNG THÁI EXCLUDED CHUẨN XÁC NHẤT TỪ STATE
      // Ưu tiên quét trong mảng global (vì nó chứa full), sau đó mới tới mảng table
      const findItem = (arr) =>
        (arr || []).find(
          (x) => x.host === host && _normPlatform(x.platform) === plat,
        );

      const existingGlobal = findItem(state.globalLatestItems);
      const existingTable = findItem(state.lastestitems);

      // Chốt cờ excluded (Ưu tiên lấy từ Global -> Table -> Payload gửi từ WS)
      let preservedExcluded = payload?.excluded;
      if (existingGlobal && existingGlobal.hasOwnProperty("excluded")) {
        preservedExcluded = existingGlobal.excluded;
      } else if (existingTable && existingTable.hasOwnProperty("excluded")) {
        preservedExcluded = existingTable.excluded;
      }

      // ====== HELPER NỘI BỘ: Tối ưu UI Lag & Memory Leak ======
      const updateArray = (targetArray, isTable = false) => {
        const arr = targetArray || [];
        const idx = arr.findIndex(
          (x) => x.host === host && _normPlatform(x.platform) === plat,
        );

        const currentObj = idx >= 0 ? arr[idx] : {};

        const merged = {
          ...currentObj,
          ...payload,
          host,
          platform: plat,
          notes: notesStr,
          excluded: preservedExcluded, // 🔥 Ép cứng cờ excluded đã được bảo vệ kỹ lưỡng
        };

        if (idx >= 0) {
          // Rút phần tử cũ ra khỏi mảng (O(N) thay vì O(N log N) của sort)
          arr.splice(idx, 1);
        } else if (isTable) {
          state.countlastest = (state.countlastest || 0) + 1;
        }

        // Cắm bản ghi mới cập nhật lên ĐẦU mảng.
        arr.unshift(merged);

        // 🔥 CHỐNG TRÀN RAM: Giới hạn mảng tối đa 5000 bản ghi
        const MAX_ITEMS = 5000;
        if (arr.length > MAX_ITEMS) {
          arr.length = MAX_ITEMS;
        }

        return arr;
      };

      // 1. Cập nhật mảng Dashboard (Global)
      if (state.globalLatestItems) {
        state.globalLatestItems = updateArray(state.globalLatestItems, false);
      }

      // 2. Cập nhật mảng Table
      state.lastestitems = updateArray(state.lastestitems, true);

      // 3. Đẩy vào chart 24h nếu NOK/Error (Bỏ qua hoàn toàn nếu đang bị exclude)
      const st = payload?.status;
      if ((st === "NOK" || st === "Error") && !preservedExcluded) {
        state.hourlyItems = [
          {
            host,
            platform: plat,
            status: st,
            starttime: payload?.starttime || new Date().toISOString(),
            notes: notesStr,
          },
          ...(state.hourlyItems || []),
        ];
      }
    },
    // 🔥 THÊM REDUCER MỚI NÀY ĐỂ NHẬN LỆNH ĐỒNG BỘ TỪ TAB KHÁC
    syncDeviceExcluded: (state, action) => {
      const { host, excluded } = action.payload;

      // Cập nhật mảng Table
      if (state.lastestitems) {
        state.lastestitems = state.lastestitems.map((item) =>
          item.host === host ? { ...item, excluded } : item,
        );
      }

      // Cập nhật mảng Dashboard (Chart & Count sẽ tự động re-render theo)
      if (state.globalLatestItems) {
        state.globalLatestItems = state.globalLatestItems.map((item) =>
          item.host === host ? { ...item, excluded } : item,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchPSCoreStatus */
      .addCase(fetchPSCoreStatus.pending, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        if (key === "hourly") {
          state.hourlyLoading = true;
        } else if (key === "hostHistory") {
          state.hostHistoryLoading = true;
        } else if (key?.startsWith("hourly_")) {
          state.hourlyLoadingByKey[key] = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchPSCoreStatus.fulfilled, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        const results = action.payload?.results || [];
        if (key === "hourly") {
          state.hourlyLoading = false;
          state.hourlyItems = results;
        } else if (key === "hostHistory") {
          state.hostHistoryLoading = false;
          state.hostHistoryItems = results;
          state.hostHistoryCount = action.payload?.count || 0;
          state.hostHistoryNext = action.payload?.next || null;
          state.hostHistoryPrevious = action.payload?.previous || null;
        } else if (key?.startsWith("hourly_")) {
          state.hourlyLoadingByKey[key] = false;
          state.hourlyByKey[key] = results;
        } else {
          state.loading = false;
          state.items = results;
          state.count = action.payload?.count || 0;
          state.next = action.payload?.next;
          state.previous = action.payload?.previous;
        }
      })
      .addCase(fetchPSCoreStatus.rejected, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        if (key === "hourly") {
          state.hourlyLoading = false;
          state.hourlyItems = [];
        } else if (key === "hostHistory") {
          state.hostHistoryLoading = false;
          state.hostHistoryItems = [];
          state.hostHistoryCount = 0;
          state.hostHistoryNext = null;
          state.hostHistoryPrevious = null;
        } else if (key?.startsWith("hourly_")) {
          state.hourlyLoadingByKey[key] = false;
          state.hourlyByKey[key] = [];
        } else {
          state.loading = false;
          state.items = [];
        }
      })

      /* latest healthcheck view */
      .addCase(fetchLatestHealthcheckView.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLatestHealthcheckView.fulfilled, (state, action) => {
        state.loading = false;

        const results = action.payload?.results || [];
        state.lastestitems = results;
        state.countlastest = results.length; // dùng length, vì không paginate nữa
        state.nextlastest = action.payload?.next;
        state.previouslastest = action.payload?.previous;

        // 🔥 THÊM ĐOẠN NÀY ĐỂ BẮT DỮ LIỆU CHO DASHBOARD
        // Nhận diện: Dashboard gọi API sẽ có page_size rất lớn (ví dụ 5000) và không filter platform cụ thể.
        // Còn Table trong Modal thường sẽ truyền platform = ['cs_mss']...
        const args = action.meta.arg || {};
        if (!args.platform && args.page_size >= 1000) {
          state.globalLatestItems = results;
        }
      })
      .addCase(fetchLatestHealthcheckView.rejected, (state) => {
        state.loading = false;
        state.lastestitems = [];
      })

      /* locked devices */
      .addCase(fetchLockedDevices.fulfilled, (state, action) => {
        state.lockedDevices = action.payload;
      })
      .addCase(fetchLockedDevices.rejected, (state) => {
        state.lockedDevices = [];
      })

      /* system health */
      .addCase(fetchSystemStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSystemStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStatus = action.payload;
      })
      .addCase(fetchSystemStatus.rejected, (state) => {
        state.loading = false;
        state.systemStatus = {};
      })

      /* group/subsystem */
      .addCase(fetchSystemStatusByGroup.fulfilled, (state, action) => {
        const { group, data } = action.payload;
        state.groupStatus[group] = data[group] || data;
      })
      .addCase(fetchSystemStatusByGroup.rejected, (state, action) => {
        const { group } = action.payload || {};
        if (group) state.groupStatus[group] = null;
      })
      .addCase(fetchSystemStatusBySubsystem.fulfilled, (state, action) => {
        const { group, subsystem, data } = action.payload;
        if (!state.subsystemStatus[group]) state.subsystemStatus[group] = {};
        state.subsystemStatus[group][subsystem] = data[subsystem] || data;
      })
      .addCase(fetchSystemStatusBySubsystem.rejected, (state, action) => {
        const { group, subsystem } = action.payload || {};
        if (group && subsystem) {
          if (!state.subsystemStatus[group]) state.subsystemStatus[group] = {};
          state.subsystemStatus[group][subsystem] = null;
        }
      })

      /* Generic healthcheck on-demand */
      .addCase(GenericHealthCheckView.pending, (state) => {
        state.loading = true;
      })
      .addCase(GenericHealthCheckView.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.healthchecknodes = action.payload;
        state.refresh = !state.refresh;
      })
      .addCase(GenericHealthCheckView.rejected, (state) => {
        state.loading = false;
        state.refresh = !state.refresh;
        state.healthchecknodes = [];
      })

      /* create/update/delete healthcheck schedules */
      .addCase(createHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true;
      })
      .addCase(createHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(createHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(deleteHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true;
      })
      .addCase(deleteHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(deleteHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(updateHealthcheckSchedule.pending, (state) => {
        state.scheduleCreating = true;
      })
      .addCase(updateHealthcheckSchedule.fulfilled, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(updateHealthcheckSchedule.rejected, (state) => {
        state.scheduleCreating = false;
      })
      .addCase(fetchHealthcheckSchedules.pending, (state) => {
        state.loadingScheduledTasks = true;
      })
      .addCase(fetchHealthcheckSchedules.fulfilled, (state, action) => {
        state.loadingScheduledTasks = false;
        state.scheduledTasks = action.payload || [];
      })
      .addCase(fetchHealthcheckSchedules.rejected, (state) => {
        state.loadingScheduledTasks = false;
        state.scheduledTasks = [];
      })

      /* platform schema */
      .addCase(fetchPlatformGroupSchema.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformGroupSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.platformSchema = action.payload;
      })
      .addCase(fetchPlatformGroupSchema.rejected, (state) => {
        state.loading = false;
        state.platformSchema = {};
      })

      /* toggle excluded */
      .addCase(toggleDeviceExcluded.fulfilled, (state, action) => {
        const { host, excluded } = action.payload;

        // 1. Cập nhật cho Bảng (Table) đang mở
        state.lastestitems = state.lastestitems.map((item) =>
          item.host === host ? { ...item, excluded } : item,
        );

        // 2. 🔥 Cập nhật luôn cho Data tổng của Dashboard chạy ngầm
        if (state.globalLatestItems) {
          state.globalLatestItems = state.globalLatestItems.map((item) =>
            item.host === host ? { ...item, excluded } : item,
          );
        }
      })

      /* nok-series aggregated endpoint */
      .addCase(fetchNokSeries.pending, (state, action) => {
        state.nokSeriesLoadingByKey[action.meta.arg.storeKey] = true;
      })
      .addCase(fetchNokSeries.fulfilled, (state, action) => {
        const { series, storeKey, platforms } = action.payload;
        state.nokSeriesByKey[storeKey] = series;
        state.nokSeriesLoadingByKey[storeKey] = false;
        // Clear stale flags cho các platform đã fetch xong
        state.nokSeriesStalePlatforms = (state.nokSeriesStalePlatforms || []).filter(
          (p) => !platforms.includes(p),
        );
      })
      .addCase(fetchNokSeries.rejected, (state, action) => {
        state.nokSeriesLoadingByKey[action.meta.arg.storeKey] = false;
      });
  },
});

export const {
  updateLastRunAt,
  setWebSocketStatus,
  updateSystemStatusPatch,
  wsMergeHourlyItems,
  upsertLatestFromClient,
  syncDeviceExcluded,
} = psCoreSlice.actions;

export default psCoreSlice.reducer;
