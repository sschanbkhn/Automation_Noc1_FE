import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Row, Col, Card, Table, Form, Button, InputGroup, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';
// import { Row, Col, Card, Table, Button } from 'react-bootstrap';

import { Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// import MmeTable from '../tables _ps/MmeTable';
import {
    clearCheckCudborUdrView, CheckCudborUdrView,
    clearPcrfShowSubView, PcrfShowSubView, clearPcrfCreateTraceView, PcrfCreateTraceView, clearPcrfStopGetTraceView, PcrfStopGetTraceView,
    clearSapcSubCreateView, SapcSubCreateView, PcrfShowTraceView, clearPcrfShowTraceView,
    clearSapcSubDeleteView, sapcSubDeleteView, clearMmeGetEbmLogView, MmeGetEbmLogView, cleargettraceuppgwes,
    PgwGetTraceUpSubView, clearshowtraceuppgwes, PgweShowTraceUpSubView, clearstoptraceuppgwes, PgweStopTraceUpSubView,
    cleartraceuppgwes, PgweGreateTraceUpSubView, clearMmeSubDeleteView, MmeSubDeleteView, clearMtasSubInfoFullView,
    MtasSubInfoFullView, clearImsSubInfoFullView, ImsSubInfoFullView, clearHlrSubInfoFulls, HlrSubInfoFullView,
    HssSubInfoFullView, clearHssSubInfoFulls, Pgw_Sub_Info_Sacc_View, clearPgw_Sub_Info_Sacc_View, Pgw_SubInfo_UP_View,
    clearPgw_SubInfo_UP_View, PgwSubInfoFullView, clearPgwSubInfoFullView, MmeSubInfoFullView, clearMmeSubInfoFullView,
    MmeeGetTraceSubView, clearMmeeGetTraceSubView, PgwGetTraceSubView, cleargettracepgwes, clearshowtracepgwes, PgweShowTraceSubView,
    clearstoptracepgwes, PgweStopTraceSubView, MmeeGetTraceSubImmediatellyView, clearMmeeGetTraceSubImmediatelly, PgweGreateTraceSubView,
    cleartracepgwes, clearshowtracemmees, MmeeShowTraceSubView, MmeeStopTraceSubView, clearstoptracemmees, MmeeGreateTraceSubView,
    postGetInfoSub, PgwSubInfo, sapcSubInfoView, clearSubs, clearPgwSubs, setProfileHss, setProfileHlr, mmeSubMove, clearSapcs, cleartracemmees
} from './../../redux/Sub/subSlice';
// import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
import DataDisplay from '../../components/DataDisplay/FormattedText';
import SapcDisplay from '../../components/DataDisplay/SapcDisplay';
import CollapsibleCard from '../../components/DataDisplay/CollapsibleCard';
import DownloadDisplay from '../../components/DataDisplay/Formatdownload';
import { SERVER_MEDIA } from './../../config/constant';

const FormsElements = () => {




    const dispatch = useDispatch();
    const [accordionKey, setAccordionKey] = useState(0);
    // dispatch(clearSubs());
    // dispatch(clearSubs());
    const [numbersInput, setNumbersInput] = useState(''); // State for Number input
    const [seidInput, setSeidInput] = useState(''); // State for Number input


    const [hssProfile, setHssProfile] = useState('');  // State for HSS profile
    const [hlrProfile, setHlrProfile] = useState('');  // State for HLR profile
    const subs = useSelector((state) => state.sub.subs);
    const account = useSelector((state) => state.account);
    // redux variable
    // const { pgwsubs, sapcs, status, tracemmees, stoptracemmees, showtracemmees, tracepgwes, stoptracepgwes,
    //     showtracepgwes, gettracepgwes, gettracemmeesimmediatelly, gettracemmees, getinfommeefulls, getinfoPgweFulls,
    //     getinfoPgweUpFulls, getinfoPgw_Sub_Info_Saccs, hssSubInfoFulls, hlrSubInfoFulls, imsSubInfoFulls, mtasSubInfoFulls,
    //     mmeeSubDels, traceuppgwes, stoptraceuppgwes, showtraceuppgwes, gettraceuppgwes, getebmlogs
    // } = useSelector((state) => state.sub);
    // all info variables
    const {
        pgwsubs = [],
        sapcs = [],
        status = '',
        tracemmees = [],
        stoptracemmees = [],
        showtracemmees = [],
        tracepgwes = [],
        stoptracepgwes = [],
        showtracepgwes = [],
        gettracepgwes = [],
        gettracemmeesimmediatelly = [],
        gettracemmees = [],
        getinfommeefulls = [],
        getinfoPgweFulls = [],
        getinfoPgweUpFulls = [],
        getinfoPgw_Sub_Info_Saccs = [],
        hssSubInfoFulls = [],
        hlrSubInfoFulls = [],
        imsSubInfoFulls = [],
        mtasSubInfoFulls = [],
        mmeeSubDels = [],
        traceuppgwes = [],
        stoptraceuppgwes = [],
        showtraceuppgwes = [],
        gettraceuppgwes = [],
        getebmlogs = [],
        sapcdeletesubs = [],
        sapccreatesubs = [],
        pcrfgetsubs = [],
        pcrfcreatetracesubs = [],
        pcrfstopgettracesubs = [],
        pcrfshowtracesubs = [],
        cudbudrsubs = [],
    } = useSelector((state) => state.sub ?? {}); // ⬅️ ensures state.sub isn't null

    // const allItems = [
    //     pgwsubs, sapcs, tracemmees, stoptracemmees, showtracemmees, tracepgwes, stoptracepgwes,
    //     showtracepgwes, gettracepgwes, gettracemmeesimmediatelly, gettracemmees, getinfommeefulls, getinfoPgweFulls,
    //     getinfoPgweUpFulls, getinfoPgw_Sub_Info_Saccs, hssSubInfoFulls, hlrSubInfoFulls, imsSubInfoFulls,
    //     mtasSubInfoFulls, mmeeSubDels, traceuppgwes, stoptraceuppgwes, showtraceuppgwes, gettraceuppgwes, getebmlogs
    // ];
    // dispatch clear list
    // const clearFunctions = [
    //     clearSubs, clearPgwSubs, clearSapcs, cleartracemmees, clearstoptracemmees, clearshowtracemmees,
    //     cleartracepgwes, clearMmeeGetTraceSubImmediatelly, clearstoptracepgwes, clearshowtracepgwes,
    //     cleargettracepgwes, clearMmeeGetTraceSubView, clearMmeSubInfoFullView, clearPgwSubInfoFullView,
    //     clearPgw_SubInfo_UP_View, clearPgw_Sub_Info_Sacc_View, clearHssSubInfoFulls, clearHlrSubInfoFulls,
    //     clearImsSubInfoFullView, clearMtasSubInfoFullView, clearMmeSubDeleteView, cleartraceuppgwes, clearstoptraceuppgwes,
    //     clearshowtraceuppgwes, cleargettraceuppgwes, clearMmeGetEbmLogView
    // ];
    const clearFunctions = useMemo(() => [
        clearSubs,
        clearPgwSubs,
        clearSapcs,
        cleartracemmees,
        clearstoptracemmees,
        clearshowtracemmees,
        cleartracepgwes,
        clearMmeeGetTraceSubImmediatelly,
        clearstoptracepgwes,
        clearshowtracepgwes,
        cleargettracepgwes,
        clearMmeeGetTraceSubView,
        clearMmeSubInfoFullView,
        clearPgwSubInfoFullView,
        clearPgw_SubInfo_UP_View,
        clearPgw_Sub_Info_Sacc_View,
        clearHssSubInfoFulls,
        clearHlrSubInfoFulls,
        clearImsSubInfoFullView,
        clearMtasSubInfoFullView,
        clearMmeSubDeleteView,
        cleartraceuppgwes,
        clearstoptraceuppgwes,
        clearshowtraceuppgwes,
        cleargettraceuppgwes,
        clearMmeGetEbmLogView,
        clearSapcSubDeleteView,
        clearSapcSubCreateView,
        clearPcrfShowSubView,
        clearPcrfCreateTraceView,
        clearPcrfStopGetTraceView,
        clearPcrfShowTraceView,
        clearCheckCudborUdrView,

    ], []);

    // Example reusable function
    const isAnyNullOrUndefined = (items) => items.some(item => item === null || item === undefined);

    useEffect(() => {
        // if (isAnyNullOrUndefined(allItems)) {
        //     console.log('Some items are null or undefined');
        // }
        clearFunctions.forEach(func => dispatch(func()));
    }, [dispatch, clearFunctions]);

    const originalOptions = [
        { outputtype: pgwsubs, displaytype: DataDisplay, name: 'get pgw subs' },
        { outputtype: sapcs, displaytype: SapcDisplay, name: 'get sapcs' },
        { outputtype: tracemmees, displaytype: DataDisplay, name: 'create trace mmees' },
        { outputtype: stoptracemmees, displaytype: DataDisplay, name: 'stop trace mmees' },
        { outputtype: showtracemmees, displaytype: DataDisplay, name: 'show trace mmees' },
        { outputtype: tracepgwes, displaytype: DataDisplay, name: 'create trace pgwes' },
        { outputtype: stoptracepgwes, displaytype: DataDisplay, name: 'stop trace pgwes' },
        { outputtype: showtracepgwes, displaytype: DataDisplay, name: 'show trace pgwes' },
        { outputtype: gettracepgwes, displaytype: DataDisplay, name: 'get trace pgwes' },
        { outputtype: gettracemmeesimmediatelly, displaytype: DownloadDisplay, name: 'get trace mmee immediatelly' },
        { outputtype: gettracemmees, displaytype: DownloadDisplay, name: 'get trace mmees' },
        { outputtype: getinfommeefulls, displaytype: DataDisplay, name: 'get info mmee fulls' },
        { outputtype: getinfoPgweFulls, displaytype: DataDisplay, name: 'get info Pgwe Fulls' },
        { outputtype: getinfoPgweUpFulls, displaytype: DataDisplay, name: 'get info Pgwe Up Fulls' },
        { outputtype: getinfoPgw_Sub_Info_Saccs, displaytype: DataDisplay, name: 'get info Pgw_Sub_Info_Saccs' },
        { outputtype: hssSubInfoFulls, displaytype: SapcDisplay, name: 'hss Sub Info Fulls' },
        { outputtype: hlrSubInfoFulls, displaytype: SapcDisplay, name: 'hlr Sub Info Fulls' },
        { outputtype: imsSubInfoFulls, displaytype: SapcDisplay, name: 'ims Sub Info Fulls' },
        { outputtype: mtasSubInfoFulls, displaytype: SapcDisplay, name: 'mtas Sub Info Fulls' },
        { outputtype: mmeeSubDels, displaytype: SapcDisplay, name: 'mmee Delete Sub' },
        { outputtype: traceuppgwes, displaytype: DataDisplay, name: 'create up trace Sub' },
        { outputtype: stoptraceuppgwes, displaytype: DataDisplay, name: 'stop up trace Sub' },
        { outputtype: showtraceuppgwes, displaytype: DataDisplay, name: 'show up trace Sub' },
        { outputtype: gettraceuppgwes, displaytype: DataDisplay, name: 'get up trace Sub' },
        { outputtype: getebmlogs, displaytype: DataDisplay, name: 'get up ebm log' },
        { outputtype: sapcdeletesubs, displaytype: DataDisplay, name: 'Delete sub cudb' },
        { outputtype: sapccreatesubs, displaytype: DataDisplay, name: 'Create sub cudb' },
        { outputtype: pcrfgetsubs, displaytype: DataDisplay, name: 'check pcrf' },
        { outputtype: pcrfcreatetracesubs, displaytype: DataDisplay, name: 'create trace pcrf' },
        { outputtype: pcrfstopgettracesubs, displaytype: DataDisplay, name: 'stop get trace pcrf' },
        { outputtype: pcrfshowtracesubs, displaytype: DataDisplay, name: 'show trace pcrf' },
        { outputtype: cudbudrsubs, displaytype: DataDisplay, name: 'show cudb udr' }

    ];
    // const [reorderedOptions, setReorderedOptions] = useState(originalOptions);



    // const Displaylist = originalOptions.map((button, idx) => (
    //     // <Button className="btn-icon" key={idx} variant={button.variant}>
    //     //     <i className={button.icon} />
    //     // </Button>
    //     <>
    //         {((button.outputtype && button.outputtype.length > 0)) && (

    //             <Col md={6} key={idx}>
    //                 <CollapsibleCard button={button} />

    //             </Col>

    //         )}
    //     </>
    // ));

    const Displaylist = originalOptions.map((button, idx) => (
        ((button.outputtype && button.outputtype.length > 0)) && (
            <React.Fragment key={idx}>
                <Col md={6}>
                    <CollapsibleCard button={button} />
                </Col>
            </React.Fragment>
        )
    ));
    const Displaydownload = originalOptions.map((button, idx) => (
        ((button.outputtype && button.outputtype.length > 0)) && (
            <React.Fragment key={idx}>
                <Col md={6}>
                    <CollapsibleCard button={button} />
                </Col>
            </React.Fragment>
        )
    ));
    // const error = useSelector((state) => state.sub.error);
    // const errorPostGetInfoSub = useSelector((state) => state.sub.errorPostGetInfoSub);
    // const refresh = useSelector((state) => state.sub.refresh);

    const formatBoolean = (value) => {
        return value ? 'True' : 'False';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
        };

        return new Date(dateString).toLocaleString('en-GB', options).replace(',', '');
    };
    // Define fields to be excluded
    const excludedFields = [];
    const toFriendlyName = (key) => {
        let modifiedKey = key;
        if (key === "sgwnamelist") {
            modifiedKey = "SGW";
        } else if (key === "pgwnamelist") {
            modifiedKey = "PGW";
        } else if (key === "hlrprofile") {
            modifiedKey = "HLR";
        } else if (key === "hssprofile") {
            modifiedKey = "HSS";
        } else if (key.includes("is_")) {
            modifiedKey = key.replace("is_", "");
        }
        return modifiedKey.toUpperCase();
    };


    // Function to format IP strings with both \n and , as separators
    const formatIpString = (ipString) => {
        const cleanedIpString = ipString.trim();
        return cleanedIpString
            .split(/[\n,]+/) // Split by newline, comma, colon, or whitespace
            .map((line, index) => (
                line && (
                    <React.Fragment key={index}>
                        {line.trim()} {/* Trim any extra spaces */}
                        <br />
                    </React.Fragment>
                )
            ));
    };

    // Updated renderCell function
    const renderCell = (data, key) => {
        if (typeof data === 'object' && data !== null) {
            // Adjust this to display the desired field from the nested object
            return data.name ? data.name : JSON.stringify(data);
        }

        // Check if the data is a string that may contain IP addresses
        if (typeof data === 'string' && (data.includes('\n') || data.includes(','))) {
            return formatIpString(data); // Format the string with line breaks
        }

        return data ?? ''; // Fallback to empty string if data is null/undefined
    };

    // Handle input change for textarea
    const handleInputChange = (e) => {
        setNumbersInput(e.target.value);
    };
    const handleInputChangeSeid = (e) => {
        setSeidInput(e.target.value);
    };

    const handleHssChange = (e) => {
        setHssProfile(e.target.value);
    };

    const handleHlrChange = (e) => {
        setHlrProfile(e.target.value);
    };


    const handleClear = () => {
        clearFunctions.forEach(func => dispatch(func()));
    };


    const handleSubmitCheckUP = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = seidInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(Pgw_SubInfo_UP_View(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };


    const handleSubmitMtas = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(MtasSubInfoFullView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleCheckCudborUdrView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(CheckCudborUdrView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };


    const handleSubmitIms = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(ImsSubInfoFullView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleHssSubInfoFullView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(HssSubInfoFullView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleHlrSubInfoFullView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(HlrSubInfoFullView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };


    const handleSubmitPgwSubInfoFullView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgwSubInfoFullView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }

    };

    const handleSubmitPgw_Sub_Info_Sacc_View = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(Pgw_Sub_Info_Sacc_View(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }

    };


    const handleSubmitMmeSubDeleteView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(MmeSubDeleteView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }

    };

    const handleSubmitMmeSubInfoFullView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(MmeSubInfoFullView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }

    };
    // Handle create trace pgưes with numbers array
    const handleTracePgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgweGreateTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };
    const handleTraceUpPgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgweGreateTraceUpSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };
    const handleStopTracePgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgweStopTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleStopTraceUpPgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgweStopTraceUpSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };


    const handleShowTracePgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgweShowTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleShowTraceUpPgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgweShowTraceUpSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };
    const handleGetTracePgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgwGetTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleGetTraceUpPgwes = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace pgwes
            dispatch(PgwGetTraceUpSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    // Handle create trace mmees with numbers array
    const handleTraceMmees = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace mmees
            dispatch(MmeeGreateTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleMmeGetEbmLogView = () => {
        dispatch(MmeGetEbmLogView());  // Pass profile and numbers array

    };

    // Handle stop trace mmees with numbers array
    const handleStopTraceMmees = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace mmees
            dispatch(MmeeStopTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleShowTraceMmees = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace mmees
            dispatch(MmeeShowTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleGetTraceMmeesImmediatelly = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace mmees
            dispatch(MmeeGetTraceSubImmediatellyView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };

    const handleGetTraceMmees = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (numbersArray.length > 0) {
            // Dispatch action or API call for creating trace mmees
            dispatch(MmeeGetTraceSubView(numbersArray));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid numbers.");
        }
    };


    // Handle setting HSS profile with numbers array
    const handleSetHssProfile = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (hssProfile && numbersArray.length > 0) {
            console.log(`Setting HSS profile: ${hssProfile} for numbers: ${numbersArray}`);
            // Dispatch action or API call for setting the HSS profile
            dispatch(setProfileHss({ hssProfile, numbersArray }));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid HSS profile and numbers.");
        }
    };

    // Handle setting HLR profile with numbers array
    const handleSetHlrProfile = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (hlrProfile && numbersArray.length > 0) {
            console.log(`Setting HLR profile: ${hlrProfile} for numbers: ${numbersArray}`);
            // Dispatch action or API call for setting the HLR profile
            dispatch(setProfileHlr({ hlrProfile, numbersArray }));  // Pass profile and numbers array
        } else {
            console.log("Please enter valid HLR profile and numbers.");
        }
    };


    // Handle button click to submit numbers
    const handleSubmitCheckSub = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(postGetInfoSub(numbersArray));
    };

    // Handle button click to submit numbers
    const handleSubmitCheckPgwSub = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(PgwSubInfo(numbersArray));
    };

    const handleSubmitCheckSapc = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(sapcSubInfoView(numbersArray));
    };

    const handleSapcSubDeleteView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(sapcSubDeleteView(numbersArray));
    };

    const handleSapcSubCreateView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(SapcSubCreateView(numbersArray));
    };

    const handlePcrfShowSubView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(PcrfShowSubView(numbersArray));
    };

    const handlePcrfCreateTraceView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(PcrfCreateTraceView(numbersArray));
    };

    const handlePcrfStopGetTraceView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(PcrfStopGetTraceView(numbersArray));
    };

    const handlePcrfShowTraceView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(PcrfShowTraceView(numbersArray));
    };

    const [selectedValue, setSelectedValue] = useState("mmee1a"); // Initial selected value

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value); // Update selected value
    };


    const handleMoveSubrofile = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (selectedValue && numbersArray.length > 0) {
            dispatch(mmeSubMove({ selectedValue, numbersArray }));  // Pass profile and numbers array
        } else {
            console.log("Please enter validated mme value.");
        }
    };

    // Disable the Check button if numbersInput is empty
    const isCheckButtonDisabled = numbersInput.trim() === '';

    const isCheckButtonDisabledSeid = seidInput.trim() === '';


    if (status === 'loading') {
        return <div>Loading...</div>;
    }


    return (
        <React.Fragment>
            <Row>
                <Col sm={12}>
                    <Card>
                        <Card.Body>
                            {/* function button*/}
                            <Row>
                                <Col md={3}>
                                    {/* link click to display sub link below */}
                                    <Row className="pb-4">
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Link
                                                to="#"
                                                onClick={() => setAccordionKey(accordionKey !== 1 ? 1 : 0)}
                                                aria-controls="accordion1"
                                                aria-expanded={accordionKey === 1}
                                                style={{
                                                    color: accordionKey === 1 ? 'red' : 'blue', // Change color dynamically
                                                    textDecoration: 'none', // Optional styling
                                                }}
                                            >
                                                MME E//
                                            </Link>
                                            <Link
                                                to="#"
                                                onClick={() => setAccordionKey(accordionKey !== 2 ? 2 : 0)}
                                                aria-controls="accordion2"
                                                aria-expanded={accordionKey === 2}
                                                style={{
                                                    color: accordionKey === 2 ? 'red' : 'blue', // Change color dynamically
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Trace pgwe
                                            </Link>
                                            <Link
                                                to="#"
                                                onClick={() => setAccordionKey(accordionKey !== 3 ? 3 : 0)}
                                                aria-controls="accordion3"
                                                aria-expanded={accordionKey === 3}
                                                style={{
                                                    color: accordionKey === 3 ? 'red' : 'blue', // Change color dynamically
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Hss Hlr Ims
                                            </Link>

                                        </div>
                                    </Row>
                                    {/* List of MME function */}
                                    <Row>
                                        <Collapse in={accordionKey === 1}>
                                            <div id="accordion1">
                                                {/* {account?.user.username === 'linhtn' && ( */}
                                                <div>

                                                    <Button variant="primary" size="sm" onClick={handleTraceMmees} disabled={isCheckButtonDisabled} >Trace mmees</Button>
                                                    <Button variant="primary" size="sm" onClick={handleStopTraceMmees} disabled={isCheckButtonDisabled} >Stop</Button>
                                                    <Button variant="primary" size="sm" onClick={handleShowTraceMmees} disabled={isCheckButtonDisabled} >Show</Button>
                                                    <Button variant="primary" size="sm" onClick={handleGetTraceMmees} disabled={isCheckButtonDisabled} >Get</Button>
                                                    <Button variant="primary" size="sm" onClick={handleGetTraceMmeesImmediatelly} disabled={isCheckButtonDisabled} >Get last</Button>

                                                </div>
                                                {/* )} */}
                                                <div >
                                                    {account?.user.username === 'linhtn' && (

                                                        <Button variant="primary" size="sm" onClick={handleMmeGetEbmLogView}  >Get ebmlog</Button>

                                                    )}

                                                </div>
                                            </div>

                                        </Collapse>

                                    </Row>
                                    {/* List of PGW function */}
                                    <Row>

                                        <Collapse in={accordionKey === 2}>
                                            <div id="accordion2">
                                                <div>
                                                    <Button variant="primary" size="sm" onClick={handleTracePgwes} disabled={isCheckButtonDisabled} >Trace pgwes</Button>
                                                    <Button variant="primary" size="sm" onClick={handleStopTracePgwes} disabled={isCheckButtonDisabled} >Stop</Button>
                                                    <Button variant="primary" size="sm" onClick={handleShowTracePgwes} disabled={isCheckButtonDisabled} >Show</Button>
                                                    <Button variant="primary" size="sm" onClick={handleGetTracePgwes} disabled={isCheckButtonDisabled} >Get</Button>
                                                </div>
                                                <div>
                                                    <Button variant="primary" size="sm" onClick={handleTraceUpPgwes} disabled={isCheckButtonDisabled} >Trace Up</Button>
                                                    <Button variant="primary" size="sm" onClick={handleStopTraceUpPgwes} disabled={isCheckButtonDisabled} >Stop</Button>
                                                    <Button variant="primary" size="sm" onClick={handleShowTraceUpPgwes} disabled={isCheckButtonDisabled} >Show</Button>
                                                    <Button variant="primary" size="sm" onClick={handleGetTraceUpPgwes} disabled={isCheckButtonDisabled} >Get</Button>
                                                </div>

                                            </div>
                                        </Collapse>
                                    </Row>
                                    {/* List of HLR HSS IMS MTAS function */}
                                    <Row>
                                        <Collapse in={accordionKey === 3}>
                                            <div id="accordion3">
                                                <Button variant="primary" size="sm" onClick={handleHssSubInfoFullView} disabled={isCheckButtonDisabled} >Hss full</Button>
                                                <Button variant="primary" size="sm" onClick={handleHlrSubInfoFullView} disabled={isCheckButtonDisabled} >Hlr full</Button>
                                                <Button variant="primary" size="sm" onClick={handleSubmitIms} disabled={isCheckButtonDisabled} >Check ims</Button>
                                                <Button variant="primary" size="sm" onClick={handleSubmitMtas} disabled={isCheckButtonDisabled} >Check mtas</Button>
                                                <Button variant="primary" size="sm" onClick={handleCheckCudborUdrView} disabled={isCheckButtonDisabled} >Check cudb udr</Button>


                                            </div>
                                        </Collapse>
                                    </Row>

                                </Col>
                                {/* texbox */}
                                <Col md={2}>

                                    <Form.Group controlId="exampleForm.ControlTextarea1">
                                        <Form.Control as="textarea"
                                            placeholder="Nhập số cần tra cứu..."
                                            rows="4"
                                            value={numbersInput} // Bind state to the input
                                            onChange={handleInputChange} // Handle change
                                        />
                                    </Form.Group>

                                </Col>
                                {/* list of checking function */}
                                <Col md={2}>
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckSub} disabled={isCheckButtonDisabled} >Check mme</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitMmeSubInfoFullView} disabled={isCheckButtonDisabled} >Full</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitMmeSubDeleteView} disabled={isCheckButtonDisabled} >Delete</Button>
                                    </Row>
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckPgwSub} disabled={isCheckButtonDisabled} >Check pgw</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitPgwSubInfoFullView} disabled={isCheckButtonDisabled} >Full</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitPgw_Sub_Info_Sacc_View} disabled={isCheckButtonDisabled} >Sacc</Button>
                                    </Row>
                                    <Row>
                                        {/* <Button variant="primary" size="sm" onClick={handleSubmitCheckSapc} disabled={isCheckButtonDisabled} >Check gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubDeleteView} disabled={isCheckButtonDisabled} >Delete gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubCreateView} disabled={isCheckButtonDisabled} >Create gói</Button> */}
                                        <Button variant="primary" size="sm" onClick={handlePcrfShowSubView} disabled={isCheckButtonDisabled} >check pcrf</Button>
                                        <Button variant="primary" size="sm" onClick={handlePcrfCreateTraceView} disabled={isCheckButtonDisabled} >create trace pcrf</Button>
                                        <Button variant="primary" size="sm" onClick={handlePcrfShowTraceView} disabled={isCheckButtonDisabled} >show trace pcrf</Button>
                                        <Button variant="primary" size="sm" onClick={handlePcrfStopGetTraceView} disabled={isCheckButtonDisabled} >stop get trace pcrf</Button>
                                    </Row>
                                </Col>
                                {/* move sub drop down list */}
                                <Col md={2}>
                                    <InputGroup className="mb-3 ">
                                        <FormControl as="select"
                                            aria-describedby="custom-addons4"
                                            className="custom-select"
                                            value={selectedValue} // Set selected value
                                            onChange={handleSelectChange} // Handle selection change

                                        >
                                            <option>mmee1a</option>
                                            <option>mmee1b</option>
                                            <option>mmee1d</option>
                                            <option>mmee1e</option>
                                            <option>mmee1f</option>
                                            <option>mmee1g</option>
                                            <option>mmee1h</option>
                                            <option>mmee1i</option>
                                            <option>mmee1k</option>
                                            <option>mmeet1a</option>
                                            <option>mmeet1b</option>

                                        </FormControl>
                                        <InputGroup.Append>
                                            <Button id="custom-addons4" onClick={handleMoveSubrofile} disabled={isCheckButtonDisabled}>Chuyển</Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Col>
                                {/* set hss hlr profile */}
                                <Col md={2}>
                                    <InputGroup className="mb-3">
                                        <FormControl
                                            placeholder="profile hss"
                                            onChange={handleHssChange}  // Handle change
                                            aria-label="profile hss"
                                            aria-describedby="basic-addon2"
                                        />
                                        <InputGroup.Append>
                                            <Button onClick={handleSetHssProfile} disabled={!hssProfile.trim()}>Set</Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <FormControl
                                            placeholder="profile hlr"
                                            onChange={handleHlrChange}  // Handle change
                                            aria-label="profile hlr"
                                            aria-describedby="basic-addon2"
                                        />
                                        <InputGroup.Append>
                                            <Button onClick={handleSetHlrProfile} disabled={!hlrProfile.trim()}>Set</Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Col>
                            </Row>
                            {/* clear all ++  seid check */}
                            <Row>
                                <Col md={3}>
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleClear} disabled={isCheckButtonDisabled} >Clear</Button>
                                    </Row>

                                </Col>
                                <Col md={2}>

                                    <Form.Group controlId="exampleForm.ControlTextarea1">
                                        <Form.Control as="textarea"
                                            placeholder="Nhập seid"
                                            rows="1"
                                            value={seidInput} // Bind state to the input
                                            onChange={handleInputChangeSeid} // Handle change
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckUP} disabled={isCheckButtonDisabledSeid} >Check UP</Button>
                                    </Row>
                                </Col>
                                <Col md={2}>


                                </Col>

                                <Col md={2}>

                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                {/* display check mme result */}

                <Col sm={12}>
                    <Row>
                        <Col>
                            <Card>
                                {/* Loop over each sub and render a table for each one */}
                                {subs?.length > 0 &&
                                    subs.map((sub, subIndex) => (
                                        <div
                                            key={subIndex}
                                            style={{
                                                overflowX: 'auto', // Add horizontal scrolling
                                                whiteSpace: 'nowrap', // Prevent cell content from wrapping
                                                marginBottom: '16px', // Optional spacing between tables
                                            }}
                                        >
                                            <Table className="table-custom1 mb-4">
                                                {/* Table header */}
                                                <thead className="table-primary table-custom1">
                                                    <tr>
                                                        {Object.keys(sub)
                                                            .filter((key) => !excludedFields.includes(key))
                                                            .map((key) => (
                                                                <th key={key}>
                                                                    {toFriendlyName(key)}
                                                                </th>
                                                            ))}
                                                    </tr>
                                                </thead>

                                                {/* Table body */}
                                                <tbody>
                                                    <tr>
                                                        {Object.keys(sub)
                                                            .filter((key) => !excludedFields.includes(key))
                                                            .map((key) => (
                                                                <td key={key}>
                                                                    {typeof sub[key] === 'boolean'
                                                                        ? formatBoolean(sub[key])
                                                                        : key.includes('date') || key.includes('time')
                                                                            ? formatDate(sub[key])
                                                                            : renderCell(sub[key], key)}
                                                                </td>
                                                            ))}
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </div>
                                    ))}
                            </Card>
                        </Col>
                    </Row>
                </Col>
                {/* <Col sm={12}>
                    <Row>
                        <Col>
                            <Card>
                                {subs?.length > 0 &&
                                    subs.map((sub, subIndex) => {
                                        // Define the number of columns per table
                                        const columnsPerTable = 10; // Change this to your desired number of columns
                                        const keys = Object.keys(sub).filter((key) => !excludedFields.includes(key));

                                        // Split keys into groups of `columnsPerTable`
                                        const columnGroups = [];
                                        for (let i = 0; i < keys.length; i += columnsPerTable) {
                                            columnGroups.push(keys.slice(i, i + columnsPerTable));
                                        }

                                        return (
                                            <div key={subIndex} className="mb-4">
                                                {columnGroups.map((group, groupIndex) => (
                                                    <Table key={groupIndex} className="table-custom1 mb-4">
                                                        <thead className="table-primary table-custom1">
                                                            <tr>
                                                                {group.map((key) => (
                                                                    <th key={key}>{toFriendlyName(key)}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                {group.map((key) => (
                                                                    <td key={key}>
                                                                        {typeof sub[key] === 'boolean'
                                                                            ? formatBoolean(sub[key])
                                                                            : key.includes('date') || key.includes('time')
                                                                                ? formatDate(sub[key])
                                                                                : renderCell(sub[key], key)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                ))}
                                            </div>
                                        );
                                    })}
                            </Card>
                        </Col>
                    </Row>
                </Col> */}


            </Row>
            {/* Display other check result */}
            <Row>
                <>
                    {gettracemmees.length > 0 && (
                        <Col sm={6}>
                            <Card>
                                <Card.Body>
                                    <h5>Download mme ready</h5>
                                    <ul>
                                        {gettracemmees[0] && Object.entries(gettracemmees[0]).map(([device, link], idx) => (
                                            <li key={idx}>
                                                <a
                                                    href={`${SERVER_MEDIA}/download${link}`}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download result for {device}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                    {gettracemmeesimmediatelly.length > 0 && (
                        <Col sm={6}>
                            <Card>
                                <Card.Body>
                                    <h5>Download trace mme last</h5>
                                    <ul>
                                        {gettracemmeesimmediatelly[0] && Object.entries(gettracemmeesimmediatelly[0]).map(([device, link], idx) => (
                                            <li key={idx}>
                                                <a
                                                    href={`${SERVER_MEDIA}/download${link}`}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download result for {device}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                </>
            </Row>
            <Row>
                {Displaylist}
            </Row>
            <Row>


                {/* 
                {((imsSubInfoFulls && imsSubInfoFulls.length > 0) || (mtasSubInfoFulls && mtasSubInfoFulls.length > 0)) && (

                    <Col sm={12}>
                        <Card>
                            <Card.Body>
                                <Row>

                                    <Col md={6}>
                                        {imsSubInfoFulls && imsSubInfoFulls.length > 0 && imsSubInfoFulls.map((imsSubInfoFull, subIndex) => (
                                            <SapcDisplay data={imsSubInfoFull} />
                                        ))}
                                    </Col>
                                    <Col md={6}>
                                        {mtasSubInfoFulls && mtasSubInfoFulls.length > 0 && mtasSubInfoFulls.map((mtasSubInfoFull, subIndex) => (
                                            <SapcDisplay data={mtasSubInfoFull} />
                                        ))}
                                    </Col>

                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                )}
                {((hssSubInfoFulls && hssSubInfoFulls.length > 0) || (hlrSubInfoFulls && hlrSubInfoFulls.length > 0)) && (

                    <Col sm={12}>
                        <Card>
                            <Card.Body>
                                <Row>

                                    <Col md={6}>
                                        {hssSubInfoFulls && hssSubInfoFulls.length > 0 && hssSubInfoFulls.map((hssSubInfoFull, subIndex) => (
                                            <SapcDisplay data={hssSubInfoFull} />
                                        ))}
                                    </Col>
                                    <Col md={6}>
                                        {hlrSubInfoFulls && hlrSubInfoFulls.length > 0 && hlrSubInfoFulls.map((hlrSubInfoFull, subIndex) => (
                                            <SapcDisplay data={hlrSubInfoFull} />
                                        ))}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                )}
                {((tracemmees && tracemmees.length > 0) || (stoptracemmees && stoptracemmees.length > 0) || (showtracemmees && showtracemmees.length > 0)) && (

                    <Col sm={12}>
                        <Card>
                            <Card.Body>
                                <Row>

                                    <Col md={4}>
                                        {tracemmees && tracemmees.length > 0 && tracemmees.map((tracemmee, subIndex) => (

                                            <DataDisplay data={tracemmee} />
                                        ))}
                                    </Col>
                                    <Col md={4}>
                                        {stoptracemmees && stoptracemmees.length > 0 && stoptracemmees.map((stoptracemmee, subIndex) => (
                                            <SapcDisplay data={stoptracemmee} />
                                        ))}
                                    </Col>
                                    <Col md={4}>
                                        {showtracemmees && showtracemmees.length > 0 && showtracemmees.map((showtracemmee, subIndex) => (
                                            <SapcDisplay data={showtracemmee} />
                                        ))}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                {((tracepgwes && tracepgwes.length > 0) || (stoptracepgwes && stoptracepgwes.length > 0) || (showtracepgwes && showtracepgwes.length > 0)) && (

                    <Col sm={12}>
                        <Card>
                            <Card.Body>
                                <Row>

                                    <Col md={4}>
                                        {tracepgwes && tracepgwes.length > 0 && tracepgwes.map((tracemmee, subIndex) => (

                                            <DataDisplay data={tracemmee} />
                                        ))}
                                    </Col>
                                    <Col md={4}>
                                        {stoptracepgwes && stoptracepgwes.length > 0 && stoptracepgwes.map((stoptracemmee, subIndex) => (
                                            <SapcDisplay data={stoptracemmee} />
                                        ))}
                                    </Col>
                                    <Col md={4}>
                                        {showtracepgwes && showtracepgwes.length > 0 && showtracepgwes.map((showtracemmee, subIndex) => (
                                            <SapcDisplay data={showtracemmee} />
                                        ))}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                {((pgwsubs && pgwsubs.length > 0) || (getinfoPgweUpFulls && getinfoPgweUpFulls.length > 0)
                    || (getinfoPgw_Sub_Info_Saccs && getinfoPgw_Sub_Info_Saccs.length > 0)
                ) && (

                        <Col sm={12}>
                            <Card>
                                <Card.Body>
                                    <Row>

                                        <Col md={4}>
                                            {pgwsubs && pgwsubs.length > 0 && pgwsubs.map((subs, subIndex) => (

                                                <DataDisplay data={subs} />
                                            ))}
                                        </Col>
                                        {getinfoPgweUpFulls && getinfoPgweUpFulls.length > 0 && getinfoPgweUpFulls.map((getinfoPgweUpFull, subIndex) => (

                                            <Col md={4}>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleDownload(getinfoPgweUpFulls, 'pgwup_data')}
                                                    className="mb-2"
                                                >
                                                    Download
                                                </Button>

                                                <DataDisplay data={getinfoPgweUpFull} />

                                            </Col>
                                        ))}


                                        {getinfoPgw_Sub_Info_Saccs && getinfoPgw_Sub_Info_Saccs.length > 0 && getinfoPgw_Sub_Info_Saccs.map((getinfoPgw_Sub_Info_Sacc, subIndex) => (

                                            <Col md={4}>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleDownload(getinfoPgw_Sub_Info_Saccs, 'pgw_sacc_data')}
                                                    className="mb-2"
                                                >
                                                    Download PGW Sacc Data
                                                </Button>

                                                <DataDisplay data={getinfoPgw_Sub_Info_Sacc} />

                                            </Col>
                                        ))}

                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                    )}
                {((sapcs && sapcs.length > 0)) && (

                    <Col sm={12}>
                        <Card>
                            <Card.Body>
                                <Row>

                                    <Col md={6}>
                                        {sapcs && sapcs.length > 0 && sapcs.map((sapcs, subIndex) => (
                                            <SapcDisplay data={sapcs} />
                                        ))}
                                    </Col>

                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                )}
                {((getinfommeefulls && getinfommeefulls.length > 0) || (getinfoPgweFulls && getinfoPgweFulls.length > 0)) && (

                    <Col sm={12}>
                        <Card>
                            <Card.Body>
                                <Row>

                                    <Col md={6}>
                                        {getinfommeefulls && getinfommeefulls.length > 0 && getinfommeefulls.map((getinfommeefull, subIndex) => (

                                            <DataDisplay data={getinfommeefull} />
                                        ))}
                                    </Col>
                                    <Col md={6}>
                                        {getinfoPgweFulls && getinfoPgweFulls.length > 0 && getinfoPgweFulls.map((getinfoPgweFull, subIndex) => (
                                            <SapcDisplay data={getinfoPgweFull} />
                                        ))}
                                    </Col>

                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                )} */}




            </Row>

        </React.Fragment>
    );
};

export default FormsElements;
