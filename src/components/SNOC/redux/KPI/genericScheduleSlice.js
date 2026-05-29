import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

/**
 * State theo usecase_type (nhóm):
 * genericSchedules: { [usecase_type]: Array<ScheduleItem> }
 * loadingGenericSchedules: { [usecase_type]: boolean }
 *
 * ScheduleItem (tối thiểu):
 * { id, name, platform, cron, node_names, enabled, usecase, action, params?, last_run_at?, last_run_status?, result_summary? }
 */

const initialState = {
  genericSchedules: {},
  loadingGenericSchedules: {},
};

/* =========================
 * Thunks
 * ========================= */
export const fetchGenericSchedule = createAsyncThunk(
  "genericSchedule/fetchGenericSchedules",
  async ({ usecase_type = "kpi" }, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.get(
        `/nornirps/scheduler/generic/list/?usecase=${usecase_type}`
      );
      return { usecase_type, data: response.data };
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Lỗi khi tải danh sách lịch generic";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue({ usecase_type, error: error?.response?.data });
    }
  }
);

export const createGenericSchedule = createAsyncThunk(
  "genericSchedule/createGenericSchedule",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.post("/nornirps/scheduler/generic/", payload);
      dispatch(showTemporaryAlert({ message: "Tạo lịch generic thành công!", type: "success" }));
      dispatch(fetchGenericSchedule({ usecase_type: payload.usecase_type }));
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền tạo lịch cho đơn vị khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Lỗi khi tạo lịch generic";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateGenericSchedule = createAsyncThunk(
  "genericSchedule/updateGenericSchedule",
  async ({ id, ...payload }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.put(`/nornirps/scheduler/generic/${id}/update/`, payload);
      dispatch(fetchGenericSchedule({ usecase_type: payload.usecase_type }));
      dispatch(showTemporaryAlert({ message: "Đã cập nhật lịch thành công", type: "success" }));
      return id;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền sửa lịch của đơn vị khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Lỗi khi cập nhật lịch generic";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const toggleGenericSchedule = createAsyncThunk(
  "genericSchedule/toggleGenericScheduleEnabled",
  async ({ id, enabled, usecase_type }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.patch(`/nornirps/scheduler/generic/${id}/toggle/`, {
        enabled,
      });
      dispatch(
        showTemporaryAlert({
          message: `Đã ${enabled ? "bật" : "tắt"} lịch generic`,
          type: "success",
        })
      );
      if (usecase_type) dispatch(fetchGenericSchedule({ usecase_type }));
      return { id, enabled };
      } catch (error) {
        const status = error?.response?.status;
        const msg =
          status === 403
            ? "Bạn không có quyền thao tác lịch của đơn vị khác."  // ← thêm
            : error?.response?.data?.error ||
              error?.response?.data?.detail ||
              "Lỗi thao tác lịch";
        dispatch(showTemporaryAlert({ message: msg, type: "error" }));
        return rejectWithValue(msg);
      }
  }
);

export const deleteGenericSchedule = createAsyncThunk(
  "genericSchedule/deleteGenericSchedule",
  async ({ id, usecase_type }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(
        `/nornirps/scheduler/generic/${id}/delete/?usecase_type=${usecase_type}`
      );
      dispatch(
        showTemporaryAlert({ message: "Đã xóa lịch generic", type: "success" })
      );
      dispatch(fetchGenericSchedule({ usecase_type }));
      return { id, usecase_type };
      } catch (error) {
        const status = error?.response?.status;
        const msg =
          status === 403
            ? "Bạn không có quyền thao tác lịch của đơn vị khác."  // ← thêm
            : error?.response?.data?.error ||
              error?.response?.data?.detail ||
              "Lỗi thao tác lịch";
        dispatch(showTemporaryAlert({ message: msg, type: "error" }));
        return rejectWithValue(msg);
      }
  }
);

/* =========================
 * Slice
 * ========================= */
const genericScheduleSlice = createSlice({
  name: "genericSchedule",
  initialState,
  reducers: {
    /**
     * Upsert trạng thái schedule từ WebSocket.
     * payload: {
     *   usecase?: "kpi",
     *   action?: "causecode"|...,
     *   name: string,
     *   last_run_at?: string,
     *   status?: string,
     *   result_summary?: string|null,
     *   platform?: string
     * }
     */
    wsUpsertScheduleStatus: (state, action) => {
      const {
        usecase = null,
        action: actionName,
        name,
        last_run_at,
        status,
        result_summary,
        platform,
      } = action.payload || {};
      if (!name) return;

      const applyUpdate = (list) => {
        const idx = list.findIndex((r) => r?.name === name);
        if (idx !== -1) {
          const item = list[idx] || {};
          list[idx] = {
            ...item,
            last_run_at: last_run_at ?? item.last_run_at,
            last_run_status: status ?? item.last_run_status,
            result_summary:
              result_summary !== undefined ? result_summary : item.result_summary,
            platform: platform ?? item.platform,
            action: actionName ?? item.action,
          };
          return true;
        }
        return false;
      };

      if (usecase) {
        const lst = state.genericSchedules[usecase] || [];
        applyUpdate(lst);
        state.genericSchedules[usecase] = lst;
      } else {
        for (const uc of Object.keys(state.genericSchedules || {})) {
          const lst = state.genericSchedules[uc] || [];
          const updated = applyUpdate(lst);
          if (updated) {
            state.genericSchedules[uc] = lst;
            break;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetch */
      .addCase(fetchGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(fetchGenericSchedule.fulfilled, (state, action) => {
        const { usecase_type, data } = action.payload || {};
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [usecase_type]: false,
        };
        state.genericSchedules[usecase_type] = data || [];
      })
      .addCase(fetchGenericSchedule.rejected, (state, action) => {
        const type =
          action.payload?.usecase_type || action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
        state.genericSchedules[type] = [];
      })

      /* create */
      .addCase(createGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(createGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })
      .addCase(createGenericSchedule.rejected, (state, action) => {
        const type =
          action.meta?.arg?.usecase_type || action.payload?.usecase_type;
        if (type) {
          state.loadingGenericSchedules = {
            ...state.loadingGenericSchedules,
            [type]: false,
          };
        }
      })

      /* update */
      .addCase(updateGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(updateGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })
      .addCase(updateGenericSchedule.rejected, (state, action) => {
        const type =
          action.meta?.arg?.usecase_type || action.payload?.usecase_type;
        if (type) {
          state.loadingGenericSchedules = {
            ...state.loadingGenericSchedules,
            [type]: false,
          };
        }
      })

      /* toggle */
      .addCase(toggleGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        if (type) {
          state.loadingGenericSchedules = {
            ...state.loadingGenericSchedules,
            [type]: true,
          };
        }
      })
      .addCase(toggleGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        if (type) {
          state.loadingGenericSchedules = {
            ...state.loadingGenericSchedules,
            [type]: false,
          };
        }
      })
      .addCase(toggleGenericSchedule.rejected, (state, action) => {
        const type =
          action.meta?.arg?.usecase_type || action.payload?.usecase_type;
        if (type) {
          state.loadingGenericSchedules = {
            ...state.loadingGenericSchedules,
            [type]: false,
          };
        }
      })

      /* delete */
      .addCase(deleteGenericSchedule.pending, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: true,
        };
      })
      .addCase(deleteGenericSchedule.fulfilled, (state, action) => {
        const type = action.meta.arg.usecase_type;
        state.loadingGenericSchedules = {
          ...state.loadingGenericSchedules,
          [type]: false,
        };
      })
      .addCase(deleteGenericSchedule.rejected, (state, action) => {
        const type =
          action.meta?.arg?.usecase_type || action.payload?.usecase_type;
        if (type) {
          state.loadingGenericSchedules = {
            ...state.loadingGenericSchedules,
            [type]: false,
          };
        }
      });
  },
});

export default genericScheduleSlice.reducer;

/* Actions */
export const { wsUpsertScheduleStatus } = genericScheduleSlice.actions;

/* Selectors */
export const selectGenericSchedules = (state) =>
  state.genericSchedule.genericSchedules;
export const selectGenericLoading = (state) =>
  state.genericSchedule.loadingGenericSchedules;

export const selectGenericSchedulesByType = (state, usecase_type) =>
  (state.genericSchedule.genericSchedules || {})[usecase_type] || [];

export const selectGenericLoadingByType = (state, usecase_type) =>
  !!(state.genericSchedule.loadingGenericSchedules || {})[usecase_type];
