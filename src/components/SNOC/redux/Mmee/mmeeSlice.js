
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// import { useSelector } from 'react-redux';
// export const createSub = createAsyncThunk('sub/createSub', async (subData) => {
//     const response = await axios.post(API_SERVER + 'subs/register', subData);
//     return response.data;
// });
import { showTemporaryAlert } from '../Alert/alertSlice';
import { API_SERVER } from './../../config/constant';


export const MmeCountTacView = createAsyncThunk('mmee/MmeCountTacView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeCountTacView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeCountTacView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get info mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const MmeGetTacConfView = createAsyncThunk('mmee/MmeGetTacConfView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeGetTacConfView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeGetTacConfView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get info mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const MmeGetRncConfView = createAsyncThunk('mmee/MmeGetRncConfView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeGetRncConfView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeGetRncConfView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get info mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


const mmeeSlice = createSlice({
    name: 'mmee',
    initialState: {
        errorMmeCountTacView: null,
        gettaccounts: [],
        gettacconfigs: [],
        getrncconfigs: [],
        status: 'idle',

        fetchStatus: 'idle',

        error: null,


        loading: false,
        refresh: false, // Add a refresh state

    },
    reducers: {

        clearMmeCountTacView: (state) => {
            state.gettaccounts = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },

        clearMmeGetTacConfView: (state) => {
            state.gettacconfigs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearMmeGetRncConfView: (state) => {
            state.getrncconfigs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },

    },
    extraReducers: (builder) => {
        builder

            .addCase(MmeCountTacView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeCountTacView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gettaccounts = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MmeCountTacView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })
            .addCase(MmeGetTacConfView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeGetTacConfView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gettacconfigs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MmeGetTacConfView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(MmeGetRncConfView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeGetRncConfView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.getrncconfigs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MmeGetRncConfView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })
            ;
    },
});



export const { clearMmeGetRncConfView, clearMmeGetTacConfView, clearMmeCountTacView } = mmeeSlice.actions;
export default mmeeSlice.reducer;
