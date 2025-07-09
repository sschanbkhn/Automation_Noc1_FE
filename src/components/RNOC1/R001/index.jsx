import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlDialog from 'components/common/CtrlDialog';
import data from './data.json';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

const SAMPLE_DATA = {
  date: '2025-07-04',
  vendors: [
    {
      name: 'Nokia',
      total_stations: 165000,
      technologies: [
        { type: '3G', count: 200 },
        { type: '4G', count: 250 },
        { type: '5G', count: 50 }
      ],
      config_errors: {
        total: 10,
        technologies: [
          {
            type: '3G',
            count: 4,
            stations: [
              { id: 'SR_CGY108M_HNI', name: 'SR_CGY108M_HNI', parameters: [
                { name: 'LAC', actual: '100', expected: '101' },
                { name: 'RAC', actual: '200', expected: '201' },
                { name: 'CI', actual: '300', expected: '301' },
                { name: 'DLPrimaryScramblingCode', actual: '400', expected: '401' },
                { name: 'Frequency', actual: '2100', expected: '2101' },
                { name: 'AdminState', actual: 'locked', expected: 'unlocked' },
                { name: 'Celltype', actual: 'macro', expected: 'macro' }
              ] },
              { id: 'UL_BDH002M_HNI', name: 'UL_BDH002M_HNI', parameters: [
                { name: 'LAC', actual: '102', expected: '103' },
                { name: 'RAC', actual: '202', expected: '203' },
                { name: 'CI', actual: '302', expected: '303' },
                { name: 'DLPrimaryScramblingCode', actual: '402', expected: '403' },
                { name: 'Frequency', actual: '2102', expected: '2103' },
                { name: 'AdminState', actual: 'locked', expected: 'unlocked' },
                { name: 'Celltype', actual: 'macro', expected: 'macro' }
              ] },
              { id: 'SR_BDH003M_HNI', name: 'SR_BDH003M_HNI', parameters: [
                { name: 'LAC', actual: '104', expected: '105' },
                { name: 'RAC', actual: '204', expected: '205' },
                { name: 'CI', actual: '304', expected: '305' },
                { name: 'DLPrimaryScramblingCode', actual: '404', expected: '405' },
                { name: 'Frequency', actual: '2104', expected: '2105' },
                { name: 'AdminState', actual: 'locked', expected: 'unlocked' },
                { name: 'Celltype', actual: 'macro', expected: 'macro' }
              ] },
              { id: 'SR_BDH004M_HNI', name: 'SR_BDH004M_HNI', parameters: [
                { name: 'LAC', actual: '106', expected: '107' },
                { name: 'RAC', actual: '206', expected: '207' },
                { name: 'CI', actual: '306', expected: '307' },
                { name: 'DLPrimaryScramblingCode', actual: '406', expected: '407' },
                { name: 'Frequency', actual: '2106', expected: '2107' },
                { name: 'AdminState', actual: 'locked', expected: 'unlocked' },
                { name: 'Celltype', actual: 'macro', expected: 'macro' }
              ] },
              { id: 'SR_BDH006M_HNI', name: 'SR_BDH006M_HNI', parameters: [
                { name: 'LAC', actual: '108', expected: '109' },
                { name: 'RAC', actual: '208', expected: '209' },
                { name: 'CI', actual: '308', expected: '309' },
                { name: 'DLPrimaryScramblingCode', actual: '408', expected: '409' },
                { name: 'Frequency', actual: '2108', expected: '2109' },
                { name: 'AdminState', actual: 'locked', expected: 'unlocked' },
                { name: 'Celltype', actual: 'macro', expected: 'macro' }
              ] },
              { id: 'SR_CGY108M_HNI_2', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_3', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_4', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_5', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_6', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_7', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_8', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_CGY108M_HNI_9', name: 'SR_CGY108M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'UL_BDH002M_HNI_2', name: 'UL_BDH002M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'UL_BDH002M_HNI_3', name: 'UL_BDH002M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'UL_BDH002M_HNI_4', name: 'UL_BDH002M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'UL_BDH002M_HNI_5', name: 'UL_BDH002M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'UL_BDH002M_HNI_6', name: 'UL_BDH002M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH003M_HNI_2', name: 'SR_BDH003M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH003M_HNI_3', name: 'SR_BDH003M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_2', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_3', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_4', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_5', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_6', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_7', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH004M_HNI_8', name: 'SR_BDH004M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH006M_HNI_2', name: 'SR_BDH006M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH006M_HNI_3', name: 'SR_BDH006M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] },
              { id: 'SR_BDH006M_HNI_4', name: 'SR_BDH006M_HNI', parameters: [ { name: 'Power', actual: '20dBm', expected: '30dBm' } ] }
            ]
          },
          { type: '4G', count: 5, stations: [
            {
              id: 'NOKIA_4G_001',
              name: 'NOKIA_4G_001',
              parameters: [
                { name: 'administrativestate', actual: 'locked', expected: 'unlocked' },
                { name: 'phycellid', actual: '10', expected: '20' },
                { name: 'tac', actual: '1001', expected: '1002' },
                { name: 'cellname', actual: 'CELL_A', expected: 'CELL_B' },
                { name: 'lcrid', actual: '1', expected: '2' },
                { name: 'enbname', actual: 'ENB_A', expected: 'ENB_B' },
                { name: 'mrbts_name', actual: 'MRBTS_A', expected: 'MRBTS_B' },
                { name: 'earfcnul', actual: '18000', expected: '18500' },
                { name: 'earfcndl', actual: '18000', expected: '18500' },
                { name: 'rootseqindex', actual: '100', expected: '101' },
                { name: 'dlchbw', actual: '10', expected: '20' },
                { name: 'ulchbw', actual: '10', expected: '20' },
                { name: 'chbw', actual: '10', expected: '20' },
                { name: 'direction', actual: 'downlink', expected: 'uplink' }
              ]
            },
            {
              id: 'NOKIA_4G_002',
              name: 'NOKIA_4G_002',
              parameters: [
                { name: 'administrativestate', actual: 'locked', expected: 'unlocked' },
                { name: 'phycellid', actual: '11', expected: '21' },
                { name: 'tac', actual: '1003', expected: '1004' },
                { name: 'cellname', actual: 'CELL_C', expected: 'CELL_D' },
                { name: 'lcrid', actual: '3', expected: '4' },
                { name: 'enbname', actual: 'ENB_C', expected: 'ENB_D' },
                { name: 'mrbts_name', actual: 'MRBTS_C', expected: 'MRBTS_D' },
                { name: 'earfcnul', actual: '18100', expected: '18600' },
                { name: 'earfcndl', actual: '18100', expected: '18600' },
                { name: 'rootseqindex', actual: '102', expected: '103' },
                { name: 'dlchbw', actual: '15', expected: '25' },
                { name: 'ulchbw', actual: '15', expected: '25' },
                { name: 'chbw', actual: '15', expected: '25' },
                { name: 'direction', actual: 'downlink', expected: 'uplink' }
              ]
            }
          ] },
          { type: '5G', count: 1, stations: [] }
        ]
      }
    },
    {
      name: 'Huawei',
      total_stations: 180000,
      technologies: [
        { type: '3G', count: 250 },
        { type: '4G', count: 300 },
        { type: '5G', count: 50 }
      ],
      config_errors: {
        total: 15,
        technologies: [
          { type: '3G', count: 5, stations: [] },
          { type: '4G', count: 8, stations: [] },
          { type: '5G', count: 2, stations: [] }
        ]
      }
    },
    {
      name: 'Ericsson',
      total_stations: 145000,
      technologies: [
        { type: '3G', count: 150 },
        { type: '4G', count: 200 },
        { type: '5G', count: 50 }
      ],
      config_errors: {
        total: 5,
        technologies: [
          { type: '3G', count: 2, stations: [] },
          { type: '4G', count: 2, stations: [] },
          { type: '5G', count: 1, stations: [] }
        ]
      }
    }
  ]
};

export default function DashboardR001() {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedStations, setSelectedStations] = useState([]);
  const [selectedParams, setSelectedParams] = useState([]);
  const [date, setDate] = useState(SAMPLE_DATA.date);
  const [fromDate, setFromDate] = useState('2025-07-01');
  const [toDate, setToDate] = useState('2025-07-04');
  const [showStationModal, setShowStationModal] = useState(false);
  const [modalStationList, setModalStationList] = useState([]);
  const [showParamModal, setShowParamModal] = useState(false);
  const [modalParamList, setModalParamList] = useState([]);
  const [modalParamStation, setModalParamStation] = useState('');
  const [sentParams, setSentParams] = useState([]);
  const [showVendorStationList, setShowVendorStationList] = useState(false);

  // Tổng hợp dữ liệu cho biểu đồ vendor
  const vendorLabels = SAMPLE_DATA.vendors.map(v => v.name);
  const vendorData = SAMPLE_DATA.vendors.map(v => v.total_stations);
  const vendorErrorData = SAMPLE_DATA.vendors.map(v => v.config_errors.total);

  // Drill-down: công nghệ theo vendor
  const techData = selectedVendor
    ? SAMPLE_DATA.vendors.find(v => v.name === selectedVendor).technologies
    : [];
  const techErrorData = selectedVendor
    ? SAMPLE_DATA.vendors.find(v => v.name === selectedVendor).config_errors.technologies
    : [];

  // Drill-down: danh sách trạm sai theo công nghệ
  const stationList = selectedVendor && selectedTech
    ? techErrorData.find(t => t.type === selectedTech)?.stations || []
    : [];

  // Drill-down: tham số sai của trạm
  const paramList = selectedStations.length === 1
    ? selectedStations[0].parameters
    : [];

  // Hàm mở modal danh sách trạm sai (dùng data.json)
  const handleShowStationModal = (tech) => {
    if (tech) {
      const stations = data[tech]?.stations || [];
      const paramCount = (data[tech]?.parameters || []).length;
      setModalStationList(stations.map(name => ({
        name,
        errorCount: paramCount,
        tech
      })));
      setShowStationModal(true);
    } else {
      // Nếu chưa chọn lát cắt, mở modal với tất cả trạm của tất cả công nghệ
      const allStations = [];
      Object.keys(data).forEach(techKey => {
        const stations = data[techKey]?.stations || [];
        const paramCount = (data[techKey]?.parameters || []).length;
        stations.forEach(name => {
          allStations.push({ name, errorCount: paramCount, tech: techKey });
        });
      });
      setModalStationList(allStations);
      setShowStationModal(true);
    }
  };

  // Hàm mở modal tham số sai cho 1 trạm
  const handleShowParamModal = (tech, station) => {
    const params = data[tech]?.parameters || [];
    // Sinh giá trị actual/expected: chẵn thì sai, lẻ thì đúng
    const paramList = params.map((name, idx) => {
      if (idx % 2 === 0) {
        return {
          name,
          actual: name + '_sai_' + idx,
          expected: name + '_dung_' + idx
        };
      } else {
        return {
          name,
          actual: name + '_dung_' + idx,
          expected: name + '_dung_' + idx
        };
      }
    });
    setModalParamList(paramList);
    setModalParamStation(station);
    setShowParamModal(true);
  };

  // Đảm bảo columns luôn là mảng cố định
  const stationColumns = [
    { title: 'Tên trạm', data: 'name' },
    { title: 'Số lượng tham số sai', data: 'errorCount' },
    { title: 'Công nghệ', data: 'tech' },
    { title: 'Chi tiết', data: 'action', Render: (row) => (
      <button className="text-blue-600 underline" onClick={() => {
        // Lấy đúng parameters từ data.json
        let params = [];
        const techObj = data[selectedTech || row.tech];
        if (techObj && Array.isArray(techObj.stations)) {
          const found = techObj.stations.find(
            s => s === row.name || s === row.id || s.name === row.name || s.id === row.id
          );
          if (found && found.parameters) {
            params = found.parameters;
          }
        }
        // Nếu không tìm thấy thì lấy từ row.parameters hoặc sinh giả lập
        if (!params || params.length === 0) {
          params = Array.isArray(row.parameters) && row.parameters.length > 0
            ? row.parameters
            : [
                { name: 'Param1', actual: 'Sai', expected: 'Đúng' },
                { name: 'Param2', actual: 'Sai', expected: 'Đúng' },
                { name: 'Param3', actual: 'Sai', expected: 'Đúng' }
              ];
        }
        setModalParamList(params);
        setModalParamStation(row.name);
        setShowParamModal(true);
      }}>Chi tiết</button>
    )}
  ];

  const paramColumns = [
    { title: 'Tên tham số', data: 'name' },
    { title: 'Giá trị thực tế', data: 'actual' },
    { title: 'Giá trị mong muốn', data: 'expected' }
  ];

  // Hàm onClick cho chart Số lượng trạm theo Vendor
  const handleVendorBarClick = (e, elements) => {
    if (elements.length > 0) {
      setSelectedVendor(vendorLabels[elements[0].index]);
      setSelectedTech(null);
      setSelectedStations([]);
      setShowVendorStationList(true);
    }
  };

  // Hàm onClick cho chart Số lượng trạm sai file config
  const handleErrorBarClick = (e, elements) => {
    if (elements.length > 0) {
      setSelectedVendor(vendorLabels[elements[0].index]);
      setSelectedTech(null);
      setSelectedStations([]);
      setShowVendorStationList(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-4 text-center">Dashboard Danh Sách Trạm có File Config</h2>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 md:mb-6 items-center justify-between">
          <form className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
            <label className="font-semibold mr-2">Từ ngày:</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border rounded px-2 py-1" />
           
          </form>
        </div>
        {/* Biểu đồ tổng hợp vendor */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-4">
          <table width="100%" style={{borderCollapse:'collapse', marginTop: 8}}>
            <tbody>
              <tr>
                <td>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2 text-base md:text-lg">Số lượng trạm theo Vendor</h3>
                    <div style={{width: '100%', maxWidth: 420, margin: '0 auto'}}>
                      <Bar
                        data={{
                          labels: vendorLabels,
                          datasets: [
                            {
                              label: 'Tổng số trạm',
                              data: vendorData,
                              backgroundColor: ['#1890ff', '#52c41a', '#faad14'],
                            }
                          ]
                        }}
                        options={{
                          onClick: handleVendorBarClick,
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: ctx => `Số lượng: ${ctx.parsed.y}`
                              }
                            }
                          },
                          maintainAspectRatio: false,
                          responsive: true,
                          scales: { x: { ticks: { font: { size: 12 } } }, y: { ticks: { font: { size: 12 } } } }
                        }}
                        height={220}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">* Click vào cột để xem chi tiết theo công nghệ</div>
                  </div>
                </td>
                <td style={{verticalAlign:'top'}}>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2 text-base md:text-lg">Số lượng trạm sai file config</h3>
                    <div style={{width: '100%', maxWidth: 420, margin: '0 auto'}}>
                      <Bar
                        data={{
                          labels: vendorLabels,
                          datasets: [
                            {
                              label: 'Trạm sai file config',
                              data: vendorErrorData,
                              backgroundColor: ['#ff4d4f', '#faad14', '#1890ff'],
                            }
                          ]
                        }}
                        options={{
                          onClick: handleErrorBarClick,
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: ctx => `Số lượng: ${ctx.parsed.y}`
                              }
                            }
                          },
                          maintainAspectRatio: false,
                          responsive: true,
                          scales: { x: { ticks: { font: { size: 12 } } }, y: { ticks: { font: { size: 12 } } } }
                        }}
                        height={220}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 mb-2">* Click vào cột để drill-down theo công nghệ</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Bảng độc lập: Danh sách trạm bị sai */}
        <table width="100%" style={{borderCollapse:'collapse', marginTop: 8}}>
          <tbody>
            <tr>
              <td width="50%" style={{verticalAlign:'top'}}>
            {selectedVendor && showVendorStationList && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-2 text-base md:text-lg">Danh sách trạm của Vendor: {selectedVendor}</h4>
                  {/* Biểu đồ hình tròn số lượng trạm theo công nghệ */}
                  <div style={{width: 260, margin: '0 auto 24px auto'}}>
                    {(() => {
                      const vendor = SAMPLE_DATA.vendors.find(v => v.name === selectedVendor);
                      if (!vendor) return null;
                      const techLabels = vendor.technologies.map(t => t.type);
                      const techCounts = vendor.technologies.map(t => t.count);
                      return (
                        <Pie
                          data={{
                            labels: techLabels,
                            datasets: [
                              {
                                data: techCounts,
                                backgroundColor: ['#38bdf8', '#22d3ee', '#a3e635'],
                              }
                            ]
                          }}
                          options={{
                            plugins: {
                              legend: { display: true, position: 'bottom' },
                              tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } }
                            },
                            maintainAspectRatio: false,
                            responsive: true,
                          }}
                          height={180}
                        />
                      );
                    })()}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm" style={{borderCollapse:'collapse', marginTop: 8}}>
                      <thead>
                        <tr style={{ background: '#f3f4f6' }}>
                          <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>STT</th>
                          <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Tên trạm</th>
                          <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Công nghệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const vendor = SAMPLE_DATA.vendors.find(v => v.name === selectedVendor);
                          if (!vendor) return null;
                          let rows = [];
                          vendor.technologies.forEach(tech => {
                            for (let i = 0; i < tech.count; i++) {
                              rows.push({
                                name: `${tech.type}_Station_${i+1}`,
                                tech: tech.type
                              });
                            }
                          });
                          return rows.map((row, idx) => (
                            <tr key={idx}>
                              <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{idx+1}</td>
                              <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{row.name}</td>
                              <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{row.tech}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setShowVendorStationList(false)}>Đóng</button>
                </div>
              )}
            </td>
            <td width="50%" style={{verticalAlign:'top'}}>
            
              {selectedVendor && !selectedTech && (
          <div className="mt-8">
            <h4 className="font-semibold mb-2 text-base md:text-lg">Danh sách trạm bị sai ({selectedVendor})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm" style={{borderCollapse:'collapse', marginTop: 8}}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>STT</th>
                    <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Công nghệ</th>
                    <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Tên trạm</th>
                    <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Số lượng tham số sai</th>
                    <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Trạng thái</th>
                    <th style={{border:'1px solid #d1d5db', fontWeight:700, textAlign:'center', padding:'6px 8px'}}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let result = [];
                    techErrorData.forEach(tech => {
                      if (Array.isArray(tech.stations) && tech.stations.length > 0) {
                        tech.stations.forEach((station, idx) => {
                          result.push({
                            tech: tech.type,
                            name: station.name || station.id || station,
                            errorCount: Array.isArray(station.parameters) ? station.parameters.length : 0,
                            parameters: station.parameters || [],
                          });
                        });
                      } else {
                        result.push({
                          tech: tech.type,
                          name: 'Tram_' + tech.type + '_FAKE',
                          errorCount: 3,
                          parameters: [
                            { name: 'Param1', actual: 'Sai', expected: 'Đúng' },
                            { name: 'Param2', actual: 'Sai', expected: 'Đúng' },
                            { name: 'Param3', actual: 'Sai', expected: 'Đúng' }
                          ]
                        });
                      }
                    });
                    return result.map((row, idx) => {
                      // Lấy danh sách các tham số sai của trạm này
                      const wrongParams = (row.parameters || []).filter(p => p.actual !== p.expected);
                      // Tạo mảng khóa cho từng tham số sai
                      const keys = wrongParams.map(p => `${row.name}__${p.name}`);
                      // Nếu tất cả các khóa này đều có trong sentParams thì coi là đã gửi
                      const isSent = keys.length > 0 && keys.every(k => sentParams.includes(k));
                      return (
                        <tr key={idx}>
                          <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{idx+1}</td>
                          <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{row.tech}</td>
                          <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{row.name}</td>
                          <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>{row.errorCount}</td>
                          <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>
                            {isSent ? <span style={{color:'#22c55e',fontWeight:600,display:'inline-flex',alignItems:'center'}}>Đã gửi <svg style={{marginLeft:4}} width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> : <span style={{color:'#ef4444'}}>Chưa gửi</span>}
                          </td>
                          <td style={{border:'1px solid #d1d5db', textAlign:'center', padding:'6px 8px'}}>
                            <button style={{background:'#2563eb',color:'#fff',border:'none',padding:'6px 16px',borderRadius:4,cursor:'pointer'}} className="hover:bg-blue-700" onClick={() => {
                              let params = [];
                              const techObj = data[selectedTech || row.tech];
                              if (techObj && Array.isArray(techObj.stations)) {
                                const found = techObj.stations.find(
                                  s => s === row.name || s === row.id || s.name === row.name || s.id === row.id
                                );
                                if (found && found.parameters) {
                                  params = found.parameters;
                                }
                              }
                              if (!params || params.length === 0) {
                                params = Array.isArray(row.parameters) && row.parameters.length > 0
                                  ? row.parameters
                                  : [
                                      { name: 'Param1', actual: 'Sai', expected: 'Đúng' },
                                      { name: 'Param2', actual: 'Sai', expected: 'Đúng' },
                                      { name: 'Param3', actual: 'Sai', expected: 'Đúng' }
                                    ];
                              }
                              setModalParamList(params);
                              setModalParamStation(row.name);
                              setShowParamModal(true);
                            }}>Chi tiết</button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => { setSelectedVendor(null); setSelectedTech(null); setSelectedStations([]); }}>Quay lại</button>
          </div>
        )}
            </td>
          </tr>
        </tbody>
        </table>
       
        {/* Drill-down: công nghệ */}
        
      
        {/* Drill-down: danh sách trạm sai */}
        {selectedVendor && selectedTech && (
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Danh sách trạm sai ({selectedVendor} - {selectedTech})</h4>
            <CtrlDynamicTable
              columnDefs={[
                { Title: 'Mã trạm', Key: 'id' },
                { Title: 'Tên trạm', Key: 'name' },
                { Title: 'Tham số sai', Key: 'parameters', Render: (params) => params.map(p => p.name).join(', ') }
              ]}
              dataItems={Array.isArray(stationList) ? stationList : []}
              // Có thể bổ sung các props khác nếu cần
            />
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => { setSelectedTech(null); setSelectedStations([]); }}>Quay lại</button>
          </div>
        )}
        {/* Drill-down: tham số sai */}
        {selectedStations.length === 1 && (
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Chi tiết tham số sai ({selectedStations[0].name})</h4>
            <CtrlDynamicTable
              columnDefs={[
                { Title: 'Tên tham số', Key: 'name' },
                { Title: 'Giá trị thực tế', Key: 'actual' },
                { Title: 'Giá trị mong muốn', Key: 'expected' }
              ]}
              dataItems={Array.isArray(paramList) ? paramList : []}
            />
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSelectedStations([])}>Quay lại</button>
          </div>
        )}
      </div>
      {/* Modal danh sách trạm sai */}
      <CtrlDialog open={showStationModal} onClose={() => setShowStationModal(false)} title="Danh sách trạm sai">
        {Array.isArray(modalStationList) && modalStationList.length > 0 ? (
          <CtrlDynamicTable columnDefs={stationColumns} dataItems={modalStationList} />
        ) : (
          <div className="text-center text-gray-500 py-4">Không có trạm sai</div>
        )}
        <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setShowStationModal(false)}>Quay lại</button>
      </CtrlDialog>
      {/* Modal tham số sai của 1 trạm */}
      {showParamModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, maxWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <h3 style={{marginBottom: 16, fontSize: 20, fontWeight: 600, color: '#2563eb'}}>Tham số sai ({modalParamStation})</h3>
            <table border="0" cellPadding={6} style={{ width: '100%', marginBottom: 18, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{borderBottom: '1px solid #e5e7eb'}}>Tên tham số</th>
                  <th style={{borderBottom: '1px solid #e5e7eb'}}>Giá trị thực tế</th>
                  <th style={{borderBottom: '1px solid #e5e7eb'}}>Giá trị mong muốn</th>
                </tr>
              </thead>
              <tbody>
                {modalParamList.map((param, idx) => {
                  const isWrong = param.actual !== param.expected;
                  return (
                    <tr key={idx} style={{ background: isWrong ? '#fee2e2' : '#f0fdf4' }}>
                      <td style={{ color: isWrong ? '#dc2626' : '#15803d', fontWeight: 500 }}>{param.name}</td>
                      <td style={{ color: isWrong ? '#dc2626' : '#15803d' }}>{param.actual}</td>
                      <td style={{ color: isWrong ? '#dc2626' : '#15803d' }}>{param.expected}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button style={{background:'#22c55e',color:'#fff',border:'none'}} className="px-4 py-2 rounded hover:bg-green-700" onClick={() => {
                const wrongParams = modalParamList.filter(p => p.actual !== p.expected);
                window.alert('Gửi thành công ' + wrongParams.length + ' tham số sai!');
                setSentParams(prev => ([...prev, ...wrongParams.map(p => `${modalParamStation}__${p.name}`)]));
                setShowParamModal(false);
              }}>Gửi phiếu</button>
              <button style={{background:'#ef4444',color:'#fff',border:'none'}} className="px-4 py-2 rounded hover:bg-red-700" onClick={() => setShowParamModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
} 