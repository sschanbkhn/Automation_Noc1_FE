// src/redux/Healthcheck/dnsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

// Gọi API tạo command tạm thời từ TAC/MME/SGW
export const fetchGenerateTmpCommandTAC = createAsyncThunk(
  "dns/fetchGenerateTmpCommandTAC",
  async ({ tacList, mmeList, sgwList }, { rejectWithValue, dispatch }) => {
    try {
      console.log("📥 [Generate TMP] Input:", { tacList, mmeList, sgwList });

      const params = new URLSearchParams();

      if (Array.isArray(tacList)) {
        tacList.forEach((t) => params.append("tac", t));
      }

      if (Array.isArray(mmeList)) {
        mmeList.forEach((m) => params.append("mme", m));
      }

      if (Array.isArray(sgwList)) {
        sgwList.forEach((s) => params.append("sgw", s));
      }

      const fullUrl = `/nornirps/generate-tmp-tac/?${params.toString()}`;
      console.log("🌐 [Generate TMP] URL:", fullUrl);

      const response = await snocApi.get(fullUrl);
      console.log("✅ [Generate TMP] Result:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [Generate TMP] Error:", error);
      const msg = error?.response?.data?.detail || "Lỗi khi tạo dòng lệnh TMP";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);


// Gọi API kiểm tra DNS theo TAC (4G)
export const fetchDnsCheckResultTAC = createAsyncThunk(
  "dns/fetchDnsCheckResultTAC",
  async (
    { platform, tacList, filename, domain },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log("📥 [DNS TAC] Input params:", {
        platform,
        tacList,
        filename,
        domain,
      });

      const params = new URLSearchParams();
      if (platform) params.append("platform", platform);
      if (tacList && tacList.length > 0) {
        params.append("tac", tacList.join(","));
      }
      if (filename) params.append("filename", filename);
      if (domain) params.append("domain", domain);

      const fullUrl = `/nornirps/dns-check-tac/?${params.toString()}`;
      console.log("🌐 [DNS TAC] Full API URL:", fullUrl);

      const response = await snocApi.get(fullUrl);
      console.log("✅ [DNS TAC] API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [DNS TAC] Error during API call:", error);
      const msg =
        error?.response?.data?.detail || "Lỗi khi thực hiện DNS TAC Check";
      dispatch(showTemporaryAlert({ message: msg, type: "error" }));
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Gọi API kiểm tra DNS theo LAC, RAC, RNCID
export const fetchDnsCheckResult3G = createAsyncThunk(
  "dns/fetchDnsCheckResult3G",
  async ({ platform, lac, rac, rncid }, { rejectWithValue, dispatch }) => {
    try {
      console.log("📥 [DNS Check] Input params:", {
        platform,
        lac,
        rac,
        rncid,
      });

      const params = new URLSearchParams();
      if (platform) params.append("platform", platform);
      if (lac) params.append("lac", lac);
      if (rac) params.append("rac", rac);
      if (rncid) params.append("rncid", rncid);

      const fullUrl = `/nornirps/dns-check-3g/?${params.toString()}`;
      console.log("🌐 [DNS Check] Full API URL:", fullUrl);

      const response = await snocApi.get(fullUrl);
      console.log("✅ [DNS Check] API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ [DNS Check] Error during API call:", error);
      const msg =
        error?.response?.data?.detail || "Lỗi khi thực hiện DNS Check";
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
    tmpCommands: {}, // ✅ kết quả từ API generate TMP
  },
  reducers: {
    clearDnsResult: (state) => {
      state.dns1b = [];
      state.dns2b = [];
      state.tacResult = {};
      state.error = null;
      state.tmpCommands = {}; // ✅ reset TMP
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDnsCheckResult3G.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDnsCheckResult3G.fulfilled, (state, action) => {
        console.log("🎯 dnsSlice.reducer received:", action.payload); // 👈 thêm dòng này
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
      // 4G TAC check
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
      // Generate TMP commands
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
      });
  },
});

export const { clearDnsResult } = dnsSlice.actions;
export default dnsSlice.reducer;
