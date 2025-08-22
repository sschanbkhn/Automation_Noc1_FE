import { CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import CtrlDynamicButton from 'components/common/CtrlDynamicButton';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import { Message } from 'models/Enums';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { ModuleName, InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import moduleListViewJson from './ListView.json';
import { IResponseMessage } from 'models/Apps';

// Interface cho LSP data
interface LSPData {
    name: string;
    from_address: string;
    host_name_from: string;
    to_address: string;
    host_name_to: string;
    action: string;
    operational_status: string;
    bandwidth: number;
    path_lsp: string;
    last_update: string;
}

interface Props {}

const I004_1List = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const moduleListView:any = moduleListViewJson;    
    const refNotification = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [fromDate, setFromDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState<string>(() => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    });
    
    console.log('moduleListViewJson loaded:', moduleListViewJson);
    
    useEffect(() => {        
        loadData();     
    }, [])
    
    const loadData = async () => {
        const fromDateTime = new Date(fromDate + 'T00:00:00');
        const toDateTime = new Date(toDate + 'T23:59:59');
        await Actions.GetLSPData(dispatch, fromDateTime, toDateTime);
    }
    
    const exportToExcel = () => {
        try {
            if (!state.DataItems || state.DataItems.length === 0) {
                refNotification.current.showNotification("warning", "Không có dữ liệu để xuất Excel");
                return;
            }
            
            // Chuẩn bị headers cho CSV
            const headers = [
                'STT',
                'Tên LSP', 
                'From Host',
                'From Address',
                'To Host', 
                'To Address',
                'Action',
                'Status',
                'Bandwidth (GB)',
                'Path LSP',
                'Last Update'
            ];
            
            // Chuẩn bị dữ liệu cho CSV
            const csvData = state.DataItems.map((item: LSPData, index: number) => [
                index + 1,
                item.name || '',
                item.host_name_from || '',
                item.from_address || '',
                item.host_name_to || '',
                item.to_address || '',
                item.action || '',
                item.operational_status || '',
                item.bandwidth || '',
                item.path_lsp || '',
                item.last_update ? new Date(item.last_update).toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : ''
            ]);
            
            // Tạo nội dung CSV
            const csvContent = [
                headers.join(','),
                ...csvData.map((row: any[]) => 
                    row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
                )
            ].join('\n');
            
            // Tạo và download file
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const fileName = `LSP_Data_${fromDate}_to_${toDate}_${new Date().getTime()}.csv`;
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            refNotification.current.showNotification("success", `Đã xuất file CSV: ${fileName}`);
        } catch (error) {
            console.error('Export CSV error:', error);
            refNotification.current.showNotification("error", "Lỗi khi xuất CSV");
        }
    }
    
    const ActionEvents = {
        onClickRefresh: async () => {
            await loadData();
            refNotification.current.showNotification("success", "Dữ liệu đã được làm mới");
        },
        onClickFilter: () => {
            setShowDateFilter(!showDateFilter);
        },
        onClickExportCSV: () => {
            exportToExcel();
        },
    }
    
    const handleDateFilter = async () => {
        if (!fromDate || !toDate) {
            refNotification.current.showNotification("warning", "Vui lòng chọn ngày bắt đầu và ngày kết thúc");
            return;
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
            refNotification.current.showNotification("warning", "Ngày bắt đầu không thể lớn hơn ngày kết thúc");
            return;
        }
        
        await loadData();
        refNotification.current.showNotification("success", "Đã lọc dữ liệu theo khoảng thời gian được chọn");
    }
    
    let ButtonGroupsRender = () => {
        console.log('ActionDefs:', moduleListView.DataGrid.ActionDefs);
        console.log('ActionEvents:', ActionEvents);
        return <CtrlDynamicButton actionDefs={moduleListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    
    const DateFilterComponent = useMemo(() => {
        if (!showDateFilter) return null;
        
        return (
            <div className="mb-3 p-3 border rounded">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label">Từ ngày:</label>
                        <input 
                            type="date" 
                            className="form-control"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Đến ngày:</label>
                        <input 
                            type="date" 
                            className="form-control"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <button 
                            className="btn btn-primary me-2"
                            onClick={handleDateFilter}
                        >
                            <i className="bi bi-search"></i> Lọc
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => setShowDateFilter(false)}
                        >
                            <i className="bi bi-x"></i> Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [showDateFilter, fromDate, toDate]);
    
    return(
        <>
            <CtrlNotification ref={refNotification} />   
            <Card key='i004_1_module' title={moduleListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                {DateFilterComponent}
                <div className="mb-2">
                    <small className="text-muted">
                        Hiển thị dữ liệu từ {fromDate} đến {toDate} | Tổng số bản ghi: {state.DataItems.length}
                    </small>
                </div>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={moduleListView.DataGrid.Key} 
                    key={moduleListView.DataGrid.Key} 
                    columnDefs={moduleListView.DataGrid.ColumnDefs} 
                    dataItems={state.DataItems}>                
                </CtrlDynamicTable>
            </Card>
        </>
    )
}

const mapState = ({ ...state }) => ({});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(I004_1List);
