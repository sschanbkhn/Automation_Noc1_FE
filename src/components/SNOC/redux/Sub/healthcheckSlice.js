
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// import { useSelector } from 'react-redux';
// export const createSub = createAsyncThunk('sub/createSub', async (subData) => {
//     const response = await axios.post(API_SERVER + 'subs/register', subData);
//     return response.data;
// });
import { showTemporaryAlert } from '../Alert/alertSlice';
import { API_SERVER } from '../../config/constant';


export const PgwHealthCheckView = createAsyncThunk('healthcheck/PgwHealthCheckView', async (_, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPgwHealthCheckView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgwHealthCheckView/', null, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'check successfully!', type: 'success' }));
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to check .';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});





const healthcheckSlice = createSlice({
    name: 'healtcheck',
    initialState: {
        pgwhealthchecks: [],

        status: 'idle',
        error: null,
        loading: false,
        refresh: false, // Add a refresh state

    },
    reducers: {
        toggleModalCreate: (state) => {
            state.showModalCreate = !state.showModalCreate;
            state.errorCreateSub = null;
        },
        toggleModalUpdate: (state) => {
            state.showModalUpdate = !state.showModalUpdate;
            if (!state.showModalUpdate) {
                state.selectedSub = null;
            }
        },
        toggleModalDelete: (state) => {
            state.showModalDelete = !state.showModalDelete;
            if (!state.showModalDelete) {
                state.selectedSub = null;
            }
        },
        toggleChangePasswordModal: (state, action) => {
            state.showChangePasswordModal = !state.showChangePasswordModal;
            state.selectedSub = action.payload || null;
        },
        toggleRefresh: (state) => {
            state.refresh = !state.refresh; // Toggle refresh state
        },

        clearPgwHealthCheckView: (state) => {
            state.pgwhealthchecks = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        }



    },
    extraReducers: (builder) => {
        builder


            .addCase(PgwHealthCheckView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgwHealthCheckView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pgwhealthchecks = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PgwHealthCheckView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            ;
    },
});



export const { clearPgwHealthCheckView } = healthcheckSlice.actions;
export default healthcheckSlice.reducer;
