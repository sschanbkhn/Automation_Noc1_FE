import React, { useState, useMemo } from 'react';

interface ZteBtsDataItem {
    TT?: number;
    Technology: string;
    Cellname: string;
    TAC: number;
    PhyCellId: number;
    LcrId?: number;
    ULEARFCN?: number;
    DLEARFCN?: number;
    CellType: string;
    Cellremote: string;
    RSI_Decimal?: number;
    Bandwidth: string;
    MIMO: string;
    ENodeBID: string;
    Provincecode: string;
    Districtcode: string;
    NET: string;
    ENodeB_Name: string;
    NE_Name: string;
    AdminState: string;
    DeviceType: string;
    CreatedDate: string;
}

interface Props {
    data: ZteBtsDataItem[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onPageSizeChange: (size: number) => void;
}

const ZteTable: React.FC<Props> = ({
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

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        
        return data.filter(item => 
            Object.values(item).some(value => 
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;
        
        return [...filteredData].sort((a, b) => {
            const aValue = (a as any)[sortField];
            const bValue = (b as any)[sortField];
            
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            const aStr = aValue.toString().toLowerCase();
            const bStr = bValue.toString().toLowerCase();
            
            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr);
            } else {
                return bStr.localeCompare(aStr);
            }
        });
    }, [filteredData, sortField, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return <i className="fas fa-sort text-muted"></i>;
        return sortDirection === 'asc' 
            ? <i className="fas fa-sort-up text-primary"></i>
            : <i className="fas fa-sort-down text-primary"></i>;
    };

    return (
        <div>
            <div className="row mb-3">
                <div className="col-md-6 text-end">
                    <div className="d-flex justify-content-end align-items-center gap-2">
                        <span className="text-muted">Hiển thị:</span>
                        <select 
                            className="form-select form-select-sm" 
                            style={{ width: 'auto' }}
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-muted">bản ghi</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm trong tất cả các trường..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={() => onSearchChange('')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ZTE BTS Data Table */}
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="thead-light">
                        <tr>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6'
                            }}>STT</th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('Technology')}>
                                Technology {getSortIcon('Technology')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('Cellname')}>
                                Cell Name {getSortIcon('Cellname')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('TAC')}>
                                TAC {getSortIcon('TAC')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('PhyCellId')}>
                                Physical Cell ID {getSortIcon('PhyCellId')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('LcrId')}>
                                LCR ID {getSortIcon('LcrId')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('ULEARFCN')}>
                                UL EARFCN {getSortIcon('ULEARFCN')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('DLEARFCN')}>
                                DL EARFCN {getSortIcon('DLEARFCN')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('CellType')}>
                                Cell Type {getSortIcon('CellType')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('Cellremote')}>
                                Cell Remote {getSortIcon('Cellremote')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('RSI_Decimal')}>
                                RSI Decimal {getSortIcon('RSI_Decimal')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('Bandwidth')}>
                                Bandwidth {getSortIcon('Bandwidth')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('MIMO')}>
                                MIMO {getSortIcon('MIMO')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('ENodeBID')}>
                                eNodeB ID {getSortIcon('ENodeBID')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('Provincecode')}>
                                Province Code {getSortIcon('Provincecode')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('Districtcode')}>
                                District Code {getSortIcon('Districtcode')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('NET')}>
                                NET {getSortIcon('NET')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('ENodeB_Name')}>
                                eNodeB Name {getSortIcon('ENodeB_Name')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('NE_Name')}>
                                NE Name {getSortIcon('NE_Name')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('AdminState')}>
                                Admin State {getSortIcon('AdminState')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('DeviceType')}>
                                Device Type {getSortIcon('DeviceType')}
                            </th>
                            <th style={{ 
                                color: '#495057',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                padding: '12px 8px',
                                fontSize: '13px',
                                borderBottom: '2px solid #dee2e6',
                                cursor: 'pointer'
                            }} onClick={() => handleSort('CreatedDate')}>
                                Created Date {getSortIcon('CreatedDate')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={22} className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <div className="mt-2">Đang tải dữ liệu...</div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={22} className="text-center py-4">
                                    <i className="fas fa-inbox text-muted mb-2" style={{ fontSize: '2em' }}></i>
                                    <div className="text-muted">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, index) => (
                                <tr key={index} style={{ fontSize: '13px' }}>
                                    <td className="text-center" style={{ padding: '8px' }}>
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td style={{ padding: '8px' }}>{item.Technology}</td>
                                    <td style={{ padding: '8px' }}>{item.Cellname}</td>
                                    <td className="text-center" style={{ padding: '8px' }}>{item.TAC}</td>
                                    <td className="text-center" style={{ padding: '8px' }}>{item.PhyCellId}</td>
                                    <td className="text-center" style={{ padding: '8px' }}>{item.LcrId}</td>
                                    <td className="text-center" style={{ padding: '8px' }}>{item.ULEARFCN}</td>
                                    <td className="text-center" style={{ padding: '8px' }}>{item.DLEARFCN}</td>
                                    <td style={{ padding: '8px' }}>{item.CellType}</td>
                                    <td style={{ padding: '8px' }}>{item.Cellremote}</td>
                                    <td className="text-center" style={{ padding: '8px' }}>{item.RSI_Decimal}</td>
                                    <td style={{ padding: '8px' }}>{item.Bandwidth}</td>
                                    <td style={{ padding: '8px' }}>{item.MIMO}</td>
                                    <td style={{ padding: '8px' }}>{item.ENodeBID}</td>
                                    <td style={{ padding: '8px' }}>{item.Provincecode}</td>
                                    <td style={{ padding: '8px' }}>{item.Districtcode}</td>
                                    <td style={{ padding: '8px' }}>{item.NET}</td>
                                    <td style={{ padding: '8px' }}>{item.ENodeB_Name}</td>
                                    <td style={{ padding: '8px' }}>{item.NE_Name}</td>
                                    <td style={{ padding: '8px' }}>{item.AdminState}</td>
                                    <td style={{ padding: '8px' }}>{item.DeviceType}</td>
                                    <td style={{ padding: '8px' }}>
                                        {item.CreatedDate ? new Date(item.CreatedDate).toLocaleString() : ''}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="row mt-3">
                    <div className="col-md-6">
                        <div className="text-muted">
                            Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, sortedData.length)} 
                            trong số {sortedData.length} bản ghi
                        </div>
                    </div>
                    <div className="col-md-6">
                        <nav>
                            <ul className="pagination justify-content-end mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => onPageChange(1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-angle-double-left"></i>
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => onPageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-angle-left"></i>
                                    </button>
                                </li>
                                
                                {/* Page numbers */}
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
                                    
                                    return (
                                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => onPageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                })}

                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => onPageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fas fa-angle-right"></i>
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => onPageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fas fa-angle-double-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZteTable;
