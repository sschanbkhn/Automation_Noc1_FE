import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPinnedKpis, createPinnedKpi, deletePinnedKpi, updatePinnedKpi } from "../../api/pinnedKpi";

export const loadPins = createAsyncThunk(
  "pinned/load",
  async (params) => await fetchPinnedKpis(params)
);

export const addPin = createAsyncThunk(
  "pinned/add",
  async (payload) => await createPinnedKpi(payload)
);

export const removePin = createAsyncThunk(
  "pinned/remove",
  async (id) => {
    await deletePinnedKpi(id);
    return id;
  }
);

export const editPin = createAsyncThunk(
  "pinned/edit",
  async ({ id, patch }) => await updatePinnedKpi(id, patch)
);

const pinnedSlice = createSlice({
  name: "pinned",
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastQuery: null, // nhớ query để reload
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase("account/LOGOUT", (state) => {
        state.items = [];
        state.lastQuery = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadPins.pending, (s, a) => {
        s.loading = true; s.error = null; s.lastQuery = a.meta.arg;
      })
      .addCase(loadPins.fulfilled, (s, a) => {
        s.loading = false; s.items = a.payload;
      })
      .addCase(loadPins.rejected, (s, a) => {
        s.loading = false; s.error = a.error?.message || "Load pins failed";
      })
      .addCase(addPin.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(removePin.fulfilled, (s, a) => {
        s.items = s.items.filter(x => x.id !== a.payload);
      })
      .addCase(editPin.fulfilled, (s, a) => {
        const idx = s.items.findIndex(x => x.id === a.payload.id);
        if (idx >= 0) s.items[idx] = a.payload;
      });
  },
});

export default pinnedSlice.reducer;
