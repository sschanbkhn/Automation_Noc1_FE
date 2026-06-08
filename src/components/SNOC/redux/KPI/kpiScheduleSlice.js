import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";
import { wsUpsertScheduleStatus } from "./genericScheduleSlice";

const initialState = {
  schedules: [],
  loading: false,
};

/* =========================
 * Thunks
 * ========================= */
export const fetchKpiSchedule = createAsyncThunk(
  "kpiSchedule/fetchKpiSchedule",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.get("/nornirps/kpi/schedule/");
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.detail || "Lỗi khi tải danh sách lịch KPI";
      dispatch(showTemporaryAlert({ message, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const createKpiSchedule = createAsyncThunk(
  "kpiSchedule/createKpiSchedule",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await snocApi.post("/nornirps/kpi/schedule/", payload);
      dispatch(showTemporaryAlert({ message: "Tạo lịch KPI thành công!", type: "success" }));
      dispatch(fetchKpiSchedule());
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền tạo lịch cho đơn vị khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Lỗi khi tạo lịch KPI";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateKpiSchedule = createAsyncThunk(
  "kpiSchedule/updateKpiSchedule",
  async ({ id, ...payload }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.put(`/nornirps/kpi/schedule/${id}/`, payload);
      dispatch(fetchKpiSchedule());
      dispatch(showTemporaryAlert({ message: "Đã cập nhật lịch KPI thành công", type: "success" }));
      return id;
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền sửa lịch của đơn vị khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Lỗi khi cập nhật lịch KPI";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const toggleKpiSchedule = createAsyncThunk(
  "kpiSchedule/toggleKpiSchedule",
  async ({ id, enabled }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.patch(`/nornirps/kpi/schedule/${id}/`, { enabled });
      dispatch(showTemporaryAlert({
        message: `Đã ${enabled ? "bật" : "tắt"} lịch KPI`,
        type: "success",
      }));
      dispatch(fetchKpiSchedule());
      return { id, enabled };
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền thao tác lịch của đơn vị khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Lỗi thao tác lịch KPI";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteKpiSchedule = createAsyncThunk(
  "kpiSchedule/deleteKpiSchedule",
  async ({ id }, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`/nornirps/kpi/schedule/${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã xóa lịch KPI", type: "success" }));
      dispatch(fetchKpiSchedule());
      return { id };
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 403
          ? "Bạn không có quyền thao tác lịch của đơn vị khác."
          : error?.response?.data?.error ||
            error?.response?.data?.detail ||
            "Lỗi thao tác lịch KPI";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

/* =========================
 * Slice
 * ========================= */
const kpiScheduleSlice = createSlice({
  name: "kpiSchedule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* fetch */
      .addCase(fetchKpiSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchKpiSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload || [];
      })
      .addCase(fetchKpiSchedule.rejected, (state) => {
        state.loading = false;
        state.schedules = [];
      })

      /* create */
      .addCase(createKpiSchedule.pending, (state) => { state.loading = true; })
      .addCase(createKpiSchedule.fulfilled, (state) => { state.loading = false; })
      .addCase(createKpiSchedule.rejected, (state) => { state.loading = false; })

      /* update */
      .addCase(updateKpiSchedule.pending, (state) => { state.loading = true; })
      .addCase(updateKpiSchedule.fulfilled, (state) => { state.loading = false; })
      .addCase(updateKpiSchedule.rejected, (state) => { state.loading = false; })

      /* toggle */
      .addCase(toggleKpiSchedule.pending, (state) => { state.loading = true; })
      .addCase(toggleKpiSchedule.fulfilled, (state) => { state.loading = false; })
      .addCase(toggleKpiSchedule.rejected, (state) => { state.loading = false; })

      /* delete */
      .addCase(deleteKpiSchedule.pending, (state) => { state.loading = true; })
      .addCase(deleteKpiSchedule.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteKpiSchedule.rejected, (state) => { state.loading = false; })

      /* WebSocket push: lắng nghe action từ genericScheduleSlice */
      .addCase(wsUpsertScheduleStatus, (state, action) => {
        const {
          name,
          last_run_at,
          status,
          result_summary,
          platform,
          action: actionName,
        } = action.payload || {};
        if (!name) return;
        const idx = state.schedules.findIndex((r) => r?.name === name);
        if (idx !== -1) {
          const item = state.schedules[idx] || {};
          state.schedules[idx] = {
            ...item,
            last_run_at: last_run_at ?? item.last_run_at,
            last_run_status: status ?? item.last_run_status,
            result_summary:
              result_summary !== undefined ? result_summary : item.result_summary,
            platform: platform ?? item.platform,
            action: actionName ?? item.action,
          };
        }
      });
  },
});

export default kpiScheduleSlice.reducer;

/* Selectors */
export const selectKpiSchedules = (state) => state.kpiSchedule.schedules;
export const selectKpiScheduleLoading = (state) => state.kpiSchedule.loading;
