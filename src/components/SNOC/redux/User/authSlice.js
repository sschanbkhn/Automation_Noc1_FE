// // accountSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// // import { API_SERVER } from '../../../../config/constant';

// // const API_SERVER = 'http://10.149.99.177:8008/api'; // Replace with your actual API server URL
// import { API_SERVER } from './../../config/constant';

// export const loginUser = createAsyncThunk(
//     'auth/loginUser',
//     async ({ email, password }, { rejectWithValue }) => {
//         console.log(API_SERVER)

//         try {
//             const response = await axios.post(API_SERVER + 'users/login', { email, password });
//             if (response.data.success) {
//                 return { user: response.data.user, token: response.data.token };
//             } else {
//                 return rejectWithValue(response.data.msg);
//             }
//         } catch (error) {
//             return rejectWithValue(error?.response?.data?.msg);
//         }
//     }
// );

// export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { getState, dispatch, rejectWithValue }) => {
//     const { account } = getState();

//     try {
//         const response = await axios.post(API_SERVER + 'users/logout', {}, {
//             headers: {
//                 Authorization: `${account.token}`,
//             },
//         });
//         return response.data; // Return the response data from the API
//     } catch (error) {
//         console.error('Logout error - ', error);
//         dispatch(LOGOUT());
//         return rejectWithValue(error?.response?.data?.msg || 'Logout failed');
//     }
// }); // Adjust debounce time as needed




// export const accountSlice = createSlice({
//     name: 'account',
//     initialState: {
//         token: '',
//         isLoggedIn: false,
//         isInitialized: false,
//         user: null,
//         error: null,
//         status: 'idle',
//     },
//     reducers: {
//         ACCOUNT_INITIALIZE: (state, action) => {
//             const { isLoggedIn, user, token } = action.payload;
//             state.isLoggedIn = isLoggedIn;
//             state.isInitialized = true;
//             state.token = token;
//             state.user = user;
//             if (isLoggedIn) {
//                 localStorage.setItem('token', token);
//             } else {
//                 localStorage.removeItem('token');
//             }
//         },
//         LOGIN: (state, action) => {
//             const { user } = action.payload;
//             state.isLoggedIn = true;
//             state.user = user;
//         },
//         LOGOUT: (state) => {
//             state.isLoggedIn = false;
//             state.token = '';
//             state.user = null;
//             localStorage.removeItem('token');
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(loginUser.pending, (state) => {
//                 state.status = 'loading';
//                 state.error = null;
//             })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.user = action.payload.user;
//                 state.token = action.payload.token;
//                 state.isLoggedIn = true;
//                 state.status = 'succeeded';
//                 localStorage.setItem('token', action.payload.token);
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.status = 'failed';
//                 state.error = action.payload;
//             })
//             .addCase(logoutUser.pending, (state) => {
//                 state.status = 'loading';
//                 state.error = null;
//             })
//             .addCase(logoutUser.fulfilled, (state) => {
//                 state.isLoggedIn = false;
//                 state.token = '';
//                 state.user = null;
//                 state.status = 'succeeded';
//                 localStorage.removeItem('token');
//             })
//             .addCase(logoutUser.rejected, (state, action) => {
//                 state.status = 'failed';
//                 state.error = action.payload;
//             });
//     },
// });

// export const { ACCOUNT_INITIALIZE, LOGIN, LOGOUT } = accountSlice.actions;
// export default accountSlice.reducer;



// accountSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { snocLogin, setSnocToken, snocApi } from './../../api/snocApiWithAutoToken';

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await snocLogin(email, password); // POST {BASE}/login
      const token = data?.token || data?.access;
      if (!token) return rejectWithValue(data?.msg || data?.message || 'Login failed');
      setSnocToken(token, { persist: true });        // muốn sống qua reload -> persist:true
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
