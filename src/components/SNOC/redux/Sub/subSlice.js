
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// import { useSelector } from 'react-redux';
// export const createSub = createAsyncThunk('sub/createSub', async (subData) => {
//     const response = await axios.post(API_SERVER + 'subs/register', subData);
//     return response.data;
// });
import { showTemporaryAlert } from '../Alert/alertSlice';
import { API_SERVER } from './../../config/constant';


export const MtasSubInfoFullView = createAsyncThunk('sub/MtasSubInfoFullView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMtasSubInfoFullView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MtasSubInfoFullView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get info mtas successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const MmeGetEbmLogView = createAsyncThunk('sub/MmeGetEbmLogView', async (_, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeGetEbmLogView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeGetEbmLogView/', null, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get ebm log successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get ebm log.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const ImsSubInfoFullView = createAsyncThunk('sub/ImsSubInfoFullView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearImsSubInfoFullView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/ImsSubInfoFullView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get info ims successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const MmeSubInfoFullView = createAsyncThunk('sub/MmeSubInfoFullView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeSubInfoFullView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeSubInfoFullView/', { numberslist: numbersArray }, {
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


export const MmeSubDeleteView = createAsyncThunk('sub/MmeSubDeleteView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeSubDeleteView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeSubDeleteView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Delete sub successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const MmeeGetTraceSubImmediatellyView = createAsyncThunk('sub/MmeeGetTraceSubImmediatellyView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeeGetTraceSubImmediatelly());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeeGetTraceSubImmediatellyView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get trace mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const MmeeGetTraceSubView = createAsyncThunk('sub/MmeeGetTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearMmeeGetTraceSubView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeeGetTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get trace mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const MmeeShowTraceSubView = createAsyncThunk('sub/MmeeShowTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearshowtracemmees());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeeShowTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Show trace mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to show trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const MmeeStopTraceSubView = createAsyncThunk('sub/MmeeStopTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearstoptracemmees());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeeStopTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Stop trace mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to stop trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const MmeeGreateTraceSubView = createAsyncThunk('sub/MmeeGreateTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(cleartracemmees());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/MmeeGreateTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create trace mme successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



export const sapcSubInfoView = createAsyncThunk('sub/sapcSubInfoView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSapcs());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/sapcsubinfo/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Sub get info successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const sapcSubDeleteView = createAsyncThunk('sub/SapcSubDeleteView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSapcSubDeleteView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/SapcSubDeleteView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Sub delete info successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const SapcSubCreateView = createAsyncThunk('sub/SapcSubCreateView', async ({ selectedPackage, numbersArray }, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSapcSubCreateView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/SapcSubCreateView/',
            {
                numberslist: numbersArray,
                package: selectedPackage  // Add profile value here 
            },
            {
                headers: {
                    Authorization: `${account.token}`,
                },
            });
        dispatch(showTemporaryAlert({ message: 'Package for Sub create  successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create package for sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const SapcSubSetPackageView = createAsyncThunk('sub/SapcSubSetPackageView', async ({ selectedPackage, numbersArray }, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSapcSubSetPackageView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/SapcSubSetPackageView/',
            {
                numberslist: numbersArray,
                package: selectedPackage  // Add profile value here 
            },
            {
                headers: {
                    Authorization: `${account.token}`,
                },
            });
        dispatch(showTemporaryAlert({ message: 'Package for Sub set  successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to set package for sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



export const postGetInfoSub = createAsyncThunk('sub/postGetInfoSub', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSubs());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/postgetinfosub/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Sub get info successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const mmeSubMove = createAsyncThunk('sub/mmeSubMove', async ({ selectedValue, numbersArray }, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSubs());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/mmesubmove/', {
            numberslist: numbersArray,
            mmedest: selectedValue  // Add profile value here 
        }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Sub is moved successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to move sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PgwSubInfo = createAsyncThunk('sub/PgwSubInfo', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPgwSubs());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/pgwsubinfo/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get Sub info pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PcrfShowSubView = createAsyncThunk('sub/PcrfShowSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPcrfShowSubView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PcrfShowSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get Sub info pcrf successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const PcrfShowTraceView = createAsyncThunk('sub/PcrfShowTraceView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPcrfShowTraceView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PcrfShowTraceView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get trace sub info pcrf successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get trace sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});




export const PcrfCreateTraceView = createAsyncThunk('sub/PcrfCreateTraceView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPcrfCreateTraceView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PcrfCreateTraceView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create trace pcrf successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PcrfStopGetTraceView = createAsyncThunk('sub/PcrfStopGetTraceView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPcrfStopGetTraceView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PcrfStopGetTraceView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create stop get pcrf successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to stop get trace.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});




export const PgwSubInfoFullView = createAsyncThunk('sub/PgwSubInfoFullView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPgwSubInfoFullView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgwSubInfoFullView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get Sub info pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const Pgw_SubInfo_UP_View = createAsyncThunk('sub/Pgw_SubInfo_UP_View', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPgw_SubInfo_UP_View());
        dispatch(clearPgw_Sub_Info_Sacc_View());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/Pgw_SubInfo_UP_View/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get Sub info pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const Pgw_Sub_Info_Sacc_View = createAsyncThunk('sub/Pgw_Sub_Info_Sacc_View', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearPgw_Sub_Info_Sacc_View());
        dispatch(clearPgw_SubInfo_UP_View());


        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/Pgw_Sub_Info_Sacc_View/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Get Sub info pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get sub info.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PgwGetTraceSubView = createAsyncThunk('sub/PgwGetTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(cleargettracepgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgwGetTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'get trace pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get trace pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PgweShowTraceSubView = createAsyncThunk('sub/PgweShowTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearshowtracepgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgweShowTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'show trace pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to show trace pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



export const PgweStopTraceSubView = createAsyncThunk('sub/PgweStopTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearstoptracepgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgweStopTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Stop trace pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to stop trace pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PgweGreateTraceSubView = createAsyncThunk('sub/PgweGreateTraceSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(cleartracepgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgweGreateTraceSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create trace pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create trace pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const PgweGreateTraceUpSubView = createAsyncThunk('sub/PgweGreateTraceUpSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(cleartraceuppgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgweGreateTraceUpSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create trace pgw up successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create trace up pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const PgweStopTraceUpSubView = createAsyncThunk('sub/PgweStopTraceUpSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearstoptraceuppgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgweStopTraceUpSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Stop trace pgw up successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to stop up trace pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PgweShowTraceUpSubView = createAsyncThunk('sub/PgweShowTraceUpSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearshowtraceuppgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgweShowTraceUpSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'show trace pgw up successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to show trace up pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const PgwGetTraceUpSubView = createAsyncThunk('sub/PgwGetTraceUpSubView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(cleargettraceuppgwes());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/PgwGetTraceUpSubView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'get trace pgw successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get trace pgw.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const HssSubInfoFullView = createAsyncThunk('sub/HssSubInfoFullView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearHssSubInfoFulls());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/HssSubInfoFullView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create hss full successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get hss full.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const CheckCudborUdrView = createAsyncThunk('sub/CheckCudborUdrView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearCheckCudborUdrView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/CheckCudborUdrView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'check cudb or udr  successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to check .';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const hssSubEnableVolteView = createAsyncThunk('sub/HssSubEnableVolteView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearHssSubEnableVolteView());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/HssSubEnableVolteView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Enable volte full successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to enable sub volte full.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const HlrSubInfoFullView = createAsyncThunk('sub/HlrSubInfoFullView', async (numbersArray, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearHlrSubInfoFulls());
        const { account } = getState();


        const response = await axios.post(API_SERVER + 'nornirps/HlrSubInfoFullView/', { numberslist: numbersArray }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Create hlr full successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to get hlr full.';
        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const setProfileHss = createAsyncThunk('sub/setProfileHss', async ({ numbersArray, hssProfile }, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSubs());

        const { account } = getState();
        const response = await axios.post(API_SERVER + 'nornirps/setprofilehss/', {
            numberslist: numbersArray,
            profile: hssProfile  // Add profile value here 
        }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Set profile hss successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to set profile hss.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});

export const setProfileHlr = createAsyncThunk('sub/setProfileHlr', async ({ numbersArray, hlrProfile }, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        dispatch(clearSubs());

        const { account } = getState();
        const response = await axios.post(API_SERVER + 'nornirps/setprofilehlr/', {
            numberslist: numbersArray,
            profile: hlrProfile  // Add profile value here 
        }, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Set profile hlr successfully!', type: 'success' }));
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to set profile hlr.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



export const createSub = createAsyncThunk('sub/createSub', async (subData, { getState, rejectWithValue, dispatch }) => {
    // console.log(subData)
    try {
        const { account } = getState();
        const response = await axios.post(API_SERVER + 'subs/register', subData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Sub created successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to create sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



// export const fetchSubs = createAsyncThunk('sub/fetchSubs', async () => {
//     const response = await axios.get(API_SERVER + 'subs/listsub');
//     return response.data;
// });
export const fetchSubs = createAsyncThunk('sub/fetchSubs', async (abc, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.get(API_SERVER + 'subs/register', {
            headers: {
                Authorization: ` ${account.token}`,
            },
        });
        // dispatch(showTemporaryAlert({ message: 'fetch subs successfully!', type: 'success' }));
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to fetch sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


// export const fetchSubs = createAsyncThunk('sub/fetchSubs', async () => {

//     const response = await axios.get(API_SERVER + 'subs/register');
//     return response.data;
// });

export const deleteSub = createAsyncThunk('sub/deleteSub', async (subId, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        await axios.delete(`http://10.149.99.177:8008/api/subs/register/${subId}/admin_delete_sub`, {
            headers: {
                Authorization: `${account.token}`,
                // id: `${subId}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Sub deleted successfully!', type: 'success' }));

        return subId;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to delete sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});



// Update sub action
export const updateSub = createAsyncThunk('sub/updateSub', async ({ subId, subData }, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.put(`http://10.149.99.177:8008/api/subs/register/${subId}`, subData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to update sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});






export const changePassword = createAsyncThunk('subs/changePassword', async (passwordData, { getState, rejectWithValue, dispatch }) => {
    try {
        const { account } = getState();
        const response = await axios.patch(`http://10.149.99.177:8008/api/subs/register/${passwordData.id}/admin_change_password`, passwordData, {
            headers: {
                Authorization: `${account.token}`,
            },
        });
        dispatch(showTemporaryAlert({ message: 'Change password successfully!', type: 'success' }));

        return response.data;
    }
    catch (error) {
        const errorMessage = error?.response?.data?.detail || 'Failed to change password sub.';

        dispatch(showTemporaryAlert({ message: errorMessage, type: 'danger' }));

        return rejectWithValue(error?.response?.data);
    }
});


export const uploadSubsCSV = createAsyncThunk('sub/uploadSubsCSV', async (file, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(API_SERVER + 'subs/upload-subs/', formData, {
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


const subSlice = createSlice({
    name: 'sub',
    initialState: {

        getinfoPgweFulls: [],
        traceuppgwes: [],
        mmeeSubDels: [],
        mtasSubInfoFulls: [],
        imsSubInfoFulls: [],
        hlrSubInfoFulls: [],
        hssSubInfoFulls: [],
        getinfoPgweUpFulls: [],
        getinfoPgw_Sub_Info_Saccs: [],
        getinfopgwfulls: [],
        subs: [],
        getebmlogs: [],
        sapcs: [],
        sapcdeletesubs: [],
        sapccreatesubs: [],
        sapcsetsubs: [],
        cudbudrsubs: [],
        hssenablevoltesubs: [],
        pgwsubs: [],
        pcrfgetsubs: [],
        tracepgwes: [],
        tracemmees: [],
        stoptracepgwes: [],
        stoptraceuppgwes: [],
        showtracepgwes: [],
        showtraceuppgwes: [],
        gettracepgwes: [],
        gettraceuppgwes: [],
        gettracemmeesimmediatelly: [],
        gettracemmees: [],
        gettracesub: [],
        stoptracemmees: [],
        showtracemmees: [],
        subsadds: [],
        pcrfcreatetracesubs: [],
        showModalCreate: false,
        showModalUpdate: false,
        showModalDelete: false,
        showChangePasswordModal: false,
        status: 'idle',
        selectedSub: null,

        fetchStatus: 'idle',
        createStatus: 'idle',
        deleteStatus: 'idle',

        error: null,
        errorPgweGreateTraceSubView: null,
        errorPgweStopTraceSubView: null,
        errorPgweShowTraceSubView: null,
        errorPgwGetTraceSubView: null,
        errorPgwSubInfoFullView: null,
        errorMmeSubInfoFullView: null,
        errorMmeeShowTraceSubView: null,
        errorMmeeStopTraceSubView: null,
        gettracesubimmediatelly: null,
        errorMmeeGetTraceSubView: null,
        errorCreateSub: null,
        errorPostGetInfoSub: null,
        errorsapcSubInfoView: null,
        errorPgwSubInfo: null,
        errormmeSubMove: null,
        errorFetchSub: null,
        erroruploadSubsCSV: null,
        pcrfstopgettracesubs: null,
        pcrfshowtracesubs: null,

        loading: false,
        refresh: false, // Add a refresh state
        roles: [
            { key: 'admin', value: 'Admin' },
            { key: 'sub', value: 'Sub' }
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
        selectSub: (state, action) => {
            state.selectedSub = action.payload;
        },
        resetError(state) {
            state.error = null;
        },
        clearSubs: (state) => {
            state.subs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPgwSubs: (state) => {
            state.pgwsubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearSapcs: (state) => {
            state.sapcs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        cleartracemmees: (state) => {
            state.tracemmees = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearstoptracemmees: (state) => {
            state.stoptracemmees = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearshowtracemmees: (state) => {
            state.showtracemmees = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        cleartracepgwes: (state) => {
            state.tracepgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearMmeeGetTraceSubImmediatelly: (state) => {
            state.gettracemmeesimmediatelly = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearMmeeGetTraceSubView: (state) => {
            state.gettracemmees = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearstoptracepgwes: (state) => {
            state.stoptracepgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearshowtracepgwes: (state) => {
            state.showtracepgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        cleargettracepgwes: (state) => {
            state.gettracepgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearMmeSubInfoFullView: (state) => {
            state.getinfommeefulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPgwSubInfoFullView: (state) => {
            state.getinfoPgweFulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPgw_SubInfo_UP_View: (state) => {
            state.getinfoPgweUpFulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPgw_Sub_Info_Sacc_View: (state) => {
            state.getinfoPgw_Sub_Info_Saccs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },

        clearHssSubInfoFulls: (state) => {
            state.hssSubInfoFulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearHlrSubInfoFulls: (state) => {
            state.hlrSubInfoFulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearImsSubInfoFullView: (state) => {
            state.imsSubInfoFulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearMtasSubInfoFullView: (state) => {
            state.mtasSubInfoFulls = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearMmeSubDeleteView: (state) => {
            state.mmeeSubDels = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },

        cleartraceuppgwes: (state) => {
            state.traceuppgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearstoptraceuppgwes: (state) => {
            state.stoptraceuppgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearshowtraceuppgwes: (state) => {
            state.showtraceuppgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        cleargettraceuppgwes: (state) => {
            state.gettraceuppgwes = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },

        clearMmeGetEbmLogView: (state) => {
            state.getebmlogs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearSapcSubDeleteView: (state) => {
            state.sapcdeletesubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearSapcSubCreateView: (state) => {
            state.sapccreatesubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearHssSubEnableVolteView: (state) => {
            state.hssenablevoltesubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearSapcSubSetPackageView: (state) => {
            state.sapcsetsubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPcrfShowSubView: (state) => {
            state.pcrfgetsubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPcrfCreateTraceView: (state) => {
            state.pcrfcreatetracesubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPcrfStopGetTraceView: (state) => {
            state.pcrfstopgettracesubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearPcrfShowTraceView: (state) => {
            state.pcrfshowtracesubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        },
        clearCheckCudborUdrView: (state) => {
            state.cudbudrsubs = [];
            state.status = 'idle';  // Reset status if needed
            state.error = null;     // Clear any previous error
        }



    },
    extraReducers: (builder) => {
        builder
            .addCase(MmeeShowTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeeShowTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.showtracemmees = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorMmeeShowTraceSubView = null
            })
            .addCase(MmeeShowTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMmeeShowTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })

            .addCase(MmeeStopTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeeStopTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.stoptracemmees = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorMmeeStopTraceSubView = null
            })
            .addCase(MmeeStopTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMmeeStopTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })

            .addCase(MmeeGreateTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeeGreateTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tracemmees = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorMmeeGreateTraceSubView = null
            })
            .addCase(MmeeGreateTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMmeeGreateTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(sapcSubInfoView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sapcSubInfoView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sapcs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorsapcSubInfoView = null
            })
            .addCase(sapcSubInfoView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorsapcSubInfoView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(postGetInfoSub.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postGetInfoSub.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.subs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPostGetInfoSub = null
            })
            .addCase(postGetInfoSub.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPostGetInfoSub = action.payload;
                state.refresh = !state.refresh;
            })


            .addCase(mmeSubMove.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(mmeSubMove.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.subs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errormmeSubMove = null
            })
            .addCase(mmeSubMove.rejected, (state, action) => {
                state.status = 'failed';
                state.errormmeSubMove = action.payload;
                state.refresh = !state.refresh;
            })



            .addCase(PgwSubInfo.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgwSubInfo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pgwsubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPgwSubInfo = null
            })
            .addCase(PgwSubInfo.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPgwSubInfo = action.payload;
                state.refresh = !state.refresh;
            })


            .addCase(setProfileHss.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(setProfileHss.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.subs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorSetProfileHss = null
            })
            .addCase(setProfileHss.rejected, (state, action) => {
                state.status = 'failed';
                state.errorSetProfileHss = action.payload;
                state.refresh = !state.refresh;
            })

            .addCase(setProfileHlr.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(setProfileHlr.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.subs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorSetProfileHlr = null
            })
            .addCase(setProfileHlr.rejected, (state, action) => {
                state.status = 'failed';
                state.errorSetProfileHlr = action.payload;
                state.refresh = !state.refresh;
            })



            .addCase(fetchSubs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSubs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.subs = action.payload;
            })
            .addCase(fetchSubs.rejected, (state, action) => {
                state.status = 'failed';
                state.errorFetchSub = action.error.message;
            })
            .addCase(createSub.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createSub.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.subs.push(action.payload);
                state.showModalCreate = false; // Close the modal on success
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorCreateSub = null
            })
            .addCase(createSub.rejected, (state, action) => {
                state.status = 'failed';
                state.errorCreateSub = action.payload;;
            })
            .addCase(deleteSub.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteSub.fulfilled, (state, action) => {
                state.subs = state.subs.filter(sub => sub.id !== action.payload);
                state.status = 'succeeded';
                // state.refresh = !state.refresh;
            })
            .addCase(deleteSub.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateSub.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateSub.fulfilled, (state, action) => {
                // const updatedSubIndex = state.subs.findIndex(sub => sub.id === action.payload.id);
                // if (updatedSubIndex !== -1) {
                //     state.subs[updatedSubIndex] = action.payload;
                // }
                state.status = 'idle'; // Reset status to idle after successful update
                state.refresh = !state.refresh; // Trigger refresh
                state.showModalUpdate = false;
                state.selectedSub = null; // Clear selected sub after update
            })
            .addCase(updateSub.rejected, (state, action) => {
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
            .addCase(uploadSubsCSV.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadSubsCSV.fulfilled, (state, action) => {
                state.loading = false;
                state.subsadds = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(uploadSubsCSV.rejected, (state, action) => {
                state.loading = false;
                state.erroruploadSubsCSV = action.payload;
            })

            .addCase(MmeeGetTraceSubImmediatellyView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeeGetTraceSubImmediatellyView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gettracemmeesimmediatelly = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MmeeGetTraceSubImmediatellyView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMmeeGetTraceSubImmediatellyView = action.payload;
                state.refresh = !state.refresh;
            })

            .addCase(MmeeGetTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeeGetTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gettracemmees = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorMmeeGetTraceSubView = null
            })
            .addCase(MmeeGetTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMmeeGetTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })


            .addCase(PgweGreateTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgweGreateTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tracepgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPgweGreateTraceSubView = null
            })
            .addCase(PgweGreateTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPgweGreateTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(PgweStopTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgweStopTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.stoptracepgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPgweStopTraceSubView = null
            })
            .addCase(PgweStopTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPgweStopTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(PgweShowTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgweShowTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.showtracepgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPgweShowTraceSubView = null
            })
            .addCase(PgweShowTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPgweShowTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(PgwGetTraceSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgwGetTraceSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gettracepgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPgwGetTraceSubView = null
            })
            .addCase(PgwGetTraceSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPgwGetTraceSubView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(MmeSubInfoFullView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeSubInfoFullView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.getinfommeefulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorMmeSubInfoFullView = null
            })
            .addCase(MmeSubInfoFullView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMmeSubInfoFullView = action.payload;
                state.refresh = !state.refresh;
            })

            .addCase(PgwSubInfoFullView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgwSubInfoFullView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.getinfoPgweFulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
                state.errorPgwSubInfoFullView = null
            })
            .addCase(PgwSubInfoFullView.rejected, (state, action) => {
                state.status = 'failed';
                state.errorPgwSubInfoFullView = action.payload;
                state.refresh = !state.refresh;
            })
            .addCase(Pgw_SubInfo_UP_View.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(Pgw_SubInfo_UP_View.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.getinfoPgweUpFulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(Pgw_SubInfo_UP_View.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(Pgw_Sub_Info_Sacc_View.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(Pgw_Sub_Info_Sacc_View.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.getinfoPgw_Sub_Info_Saccs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(Pgw_Sub_Info_Sacc_View.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(HssSubInfoFullView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(HssSubInfoFullView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.hssSubInfoFulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(HssSubInfoFullView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(HlrSubInfoFullView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(HlrSubInfoFullView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.hlrSubInfoFulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(HlrSubInfoFullView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })


            .addCase(ImsSubInfoFullView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(ImsSubInfoFullView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.imsSubInfoFulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(ImsSubInfoFullView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(MtasSubInfoFullView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MtasSubInfoFullView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.mtasSubInfoFulls = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MtasSubInfoFullView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(MmeSubDeleteView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeSubDeleteView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.mmeeSubDels = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MmeSubDeleteView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(PgweGreateTraceUpSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgweGreateTraceUpSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.traceuppgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PgweGreateTraceUpSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(PgweStopTraceUpSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgweStopTraceUpSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.stoptraceuppgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PgweStopTraceUpSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })


            .addCase(PgweShowTraceUpSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgweShowTraceUpSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.showtraceuppgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PgweShowTraceUpSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(PgwGetTraceUpSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PgwGetTraceUpSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gettraceuppgwes = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PgwGetTraceUpSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(MmeGetEbmLogView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(MmeGetEbmLogView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.getebmlogs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(MmeGetEbmLogView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })


            .addCase(sapcSubDeleteView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sapcSubDeleteView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sapcdeletesubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(sapcSubDeleteView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(SapcSubCreateView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(SapcSubCreateView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sapccreatesubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(SapcSubCreateView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(hssSubEnableVolteView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(hssSubEnableVolteView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.hssenablevoltesubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(hssSubEnableVolteView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(SapcSubSetPackageView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(SapcSubSetPackageView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sapcsetsubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(SapcSubSetPackageView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(PcrfShowSubView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PcrfShowSubView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pcrfgetsubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PcrfShowSubView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(PcrfCreateTraceView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PcrfCreateTraceView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pcrfcreatetracesubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PcrfCreateTraceView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            .addCase(PcrfStopGetTraceView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PcrfStopGetTraceView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pcrfstopgettracesubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PcrfStopGetTraceView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })


            .addCase(PcrfShowTraceView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(PcrfShowTraceView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pcrfshowtracesubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(PcrfShowTraceView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })


            .addCase(CheckCudborUdrView.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(CheckCudborUdrView.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cudbudrsubs = action.payload;
                state.refresh = !state.refresh; // Toggle refresh state on sub creations
            })
            .addCase(CheckCudborUdrView.rejected, (state, action) => {
                state.status = 'failed';
                state.refresh = !state.refresh;
            })

            ;
    },
});



export const { clearCheckCudborUdrView, clearPcrfShowTraceView, clearPcrfStopGetTraceView, clearPcrfCreateTraceView, clearPcrfShowSubView, clearSapcSubSetPackageView, clearHssSubEnableVolteView, clearSapcSubCreateView, clearSapcSubDeleteView, clearMmeGetEbmLogView, cleargettraceuppgwes, clearshowtraceuppgwes, clearstoptraceuppgwes, cleartraceuppgwes, clearMmeSubDeleteView, clearMtasSubInfoFullView, clearImsSubInfoFullView, clearHlrSubInfoFulls, clearHssSubInfoFulls, clearPgw_Sub_Info_Sacc_View, clearPgw_SubInfo_UP_View, clearPgwSubInfoFullView, clearMmeSubInfoFullView, clearMmeeGetTraceSubView, cleargettracepgwes, clearshowtracepgwes, clearstoptracepgwes, errorPgweStopTraceSubView, clearMmeeGetTraceSubImmediatelly, errorPgweGreateTraceSubView, cleartracepgwes, clearshowtracemmees, toggleModalCreate, toggleModalUpdate, toggleRefresh, selectSub, toggleModalDelete, toggleChangePasswordModal, resetErrorv, errorPostGetInfoSub, errorPgwSubInfo, errorsapcSubInfoView, cleartracemmees, clearSubs, clearPgwSubs, clearSapcs, clearstoptracemmees, errorMmeeStopTraceSubView } = subSlice.actions;
export default subSlice.reducer;
