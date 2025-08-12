import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Row, Col, Card, Table, Form, Button, InputGroup, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';
// import { Row, Col, Card, Table, Button } from 'react-bootstrap';

import { Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// import MmeTable from '../tables _ps/MmeTable';


import {
    clearMmeCountTacView, MmeCountTacView, clearMmeGetTacConfView, MmeGetTacConfView, clearMmeGetRncConfView, MmeGetRncConfView
} from '../../redux/Mmee/mmeeSlice';
// import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
import DataDisplay from '../../components/DataDisplay/FormattedText';
import SapcDisplay from '../../components/DataDisplay/SapcDisplay';
import CollapsibleCard from '../../components/DataDisplay/CollapsibleCard';
import { SERVER_MEDIA } from './../../config/constant';

const Mmee = () => {




    const dispatch = useDispatch();

    const [numbersInput, setNumbersInput] = useState(''); // State for Number input

    const account = useSelector((state) => state.account);


    const {
        status = '',
        gettaccounts = [],
        gettacconfigs = [],
        getrncconfigs = [],

    } = useSelector((state) => state.mmee ?? {}); // ⬅️ ensures state.sub isn't null

    const clearFunctions = useMemo(() => [

        clearMmeCountTacView,
        clearMmeGetTacConfView,
        clearMmeGetRncConfView,
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

        { outputtype: gettaccounts, displaytype: SapcDisplay, name: 'Get tac count' },
        { outputtype: gettacconfigs, displaytype: SapcDisplay, name: 'Get tac config' },
        { outputtype: getrncconfigs, displaytype: SapcDisplay, name: 'Get rnc config' },
    ];
    // const [reorderedOptions, setReorderedOptions] = useState(originalOptions);



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



    const handleMmeCountTacView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(MmeCountTacView(numbersArray));
    };




    const handleMmeGetTacConfView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(MmeGetTacConfView(numbersArray));
    };

    const handleMmeGetRncConfView = () => {
        // Extract numbers from textarea (split by line or comma)
        const numbersArray = numbersInput
            .split(/[\n,]/) // Split by newline or comma
            .map(num => num.trim()) // Trim spaces
            .filter(num => !isNaN(num) && num !== ''); // Ensure valid numbers

        // Dispatch the action with the numbers array
        dispatch(MmeGetRncConfView(numbersArray));
    };
    const [selectedValue, setSelectedValue] = useState("mmee1a"); // Initial selected value

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value); // Update selected value
    };
    const [selectedValue1, setSelectedValue1] = useState("mmee1a"); // Initial selected value

    const handleSelectChange1 = (event) => {
        setSelectedValue1(event.target.value); // Update selected value
    };


    const handleDownload = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', ''); // Tên file sẽ lấy từ response nếu header có Content-Disposition
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                            placeholder="Nhập TAC hoặc DPC của RNC..."
                                            rows="4"
                                            value={numbersInput} // Bind state to the input
                                            onChange={handleInputChange} // Handle change
                                        />
                                    </Form.Group>

                                </Col>
                                {/* list of checking function */}
                                <Col md={1}>
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
                                    {account?.user.username === 'linhtn' && (
                                        <Row>


                                            {/* <Button variant="primary" size="sm" onClick={handleSubmitCheckSapc} disabled={isCheckButtonDisabled} >Count</Button> */}
                                            <Button variant="primary" size="sm" onClick={handleMmeCountTacView} disabled={isCheckButtonDisabled} >Count</Button>
                                            <Button variant="primary" size="sm" onClick={handleMmeGetTacConfView} disabled={isCheckButtonDisabled} >Get Tac Conf</Button>
                                            <Button variant="primary" size="sm" onClick={handleMmeGetRncConfView} disabled={isCheckButtonDisabled} >Get Rnc Conf</Button>
                                            {/* <Button variant="primary" size="sm" onClick={handleSapcSubDeleteView} disabled={isCheckButtonDisabled} >Delete gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubCreateView} disabled={isCheckButtonDisabled} >Create gói</Button>
                                        <Button variant="primary" size="sm" onClick={handleHssSubEnableVolteView} disabled={isCheckButtonDisabled} >Create subvolte Hss</Button>
                                        <Button variant="primary" size="sm" onClick={handleSapcSubSetPackageView} disabled={isCheckButtonDisabled} >Set gói</Button> */}
                                        </Row>
                                    )}

                                </Col>
                                {/* move sub drop down list */}
                                <Col md={1}>
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

                                    </InputGroup>
                                </Col>
                                <Col md={1}>
                                    <InputGroup className="mb-3 ">
                                        <FormControl as="select"
                                            aria-describedby="custom-addons4"
                                            className="custom-select"
                                            value={selectedValue1} // Set selected value
                                            onChange={handleSelectChange1} // Handle selection change

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

                                    </InputGroup>
                                </Col>

                                <Col md={1}>

                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleMmeCountTacView} disabled={isCheckButtonDisabled} >Compare</Button>
                                    </Row>
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
            {account?.user.username === 'linhtn' && (
                <Row>
                    <ul>
                        {gettacconfigs.map((item, idx) => (
                            <li key={idx}>
                                <button
                                    className="btn btn-link p-0"
                                    onClick={() => handleDownload(`${SERVER_MEDIA}/download${item.result_file}`)}
                                >
                                    Download result for TAC {item.tac} on {item.host}
                                </button>
                            </li>
                        ))}
                    </ul>

                </Row>
            )}

            {account?.user.username === 'linhtn' && (
                <Row>
                    <ul>
                        {getrncconfigs.map((item, idx) => (
                            <li key={idx}>
                                <button
                                    className="btn btn-link p-0"
                                    onClick={() => handleDownload(`${SERVER_MEDIA}/download${item.result_file}`)}
                                >
                                    Download result for Rnc {item.dpc} on {item.host}
                                </button>
                            </li>
                        ))}
                    </ul>

                </Row>
            )}

            {/* Display other check result */}
            <Row>
                {Displaylist}
            </Row>
            <Row>

            </Row>

        </React.Fragment>
    );
};

export default Mmee;
