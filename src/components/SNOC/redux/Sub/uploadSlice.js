// src/features/upload/uploadSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_SERVER } from './../../config/constant';

export const uploadFile = createAsyncThunk('upload/uploadFile', async (file, { getState, rejectWithValue }) => {
    const { account } = getState(); // Assuming you have an account slice that stores the token
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(API_SERVER + 'users/upload-users', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `${account.token}`,
            },
        });

        if (response.data.success) {
            return response.data;
        } else {
            return rejectWithValue(response.data.msg);
        }
    } catch (error) {
        return rejectWithValue(error?.response?.data);
    }
});

const uploadSlice = createSlice({
    name: 'upload',
    initialState: {
        status: 'idle',
        error: null,
        success: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadFile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.success = false;
            })
            .addCase(uploadFile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.success = true;
            })
            .addCase(uploadFile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Something went wrong';
            });
    },
});

export default uploadSlice.reducer;
