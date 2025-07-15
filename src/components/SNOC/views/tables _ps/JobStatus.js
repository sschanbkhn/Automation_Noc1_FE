import React, { useState, useEffect } from 'react';

function JobStatus({ jobId }) {
    const [status, setStatus] = useState('pending');
    const [output, setOutput] = useState('');

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:5000/ws/job/${jobId}/`);

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.status) {
                setStatus(data.status);
            }
            if (data.output) {
                setOutput(data.output);
            }
        };

        socket.onclose = function (event) {
            console.error('WebSocket closed unexpectedly');
        };

        return () => {
            socket.close();
        };
    }, [jobId]);

    return (
        <div>
            <h3>Job Status: {status}</h3>
            <pre>{output}</pre>
        </div>
    );
}

export default JobStatus;
