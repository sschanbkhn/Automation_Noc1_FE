import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from "react-redux";
import { CtrlNotification } from 'components/common';
import CtrlButton from 'components/common/CtrlButton';
import Card from 'components/common/Card';
import CtrlDate from 'components/common/CtrlDate';
import CtrlSelect from 'components/common/CtrlSelect';
import { Message } from 'models/Enums';
import RnocR009Service from 'services/RnocR009Service';
import Nokia4GTable from './Nokia4GTable';
import Nokia5GTable from './Nokia5GTable';
import Huawei4GTable from './Huawei4GTable';

interface Props {
    Apps: any
}

interface IBtsDataItem {
    TT?: number;
    CellName: string;
    IdCell: number;
    EnodebId: string;
    LocalCellId: string;
    Ulearfcncfgind: string;
    Dlearfcn?: string;
    RootSequenceIdx?: string;
    Txrxmode: string;
    Ulbandwidth?: string;
    Dlbandwidth?: string;
    Freqband?: string;
    Nename: string;
    Tac: string;
    Phycellid: string;
    CreateDate: string;
}

// Thêm các interface cho Nokia5GItem
interface Nokia5GItem {
    TT?: number;
    id_bts: string;
    nrcell_mo_id: string;
    celltechnology: string;
    celldeptype: string;
    cellname: string;
    physcellid: string;
    lcrid: string;
    prachrootsequenceindex: string;
    chbw: string;
    nrarfcn: string;
    administrativestate: string;
    basicbeamset: string;
    nrbts_mo_id: string;
    nrbts_name: string;
    mrbts_mo_id: string;
    mrbts_name: string;
    direction: string;
    createdate: string;
}

// Thêm interface cho Nokia4GItem
interface Nokia4GItem {
    TT?: number;
    id_bts: string;
    lncells_mo_id: string;
    administrativestate: string;
    phycellid: string;
    tac: string;
    cellname: string;
    lcrid: string;
    enbname: string;
    mrbts_name: string;
    earfcnul: string;
    earfcndl: string;
    rootseqindex: string;
    dlchbw: string;
    ulchbw: string;
    chbw: string;
    direction: string;
    createdate: string;
}

const VendorOptions = [
    { value: "huawei", label: "Vendor Huawei" },
    { value: "nokia", label: "Vendor Nokia" },
    { value: "ericsson", label: "Vendor Ericsson" }
];

const TechnologyOptions = [
    { value: "4G", label: "4G" },
    { value: "5G", label: "5G" }
];

// Memoized table component to prevent unnecessary re-renders
const DataTable = React.memo(({ 
    data, 
    isLoading, 
    currentPage, 
    pageSize, 
    onPageChange, 
    searchTerm, 
    onSearchChange,
    onPageSizeChange
}: { 
    data: IBtsDataItem[], 
    isLoading: boolean,
    currentPage: number,
    pageSize: number,
    onPageChange: (page: number) => void,
    searchTerm: string,
    onSearchChange: (term: string) => void,
    onPageSizeChange: (size: number) => void
}) => {
    if (isLoading) {
        return (
            <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-3">
                <div className="text-muted">Không có dữ liệu</div>
            </div>
        );
    }

    // Filter data based on search term
    const filteredData = data.filter(item => 
        item.CellName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.EnodebId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Nename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Tac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Phycellid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.IdCell?.toString().includes(searchTerm)
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
        <div>
            {/* Search Bar and Controls */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm theo Cell Name, EnodeB ID, NE Name, TAC, Physical Cell ID, ID Cell..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-end">
                    <div className="d-flex align-items-center">
                        <span className="me-2 text-muted">Hiển thị:</span>
                        <select 
                            className="form-select form-select-sm me-3" 
                            style={{ width: 'auto' }}
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                        <span className="text-muted">
                            {startIndex + 1}-{Math.min(endIndex, filteredData.length)} trong tổng số {filteredData.length} bản ghi
                        </span>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #e9ecef'
                    }}>
                        <tr>
                            <th style={{ 
                                width: '60px', 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>TT</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>Cell Name</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>ID Cell</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>EnodeB ID</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>Local Cell ID</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>UL EARFCN</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>DL EARFCN</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>Root Sequence Index</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>TxRx Mode</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>UL Bandwidth</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>DL Bandwidth</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>Frequency Band</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>NE Name</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>TAC</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>Physical Cell ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={`${item.IdCell}-${startIndex + index}`}>
                                <td className="text-center">{startIndex + index + 1}</td>
                                <td>{item.CellName}</td>
                                <td className="text-center">{item.IdCell}</td>
                                <td>{item.EnodebId}</td>
                                <td>{item.LocalCellId}</td>
                                <td>{item.Ulearfcncfgind}</td>
                                <td>{item.Dlearfcn}</td>
                                <td>{item.RootSequenceIdx}</td>
                                <td>{item.Txrxmode}</td>
                                <td>{item.Ulbandwidth}</td>
                                <td>{item.Dlbandwidth}</td>
                                <td>{item.Freqband}</td>
                                <td>{item.Nename}</td>
                                <td>{item.Tac}</td>
                                <td>{item.Phycellid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4" style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <div className="d-flex align-items-center">
                        <div style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <i className="fas fa-file-alt me-2"></i>
                            Trang {currentPage} / {totalPages}
                        </div>
                        <div className="ms-3 text-muted" style={{ fontSize: '13px' }}>
                            <i className="fas fa-info-circle me-1"></i>
                            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredData.length)} trong {filteredData.length} bản ghi
                        </div>
                    </div>
                    
                    <nav>
                        <ul className="pagination pagination-sm mb-0" style={{ gap: '2px' }}>
                            {/* First Page */}
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => onPageChange(1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        backgroundColor: currentPage === 1 ? '#e9ecef' : '#fff',
                                        color: currentPage === 1 ? '#6c757d' : '#495057',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s ease',
                                        minWidth: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = '#fff';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '16px',
                                        color: currentPage === 1 ? '#6c757d' : '#495057',
                                        fontWeight: 'bold'
                                    }}>««</span>
                                </button>
                            </li>
                            
                            {/* Previous Page */}
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        backgroundColor: currentPage === 1 ? '#e9ecef' : '#fff',
                                        color: currentPage === 1 ? '#6c757d' : '#495057',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s ease',
                                        minWidth: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = '#fff';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '16px',
                                        color: currentPage === 1 ? '#6c757d' : '#495057',
                                        fontWeight: 'bold'
                                    }}>‹</span>
                                </button>
                            </li>
                            
                            {/* Page Numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                const isActive = currentPage === pageNum;
                                
                                return (
                                    <li key={pageNum} className="page-item">
                                        <button 
                                            className="page-link" 
                                            onClick={() => onPageChange(pageNum)}
                                            style={{
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 14px',
                                                backgroundColor: isActive ? '#007bff' : '#fff',
                                                color: isActive ? '#fff' : '#495057',
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s ease',
                                                minWidth: '40px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                );
                            })}
                            
                            {/* Next Page */}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        backgroundColor: currentPage === totalPages ? '#e9ecef' : '#fff',
                                        color: currentPage === totalPages ? '#6c757d' : '#495057',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s ease',
                                        minWidth: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = '#fff';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '16px',
                                        color: currentPage === totalPages ? '#6c757d' : '#495057',
                                        fontWeight: 'bold'
                                    }}>›</span>
                                </button>
                            </li>
                            
                            {/* Last Page */}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => onPageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        backgroundColor: currentPage === totalPages ? '#e9ecef' : '#fff',
                                        color: currentPage === totalPages ? '#6c757d' : '#495057',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s ease',
                                        minWidth: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = '#fff';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '16px',
                                        color: currentPage === totalPages ? '#6c757d' : '#495057',
                                        fontWeight: 'bold'
                                    }}>»»</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
});

const Index = (props: Props) => {  
    const [formSearch, setFormSearch] = useState({
        selectedDate: new Date(),
        vendor: "",
        technology: ""
    });
    // State riêng cho từng loại bảng
    const [huaweiData, setHuaweiData] = useState<IBtsDataItem[]>([]);
    const [nokia4GData, setNokia4GData] = useState<Nokia4GItem[]>([]);
    const [nokia5GData, setNokia5GData] = useState<Nokia5GItem[]>([]);
    // State phân trang, tìm kiếm riêng cho từng bảng
    const [huaweiPage, setHuaweiPage] = useState(1);
    const [huaweiPageSize, setHuaweiPageSize] = useState(50);
    const [huaweiSearch, setHuaweiSearch] = useState("");
    const [nokia4GPage, setNokia4GPage] = useState(1);
    const [nokia4GPageSize, setNokia4GPageSize] = useState(50);
    const [nokia4GSearch, setNokia4GSearch] = useState("");
    const [nokia5GPage, setNokia5GPage] = useState(1);
    const [nokia5GPageSize, setNokia5GPageSize] = useState(50);
    const [nokia5GSearch, setNokia5GSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const refNotification = useRef<any>();
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Helper function to convert string to ArrayBuffer (for Excel export)
    const s2ab = useCallback((s: any) => {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }, []);

    // Helper function to decode base64 safely
    const decodeBase64 = useCallback((str: string) => {
        try {
            const cleanStr = str.replace(/\s/g, '').replace(/=/g, '');
            const paddedStr = cleanStr + '='.repeat((4 - cleanStr.length % 4) % 4);
            return atob(paddedStr);
        } catch (error) {
            console.error('Base64 decode error:', error);
            throw new Error('Invalid base64 string');
        }
    }, []);

    // Execute query to get BTS data
    const ExecuteQuery = useCallback(async () => {
        if (!formSearch.selectedDate) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn ngày!");
            return;
        }
        if (!formSearch.vendor) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn Vendor!");
            return;
        }
        if (!formSearch.technology) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn Công nghệ!");
            return;
        }
        setIsLoading(true);
        try {
            const dateStr = formSearch.selectedDate.getFullYear() + "-" + 
                String(formSearch.selectedDate.getMonth() + 1).padStart(2, '0') + "-" + 
                String(formSearch.selectedDate.getDate()).padStart(2, '0');
            let response;
            if (formSearch.vendor === "huawei" && formSearch.technology === "4G") {
                response = await RnocR009Service.GetBtsDataByDate(dateStr);
                if (!isMountedRef.current) return;
                if (response && response.Success) {
                    const newData = response.Data || [];
                    setHuaweiData(newData.map((item: any, idx: number) => ({ ...item, TT: idx + 1 })));
                } else {
                    setHuaweiData([]);
                }
                setNokia4GData([]);
                setNokia5GData([]);
            } else if (formSearch.vendor === "nokia" && formSearch.technology === "4G") {
                response = await RnocR009Service.GetNokiaBtsDataByDate(dateStr);
                if (!isMountedRef.current) return;
                console.log('Nokia 4G API Response:', response);
                console.log('Nokia 4G Response Success:', response?.Success);
                console.log('Nokia 4G Response Data:', response?.Data);
                console.log('Nokia 4G Response data (lowercase):', response?.data);
                console.log('Nokia 4G Response keys:', Object.keys(response || {}));
                
                if (response && response.Success) {
                    const newData = response.Data || response.data || [];
                    console.log('Nokia 4G Raw Data:', newData);
                    console.log('Nokia 4G Data Length:', newData.length);
                    console.log('Nokia 4G Data Type:', typeof newData);
                    console.log('Nokia 4G Is Array:', Array.isArray(newData));
                    
                    if (newData.length > 0) {
                        console.log('Nokia 4G First Record:', newData[0]);
                        console.log('Nokia 4G First Record Keys:', Object.keys(newData[0]));
                        console.log('Nokia 4G First Record Values:', Object.values(newData[0]));
                    }
                    
                    const mappedData = newData.map((item: any, idx: number) => {
                        // Map từ PascalCase sang snake_case để khớp với interface
                        const mapped = {
                            TT: idx + 1,
                            id_bts: item.id_bts || item.IdBts || '',
                            lncells_mo_id: item.lncells_mo_id || item.LncellsMoId || '',
                            administrativestate: item.administrativestate || item.AdministrativeState || '',
                            phycellid: item.phycellid || item.Phycellid || '',
                            tac: item.tac || item.Tac || '',
                            cellname: item.cellname || item.CellName || '',
                            lcrid: item.lcrid || item.Lcrid || '',
                            enbname: item.enbname || item.EnbName || '',
                            mrbts_name: item.mrbts_name || item.MrbtsName || '',
                            earfcnul: item.earfcnul || item.EarfcnUl || '',
                            earfcndl: item.earfcndl || item.EarfcnDl || '',
                            rootseqindex: item.rootseqindex || item.RootSeqIndex || '',
                            dlchbw: item.dlchbw || item.DlChBw || '',
                            ulchbw: item.ulchbw || item.UlChBw || '',
                            chbw: item.chbw || item.ChBw || '',
                            direction: item.direction || item.Direction || '',
                            createdate: item.createdate || item.CreateDate || ''
                        };
                        console.log(`Nokia 4G Mapped Record ${idx + 1}:`, mapped);
                        return mapped;
                    });
                    console.log('Nokia 4G Final Mapped Data Length:', mappedData.length);
                    setNokia4GData(mappedData);
                } else {
                    console.log('Nokia 4G API failed or no data');
                    console.log('Nokia 4G Response Success:', response?.Success);
                    console.log('Nokia 4G Response Message:', response?.Message);
                    setNokia4GData([]);
                }
                setHuaweiData([]);
                setNokia5GData([]);
            } else if (formSearch.vendor === "nokia" && formSearch.technology === "5G") {
                response = await RnocR009Service.GetNokiaBtsData5GByDate(dateStr);
                if (!isMountedRef.current) return;
                console.log('Nokia 5G API Response:', response);
                console.log('Nokia 5G Response Success:', response?.Success);
                console.log('Nokia 5G Response Data:', response?.Data);
                console.log('Nokia 5G Response data (lowercase):', response?.data);
                console.log('Nokia 5G Response keys:', Object.keys(response || {}));
                
                if (response && response.Success) {
                    const newData = response.Data || response.data || [];
                    console.log('Nokia 5G Raw Data:', newData);
                    console.log('Nokia 5G Data Length:', newData.length);
                    console.log('Nokia 5G Data Type:', typeof newData);
                    console.log('Nokia 5G Is Array:', Array.isArray(newData));
                    
                    if (newData.length > 0) {
                        console.log('Nokia 5G First Record:', newData[0]);
                        console.log('Nokia 5G First Record Keys:', Object.keys(newData[0]));
                        console.log('Nokia 5G First Record Values:', Object.values(newData[0]));
                    }
                    
                    const mappedData = newData.map((item: any, idx: number) => {
                        // Map từ PascalCase sang snake_case để khớp với interface
                        const mapped = {
                            TT: idx + 1,
                            id_bts: item.id_bts || item.IdBts || '',
                            nrcell_mo_id: item.nrcell_mo_id || item.NrCellMoId || '',
                            celltechnology: item.celltechnology || item.CellTechnology || '',
                            celldeptype: item.celldeptype || item.CellDepType || '',
                            cellname: item.cellname || item.CellName || '',
                            physcellid: item.physcellid || item.PhysCellId || '',
                            lcrid: item.lcrid || item.Lcrid || '',
                            prachrootsequenceindex: item.prachrootsequenceindex || item.PrachRootSequenceIndex || '',
                            chbw: item.chbw || item.ChBw || '',
                            nrarfcn: item.nrarfcn || item.NrArfcn || '',
                            administrativestate: item.administrativestate || item.AdministrativeState || '',
                            basicbeamset: item.basicbeamset || item.BasicBeamSet || '',
                            nrbts_mo_id: item.nrbts_mo_id || item.NrBtsMoId || '',
                            nrbts_name: item.nrbts_name || item.NrBtsName || '',
                            mrbts_mo_id: item.mrbts_mo_id || item.MrBtsMoId || '',
                            mrbts_name: item.mrbts_name || item.MrBtsName || '',
                            direction: item.direction || item.Direction || '',
                            createdate: item.createdate || item.CreateDate || ''
                        };
                        console.log(`Nokia 5G Mapped Record ${idx + 1}:`, mapped);
                        return mapped;
                    });
                    console.log('Nokia 5G Final Mapped Data Length:', mappedData.length);
                    setNokia5GData(mappedData);
                } else {
                    console.log('Nokia 5G API failed or no data');
                    console.log('Nokia 5G Response Success:', response?.Success);
                    console.log('Nokia 5G Response Message:', response?.Message);
                    setNokia5GData([]);
                }
                setHuaweiData([]);
                setNokia4GData([]);
            } else {
                refNotification.current?.showNotification("warning", "Chỉ hỗ trợ Huawei 4G, Nokia 4G, Nokia 5G!");
                setHuaweiData([]);
                setNokia4GData([]);
                setNokia5GData([]);
                setIsLoading(false);
                return;
            }
            refNotification.current?.showNotification("success", `Lấy dữ liệu thành công!`);
        } catch (error: any) {
            refNotification.current?.showNotification("error", "Lỗi khi lấy dữ liệu!");
            setHuaweiData([]);
            setNokia4GData([]);
            setNokia5GData([]);
        } finally {
            if (isMountedRef.current) setIsLoading(false);
        }
    }, [formSearch.selectedDate, formSearch.vendor, formSearch.technology]);

    // Khi đổi vendor/technology thì reset page/search của từng bảng
    useEffect(() => {
        setHuaweiPage(1); setHuaweiSearch("");
        setNokia4GPage(1); setNokia4GSearch("");
        setNokia5GPage(1); setNokia5GSearch("");
    }, [formSearch.vendor, formSearch.technology]);

    // Export Excel function with safe download
    const XuatBaoCao = useCallback(async () => {
        if (!formSearch.selectedDate) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn ngày!");
            return;
        }
        if (!formSearch.vendor) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn Vendor!");
            return;
        }
        if (!formSearch.technology) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn Công nghệ!");
            return;
        }
        const fromDate = formSearch.selectedDate.getFullYear() + "-" +
            String(formSearch.selectedDate.getMonth() + 1).padStart(2, '0') + "-" +
            String(formSearch.selectedDate.getDate()).padStart(2, '0');
        let excelData = { fromDate, toDate: fromDate, vendor: formSearch.vendor };
        let exportFunc;
        let fileVendor = formSearch.vendor;
        if (formSearch.vendor === "huawei" && formSearch.technology === "4G") {
            exportFunc = RnocR009Service.ExportBtsDataToExcel;
        } else if (formSearch.vendor === "nokia" && formSearch.technology === "4G") {
            exportFunc = RnocR009Service.ExportNokiaBtsDataToExcel;
        } else if (formSearch.vendor === "nokia" && formSearch.technology === "5G") {
            exportFunc = RnocR009Service.ExportNokiaBtsData5GToExcel;
        } else {
            refNotification.current?.showNotification("warning", "Chỉ hỗ trợ xuất Excel cho Huawei 4G, Nokia 4G, Nokia 5G!");
            return;
        }
        try {
            const response = await exportFunc(excelData);
            if (!isMountedRef.current) return;
            let base64Data = response?.Data || response?.data || response;
            if (base64Data && typeof base64Data === 'string' && base64Data.length > 0) {
                const blob = new Blob([s2ab(decodeBase64(base64Data))], {
                    type: 'text/csv;charset=utf-8;'
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `BTS_Data_${fromDate}_${fileVendor}.csv`;
                link.style.display = 'none';
                if ((navigator as any).msSaveBlob) {
                    (navigator as any).msSaveBlob(blob, link.download);
                } else {
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        try {
                            if (document.body.contains(link)) {
                                document.body.removeChild(link);
                            }
                        } catch (e) {}
                        window.URL.revokeObjectURL(url);
                    }, 1000);
                }
                refNotification.current?.showNotification("success", "Xuất Excel thành công!");
            } else {
                refNotification.current?.showNotification("error", "Dữ liệu Excel không hợp lệ!");
            }
        } catch (error: any) {
            let errorMessage = "Lỗi khi xuất Excel!";
            if (error && error.response && error.response.status) {
                if (error.response.status === 401) {
                    errorMessage = "Hết thời gian truy cập!";
                } else {
                    errorMessage = error.response.data?.Message || error.response.statusText || errorMessage;
                }
            } else if (error && error.message) {
                if (error.code === 'ECONNABORTED') {
                    errorMessage = "Kết nối bị timeout khi xuất Excel!";
                } else if (error.message.includes('Network Error')) {
                    errorMessage = "Lỗi kết nối mạng khi xuất Excel!";
                } else if (error.message.includes('status')) {
                    errorMessage = "Lỗi kết nối đến server!";
                } else {
                    errorMessage = error.message;
                }
            } else {
                errorMessage = "Lỗi không xác định khi xuất Excel!";
            }
            refNotification.current?.showNotification("error", errorMessage);
        }
    }, [formSearch.selectedDate, formSearch.vendor, formSearch.technology, s2ab, decodeBase64]);

    const onChangeFormSearch = useCallback((key: string, value: any) => {
        if (!isMountedRef.current) return;
        
        const newFormSearch = {
            ...formSearch,
            [key]: value
        };
        setFormSearch(newFormSearch);
        
        // Reset pagination when vendor changes
        // setCurrentPage(1); // This line is removed as per the new_code
        
        // If vendor or technology changed, filter existing data
        // if ((key === 'vendor' || key === 'technology') && dataItems.length > 0) { // This line is removed as per the new_code
        //     const filtered = filterData(dataItems,  // This line is removed as per the new_code
        //         key === 'vendor' ? value : formSearch.vendor,  // This line is removed as per the new_code
        //         key === 'technology' ? value : formSearch.technology // This line is removed as per the new_code
        //     ); // This line is removed as per the new_code
        //     setFilteredData(filtered); // This line is removed as per the new_code
        // } // This line is removed as per the new_code
    }, [formSearch]); // This line is changed as per the new_code

    // Reset pagination when search term changes
    useEffect(() => {
        // setCurrentPage(1); // This line is removed as per the new_code
    }, [huaweiSearch, nokia4GSearch, nokia5GSearch]); // This line is changed as per the new_code

    // Page size change handler
    const handlePageSizeChange = useCallback((newPageSize: number) => {
        // setPageSize(newPageSize); // This line is removed as per the new_code
        // setCurrentPage(1); // This line is removed as per the new_code
    }, []);

    const ButtonGroupsRender = useCallback(() => {
        return (
            <div className="d-flex gap-2">
                <CtrlButton 
                    title="Thực hiện" 
                    onClick={ExecuteQuery} 
                    type="primary"
                    icon="el-icon-search"
                    style={{ marginRight: '10px' }}
                />
                <CtrlButton 
                    title="Xuất Excel" 
                    onClick={XuatBaoCao} 
                    type="success"
                    icon="el-icon-download"
                    style={{ marginLeft: '10px' }}
                />
            </div>
        );
    }, [ExecuteQuery, XuatBaoCao]);

    return (
        <>
            <CtrlNotification ref={refNotification} />   
            <Card key='r009-report' title='Báo cáo BTS Data' buttonGroups={ButtonGroupsRender()}>
                <div>
                    {/* Header Section with Light Gray Background */}
                    <div className="row mb-4" style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        margin: '0 -15px 20px -15px'
                    }}> 
                        <div className="col-md-3">
                            <div className="mb-2">
                                <label className="form-label fw-bold text-dark mb-1">
                                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                                    Chọn ngày
                                </label>
                            </div>
                            <CtrlDate 
                                placeholder="Chọn ngày" 
                                key={"selectedDate"} 
                                onChange={(e: any) => onChangeFormSearch('selectedDate', e)} 
                                value={formSearch.selectedDate} 
                            />         
                        </div> 
                        <div className="col-md-3">
                            <div className="mb-2">
                                <label className="form-label fw-bold text-dark mb-1">
                                    <i className="fas fa-building me-2 text-primary"></i>
                                    Vendor
                                </label>
                            </div>
                            <CtrlSelect 
                                clearable={false} 
                                onChange={(value: any) => onChangeFormSearch('vendor', value)} 
                                placeholder="Chọn Vendor" 
                                value={formSearch.vendor} 
                                options={VendorOptions} 
                            />
                        </div>
                        <div className="col-md-3">
                            <div className="mb-2">
                                <label className="form-label fw-bold text-dark mb-1">
                                    <i className="fas fa-wifi me-2 text-primary"></i>
                                    Công nghệ
                                </label>
                            </div>
                            <CtrlSelect 
                                clearable={false} 
                                onChange={(value: any) => onChangeFormSearch('technology', value)} 
                                placeholder="Chọn Công nghệ" 
                                value={formSearch.technology} 
                                options={TechnologyOptions} 
                            />
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <div className="d-flex align-items-center w-100">
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-database me-2 text-success"></i>
                                        <span className="fw-bold text-dark">Tổng số bản ghi:</span>
                                        <span className="badge bg-primary ms-2 fs-6">
                                            {formSearch.vendor === 'huawei' && formSearch.technology === '4G' ? huaweiData.length :
                                             formSearch.vendor === 'nokia' && formSearch.technology === '4G' ? nokia4GData.length :
                                             formSearch.vendor === 'nokia' && formSearch.technology === '5G' ? nokia5GData.length : 0}
                                        </span>
                                    </div>
                                    {/* Debug info */}
                                    <div className="mt-1">
                                        <small className="text-muted">
                                            Debug: HW={huaweiData.length}, N4G={nokia4GData.length}, N5G={nokia5GData.length}
                                        </small>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Báo cáo dữ liệu BTS theo ngày
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Render bảng phù hợp theo vendor/technology */}
                    {formSearch.vendor === 'nokia' && formSearch.technology === '4G' ? (
                        <Nokia4GTable
                            data={nokia4GData}
                            isLoading={isLoading}
                            currentPage={nokia4GPage}
                            pageSize={nokia4GPageSize}
                            onPageChange={setNokia4GPage}
                            searchTerm={nokia4GSearch}
                            onSearchChange={setNokia4GSearch}
                            onPageSizeChange={setNokia4GPageSize}
                        />
                    ) : formSearch.vendor === 'nokia' && formSearch.technology === '5G' ? (
                        <Nokia5GTable
                            data={nokia5GData}
                            isLoading={isLoading}
                            currentPage={nokia5GPage}
                            pageSize={nokia5GPageSize}
                            onPageChange={setNokia5GPage}
                            searchTerm={nokia5GSearch}
                            onSearchChange={setNokia5GSearch}
                            onPageSizeChange={setNokia5GPageSize}
                        />
                    ) : formSearch.vendor === 'huawei' && formSearch.technology === '4G' ? (
                        <Huawei4GTable
                            data={huaweiData}
                            isLoading={isLoading}
                            currentPage={huaweiPage}
                            pageSize={huaweiPageSize}
                            onPageChange={setHuaweiPage}
                            searchTerm={huaweiSearch}
                            onSearchChange={setHuaweiSearch}
                            onPageSizeChange={setHuaweiPageSize}
                        />
                    ) : null}
                </div>
            </Card>
        </>
    );
};

const mapState = ({ ...state }) => ({
    Apps: state.apps
});

const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(Index); 