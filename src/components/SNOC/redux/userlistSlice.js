// src/redux/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_SERVER } from './../../config/constant';

export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
    const response = await axios.get(API_SERVER + 'users/listuser');
    return response.data;
});

const userlistSlice = createSlice({
    name: 'userlist',
    initialState: {
        users: [],
        showModal: false,
        status: 'idle',
        error: null,
    },
    reducers: {
        toggleModal: (state) => {
            state.showModal = !state.showModal;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { toggleModal } = userlistSlice.actions;
export default userlistSlice.reducer;
