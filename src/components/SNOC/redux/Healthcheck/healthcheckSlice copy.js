// src/redux/Healthcheck/healthcheckSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

/* =========================
 * Helpers (không export)
 * ========================= */
function _hourKeyISO(starttime) {
  const d = new Date(starttime);
  if (Number.isNaN(d.getTime())) return null;
  d.setMinutes(0, 0, 0);
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
        })
      );
      return { host, excluded };
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Không thể cập nhật trạng thái excluded";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
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
  }
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
  }
);

export const createHealthcheckSchedule = createAsyncThunk(
  "pscore/createHealthcheckSchedule",
  async (
    { name, platform, node_names, cron, start_time },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await snocApi.post("/nornirps/schedulerhealth/", {
        name,
        platform,
        node_names,
        cron,
        start_time,
      });
      dispatch(
        showTemporaryAlert({ message: "Đặt lịch thành công!", type: "success" })
      );
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi đặt lịch";
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
        })
      );
      return { id, enabled };
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi bật/tắt lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
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
        })
      );
      return id;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi xóa lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateHealthcheckSchedule = createAsyncThunk(
  "pscore/updateHealthcheckSchedule",
  async (
    { id, name, platform, node_names, cron, start_time },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await snocApi.put(`/nornirps/schedulerhealth/${id}/update/`, {
        name,
        platform,
        node_names,
        cron,
        start_time,
      });
      dispatch(fetchHealthcheckSchedules());
      dispatch(
        showTemporaryAlert({
          message: "Đã cập nhật lịch thành công",
          type: "success",
        })
      );
      return id;
    } catch (error) {
      const message = error?.response?.data?.detail || "Lỗi khi cập nhật lịch";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
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
    { rejectWithValue, dispatch }
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
      if (!hasHours) params.append("include_notes", "1");

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

      // ---- Fetch ALL pages để tránh rụng ----
      const MAX_PAGES = 80; // chặn an toàn, tránh loop vô hạn
      let curPage = page || 1;

      let mergedResults = [];
      let firstMeta = null;

      for (let i = 0; i < MAX_PAGES; i++) {
        const response = await snocApi.get(`${baseUrl}&page=${curPage}`);
        const data = response.data || {};

        if (!firstMeta) firstMeta = data;

        const results = Array.isArray(data?.results) ? data.results : [];
        if (results.length) mergedResults.push(...results);

        // DRF PageNumberPagination: next=null khi hết
        if (!data?.next) {
          return {
            count: data?.count ?? firstMeta?.count ?? mergedResults.length,
            next: null,
            previous: firstMeta?.previous ?? null,
            results: mergedResults,
          };
        }

        curPage += 1;
      }

      // Nếu vượt MAX_PAGES, vẫn trả phần đã có + cảnh báo nhẹ (không throw)
      dispatch(
        showTemporaryAlert({
          message:
            "Dữ liệu history quá nhiều, đã tải một phần (vượt giới hạn trang).",
          type: "warning",
        })
      );

      return {
        count: firstMeta?.count ?? mergedResults.length,
        next: null,
        previous: firstMeta?.previous ?? null,
        results: mergedResults,
      };
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const fetchHealthcheckSnapshots = createAsyncThunk(
  "pscore/fetchHealthcheckSnapshots",
  async (
    { group, subsystem, hours = 24, storeKey }, // storeKey để reuse cho group/subsystem/detail/modal
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("group", group);
      params.append("subsystem", subsystem);
      params.append("hours", String(hours));

      const res = await snocApi.get(
        `/nornirps/healthcheck/snapshots/?${params.toString()}`
      );

      return { storeKey, data: res.data };
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải snapshot healthcheck";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue({ storeKey, error: error?.response?.data });
    }
  }
);

export const fetchLatestHealthcheckView = createAsyncThunk(
  "pscore/fetchLatestHealthcheckView",
  async (
    // { host, page = 1, platform = [], option = "" },
    { host, platform = [], option = "" },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();
      if (host) params.append("host", host);
      if (option) params.append("option", option);
      // params.append("page", page);
      platform.forEach((p) => params.append("platform", p));

      const response = await snocApi.get(
        `/nornirps/healthcheck/latest/?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu PS Core";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
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
        })
      );
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Không thể tải dữ liệu System Health";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
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
  }
);

export const fetchSystemStatusBySubsystem = createAsyncThunk(
  "pscore/fetchSystemStatusBySubsystem",
  async ({ group, subsystem }, { rejectWithValue, dispatch }) => {
    try {
      const response = await snocApi.get(
        `/nornirps/systemhealth/${group}/${subsystem}/`
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
  }
);

export const GenericHealthCheckView = createAsyncThunk(
  "healthcheck/GenericHealthCheckView",
  async (
    { selectedPlatform, selectedDevice },
    { rejectWithValue, dispatch }
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
        }
      );

      dispatch(
        showTemporaryAlert({
          message: "Nodes is healthcheck successfully!",
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      const isCanceled =
        (axios.isCancel && axios.isCancel(error)) ||
        error?.code === "ERR_CANCELED";

      const isTimeout =
        error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "");

      const errorMessage = isCanceled
        ? "Healthcheck request was canceled."
        : isTimeout
        ? "Healthcheck timed out after 2 minutes."
        : error?.response?.data?.detail || "Failed to healthcheck nodes.";

      dispatch(showTemporaryAlert({ message: errorMessage, type: "error" }));
      return rejectWithValue(error?.response?.data ?? { detail: errorMessage });
    }
  }
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
    snapshotByKey: {}, // { [storeKey]: [{ts, ok, nok, ...}] }
    snapshotLoadingByKey: {}, // { [storeKey]: boolean }
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
        const map = new Map(); // key = platform|host|hourISO

        // nạp sẵn existing để dedup
        for (const it of existing) {
          const hourISO = _hourKeyISO(it.starttime);
          if (!hourISO) continue;
          map.set(`${p}|${it.host}|${hourISO}`, it);
        }
        // add/update new items
        for (const it of arr) {
          const hourISO = _hourKeyISO(it.starttime);
          if (!hourISO) continue;
          map.set(`${p}|${it.host}|${hourISO}`, it);
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

      // tìm theo host + platform (không chỉ host)
      const arr = state.lastestitems || (state.lastestitems = []);
      const idx = arr.findIndex(
        (x) => x.host === host && _normPlatform(x.platform) === plat
      );

      // notes: đảm bảo luôn là string để render ổn
      const notesStr = Array.isArray(payload?.notes)
        ? payload.notes.map((n) => n?.note ?? "").join(" | ")
        : payload?.notes ?? "";

      const merged = {
        ...(idx >= 0 ? arr[idx] : {}),
        ...payload,
        host,
        platform: plat, // luôn set platform đã chuẩn hoá
        notes: notesStr,
      };

      if (idx >= 0) {
        arr[idx] = merged;
      } else {
        arr.unshift(merged);
        state.countlastest = (state.countlastest || 0) + 1;
      }

      // sắp theo thời gian mới nhất (giảm dần) cho dễ nhìn
      arr.sort((a, b) => new Date(b.starttime) - new Date(a.starttime));
      state.lastestitems = arr;

      // (tuỳ chọn) đẩy vào chart 24h nếu NOK/Error
      const st = payload?.status;
      if (st === "NOK" || st === "Error") {
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
        // state.lastestitems = action.payload.results || [];
        // state.countlastest = action.payload.count || 0;
        const results = action.payload?.results || [];
        state.lastestitems = results;
        state.countlastest = results.length; // dùng length, vì không paginate nữa
        state.nextlastest = action.payload.next;
        state.previouslastest = action.payload.previous;
      })
      .addCase(fetchLatestHealthcheckView.rejected, (state) => {
        state.loading = false;
        state.lastestitems = [];
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
        state.lastestitems = state.lastestitems.map((item) =>
          item.host === host ? { ...item, excluded } : item
        );
      })

      /* snapshots */
      .addCase(fetchHealthcheckSnapshots.pending, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        if (key) state.snapshotLoadingByKey[key] = true;
      })
      .addCase(fetchHealthcheckSnapshots.fulfilled, (state, action) => {
        const { storeKey, data } = action.payload || {};
        if (!storeKey) return;
        state.snapshotLoadingByKey[storeKey] = false;

        // data.results là list 288 points
        const results = Array.isArray(data?.results) ? data.results : [];
        state.snapshotByKey[storeKey] = results;
      })
      .addCase(fetchHealthcheckSnapshots.rejected, (state, action) => {
        const key = action.meta?.arg?.storeKey;
        if (!key) return;
        state.snapshotLoadingByKey[key] = false;
        state.snapshotByKey[key] = [];
      });
  },
});

export const {
  updateLastRunAt,
  setWebSocketStatus,
  updateSystemStatusPatch,
  wsMergeHourlyItems,
  upsertLatestFromClient,
} = psCoreSlice.actions;

export default psCoreSlice.reducer;
