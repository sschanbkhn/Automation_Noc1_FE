import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const IMPORT_URL = "/nornirps/healthcheck/config-sync/import/";
const EXPORT_URL = "/nornirps/healthcheck/config-sync/export/";

export const runImportSync = createAsyncThunk(
  "configSync/runImport",
  async ({ apply = false } = {}, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(IMPORT_URL, { apply });
      dispatch(showTemporaryAlert({
        message: apply ? "Đã import vào DB" : "Đã xem trước (dry-run) — chưa ghi gì",
        type: "success",
      }));
      return { apply, report: res.data };
    } catch (err) {
      const msg = err?.response?.data?.detail || "Import thất bại";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const runExportSync = createAsyncThunk(
  "configSync/runExport",
  async ({ applyInplace = false } = {}, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(EXPORT_URL, { apply_inplace: applyInplace });
      dispatch(showTemporaryAlert({
        message: applyInplace ? "Đã backup + ghi đè file thành công" : "Đã sinh nội dung preview",
        type: "success",
      }));
      return { applyInplace, result: res.data };
    } catch (err) {
      const msg = err?.response?.data?.detail || "Export thất bại";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const configSyncSlice = createSlice({
  name: "configSync",
  initialState: {
    importReport: null,
    importPreviewed: false,
    exportResult: null,
    running: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runImportSync.pending,   (s) => { s.running = true; })
      .addCase(runImportSync.fulfilled, (s, a) => {
        s.running = false;
        s.importReport = a.payload.report;
        if (!a.payload.apply) s.importPreviewed = true;
      })
      .addCase(runImportSync.rejected,  (s) => { s.running = false; })

      .addCase(runExportSync.pending,   (s) => { s.running = true; })
      .addCase(runExportSync.fulfilled, (s, a) => {
        s.running = false;
        s.exportResult = a.payload.result;
      })
      .addCase(runExportSync.rejected,  (s) => { s.running = false; });
  },
});

export default configSyncSlice.reducer;
