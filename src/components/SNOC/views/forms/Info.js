import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SERVER_MEDIA } from './../../config/constant';

import { Row, Col, Card, Table, Form, Button, InputGroup, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';
// import { Row, Col, Card, Table, Button } from 'react-bootstrap';

import { Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import MmeTable from '../tables _ps/MmeTable';

import {
    clearPgwHealthCheckView, PgwHealthCheckView
} from '../../redux/Sub/healthcheckSlice';
// import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
import DataDisplay from '../../components/DataDisplay/FormattedText';
import CollapsibleCard from '../../components/DataDisplay/CollapsibleCard';
const Info = () => {




    const dispatch = useDispatch();




    const {
        status = '',

        pgwhealthchecks = [],

    } = useSelector((state) => state.healthcheck ?? {}); // ⬅️ ensures state.healthcheck isn't null

    console.log(pgwhealthchecks)

    const clearFunctions = useMemo(() => [

        clearPgwHealthCheckView,
    ], []);


    useEffect(() => {

        clearFunctions.forEach(func => dispatch(func()));
    }, [dispatch, clearFunctions]);

    const originalOptions = [

        { outputtype: pgwhealthchecks, displaytype: DataDisplay, name: 'Healthcheck pgw' }

    ];

    const Displaylist = originalOptions.map((button, idx) => (
        ((button.outputtype && button.outputtype.length > 0)) && (
            <React.Fragment key={idx}>
                <Col md={6}>
                    <CollapsibleCard button={button} />
                </Col>
            </React.Fragment>
        )
    ));







    const handleClear = () => {
        clearFunctions.forEach(func => dispatch(func()));
    };


    const handlePgwHealthCheckView = () => {
        dispatch(PgwHealthCheckView());
    };








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


                                {/* list of checking function */}
                                <Col md={2}>

                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handlePgwHealthCheckView}  >HealthCheck PGW</Button>
                                    </Row>
                                </Col>

                            </Row>
                            {/* clear all ++  seid check */}
                            <Row>
                                <Col md={3}>
                                    <Row>
                                        <Button variant="primary" size="sm" onClick={handleClear}  >Clear</Button>
                                    </Row>

                                </Col>

                            </Row>
                        </Card.Body>
                    </Card>
                </Col>




            </Row>
            {/* Display other check result */}
            <Row>
                <Row>
                    {pgwhealthchecks.length > 0 && (
                        <Col sm={12}>
                            <Card>
                                <Card.Body>
                                    <h5>Download Healthcheck Results</h5>
                                    <ul>
                                        {pgwhealthchecks[0] && Object.entries(pgwhealthchecks[0]).map(([device, link], idx) => (
                                            <li key={idx}>
                                                {/* Link với đường dẫn đến file */}
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
                </Row>



            </Row>

        </React.Fragment>
    );
};

export default Info;
