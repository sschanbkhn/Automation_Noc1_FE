import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const SCHEMA_URL = "/nornirps/healthcheck/analysis-params/schema/";
const PARAMS_URL = "/nornirps/healthcheck/analysis-params/";

export const fetchAnalysisSchema = createAsyncThunk(
  "analysisParam/fetchSchema",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(SCHEMA_URL);
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể tải schema";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchAnalysisParams = createAsyncThunk(
  "analysisParam/fetchParams",
  async (platform, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(PARAMS_URL, { params: { platform } });
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể tải params";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const saveAnalysisParam = createAsyncThunk(
  "analysisParam/save",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(PARAMS_URL, payload);
      dispatch(showTemporaryAlert({ message: "Đã lưu override", type: "success" }));
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể lưu";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteAnalysisParam = createAsyncThunk(
  "analysisParam/delete",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${PARAMS_URL}${id}/`);
      dispatch(showTemporaryAlert({ message: "Đã reset về default", type: "success" }));
      return id;
    } catch (error) {
      const msg = error?.response?.data?.error || "Không thể xóa override";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const analysisParamSlice = createSlice({
  name: "analysisParam",
  initialState: {
    schema: {},
    params: [],
    selectedPlatform: "",
    loadingSchema: false,
    loadingParams: false,
    saving: false,
    error: null,
  },
  reducers: {
    setSelectedPlatform(state, action) {
      state.selectedPlatform = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalysisSchema.pending,   (s) => { s.loadingSchema = true; })
      .addCase(fetchAnalysisSchema.fulfilled, (s, a) => { s.loadingSchema = false; s.schema = a.payload; })
      .addCase(fetchAnalysisSchema.rejected,  (s) => { s.loadingSchema = false; })

      .addCase(fetchAnalysisParams.pending,   (s) => { s.loadingParams = true; s.error = null; })
      .addCase(fetchAnalysisParams.fulfilled, (s, a) => { s.loadingParams = false; s.params = a.payload; })
      .addCase(fetchAnalysisParams.rejected,  (s, a) => { s.loadingParams = false; s.error = a.payload; })

      .addCase(saveAnalysisParam.pending,   (s) => { s.saving = true; })
      .addCase(saveAnalysisParam.fulfilled, (s) => { s.saving = false; })
      .addCase(saveAnalysisParam.rejected,  (s) => { s.saving = false; })

      .addCase(deleteAnalysisParam.pending,   (s) => { s.saving = true; })
      .addCase(deleteAnalysisParam.fulfilled, (s) => { s.saving = false; })
      .addCase(deleteAnalysisParam.rejected,  (s) => { s.saving = false; });
  },
});

export const { setSelectedPlatform } = analysisParamSlice.actions;
export default analysisParamSlice.reducer;
