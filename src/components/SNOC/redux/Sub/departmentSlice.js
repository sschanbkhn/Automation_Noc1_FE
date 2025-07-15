import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showTemporaryAlert } from '../Alert/alertSlice';
import { API_SERVER } from './../../config/constant';


export const fetchDepartments = createAsyncThunk('department/fetchDepartments', async (departmentId, { getState, rejectWithValue, dispatch }) => {
    try {
        // console.log(departmentData)
        const { account } = getState();
        const response = await axios.get(API_SERVER + 'users/departments', {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        // dispatch(showTemporaryAlert({ message: 'fetch department successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to fetch department.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});
export const createDepartment = createAsyncThunk('department/createDepartment', async (departmentData, { getState, rejectWithValue, dispatch }) => {
    try {

        const { account } = getState();
        const response = await axios.post(API_SERVER + 'users/departments', departmentData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'create department successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create department.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const updateDepartment = createAsyncThunk('department/updateDepartment', async ({ departmentId, departmentData }, { getState, rejectWithValue, dispatch }) => {
    try {

        const { account } = getState();
        const response = await axios.put(`http://10.149.99.177:8008/api/users/departments/${departmentId}`, departmentData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'update department successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to update department.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const deleteDepartment = createAsyncThunk('department/deleteDepartment', async (departmentId, { getState, rejectWithValue, dispatch }) => {
    try {

        const { account } = getState();
        await axios.delete(`http://10.149.99.177:8008/api/users/departments/${departmentId}`, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'delete department successfully!', type: 'success' }));

        return departmentId;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete department.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        departments: [],
        showModalCreateDepartment: false,
        showModalUpdateDepartment: false,
        showModalDeleteDepartment: false,
        statusDepartment: 'idle',
        errorDepartment: null,
        refreshDepart: false,
        selectedDepartment: null,
    },
    reducers: {
        toggleModalCreateDepartment: (state) => {
            state.showModalCreateDepartment = !state.showModalCreateDepartment;
        },
        toggleModalUpdateDepartment: (state) => {
            state.showModalUpdateDepartment = !state.showModalUpdateDepartment;
            if (!state.showModalUpdateDepartment) {
                state.selectedDepartment = null;
            }
        },
        toggleModalDeleteDepartment: (state) => {
            state.showModalDeleteDepartment = !state.showModalDeleteDepartment;
            if (!state.showModalDeleteDepartment) {
                state.selectedDepartment = null;
            }
        },
        toggleRefresh: (state) => {
            state.refresh = !state.refresh; // Toggle refresh state
        },
        selectDepartment: (state, action) => {
            state.selectedDepartment = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
                state.statusDepartment = 'loading';
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.statusDepartment = 'succeeded';
                state.departments = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.statusDepartment = 'failed';
                state.errorDepartment = action.error.message;
            })
            .addCase(createDepartment.pending, (state) => {
                state.statusDepartment = 'loading';
            })
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.statusDepartment = 'succeeded';
                // state.departments.push(action.payload);
                // state.showModalCreateDepartment = false; // Close the modal on success
                state.refreshDepart = !state.refreshDepart; // Toggle refresh state on user creations
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.statusDepartment = 'failed';
                state.errorDepartment = action.error.message;
            })

            .addCase(updateDepartment.pending, (state) => {
                state.statusDepartment = 'loading';
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const updatedDepartmentIndex = state.departments.findIndex(department => department.id === action.payload.id);
                if (updatedDepartmentIndex !== -1) {
                    state.departments[updatedDepartmentIndex] = action.payload;
                }
                state.statusDepartment = 'succeeded'; // Reset statusDepartment to idle after successful update
                state.refreshDepart = !state.refreshDepart; // Trigger refresh
                state.showModalUpdateDepartment = false;
                // state.selectedDepartment = null; // Clear selected department after update
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.statusDepartment = 'failed';
                state.errorDepartment = action.error.message;

            })
            .addCase(deleteDepartment.pending, (state) => {
                state.statusDepartment = 'loading';
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.departments = state.departments.filter(department => department.id !== action.payload);
                state.statusDepartment = 'succeeded';
                state.selectedDepartment = null;
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.statusDepartment = 'failed';
                state.errorDepartment = action.error.message;
            })
            ;
        ;
    },
});

export const { toggleModalCreateDepartment, toggleModalUpdateDepartment, toggleModalDeleteDepartment, selectDepartment } = departmentSlice.actions;

export default departmentSlice.reducer;
