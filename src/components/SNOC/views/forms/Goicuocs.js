import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Row, Col, Card, Table, Form, Button, InputGroup, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';
// import { Row, Col, Card, Table, Button } from 'react-bootstrap';

// import { Collapse } from 'react-bootstrap';
// import { Link } from 'react-router-dom';

// import MmeTable from '../tables _ps/MmeTable';
import {
    clearSapcSubCreateView, SapcSubCreateView,
    clearSapcSubDeleteView, sapcSubDeleteView, sapcSubInfoView, clearSapcs,
    clearHssSubEnableVolteView, hssSubEnableVolteView,
    clearSapcSubSetPackageView, SapcSubSetPackageView
} from '../../redux/Sub/subSlice';
// import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
import DataDisplay from '../../components/DataDisplay/FormattedText';
import SapcDisplay from '../../components/DataDisplay/SapcDisplay';
import CollapsibleCard from '../../components/DataDisplay/CollapsibleCard';
const Goicuocs = () => {




    const dispatch = useDispatch();

    const [numbersInput, setNumbersInput] = useState(''); // State for Number input
    const subs = useSelector((state) => state.sub.subs);


    const {
        sapcs = [],
        status = '',
        sapcdeletesubs = [],
        sapccreatesubs = [],
        hssenablevoltesubs = [],
        sapcsetsubs = []

    } = useSelector((state) => state.sub ?? {}); // ⬅️ ensures state.sub isn't null


    const clearFunctions = useMemo(() => [

        clearSapcs,
        clearSapcSubDeleteView,
        clearSapcSubCreateView,
        clearHssSubEnableVolteView,
        clearSapcSubSetPackageView,
    ], []);

    // Example reusable function
    // const isAnyNullOrUndefined = (items) => items.some(item => item === null || item === undefined);

    useEffect(() => {
        // if (isAnyNullOrUndefined(allItems)) {
        //     console.log('Some items are null or undefined');
        // }
        clearFunctions.forEach(func => dispatch(func()));
    }, [dispatch, clearFunctions]);

    const originalOptions = [
        { outputtype: sapcs, displaytype: SapcDisplay, name: 'get sapcs' },

        { outputtype: sapcdeletesubs, displaytype: DataDisplay, name: 'Delete sub cudb' },
        { outputtype: sapccreatesubs, displaytype: DataDisplay, name: 'Create sub cudb' },
        // { outputtype: hssenablevoltesubs, displaytype: DataDisplay, name: 'enable volte sub hss' },
        { outputtype: sapcsetsubs, displaytype: DataDisplay, name: 'Set sub package' }

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


    const handleClear = () => {
        clearFunctions.forEach(func => dispatch(func()));
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



    const [selectedPackage, setSelectedPakage] = useState("__"); // Initial selected value

    const handleSelectPakageChange = (event) => {
        setSelectedPakage(event.target.value); // Update selected value
    };


    const handleSapcSubCreateView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (selectedPackage && numbersArray.length > 0) {
            dispatch(SapcSubCreateView({ selectedPackage, numbersArray }));  // Pass profile and numbers array
        } else {
            console.log("Please enter validated mme value.");
        }
    };

    const handleSapcSubSetPackageView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/)
            .map(num => num.trim())
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        if (selectedPackage && numbersArray.length > 0) {
            dispatch(SapcSubSetPackageView({ selectedPackage, numbersArray }));  // Pass profile and numbers array
        } else {
            console.log("Please enter validated mme value.");
        }
    };


    const handleHssSubEnableVolteView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(hssSubEnableVolteView(numbersArray));
    };




    // Disable the Check button if numbersInput is empty
    const isCheckButtonDisabled = numbersInput.trim() === '';

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
                                    {/* <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckSub} disabled={isCheckButtonDisabled} >Check mme</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitMmeSubInfoFullView} disabled={isCheckButtonDisabled} >Full</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitMmeSubDeleteView} disabled={isCheckButtonDisabled} >Delete</Button>
                                    </Row>
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckPgwSub} disabled={isCheckButtonDisabled} >Check pgw</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitPgwSubInfoFullView} disabled={isCheckButtonDisabled} >Full</Button>
                                        <Button variant="primary" size="sm" onClick={handleSubmitPgw_Sub_Info_Sacc_View} disabled={isCheckButtonDisabled} >Sacc</Button>
                                    </Row> */}
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckSapc} disabled={isCheckButtonDisabled} >Check gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubDeleteView} disabled={isCheckButtonDisabled} >Delete gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubCreateView} disabled={isCheckButtonDisabled} >Create gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleHssSubEnableVolteView} disabled={isCheckButtonDisabled} >Create subvolte Hss</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubSetPackageView} disabled={isCheckButtonDisabled} >Set gói</Button>
                                    </Row>
                                </Col>
                                {/* move sub drop down list */}
                                <Col md={2}>
                                    <InputGroup className="mb-3 ">
                                        <FormControl as="select"
                                            aria-describedby="custom-addons4"
                                            className="custom-select"
                                            value={selectedPackage} // Set selected value
                                            onChange={handleSelectPakageChange} // Handle selection change

                                        >
                                            <option>__</option>
                                            <option>VoLTE_group</option>
                                            <option>BIG_DPM</option>
                                            <option>BIG-IT</option>
                                            <option>MAX_Speed128_64</option>
                                            <option>MAX_Speed5120_2560</option>
                                            <option>MAX_Speed256_128</option>
                                            <option>X</option>
                                            <option>VIP</option>
                                            <option>DIP_Meta</option>
                                            <option>KMD</option>
                                            <option>FB_limit</option>
                                            <option>PAYGO</option>
                                            <option>Def_Roaming2</option>
                                            <option>RX</option>
                                            <option>DRX</option>
                                            <option>VIP_Roaming</option>
                                            <option>SubcriberUnknown</option>
                                            <option>Family</option>
                                            <option>WIFIBIG</option>
                                            <option>MAX-I-Condition</option>
                                            <option>HOME</option>
                                            <option>DE-Free</option>
                                            <option>MI_MYTV</option>
                                            <option>WIFIBIG</option>
                                            <option>LTime_Limit</option>
                                            <option>DAYNIGHT_5M2M</option>

                                        </FormControl>
                                        <InputGroup.Append>
                                            {/* <Button id="custom-addons4" onClick={handleMoveSubrofile} disabled={isCheckButtonDisabled}>Chuyển</Button> */}
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Col>
                                {/* set hss hlr profile */}
                                <Col md={2}>
                                    {/* <InputGroup className="mb-3">
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
                                    </InputGroup> */}
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

                                    {/* <Form.Group controlId="exampleForm.ControlTextarea1">
                                        <Form.Control as="textarea"
                                            placeholder="Nhập seid"
                                            rows="1"
                                            value={seidInput} // Bind state to the input
                                            onChange={handleInputChangeSeid} // Handle change
                                        />
                                    </Form.Group> */}
                                </Col>
                                <Col md={2}>
                                    {/* <Row>
                                        <Button variant="primary" size="sm" onClick={handleSubmitCheckUP} disabled={isCheckButtonDisabledSeid} >Check UP</Button>
                                    </Row> */}
                                </Col>
                                <Col md={2}>


                                </Col>

                                <Col md={2}>

                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>




            </Row>
            {/* Display other check result */}
            <Row>
                {Displaylist}
            </Row>
            <Row>

            </Row>

        </React.Fragment>
    );
};

export default Goicuocs;
