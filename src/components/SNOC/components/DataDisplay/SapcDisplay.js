import React from 'react';

// const highlightTerms = (text) => {
//     const patterns = [
//         { regex: /\bm3-world\b/g, className: 'highlight-darkblue' },
//         { regex: /\bims\b/g, className: 'highlight-darkblue' }, // No replacement specified, use the original term
//         { regex: /\bserving-node-in-use\b/g, replacement: "Serving Node", className: 'highlight-green' },
//         { regex: /\bgateway-node-in-use\b/g, replacement: "Gateway Node", className: 'highlight-green' },
//         { regex: /\bimsi\b|\bmsisdn\b|\bapn-in-use\b|\buser-plane-seid\b|\bdefault-bearer-qci\b/gi, replacement: (match) => match, className: 'highlight-blue' },
//         { regex: /\bcontrol-plane\b/g, replacement: "CP", className: 'highlight-green' },
//         { regex: /\buser-plane\b/g, replacement: "UP", className: 'highlight-green' },
//         { regex: /\bPGW_U_E1E|\bPGW_U_E1F|\bPGW_U_E1G|\bPGW_U_E1H|\bPGW_U_E1I|\bPGW_U_E1K|\bPGWE_1C|\bPGWE_1D|\bPGWE_1A|\bPGWE_1B|\bPGW_U_ET1A/g, className: 'highlight-red' },
//         { regex: /\bPGW_C_E1E|\bPGW_C_E1F|\bPGW_C_E1G|\bPGW_C_E1H|\bPGW_C_E1I|\bPGW_C_E1K|\bPGW_C_ET1A|\bPGW_C_ET1B/g, className: 'highlight-red' },
//         { regex: /\bSGW_C_E1E|\bSGW_C_E1F|\bSGW_C_E1G|\bSGW_C_E1H|\bSGW_C_E1I|\bSGW_C_E1K|\bSGW_C_ET1A|\bSGW_C_ET1B/g, className: 'highlight-red' },
//         { regex: /\bSGW_U_E1E|\bSGW_U_E1F|\bSGW_U_E1G|\bSGW_U_E1H|\bSGW_U_E1I|\bSGW_U_E1K|\bSGW_U_ET1A/g, className: 'highlight-red' },

//     ];

//     let formattedText = text;

//     // Replace all patterns in the text with highlighted and replaced versions
//     patterns.forEach(pattern => {
//         formattedText = formattedText.replace(pattern.regex, (match) => {
//             const replacementText = typeof pattern.replacement === 'function'
//                 ? pattern.replacement(match) // If replacement is a function, use it
//                 : pattern.replacement || match; // Use replacement string, or fall back to the original match

//             return `<span class="${pattern.className}">${replacementText}</span>`;
//         });
//     });

//     return formattedText;
// };



// const formatIpString = (ipString) => {
//     return (
//         <React.Fragment>
//             <div className="data-display-container">
//                 {ipString.split(/[\n]+/).map((line, index) => {
//                     // Split each line by the first colon to get key and value
//                     const [key, ...valueParts] = line.split(':');
//                     const value = valueParts.join(':').trim(); // Re-join in case there are multiple colons in value

//                     return (
//                         <div className="data-field" key={index}>
//                             <span
//                                 className="key-field"
//                                 dangerouslySetInnerHTML={{ __html: highlightTerms(key.trim()) }} // Apply highlightTerms to the key
//                             />
//                             <span
//                                 className="value-field"
//                                 dangerouslySetInnerHTML={{ __html: highlightTerms(value) }} // Apply highlightTerms to the value
//                             />
//                         </div>
//                     );
//                 })}
//             </div>
//         </React.Fragment>

//     );
// };

// // Updated renderCell function
// const renderCell = (data) => {
//     if (typeof data === 'object' && data !== null) {
//         // Adjust this to display the desired field from the nested object
//         return data.name ? data.name : JSON.stringify(data);
//     }

//     // Check if the data is a string that may contain IP addresses
//     if (typeof data === 'string' && (data.includes('\n') || data.includes(','))) {
//         return formatIpString(data); // Format the string with line breaks
//     }

//     return data ?? ''; // Fallback to empty string if data is null/undefined
// };

// const formatData = (data) => {
//     return Object.entries(data).map(([key, value]) => {
//         if (typeof value === 'object' && value !== null) {
//             return (
//                 <div key={key}>
//                     <strong>{key}:</strong>
//                     <div style={{ marginLeft: '20px' }}>
//                         {formatData(value)}
//                     </div>
//                 </div>
//             );
//         } else {
//             return (
//                 <div key={key}>
//                     <div><strong>{key}:</strong>
//                     </div>
//                     <div>
//                         {renderCell(value)}
//                     </div>
//                 </div>
//             );
//         }
//     });
// };

// const DataDisplay = ({ data }) => {
//     return (
//         <div>
//             {formatData(data)}
//         </div>
//     );
// };

// export default DataDisplay;



const highlightTerms = (text) => {
    const patterns = [
        { regex: /\bWIFIVIP\b/g, className: 'highlight-darkblue' },
        { regex: /\bims\b/g, className: 'highlight-darkblue' },
        { regex: /\bserving-node-in-use\b/g, replacement: "Serving Node", className: 'highlight-green' },
        { regex: /\bgateway-node-in-use\b/g, replacement: "Gateway Node", className: 'highlight-green' },
        { regex: /\bimsi\b|\bmsisdn\b|\bapn-in-use\b|\buser-plane-seid\b|\bdefault-bearer-qci\b/gi, replacement: (match) => match, className: 'highlight-blue' },
        { regex: /\bcontrol-plane\b/g, replacement: "CP", className: 'highlight-green' },
        { regex: /\buser-plane\b/g, replacement: "UP", className: 'highlight-green' },
    ];

    let formattedText = text;

    patterns.forEach(pattern => {
        formattedText = formattedText.replace(pattern.regex, (match) => {
            const replacementText = typeof pattern.replacement === 'function'
                ? pattern.replacement(match)
                : pattern.replacement || match;

            return `<span class="${pattern.className}">${replacementText}</span>`;
        });
    });

    return formattedText;
};

const formatIpString = (ipString) => {
    return (
        <div className="data-display-container">
            {ipString.split(/[\n]+/).map((line, index) => {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();

                return (
                    <div className="data-field" key={index}>
                        <span
                            className="key-field"
                            dangerouslySetInnerHTML={{ __html: highlightTerms(key.trim()) }}
                        />
                        <span
                            className="value-field"
                            dangerouslySetInnerHTML={{ __html: highlightTerms(value) }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const renderCell = (data) => {
    if (Array.isArray(data)) {
        return (
            <div style={{ marginLeft: '20px' }}>
                {data.map((item, index) => (
                    <div key={index}>{renderCell(item)}</div>
                ))}
            </div>
        );
    }

    if (typeof data === 'object' && data !== null) {
        return (
            <div style={{ marginLeft: '20px' }}>
                {formatData(data)}
            </div>
        );
    }

    if (typeof data === 'string' && (data.includes('\n') || data.includes(','))) {
        return formatIpString(data);
    }

    return data ?? '';
};

const formatData = (data) => {
    if (Array.isArray(data)) {
        return data.map((item, index) => (
            <div key={index}>
                {formatData(item)}
            </div>
        ));
    }

    return Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value)) {
            return (
                <div key={key}>
                    <strong>{key}:</strong>
                    <div style={{ marginLeft: '20px' }}>
                        {value.map((item, index) => (
                            <div key={index}>{renderCell(item)}</div>
                        ))}
                    </div>
                </div>
            );
        } else if (typeof value === 'object' && value !== null) {
            return (
                <div key={key}>
                    <strong>{key}:</strong>
                    <div style={{ marginLeft: '20px' }}>
                        {formatData(value)}
                    </div>
                </div>
            );
        } else {
            return (
                <div key={key}>
                    <strong>{key}:</strong> {renderCell(value)}
                </div>
            );
        }
    });
};

const DataDisplay = ({ data }) => {
    return (
        <div>
            {formatData(data)}
        </div>
    );
};

export default DataDisplay;
