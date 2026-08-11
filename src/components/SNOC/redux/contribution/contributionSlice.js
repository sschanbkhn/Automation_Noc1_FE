import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

const BASE_URL = "/nornirps/contribution/";

const errMsg = (err, fallback) =>
  err?.response?.data?.error || err?.response?.data?.detail || fallback;

export const fetchMyDrafts = createAsyncThunk(
  "contribution/fetchMyDrafts",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(BASE_URL);
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Không thể tải danh sách draft");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const createDraft = createAsyncThunk(
  "contribution/createDraft",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(BASE_URL, payload);
      dispatch(showTemporaryAlert({ message: "Đã tạo draft mới", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Tạo draft thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const saveManualCode = createAsyncThunk(
  "contribution/saveManualCode",
  async ({ draftId, code }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${draftId}/manual-code/`, { code });
      dispatch(showTemporaryAlert({ message: "Đã lưu code", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Lưu code thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchPlatformContext = createAsyncThunk(
  "contribution/fetchPlatformContext",
  async (platform, { rejectWithValue }) => {
    try {
      const res = await snocApi.get(`${BASE_URL}platform-context/`, { params: { platform } });
      return res.data;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Không tải được thông tin platform"));
    }
  }
);

export const runSandbox = createAsyncThunk(
  "contribution/runSandbox",
  async (draftId, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${draftId}/sandbox/`);
      dispatch(showTemporaryAlert({
        message: res.data.passed ? "✅ Sandbox PASS" : "❌ Sandbox FAIL",
        type: res.data.passed ? "success" : "error",
      }));
      return { draftId, result: res.data };
    } catch (err) {
      const msg = errMsg(err, "Chạy sandbox thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const testCodePreview = createAsyncThunk(
  "contribution/testCodePreview",
  async ({ code, sample_output, command_pattern, fn_name }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}sandbox-preview/`, { code, sample_output, command_pattern, fn_name });
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Test code thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const submitDraft = createAsyncThunk(
  "contribution/submitDraft",
  async (draftId, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${draftId}/submit/`);
      dispatch(showTemporaryAlert({ message: "Đã gửi draft cho admin duyệt", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Submit thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const approveDraft = createAsyncThunk(
  "contribution/approveDraft",
  async (draftId, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${draftId}/approve/`, { approve: true });
      dispatch(showTemporaryAlert({ message: "Đã approve draft", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Approve thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const rejectDraft = createAsyncThunk(
  "contribution/rejectDraft",
  async ({ draftId, reason }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${draftId}/approve/`, { approve: false, reason });
      dispatch(showTemporaryAlert({ message: "Đã reject draft", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Reject thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deleteDraft = createAsyncThunk(
  "contribution/deleteDraft",
  async (draftId, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.delete(`${BASE_URL}${draftId}/`);
      dispatch(showTemporaryAlert({ message: "Đã xoá draft", type: "success" }));
      return draftId;
    } catch (err) {
      const msg = errMsg(err, "Xoá draft thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchAuditLog = createAsyncThunk(
  "contribution/fetchAuditLog",
  async (draftId, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(`${BASE_URL}${draftId}/audit/`);
      return { draftId, logs: res.data };
    } catch (err) {
      const msg = errMsg(err, "Không tải được lịch sử duyệt");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const deployDraft = createAsyncThunk(
  "contribution/deployDraft",
  async (draftId, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}${draftId}/deploy/`);
      dispatch(showTemporaryAlert({ message: "🚀 Đã deploy — hot-deploy vào dispatcher, không cần restart", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Deploy thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchBuiltinSource = createAsyncThunk(
  "contribution/fetchBuiltinSource",
  async ({ platform, fn_name }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.get(`${BASE_URL}builtin/${platform}/${fn_name}/source/`);
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Không đọc được source code hàm built-in");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const disableBuiltinFunction = createAsyncThunk(
  "contribution/disableBuiltinFunction",
  async ({ platform, fn_name, reason }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.post(`${BASE_URL}builtin/${platform}/${fn_name}/disable/`, { reason });
      dispatch(showTemporaryAlert({ message: "Đã tắt hàm built-in", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Tắt hàm built-in thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const enableBuiltinFunction = createAsyncThunk(
  "contribution/enableBuiltinFunction",
  async ({ platform, fn_name }, { dispatch, rejectWithValue }) => {
    try {
      const res = await snocApi.delete(`${BASE_URL}builtin/${platform}/${fn_name}/disable/`);
      dispatch(showTemporaryAlert({ message: "Đã bật lại hàm built-in", type: "success" }));
      return res.data;
    } catch (err) {
      const msg = errMsg(err, "Bật lại hàm built-in thất bại");
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(msg);
    }
  }
);

const upsertDraft = (state, draft) => {
  const idx = state.drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) state.drafts[idx] = draft;
  else state.drafts.unshift(draft);
};

const contributionSlice = createSlice({
  name: "contribution",
  initialState: {
    drafts: [],
    loading: false,
    creating: false,
    savingManualCode: false,
    sandboxRunning: false,
    submitting: false,
    approving: false,
    deploying: false,
    deleting: false,
    sandboxResultByDraftId: {},
    previewResult: null,
    previewRunning: false,
    auditByDraftId: {},
    auditLoading: false,
    platformContext: { existingCommands: [], existingFunctions: [], loading: false },
    builtinSourceLoading: false,
    togglingBuiltin: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDrafts.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMyDrafts.fulfilled, (s, a) => { s.loading = false; s.drafts = a.payload; })
      .addCase(fetchMyDrafts.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createDraft.pending,   (s) => { s.creating = true; })
      .addCase(createDraft.fulfilled, (s, a) => { s.creating = false; upsertDraft(s, a.payload); })
      .addCase(createDraft.rejected,  (s) => { s.creating = false; })

      .addCase(saveManualCode.pending,   (s) => { s.savingManualCode = true; })
      .addCase(saveManualCode.fulfilled, (s, a) => { s.savingManualCode = false; upsertDraft(s, a.payload); })
      .addCase(saveManualCode.rejected,  (s) => { s.savingManualCode = false; })

      .addCase(fetchPlatformContext.pending,   (s) => { s.platformContext.loading = true; })
      .addCase(fetchPlatformContext.fulfilled, (s, a) => {
        s.platformContext = {
          loading: false,
          existingCommands: a.payload.existing_commands || [],
          existingFunctions: a.payload.existing_functions || [],
        };
      })
      .addCase(fetchPlatformContext.rejected, (s) => {
        s.platformContext = { loading: false, existingCommands: [], existingFunctions: [] };
      })

      .addCase(runSandbox.pending,   (s) => { s.sandboxRunning = true; })
      .addCase(runSandbox.fulfilled, (s, a) => {
        s.sandboxRunning = false;
        s.sandboxResultByDraftId[a.payload.draftId] = a.payload.result;
      })
      .addCase(runSandbox.rejected,  (s) => { s.sandboxRunning = false; })

      .addCase(testCodePreview.pending,   (s) => { s.previewRunning = true; })
      .addCase(testCodePreview.fulfilled, (s, a) => { s.previewRunning = false; s.previewResult = a.payload; })
      .addCase(testCodePreview.rejected,  (s) => { s.previewRunning = false; })

      .addCase(submitDraft.pending,   (s) => { s.submitting = true; })
      .addCase(submitDraft.fulfilled, (s, a) => { s.submitting = false; upsertDraft(s, a.payload); })
      .addCase(submitDraft.rejected,  (s) => { s.submitting = false; })

      .addCase(approveDraft.pending,   (s) => { s.approving = true; })
      .addCase(approveDraft.fulfilled, (s, a) => { s.approving = false; upsertDraft(s, a.payload); })
      .addCase(approveDraft.rejected,  (s) => { s.approving = false; })

      .addCase(rejectDraft.pending,   (s) => { s.approving = true; })
      .addCase(rejectDraft.fulfilled, (s, a) => { s.approving = false; upsertDraft(s, a.payload); })
      .addCase(rejectDraft.rejected,  (s) => { s.approving = false; })

      .addCase(deleteDraft.pending,   (s) => { s.deleting = true; })
      .addCase(deleteDraft.fulfilled, (s, a) => { s.deleting = false; s.drafts = s.drafts.filter((d) => d.id !== a.payload); })
      .addCase(deleteDraft.rejected,  (s) => { s.deleting = false; })

      .addCase(fetchAuditLog.pending,   (s) => { s.auditLoading = true; })
      .addCase(fetchAuditLog.fulfilled, (s, a) => {
        s.auditLoading = false;
        s.auditByDraftId[a.payload.draftId] = a.payload.logs;
      })
      .addCase(fetchAuditLog.rejected,  (s) => { s.auditLoading = false; })

      .addCase(deployDraft.pending,   (s) => { s.deploying = true; })
      .addCase(deployDraft.fulfilled, (s, a) => { s.deploying = false; upsertDraft(s, a.payload); })
      .addCase(deployDraft.rejected,  (s) => { s.deploying = false; })

      .addCase(fetchBuiltinSource.pending,   (s) => { s.builtinSourceLoading = true; })
      .addCase(fetchBuiltinSource.fulfilled, (s) => { s.builtinSourceLoading = false; })
      .addCase(fetchBuiltinSource.rejected,  (s) => { s.builtinSourceLoading = false; })

      .addCase(disableBuiltinFunction.pending,   (s) => { s.togglingBuiltin = true; })
      .addCase(disableBuiltinFunction.fulfilled, (s) => { s.togglingBuiltin = false; })
      .addCase(disableBuiltinFunction.rejected,  (s) => { s.togglingBuiltin = false; })

      .addCase(enableBuiltinFunction.pending,   (s) => { s.togglingBuiltin = true; })
      .addCase(enableBuiltinFunction.fulfilled, (s) => { s.togglingBuiltin = false; })
      .addCase(enableBuiltinFunction.rejected,  (s) => { s.togglingBuiltin = false; });
  },
});

export default contributionSlice.reducer;
