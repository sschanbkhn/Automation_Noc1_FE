import React, { useState, useMemo } from 'react';

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

interface Props {
    data: Nokia4GItem[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onPageSizeChange: (size: number) => void;
}

const Nokia4GTable: React.FC<Props> = ({
    data,
    isLoading,
    currentPage,
    pageSize,
    onPageChange,
    searchTerm,
    onSearchChange,
    onPageSizeChange
}) => {
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return 'sort-icon';
        return sortDirection === 'asc' ? 'sort-icon asc' : 'sort-icon desc';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const sortedData = useMemo(() => {
        if (!sortField) return data;
        
        return [...data].sort((a, b) => {
            let aValue = (a as any)[sortField];
            let bValue = (b as any)[sortField];
            
            // Handle numeric values
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Handle string values
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
            
            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    }, [data, sortField, sortDirection]);

    if (isLoading) {
        return (
            <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2">Đang tải dữ liệu Nokia 4G...</div>
            </div>
        );
    }
    if (data.length === 0) {
        return (
            <div className="text-center py-3">
                <div className="text-muted">Không có dữ liệu Nokia 4G</div>
                <div className="text-muted mt-2">Debug: Data length = {data.length}</div>
                {/* Debug raw data */}
                <div className="mt-3 p-3 bg-light border rounded">
                    <h6>Debug Info:</h6>
                    <pre className="text-start" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }
    // Lọc dữ liệu theo searchTerm
    const filteredData = sortedData.filter(item =>
        item.cellname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id_bts?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.enbname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mrbts_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phycellid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lncells_mo_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    return (
        <div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm theo Cell Name, ID BTS, ENB Name, MR BTS Name, TAC, Physical Cell ID, LNCells MO ID..."
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
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
                            onChange={e => onPageSizeChange(Number(e.target.value))}
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
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead style={{ backgroundColor: '#e3f2fd' }}>
                        <tr>
                            <th className="sticky-column sticky-column-tt sticky-header">TT</th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('id_bts')}
                                className="sortable-header sticky-column nokia4g-sticky-id_bts sticky-header"
                            >
                                <span className="header-text">id_bts</span>
                                <span className={getSortIcon('id_bts')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('cellname')}
                                className="sortable-header sticky-column nokia4g-sticky-cellname sticky-header"
                            >
                                <span className="header-text">cellname</span>
                                <span className={getSortIcon('cellname')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('lncells_mo_id')}
                                className="sortable-header"
                            >
                                <span className="header-text">lncells_mo_id</span>
                                <span className={getSortIcon('lncells_mo_id')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('administrativestate')}
                                className="sortable-header"
                            >
                                <span className="header-text">administrativestate</span>
                                <span className={getSortIcon('administrativestate')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('phycellid')}
                                className="sortable-header"
                            >
                                <span className="header-text">phycellid</span>
                                <span className={getSortIcon('phycellid')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('tac')}
                                className="sortable-header"
                            >
                                <span className="header-text">tac</span>
                                <span className={getSortIcon('tac')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('lcrid')}
                                className="sortable-header"
                            >
                                <span className="header-text">lcrid</span>
                                <span className={getSortIcon('lcrid')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('enbname')}
                                className="sortable-header"
                            >
                                <span className="header-text">enbname</span>
                                <span className={getSortIcon('enbname')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('mrbts_name')}
                                className="sortable-header"
                            >
                                <span className="header-text">mrbts_name</span>
                                <span className={getSortIcon('mrbts_name')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('earfcnul')}
                                className="sortable-header"
                            >
                                <span className="header-text">earfcnul</span>
                                <span className={getSortIcon('earfcnul')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('earfcndl')}
                                className="sortable-header"
                            >
                                <span className="header-text">earfcndl</span>
                                <span className={getSortIcon('earfcndl')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('rootseqindex')}
                                className="sortable-header"
                            >
                                <span className="header-text">rootseqindex</span>
                                <span className={getSortIcon('rootseqindex')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('dlchbw')}
                                className="sortable-header"
                            >
                                <span className="header-text">dlchbw</span>
                                <span className={getSortIcon('dlchbw')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('ulchbw')}
                                className="sortable-header"
                            >
                                <span className="header-text">ulchbw</span>
                                <span className={getSortIcon('ulchbw')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('chbw')}
                                className="sortable-header"
                            >
                                <span className="header-text">chbw</span>
                                <span className={getSortIcon('chbw')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('direction')}
                                className="sortable-header"
                            >
                                <span className="header-text">direction</span>
                                <span className={getSortIcon('direction')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('createdate')}
                                className="sortable-header"
                            >
                                <span className="header-text">createdate</span>
                                <span className={getSortIcon('createdate')}></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, idx) => (
                            <tr key={item.id_bts + '-' + (startIndex + idx)}>
                                <td className="text-center sticky-column sticky-column-tt">{startIndex + idx + 1}</td>
                                <td className="sticky-column nokia4g-sticky-id_bts">{item.id_bts}</td>
                                <td className="sticky-column nokia4g-sticky-cellname">{item.cellname}</td>
                                <td>{item.lncells_mo_id}</td>
                                <td>{item.administrativestate}</td>
                                <td>{item.phycellid}</td>
                                <td>{item.tac}</td>
                                <td>{item.lcrid}</td>
                                <td>{item.enbname}</td>
                                <td>{item.mrbts_name}</td>
                                <td>{item.earfcnul}</td>
                                <td>{item.earfcndl}</td>
                                <td>{item.rootseqindex}</td>
                                <td>{item.dlchbw}</td>
                                <td>{item.ulchbw}</td>
                                <td>{item.chbw}</td>
                                <td>{item.direction}</td>
                                <td>{formatDate(item.createdate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Phân trang giống bảng cũ */}
            {totalPages > 1 && (
                <nav className="mt-3">
                    <ul className="pagination pagination-sm mb-0 justify-content-end">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(1)} disabled={currentPage === 1}>««</button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                        </li>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            const isActive = currentPage === pageNum;
                            return (
                                <li key={pageNum} className="page-item">
                                    <button className={`page-link ${isActive ? 'active' : ''}`} onClick={() => onPageChange(pageNum)}>{pageNum}</button>
                                </li>
                            );
                        })}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>»»</button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default Nokia4GTable; 