// src/redux/Healthcheck/dnsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import snocApi from "../../api/snocApiWithAutoToken";
import { showTemporaryAlert } from "../Alert/alertSlice";

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
  },
  reducers: {
    clearDnsResult: (state) => {
      state.dns1b = [];
      state.dns2b = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDnsCheckResult3G.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDnsCheckResult3G.fulfilled, (state, action) => {
        state.loading = false;
        state.dns1b = action.payload.dns1b || [];
        state.dns2b = action.payload.dns2b || [];
      })
      .addCase(fetchDnsCheckResult3G.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Lỗi không xác định";
        state.dns1b = [];
        state.dns2b = [];
      });
  },
});

export const { clearDnsResult } = dnsSlice.actions;
export default dnsSlice.reducer;
