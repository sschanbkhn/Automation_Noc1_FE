import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/snocApiWithAutoToken";

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

const kpiDashboardStateSlice = createSlice({
  name: "kpiDashboardState",
  initialState: {
    singleState: null,
    loaded: false,
    saving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase("account/LOGOUT", (state) => {
        state.singleState = null;
        state.loaded = false;
      })
      .addCase(fetchKpiDashboardState.fulfilled, (state, { payload }) => {
        state.singleState = payload.single_state || {};
        state.loaded = true;
      })
      .addCase(saveKpiDashboardState.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveKpiDashboardState.fulfilled, (state, { payload }) => {
        state.saving = false;
        if (payload.single_state !== undefined) state.singleState = payload.single_state;
      })
      .addCase(saveKpiDashboardState.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default kpiDashboardStateSlice.reducer;
