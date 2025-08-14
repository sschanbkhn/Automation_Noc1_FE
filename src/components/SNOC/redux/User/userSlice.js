
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_SERVER } from './../../config/constant';

// import { useSelector } from 'react-redux';
// export const createUser = createAsyncThunk('user/createUser', async (userData) => {
//     const response = await axios.post(API_SERVER + 'users/register', userData);
//     return response.data;
// });
import { showTemporaryAlert } from '../Alert/alertSlice';

const createAuthAxios = (token) => {
    return axios.create({
        baseURL: API_SERVER,
        headers: {
            Authorization: token,
        },
    });
};


export const createUser = createAsyncThunk('user/createUser', async (userData, { getState, rejectWithValue, dispatch }) => {
    // console.log(userData)
    try {
        const { account } = getState();
        const response = await axios.post(API_SERVER + 'users/register', userData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'User created successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create user.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



// export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
//     const response = await axios.get(API_SERVER + 'users/listuser');
//     return response.data;
// });
export const fetchUsers = createAsyncThunk('user/fetchUsers', async (abc, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.get(API_SERVER + 'users/register', {
            headers: {
                Authorization: ` ${account.token}`,
            },
        });
        // dispatch(showTemporaryAlert({ message: 'fetch users successfully!', type: 'success' }));
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to fetch user.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


// export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {

//     const response = await axios.get(API_SERVER + 'users/register');
//     return response.data;
// });

export const deleteUser = createAsyncThunk('user/deleteUser', async (userId, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        await axios.delete(`${API_SERVER}users/register/${userId}/admin_delete_user`, {
            headers: {
                Authorization: `${account.token}`,
                // id: `${userId}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'User deleted successfully!', type: 'success' }));

        return userId;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete user.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



// Update user action
export const updateUser = createAsyncThunk('user/updateUser', async ({ userId, userData }, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.put(`${API_SERVER}users/register/${userId}`, userData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to update user.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});






export const changePassword = createAsyncThunk('users/changePassword', async (passwordData, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.patch(`${API_SERVER}users/register/${passwordData.id}/admin_change_password`, passwordData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Change password successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to change password user.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const uploadUsersCSV = createAsyncThunk('user/uploadUsersCSV', async (file, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(API_SERVER + 'users/upload-users/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error?.response?.data);
    }
}
);


const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
        usersadds: [],
        showModalCreate: false,
        showModalUpdate: false,
        showModalDelete: false,
        showChangePasswordModal: false,
        status: 'idle',
        selectedUser: null,

        fetchStatus: 'idle',
        createStatus: 'idle',
        deleteStatus: 'idle',

        error: null,
        errorCreateUser: null,
        errorFetchUser: null,
        erroruploadUsersCSV: null,
        loading: false,
        refresh: false, // Add a refresh state
        roles: [
            { key: 'admin', value: 'Admin' },
            { key: 'user', value: 'User' },
            { key: 'super', value: 'Super' }
        ],
        nocs: [
            { key: 'noc1', value: 'NOC1' },
            { key: 'noc2', value: 'NOC2' },
            { key: 'noc3', value: 'NOC3' },
            { key: '_', value: '_' }

        ],
        departs: [
            { key: 'inoc', value: 'INOC' },
            { key: 'rnoc', value: 'RNOC' },
            { key: 'snoc', value: 'SNOC' },
            { key: 'tnoc', value: 'TNOC' },
            { key: '_', value: '_' }
        ],
    },
    reducers: {
        toggleModalCreate: (state) => {
            state.showModalCreate = !state.showModalCreate;
            state.errorCreateUser = null;
        },
        toggleModalUpdate: (state) => {
            state.showModalUpdate = !state.showModalUpdate;
            if (!state.showModalUpdate) {
                state.selectedUser = null;
            }
        },
        toggleModalDelete: (state) => {
            state.showModalDelete = !state.showModalDelete;
            if (!state.showModalDelete) {
                state.selectedUser = null;
            }
        },
        toggleChangePasswordModal: (state, action) => {
            state.showChangePasswordModal = !state.showChangePasswordModal;
            state.selectedUser = action.payload || null;
        },
        toggleRefresh: (state) => {
            state.refresh = !state.refresh; // Toggle refresh state
        },
        selectUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        resetError(state) {
            state.error = null;
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
                state.errorFetchUser = action.error.message;
            })
            .addCase(createUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users.push(action.payload);
                state.showModalCreate = false; // Close the modal on success
                state.refresh = !state.refresh; // Toggle refresh state on user creations
                state.errorCreateUser = null
            })
            .addCase(createUser.rejected, (state, action) => {
                state.status = 'failed';
                state.errorCreateUser = action.payload;;
            })
            .addCase(deleteUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.payload);
                state.status = 'succeeded';
                // state.refresh = !state.refresh;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                // const updatedUserIndex = state.users.findIndex(user => user.id === action.payload.id);
                // if (updatedUserIndex !== -1) {
                //     state.users[updatedUserIndex] = action.payload;
                // }
                state.status = 'idle'; // Reset status to idle after successful update
                state.refresh = !state.refresh; // Trigger refresh
                state.showModalUpdate = false;
                state.selectedUser = null; // Clear selected user after update
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;

            })
            .addCase(changePassword.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(uploadUsersCSV.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadUsersCSV.fulfilled, (state, action) => {
                state.loading = false;
                state.usersadds = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(uploadUsersCSV.rejected, (state, action) => {
                state.loading = false;
                state.erroruploadUsersCSV = action.payload;
            });
    },
});

export const { toggleModalCreate, toggleModalUpdate, toggleRefresh, selectUser, toggleModalDelete, toggleChangePasswordModal, resetError } = userSlice.actions;
export default userSlice.reducer;
