// src/redux/Dns/dnsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// (giữ nguyên) TMP TAC
export const fetchGenerateTmpCommandTAC = createAsyncThunk(
  "dns/fetchGenerateTmpCommandTAC",
  async (
    { tacList, mmeList, sgwList, pgw5gList },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();
      (tacList || []).forEach((t) => params.append("tac", t));
      (mmeList || []).forEach((m) => params.append("mme", m));
      (sgwList || []).forEach((s) => params.append("sgw", s));
      (pgw5gList || []).forEach((p) => params.append("pgw5g", p));

      const fullUrl = `/nornirps/generate-tmp-tac/?${params.toString()}`;
      const response = await snocApi.get(fullUrl);
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Lỗi khi tạo dòng lệnh TMP";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// (giữ nguyên) DNS TAC check
export const fetchDnsCheckResultTAC = createAsyncThunk(
  "dns/fetchDnsCheckResultTAC",
  async (
    { platform, tacList, filename, domain },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();
      if (platform) params.append("platform", platform);
      if (tacList?.length) params.append("tac", tacList.join(","));
      if (filename) params.append("filename", filename);
      if (domain) params.append("domain", domain);

      const fullUrl = `/nornirps/dns-check-tac/?${params.toString()}`;
      const response = await snocApi.get(fullUrl);
      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Lỗi khi thực hiện DNS TAC Check";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// (giữ nguyên) DNS 3G check

export const fetchDnsCheckResult3G = createAsyncThunk(
  "dns/fetchDnsCheckResult3G",
  async (
    {
      platform,
      lac,
      rac,
      rncid,
      sets,          // ✅ NEW: list-of-list [[rncid,lac,rac], ...]
      filename,
      domain,
      filename4g,    // ✅ optional passthrough
      domain4g,      // ✅ optional passthrough
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const params = new URLSearchParams();
      if (platform) params.append("platform", platform);

      if (Array.isArray(sets) && sets.length > 0) {
        params.append("sets", JSON.stringify(sets));      // ✅ ưu tiên dùng sets
      } else {
        if (lac != null && lac !== "") params.append("lac", lac);
        if (rac != null && rac !== "") params.append("rac", rac);
        if (rncid != null && rncid !== "") params.append("rncid", rncid);
      }

      if (filename)  params.append("filename",  filename);
      if (domain)    params.append("domain",    domain);
      if (filename4g) params.append("filename4g", filename4g); // ✅ optional
      if (domain4g)   params.append("domain4g",   domain4g);   // ✅ optional

      const fullUrl = `/nornirps/dns-check-3g/?${params.toString()}`;
      const response = await snocApi.get(fullUrl);
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.detail || "Lỗi khi thực hiện DNS Check";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);


// ✅ NEW: Generate TMP RNC (nhận thêm msspoolList)
export const fetchGenerateTmpRNC = createAsyncThunk(
  "dns/fetchGenerateTmpRNC",
  async ({ mmeList, sets, msspoolList }, { rejectWithValue, dispatch }) => {
    try {
      const params = new URLSearchParams();
      (mmeList || []).forEach((m) => params.append("mme", m));
      params.append("sets", JSON.stringify(sets || []));
      // truyền nhiều msspool: ?msspool=a&msspool=b...
      (msspoolList || []).forEach((p) => params.append("msspool", p));

      const fullUrl = `/nornirps/generate-tmp-rnc/?${params.toString()}`;
      const response = await snocApi.get(fullUrl);
      return response.data; // { dns1b: [...], dns2b: [...] }
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Lỗi khi sinh TMP RNC";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Slice DNS
const dnsSlice = createSlice({
  name: "dns",
  initialState: {
    loading: false,
    dns1b: [],
    dns2b: [],
    error: null,
    tacResult: {},
    tmpCommands: {}, // TMP TAC nếu dùng
  },
  reducers: {
    clearDnsResult: (state) => {
      state.dns1b = [];
      state.dns2b = [];
      state.tacResult = {};
      state.error = null;
      state.tmpCommands = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // 3G Check
      .addCase(fetchDnsCheckResult3G.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDnsCheckResult3G.fulfilled, (state, action) => {
        state.loading = false;
        state.dns1b = action.payload?.dns1b || [];
        state.dns2b = action.payload?.dns2b || [];
      })
      .addCase(fetchDnsCheckResult3G.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Lỗi không xác định";
        state.dns1b = [];
        state.dns2b = [];
      })

      // TAC Check
      .addCase(fetchDnsCheckResultTAC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDnsCheckResultTAC.fulfilled, (state, action) => {
        state.loading = false;
        state.tacResult = action.payload || {};
      })
      .addCase(fetchDnsCheckResultTAC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Lỗi không xác định (TAC)";
        state.tacResult = {};
      })

      // TMP TAC
      .addCase(fetchGenerateTmpCommandTAC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGenerateTmpCommandTAC.fulfilled, (state, action) => {
        state.loading = false;
        state.tmpCommands = action.payload || {};
      })
      .addCase(fetchGenerateTmpCommandTAC.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.error || "Lỗi không xác định (generate TMP)";
        state.tmpCommands = {};
      })

      // ✅ TMP RNC (ghi vào 2 textbox)
      .addCase(fetchGenerateTmpRNC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGenerateTmpRNC.fulfilled, (state, action) => {
        state.loading = false;
        state.dns1b = action.payload?.dns1b || [];
        state.dns2b = action.payload?.dns2b || [];
      })
      .addCase(fetchGenerateTmpRNC.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.error || "Lỗi không xác định (Generate TMP RNC)";
      });
  },
});

export const { clearDnsResult } = dnsSlice.actions;
export default dnsSlice.reducer;
