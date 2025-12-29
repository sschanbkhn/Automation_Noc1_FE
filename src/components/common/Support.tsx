import React from 'react'
import { connect } from "react-redux";

interface Props {
       
}

const Support = (props: Props) => {  
    console.log('Support component rendered!');
    
    const handleDownload = (fileName: string) => {
        // File được serve từ thư mục public/assets/docx/
        const link = document.createElement('a');
        link.href = `/assets/docx/${fileName}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const documentList = [
        {
            title: 'Tài liệu Usecase Rnoc1',
            fileName: 'Rnoc1_document.rar',
            description: 'Tài liệu hướng dẫn sử dụng và usecase module RNOC1',
            icon: 'bi bi-file-earmark-zip'
        },
        {
            title: 'Usecase Tnoc1',
            fileName: 'TNOC1_document.rar',
            description: 'Tài liệu hướng dẫn sử dụng và usecase module TNOC1',
            icon: 'bi bi-file-earmark-zip'
        },
        {
            title: 'Usecase Inoc1',
            fileName: 'INOC1_Document.rar',
            description: 'Tài liệu hướng dẫn sử dụng và usecase module INOC1',
            icon: 'bi bi-file-earmark-zip'
        }
    ];

    return(
        <div className="container-fluid">
            <div className="card">
                <div className="card-header">
                    <h4>Tài liệu hỗ trợ</h4>
                </div>
                <div className="card-body">
                    <div className="row">
                        {documentList.map((doc, index) => (
                            <div key={index} className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm" style={{borderRadius: '8px'}}>
                                    <div className="card-body text-center d-flex flex-column">
                                        <i className={doc.icon} style={{
                                            fontSize: '48px',
                                            color: '#409EFF',
                                            marginBottom: '15px'
                                        }}></i>
                                        <h5 className="card-title">{doc.title}</h5>
                                        <p className="card-text text-muted">{doc.description}</p>
                                        <button 
                                            className="btn btn-primary mt-auto"
                                            onClick={() => handleDownload(doc.fileName)}>
                                            <i className="bi bi-download me-2"></i>
                                            Tải xuống
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Support);