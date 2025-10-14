// Simple version without Quick buttons and sample data
// This is a backup in case we need to restore a working version

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { request } from '../../../helpers/request';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Notification } from "../../common";
import * as XLSX from 'xlsx';

const I004Dashboard = (props: any) => {
    // Basic states
    const [selectedPData, setSelectedPData] = useState<string[]>([]);
    const [selectedPOPData, setSelectedPOPData] = useState<string[]>([]);
    const [pDataList, setPDataList] = useState<any[]>([]);
    const [popDataList, setPopDataList] = useState<any[]>([]);
    const [bandwidthData, setBandwidthData] = useState<any[]>([]);
    const [selectedRange, setSelectedRange] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [isBandwidthLoading, setIsBandwidthLoading] = useState(false);
    const [showPDataDropdown, setShowPDataDropdown] = useState(false);
    const [showPOPDataDropdown, setShowPOPDataDropdown] = useState(false);
    
    const refNotification = useRef<any>(null);

    // Load dropdown data
    useEffect(() => {
        loadPDataList();
        loadPOPDataList();
    }, []);

    const loadPDataList = async () => {
        try {
            const response = await request.get('/I004_LSP/GetPDataList');
            if (response?.Success && Array.isArray(response.Data)) {
                setPDataList(response.Data);
            }
        } catch (error) {
            console.error('Error loading P-Data:', error);
        }
    };

    const loadPOPDataList = async () => {
        try {
            const response = await request.get('/I004_LSP/GetPOPDataList');
            if (response?.Success && Array.isArray(response.Data)) {
                setPopDataList(response.Data);
            }
        } catch (error) {
            console.error('Error loading POP-Data:', error);
        }
    };

    const loadBandwidthData = async () => {
        if (selectedPData.length === 0 || selectedPOPData.length === 0) {
            refNotification.current?.showNotification("warning", "Vui lòng chọn ít nhất 1 P-Data và 1 POP-Data");
            return;
        }

        setIsBandwidthLoading(true);
        try {
            // Clean IPs by removing /32
            const fromData = selectedPData.map(ip => ip.replace('/32', ''));
            const toData = selectedPOPData.map(ip => ip.replace('/32', ''));
            
            const params = new URLSearchParams();
            fromData.forEach(ip => params.append('fromData', ip));
            toData.forEach(ip => params.append('toData', ip));
            params.append('timeRange', selectedRange);

            const url = `/I004_LSP/bandwidthbypath?${params.toString()}`;
            const result = await request.get(url);

            if (result?.Success && Array.isArray(result.Data)) {
                setBandwidthData(result.Data);
                if (result.Data.length === 0) {
                    refNotification.current?.showNotification("info", "Không có dữ liệu bandwidth cho khoảng thời gian đã chọn");
                }
            } else {
                setBandwidthData([]);
                refNotification.current?.showNotification("warning", "Không có dữ liệu bandwidth");
            }
        } catch (error) {
            console.error('Error loading bandwidth:', error);
            refNotification.current?.showNotification("error", "Lỗi tải dữ liệu bandwidth");
        } finally {
            setIsBandwidthLoading(false);
        }
    };

    const handleCheckboxChange = (value: string, selected: string[], setter: Function) => {
        if (selected.includes(value)) {
            setter(selected.filter((item: string) => item !== value));
        } else {
            setter([...selected, value]);
        }
    };

    const handleSelectAll = (dataList: any[], setter: Function) => {
        setter(dataList.map(item => item.IdNode));
    };

    const handleDeselectAll = (setter: Function) => {
        setter([]);
    };

    const exportToExcel = () => {
        if (bandwidthData.length === 0) {
            refNotification.current?.showNotification("warning", "Không có dữ liệu để xuất Excel");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(bandwidthData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "LSP Bandwidth");
        XLSX.writeFile(workbook, `LSP_Bandwidth_${selectedRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        refNotification.current?.showNotification("success", "Đã xuất file Excel thành công");
    };

    return (
        <>
            <Notification ref={refNotification} />
            <div style={{ padding: 20, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>
                    🌐 LSP Quốc tế Dashboard
                </h2>

                {/* Selection Controls */}
                <div style={{ display: 'flex', gap: 40, marginBottom: 20, flexWrap: 'wrap' }}>
                    {/* P-Data Selection */}
                    <div style={{ position: 'relative', minWidth: 180 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>P-Data:</div>
                        <button 
                            onClick={() => setShowPDataDropdown(!showPDataDropdown)} 
                            style={{ 
                                padding: '6px 12px', 
                                border: '1px solid #ccc', 
                                borderRadius: 4, 
                                minWidth: 180,
                                background: 'white'
                            }}
                        >
                            Chọn P-Data ({selectedPData.length}/{pDataList.length})
                        </button>
                        {showPDataDropdown && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                background: '#fff', 
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)', 
                                padding: 10, 
                                zIndex: 10, 
                                maxHeight: 240, 
                                overflowY: 'auto', 
                                minWidth: 200 
                            }}>
                                <div style={{ marginBottom: 8 }}>
                                    <button onClick={() => handleSelectAll(pDataList, setSelectedPData)} style={{ marginRight: 8, fontSize: 12 }}>Check all</button>
                                    <button onClick={() => handleDeselectAll(setSelectedPData)} style={{ fontSize: 12 }}>Uncheck all</button>
                                </div>
                                {pDataList.map(opt => (
                                    <label key={opt.IdNode} style={{ display: 'block', fontSize: 12 }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPData.includes(opt.IdNode)} 
                                            onChange={() => handleCheckboxChange(opt.IdNode, selectedPData, setSelectedPData)} 
                                        />{' '}{opt.HostName} ({opt.IdNode.replace('/32', '')})
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* POP-Data Selection */}
                    <div style={{ position: 'relative', minWidth: 180 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>POP-Data:</div>
                        <button 
                            onClick={() => setShowPOPDataDropdown(!showPOPDataDropdown)} 
                            style={{ 
                                padding: '6px 12px', 
                                border: '1px solid #ccc', 
                                borderRadius: 4, 
                                minWidth: 180,
                                background: 'white'
                            }}
                        >
                            Chọn POP-Data ({selectedPOPData.length}/{popDataList.length})
                        </button>
                        {showPOPDataDropdown && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                background: '#fff', 
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)', 
                                padding: 10, 
                                zIndex: 10, 
                                maxHeight: 240, 
                                overflowY: 'auto', 
                                minWidth: 200 
                            }}>
                                <div style={{ marginBottom: 8 }}>
                                    <button onClick={() => handleSelectAll(popDataList, setSelectedPOPData)} style={{ marginRight: 8, fontSize: 12 }}>Check all</button>
                                    <button onClick={() => handleDeselectAll(setSelectedPOPData)} style={{ fontSize: 12 }}>Uncheck all</button>
                                </div>
                                {popDataList.map(opt => (
                                    <label key={opt.IdNode} style={{ display: 'block', fontSize: 12 }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPOPData.includes(opt.IdNode)} 
                                            onChange={() => handleCheckboxChange(opt.IdNode, selectedPOPData, setSelectedPOPData)} 
                                        />{' '}{opt.HostName} ({opt.IdNode.replace('/32', '')})
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Time Range Selection */}
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Khoảng thời gian:</div>
                        <select 
                            value={selectedRange} 
                            onChange={(e) => setSelectedRange(e.target.value)}
                            style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4 }}
                        >
                            <option value="1h">1 Giờ</option>
                            <option value="6h">6 Giờ</option>
                            <option value="12h">12 Giờ</option>
                            <option value="24h">24 Giờ</option>
                            <option value="3d">3 Ngày</option>
                            <option value="7d">7 Ngày</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <button 
                            onClick={loadBandwidthData}
                            disabled={isBandwidthLoading}
                            style={{ 
                                padding: '8px 16px', 
                                backgroundColor: '#2563eb', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: 4, 
                                cursor: isBandwidthLoading ? 'not-allowed' : 'pointer',
                                opacity: isBandwidthLoading ? 0.6 : 1
                            }}
                        >
                            {isBandwidthLoading ? 'Đang tải...' : 'Áp dụng'}
                        </button>
                        <button 
                            onClick={exportToExcel}
                            style={{ 
                                padding: '8px 16px', 
                                backgroundColor: '#059669', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: 4, 
                                cursor: 'pointer'
                            }}
                        >
                            Xuất Excel
                        </button>
                    </div>
                </div>

                {/* Chart */}
                <div style={{ 
                    background: '#fff', 
                    borderRadius: 12, 
                    padding: 16, 
                    boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
                    marginBottom: 20 
                }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px 0' }}>
                        Lưu lượng LSP theo từng Path (Đơn vị: GB) - {bandwidthData.length} điểm dữ liệu ({selectedRange})
                    </h3>
                    
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={bandwidthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="ts" 
                                tickFormatter={(value) => {
                                    try {
                                        return new Date(value).toLocaleTimeString('vi-VN', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        });
                                    } catch {
                                        return value;
                                    }
                                }}
                            />
                            <YAxis />
                            <Tooltip 
                                labelFormatter={(value) => {
                                    try {
                                        return new Date(value).toLocaleString('vi-VN');
                                    } catch {
                                        return value;
                                    }
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="bandwidth" 
                                stroke="#2563eb" 
                                strokeWidth={2}
                                name="Bandwidth (GB)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Data Table */}
                {bandwidthData.length > 0 && (
                    <div style={{ 
                        background: '#fff', 
                        borderRadius: 12, 
                        padding: 16, 
                        boxShadow: '0 1px 6px rgba(0,0,0,0.1)' 
                    }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                            Chi tiết dữ liệu LSP ({bandwidthData.length} bản ghi)
                        </h3>
                        <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc' }}>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Thời gian</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>From → To</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Path LSP</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>Bandwidth (GB)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bandwidthData.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                                                {new Date(item.ts).toLocaleString('vi-VN')}
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                {item.fromAddress?.replace('/32', '')} → {item.toAddress?.replace('/32', '')}
                                            </td>
                                            <td style={{ padding: '8px' }}>{item.pathLsp}</td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                                                {parseFloat(item.bandwidth).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const mapState = ({ ...state }) => ({});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(I004Dashboard);