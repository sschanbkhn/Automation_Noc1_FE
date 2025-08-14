import React, { useState, useMemo } from 'react';

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

interface Props {
    data: Nokia5GItem[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onPageSizeChange: (size: number) => void;
}

const Nokia5GTable: React.FC<Props> = ({
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
                <div className="mt-2">Đang tải dữ liệu Nokia 5G...</div>
            </div>
        );
    }
    if (data.length === 0) {
        return <div className="text-center py-3 text-muted">Không có dữ liệu Nokia 5G</div>;
    }
    // Lọc dữ liệu theo searchTerm
    const filteredData = sortedData.filter(item =>
        item.cellname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nrbts_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nrcell_mo_id?.toLowerCase().includes(searchTerm.toLowerCase())
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
                            placeholder="Tìm kiếm theo Cell Name, NR BTS Name, NR Cell MO ID..."
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
                    <thead style={{ backgroundColor: '#fff3e0' }}>
                        <tr>
                            <th className="sticky-column sticky-column-tt sticky-header">TT</th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('id_bts')}
                                className="sortable-header sticky-column nokia5g-sticky-id_bts sticky-header"
                            >
                                <span className="header-text">id_bts</span>
                                <span className={getSortIcon('id_bts')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('cellname')}
                                className="sortable-header sticky-column nokia5g-sticky-cellname sticky-header"
                            >
                                <span className="header-text">cellname</span>
                                <span className={getSortIcon('cellname')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('nrcell_mo_id')}
                                className="sortable-header"
                            >
                                <span className="header-text">nrcell_mo_id</span>
                                <span className={getSortIcon('nrcell_mo_id')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('celltechnology')}
                                className="sortable-header"
                            >
                                <span className="header-text">celltechnology</span>
                                <span className={getSortIcon('celltechnology')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('celldeptype')}
                                className="sortable-header"
                            >
                                <span className="header-text">celldeptype</span>
                                <span className={getSortIcon('celldeptype')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('physcellid')}
                                className="sortable-header"
                            >
                                <span className="header-text">physcellid</span>
                                <span className={getSortIcon('physcellid')}></span>
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
                                onClick={() => handleSort('prachrootsequenceindex')}
                                className="sortable-header"
                            >
                                <span className="header-text">prachrootsequenceindex</span>
                                <span className={getSortIcon('prachrootsequenceindex')}></span>
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
                                onClick={() => handleSort('nrarfcn')}
                                className="sortable-header"
                            >
                                <span className="header-text">nrarfcn</span>
                                <span className={getSortIcon('nrarfcn')}></span>
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
                                onClick={() => handleSort('basicbeamset')}
                                className="sortable-header"
                            >
                                <span className="header-text">basicbeamset</span>
                                <span className={getSortIcon('basicbeamset')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('nrbts_mo_id')}
                                className="sortable-header"
                            >
                                <span className="header-text">nrbts_mo_id</span>
                                <span className={getSortIcon('nrbts_mo_id')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('nrbts_name')}
                                className="sortable-header"
                            >
                                <span className="header-text">nrbts_name</span>
                                <span className={getSortIcon('nrbts_name')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('mrbts_mo_id')}
                                className="sortable-header"
                            >
                                <span className="header-text">mrbts_mo_id</span>
                                <span className={getSortIcon('mrbts_mo_id')}></span>
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
                                <td className="sticky-column nokia5g-sticky-id_bts">{item.id_bts}</td>
                                <td className="sticky-column nokia5g-sticky-cellname">{item.cellname}</td>
                                <td>{item.nrcell_mo_id}</td>
                                <td>{item.celltechnology}</td>
                                <td>{item.celldeptype}</td>
                                <td>{item.physcellid}</td>
                                <td>{item.lcrid}</td>
                                <td>{item.prachrootsequenceindex}</td>
                                <td>{item.chbw}</td>
                                <td>{item.nrarfcn}</td>
                                <td>{item.administrativestate}</td>
                                <td>{item.basicbeamset}</td>
                                <td>{item.nrbts_mo_id}</td>
                                <td>{item.nrbts_name}</td>
                                <td>{item.mrbts_mo_id}</td>
                                <td>{item.mrbts_name}</td>
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

export default Nokia5GTable; 