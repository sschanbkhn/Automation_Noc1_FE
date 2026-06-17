import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/snocApiWithAutoToken";
import { clearEmbeddedData } from "./kpiSlice";

const API_URL = "/nornirps/kpi-dashboard-state/";

export const fetchKpiDashboardState = createAsyncThunk(
  "kpiDashboardState/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e?.message);
    }
  }
);

export const saveKpiDashboardState = createAsyncThunk(
  "kpiDashboardState/save",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(API_URL, payload);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e?.message);
    }
  }
);

const MAX_MULTI_PINS = 20;

const kpiDashboardStateSlice = createSlice({
  name: "kpiDashboardState",
  initialState: {
    singleState: null,
    multiState: null,
    multiPinned: [],
    loaded: false,
    saving: false,
  },
  reducers: {
    addMultiPin(state, { payload }) {
      if (state.multiPinned.length >= MAX_MULTI_PINS) return;
      state.multiPinned.push(payload);
    },
    removeMultiPin(state, { payload: id }) {
      state.multiPinned = state.multiPinned.filter((p) => p.id !== id);
    },
    updateMultiPin(state, { payload: { id, changes } }) {
      const entry = state.multiPinned.find((p) => p.id === id);
      if (entry) Object.assign(entry, changes);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("account/LOGOUT", (state) => {
        state.singleState = null;
        state.multiState = null;
        state.multiPinned = [];
        state.loaded = false;
      })
      .addCase(fetchKpiDashboardState.fulfilled, (state, { payload }) => {
        state.singleState = payload.single_state || {};
        state.multiState = payload.multi_state || {};
        state.multiPinned = payload.multi_pinned || [];
        state.loaded = true;
      })
      .addCase(fetchKpiDashboardState.rejected, (state) => {
        state.loaded = true; // unblock UI dù fetch lỗi
      })
      .addCase(saveKpiDashboardState.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveKpiDashboardState.fulfilled, (state, { payload }) => {
        state.saving = false;
        if (payload.single_state !== undefined) state.singleState = payload.single_state;
        if (payload.multi_state !== undefined) state.multiState = payload.multi_state;
        if (payload.multi_pinned !== undefined) state.multiPinned = payload.multi_pinned;
      })
      .addCase(saveKpiDashboardState.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { addMultiPin, removeMultiPin, updateMultiPin } = kpiDashboardStateSlice.actions;

// Thunk tổng hợp — đọc getState() sau khi reducer đã cập nhật để tránh stale closure
export const addMultiPinAndSave = (pinConfig) => (dispatch, getState) => {
  dispatch(addMultiPin(pinConfig));
  const { multiPinned } = getState().kpiDashboardState;
  dispatch(saveKpiDashboardState({ multi_pinned: multiPinned }));
};

export const removeMultiPinAndSave = (pinId) => (dispatch, getState) => {
  dispatch(removeMultiPin(pinId));
  dispatch(clearEmbeddedData(`multi_pin_${pinId}`)); // dọn embeddedData/embedFilters của pin đã xoá
  const { multiPinned } = getState().kpiDashboardState;
  dispatch(saveKpiDashboardState({ multi_pinned: multiPinned }));
};

export default kpiDashboardStateSlice.reducer;
