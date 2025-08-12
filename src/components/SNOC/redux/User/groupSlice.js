import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showTemporaryAlert } from '../Alert/alertSlice';
import { API_SERVER } from './../../config/constant';
export const fetchGroups = createAsyncThunk('group/fetchGroups', async (groupId, { getState, rejectWithValue, dispatch }) => {
    try {
        // console.log(groupData)
        const { account } = getState();
        const response = await axios.get(API_SERVER + 'users/groups', {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        // dispatch(showTemporaryAlert({ message: 'fetch group successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to fetch groups.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const createGroup = createAsyncThunk('group/createGroup', async (groupData, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.post(API_SERVER + 'users/groups', groupData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'create group successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create group.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const updateGroup = createAsyncThunk('group/updateGroup', async ({ groupId, groupData }, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.put(`${API_SERVER}users/groups/${groupId}`, groupData, {
            headers: {
                Authorization: `${account.token}`
            },
        });
        dispatch(showTemporaryAlert({ message: 'update group successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to update group.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const deleteGroup = createAsyncThunk('group/deleteGroup', async (groupId, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        await axios.delete(`${API_SERVER}users/groups/${groupId}`, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'delete group successfully!', type: 'success' }));

        return groupId;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete group.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


const groupSlice = createSlice({
    name: 'group',
    initialState: {
        groups: [],
        showModalCreateGroup: false,
        showModalUpdateGroup: false,
        showModalDeleteGroup: false,
        errorGroupGroupFetchgroup: false,
        statusGroup: 'idle',
        errorGroup: null,
        refreshGroup: false,
        selectedGroup: null,
    },
    reducers: {
        toggleModalCreateGroup: (state) => {
            state.showModalCreateGroup = !state.showModalCreateGroup;
        },
        toggleModalUpdateGroup: (state) => {
            state.showModalUpdateGroup = !state.showModalUpdateGroup;
            if (!state.showModalUpdateGroup) {
                state.selectedGroup = null;
            }
        },
        toggleModalDeleteGroup: (state) => {
            state.showModalDeleteGroup = !state.showModalDeleteGroup;
            if (!state.showModalDeleteGroup) {
                state.selectedGroup = null;
            }
        },
        selectGroup: (state, action) => {
            state.selectedGroup = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.statusGroup = 'loading';
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.statusGroup = 'succeeded';
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.statusGroup = 'failed';
                state.errorGroupGroupFetchgroup = action.error.message;
            })
            .addCase(createGroup.pending, (state) => {
                state.statusGroup = 'loading';
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.groups.push(action.payload);
                state.statusGroup = 'succeeded';
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.statusGroup = 'failed';
                state.errorGroup = action.error.message;
                state.showModalCreateGroup = false; // Close the modal on success
                state.refreshGroup = !state.refreshGroup; // Toggle refreshGroup state on user creations
            })
            .addCase(updateGroup.pending, (state) => {
                state.statusGroup = 'loading';
                state.refreshGroup = !state.refreshGroup;

            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                const updatedGroupIndex = state.groups.findIndex(group => group.id === action.payload.id);
                if (updatedGroupIndex !== -1) {
                    state.groups[updatedGroupIndex] = action.payload;
                }
                state.statusGroup = 'succeeded'; // Reset statusGroup to idle after successful update
                state.refreshGroup = !state.refreshGroup; // Trigger refreshGroup
                state.showModalUpdateGroup = false;
                state.selectedGroup = null; // Clear selected group after update
            })
            .addCase(updateGroup.rejected, (state, action) => {
                state.statusGroup = 'failed';
                state.errorGroup = action.error.message;

            })
            .addCase(deleteGroup.pending, (state) => {
                state.statusGroup = 'loading';
            })
            .addCase(deleteGroup.fulfilled, (state, action) => {
                state.groups = state.groups.filter(group => group.id !== action.payload);
                state.statusGroup = 'succeeded';
                state.showModalDeleteGroup = false;

            })
            .addCase(deleteGroup.rejected, (state, action) => {
                state.statusGroup = 'failed';
                state.errorGroup = action.error.message;
            })
            ;
    },
});
export const { toggleModalCreateGroup, toggleModalUpdateGroup, toggleModalDeleteGroup, showModalDeleteGroup, selectGroup } = groupSlice.actions;
export default groupSlice.reducer;
