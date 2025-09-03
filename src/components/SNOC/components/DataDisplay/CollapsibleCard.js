import React, { useState } from 'react';
import { Card, Button, Collapse } from 'react-bootstrap';

const CollapsibleCard = ({ button }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleCollapse = () => setIsOpen(!isOpen);
    const handleDownload = (data, filename) => {
        const formattedData = data.map(item => {
            if (typeof item === 'object') {
                // Convert object to formatted string and replace escaped newline characters with actual newlines
                return JSON.stringify(item, null, 2).replace(/\\n/g, '\n');
            }
            return item;
        }).join('\n\n');

        const blob = new Blob([formattedData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <Card>
            <Card.Header style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', lineHeight: '1.2' }}>
                <Card.Title as="h5">{button.name}</Card.Title>
                <Button
                    variant="secondary"
                    onClick={() => handleDownload(button.outputtype, button.name)}
                    className="btn-ct"
                >
                    Download
                </Button>
                <Button
                    variant="link"
                    onClick={toggleCollapse}
                    aria-controls={`collapse-${button.name}`}
                    aria-expanded={isOpen}
                    className="ml-2"
                >
                    {isOpen ? 'Hide Details' : 'Show Details'}
                </Button>
            </Card.Header>
            <Collapse in={isOpen}>
                <div id={`collapse-${button.name}`} style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px' }}>
                    <Card.Body>
                        {button.outputtype && button.outputtype.length > 0
                            ? button.outputtype.map((value, subIndex) => (
                                <button.displaytype data={value} key={subIndex} />
                            ))
                            : <p>No data available</p>}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
};

export default CollapsibleCard;
