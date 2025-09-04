import React from 'react';
import { SERVER_MEDIA } from './../../config/constant';
import { Row, Col, Card, Table, Form, Button, InputGroup, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';

const DownloadDisplay = ({ data }) => {
    return (
        <>
            {data.length > 0 && (
                <Card>
                    <Card.Body>
                        <h5>Download Healthcheck Results</h5>
                        <ul>
                            {data[0] && Object.entries(data[0]).map(([device, link], idx) => (
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
            )}
        </>
    );
};

export default DownloadDisplay;
