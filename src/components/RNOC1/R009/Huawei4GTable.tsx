import React, { useState, useMemo } from 'react';

interface Huawei4GItem {
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

interface Props {
    data: Huawei4GItem[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onPageSizeChange: (size: number) => void;
}

const Huawei4GTable: React.FC<Props> = ({
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
                <div className="mt-2">Đang tải dữ liệu Huawei 4G...</div>
            </div>
        );
    }
    if (data.length === 0) {
        return <div className="text-center py-3 text-muted">Không có dữ liệu Huawei 4G</div>;
    }
    // Lọc dữ liệu theo searchTerm
    const filteredData = sortedData.filter(item =>
        item.CellName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.EnodebId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Nename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Tac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Phycellid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.IdCell?.toString().includes(searchTerm)
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
                            placeholder="Tìm kiếm theo Cell Name, EnodeB ID, NE Name, TAC, Physical Cell ID, ID Cell..."
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
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th className="sticky-column sticky-column-tt sticky-header">TT</th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('CellName')}
                                className="sortable-header sticky-column sticky-column-cellname sticky-header"
                            >
                                <span className="header-text">Cell Name</span>
                                <span className={getSortIcon('CellName')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('IdCell')}
                                className="sortable-header sticky-column sticky-column-id sticky-header"
                            >
                                <span className="header-text">ID Cell</span>
                                <span className={getSortIcon('IdCell')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('EnodebId')}
                                className="sortable-header"
                            >
                                <span className="header-text">EnodeB ID</span>
                                <span className={getSortIcon('EnodebId')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('LocalCellId')}
                                className="sortable-header"
                            >
                                <span className="header-text">Local Cell ID</span>
                                <span className={getSortIcon('LocalCellId')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Ulearfcncfgind')}
                                className="sortable-header"
                            >
                                <span className="header-text">UL EARFCN</span>
                                <span className={getSortIcon('Ulearfcncfgind')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Dlearfcn')}
                                className="sortable-header"
                            >
                                <span className="header-text">DL EARFCN</span>
                                <span className={getSortIcon('Dlearfcn')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('RootSequenceIdx')}
                                className="sortable-header"
                            >
                                <span className="header-text">Root Sequence Index</span>
                                <span className={getSortIcon('RootSequenceIdx')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Txrxmode')}
                                className="sortable-header"
                            >
                                <span className="header-text">TxRx Mode</span>
                                <span className={getSortIcon('Txrxmode')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Ulbandwidth')}
                                className="sortable-header"
                            >
                                <span className="header-text">UL Bandwidth</span>
                                <span className={getSortIcon('Ulbandwidth')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Dlbandwidth')}
                                className="sortable-header"
                            >
                                <span className="header-text">DL Bandwidth</span>
                                <span className={getSortIcon('Dlbandwidth')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Freqband')}
                                className="sortable-header"
                            >
                                <span className="header-text">Frequency Band</span>
                                <span className={getSortIcon('Freqband')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Nename')}
                                className="sortable-header"
                            >
                                <span className="header-text">NE Name</span>
                                <span className={getSortIcon('Nename')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Tac')}
                                className="sortable-header"
                            >
                                <span className="header-text">TAC</span>
                                <span className={getSortIcon('Tac')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('Phycellid')}
                                className="sortable-header"
                            >
                                <span className="header-text">Physical Cell ID</span>
                                <span className={getSortIcon('Phycellid')}></span>
                            </th>
                            <th 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSort('CreateDate')}
                                className="sortable-header"
                            >
                                <span className="header-text">Ngày tạo</span>
                                <span className={getSortIcon('CreateDate')}></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, idx) => (
                            <tr key={item.IdCell + '-' + (startIndex + idx)}>
                                <td className="text-center sticky-column sticky-column-tt">{startIndex + idx + 1}</td>
                                <td className="sticky-column sticky-column-cellname">{item.CellName}</td>
                                <td className="sticky-column sticky-column-id">{item.IdCell}</td>
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
                                <td>{formatDate(item.CreateDate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Phân trang giống các bảng khác */}
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

export default Huawei4GTable; 