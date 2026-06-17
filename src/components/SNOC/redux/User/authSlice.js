

// accountSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { snocLogin, setSnocToken, snocApi } from './../../api/snocApiWithAutoToken';
import { fetchKpiPreferences } from '../KPI/kpiPinnedSlice';

const USER_ID_KEY = "snoc_current_user_id";

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const data = await snocLogin(email, password); // POST {BASE}/login
      const token = data?.token || data?.access;
      if (!token) return rejectWithValue(data?.msg || data?.message || 'Login failed');
      setSnocToken(token, { persist: true });        // muốn sống qua reload -> persist:true
      const userId = data.user?.id ?? data.user?.username ?? data.user?.email;
      if (userId != null) localStorage.setItem(USER_ID_KEY, String(userId));
      dispatch(fetchKpiPreferences());
      return { user: data.user, token };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.msg || error?.message || 'Login failed');
    }
  }
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await snocApi.post('/logout');   // nếu BE có; nếu không có cũng không sao
      return { ok: true };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.msg || 'Logout failed');
    } finally {
      dispatch(LOGOUT());
    }
  }
);

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    token: '',
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    error: null,
    status: 'idle',
  },
  reducers: {
    ACCOUNT_INITIALIZE: (state, action) => {
      const { isLoggedIn, user, token } = action.payload || {};
      state.isLoggedIn = !!isLoggedIn;
      state.isInitialized = true;
      state.token = token || '';
      state.user = user || null;
      setSnocToken(state.token || null, { persist: true });
    },
    LOGIN: (state, action) => {
      const { user, token } = action.payload || {};
      state.isLoggedIn = true;
      state.user = user || null;
      state.token = token || state.token;
      setSnocToken(state.token || null, { persist: true });
    },
    LOGOUT: (state) => {
      state.isLoggedIn = false;
      state.token = '';
      state.user = null;
      state.status = 'idle';
      state.error = null;
      setSnocToken(null, { persist: true });
      try { localStorage.removeItem(USER_ID_KEY); } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { ACCOUNT_INITIALIZE, LOGIN, LOGOUT } = accountSlice.actions;
export default accountSlice.reducer;
