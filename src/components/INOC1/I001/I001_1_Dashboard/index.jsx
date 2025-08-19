import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dummyData = {
  '3h': [
    { time: '00:00', 'HNI-P1': 300, 'HNI-P2': 280, 'HCM-P1': 320, 'HCM-P2': 310, 'HPG-P1': 290, 'HPG-P2': 310, 'PTO-P1': 305, 'PTO-P2': 295, 'DNG-P1': 330, 'DNG-P2': 310, 'SGP-EQX-POP1': 270, 'SGP-EQX-POP2': 250, 'HKG-MEGA-POP1': 260, 'HKG-MEGA-POP2': 240, 'HKG-EQX-POP1': 230, 'HKG-EQX-POP2': 220 },
    { time: '01:00', 'HNI-P1': 310, 'HNI-P2': 270, 'HCM-P1': 315, 'HCM-P2': 300, 'HPG-P1': 280, 'HPG-P2': 300, 'PTO-P1': 295, 'PTO-P2': 285, 'DNG-P1': 320, 'DNG-P2': 305, 'SGP-EQX-POP1': 265, 'SGP-EQX-POP2': 255, 'HKG-MEGA-POP1': 250, 'HKG-MEGA-POP2': 235, 'HKG-EQX-POP1': 225, 'HKG-EQX-POP2': 210 },
    { time: '02:00', 'HNI-P1': 295, 'HNI-P2': 275, 'HCM-P1': 325, 'HCM-P2': 295, 'HPG-P1': 285, 'HPG-P2': 310, 'PTO-P1': 310, 'PTO-P2': 300, 'DNG-P1': 335, 'DNG-P2': 320, 'SGP-EQX-POP1': 275, 'SGP-EQX-POP2': 245, 'HKG-MEGA-POP1': 255, 'HKG-MEGA-POP2': 230, 'HKG-EQX-POP1': 215, 'HKG-EQX-POP2': 200 }
  ],
  '12h': [
    { time: '00:00', 'HNI-P1': 500, 'HNI-P2': 480, 'HCM-P1': 520, 'HCM-P2': 510, 'HPG-P1': 490, 'HPG-P2': 510, 'PTO-P1': 505, 'PTO-P2': 495, 'DNG-P1': 530, 'DNG-P2': 510, 'SGP-EQX-POP1': 470, 'SGP-EQX-POP2': 450, 'HKG-MEGA-POP1': 460, 'HKG-MEGA-POP2': 440, 'HKG-EQX-POP1': 430, 'HKG-EQX-POP2': 420 },
    { time: '06:00', 'HNI-P1': 520, 'HNI-P2': 470, 'HCM-P1': 515, 'HCM-P2': 500, 'HPG-P1': 480, 'HPG-P2': 500, 'PTO-P1': 495, 'PTO-P2': 485, 'DNG-P1': 520, 'DNG-P2': 505, 'SGP-EQX-POP1': 465, 'SGP-EQX-POP2': 455, 'HKG-MEGA-POP1': 450, 'HKG-MEGA-POP2': 435, 'HKG-EQX-POP1': 425, 'HKG-EQX-POP2': 410 },
    { time: '12:00', 'HNI-P1': 505, 'HNI-P2': 475, 'HCM-P1': 525, 'HCM-P2': 495, 'HPG-P1': 485, 'HPG-P2': 510, 'PTO-P1': 510, 'PTO-P2': 500, 'DNG-P1': 535, 'DNG-P2': 520, 'SGP-EQX-POP1': 475, 'SGP-EQX-POP2': 445, 'HKG-MEGA-POP1': 455, 'HKG-MEGA-POP2': 430, 'HKG-EQX-POP1': 415, 'HKG-EQX-POP2': 400 }
  ],
  '24h': [
    { time: '00:00', 'HNI-P1': 600, 'HNI-P2': 580, 'HCM-P1': 620, 'HCM-P2': 610, 'HPG-P1': 590, 'HPG-P2': 610, 'PTO-P1': 605, 'PTO-P2': 595, 'DNG-P1': 630, 'DNG-P2': 610, 'SGP-EQX-POP1': 570, 'SGP-EQX-POP2': 550, 'HKG-MEGA-POP1': 560, 'HKG-MEGA-POP2': 540, 'HKG-EQX-POP1': 530, 'HKG-EQX-POP2': 520 },
    { time: '06:00', 'HNI-P1': 610, 'HNI-P2': 570, 'HCM-P1': 615, 'HCM-P2': 600, 'HPG-P1': 580, 'HPG-P2': 600, 'PTO-P1': 595, 'PTO-P2': 585, 'DNG-P1': 620, 'DNG-P2': 605, 'SGP-EQX-POP1': 565, 'SGP-EQX-POP2': 555, 'HKG-MEGA-POP1': 550, 'HKG-MEGA-POP2': 535, 'HKG-EQX-POP1': 525, 'HKG-EQX-POP2': 510 },
    { time: '12:00', 'HNI-P1': 595, 'HNI-P2': 575, 'HCM-P1': 625, 'HCM-P2': 595, 'HPG-P1': 585, 'HPG-P2': 610, 'PTO-P1': 610, 'PTO-P2': 600, 'DNG-P1': 635, 'DNG-P2': 620, 'SGP-EQX-POP1': 575, 'SGP-EQX-POP2': 545, 'HKG-MEGA-POP1': 555, 'HKG-MEGA-POP2': 530, 'HKG-EQX-POP1': 515, 'HKG-EQX-POP2': 500 },
    { time: '18:00', 'HNI-P1': 615, 'HNI-P2': 560, 'HCM-P1': 630, 'HCM-P2': 580, 'HPG-P1': 570, 'HPG-P2': 590, 'PTO-P1': 585, 'PTO-P2': 570, 'DNG-P1': 610, 'DNG-P2': 590, 'SGP-EQX-POP1': 550, 'SGP-EQX-POP2': 530, 'HKG-MEGA-POP1': 540, 'HKG-MEGA-POP2': 515, 'HKG-EQX-POP1': 505, 'HKG-EQX-POP2': 490 },
    { time: '23:59', 'HNI-P1': 625, 'HNI-P2': 550, 'HCM-P1': 640, 'HCM-P2': 570, 'HPG-P1': 560, 'HPG-P2': 580, 'PTO-P1': 575, 'PTO-P2': 560, 'DNG-P1': 600, 'DNG-P2': 580, 'SGP-EQX-POP1': 540, 'SGP-EQX-POP2': 520, 'HKG-MEGA-POP1': 530, 'HKG-MEGA-POP2': 510, 'HKG-EQX-POP1': 495, 'HKG-EQX-POP2': 480 }
  ],
  '1w': [
    { time: 'Mon', 'HNI-P1': 800, 'HNI-P2': 770, 'HCM-P1': 820, 'HCM-P2': 790, 'HPG-P1': 780, 'HPG-P2': 800, 'PTO-P1': 805, 'PTO-P2': 795, 'DNG-P1': 830, 'DNG-P2': 810, 'SGP-EQX-POP1': 740, 'SGP-EQX-POP2': 720, 'HKG-MEGA-POP1': 730, 'HKG-MEGA-POP2': 710, 'HKG-EQX-POP1': 700, 'HKG-EQX-POP2': 690 },
    { time: 'Tue', 'HNI-P1': 820, 'HNI-P2': 760, 'HCM-P1': 825, 'HCM-P2': 780, 'HPG-P1': 770, 'HPG-P2': 790, 'PTO-P1': 795, 'PTO-P2': 785, 'DNG-P1': 820, 'DNG-P2': 805, 'SGP-EQX-POP1': 735, 'SGP-EQX-POP2': 725, 'HKG-MEGA-POP1': 720, 'HKG-MEGA-POP2': 705, 'HKG-EQX-POP1': 695, 'HKG-EQX-POP2': 680 },
    { time: 'Wed', 'HNI-P1': 810, 'HNI-P2': 750, 'HCM-P1': 835, 'HCM-P2': 770, 'HPG-P1': 775, 'HPG-P2': 800, 'PTO-P1': 810, 'PTO-P2': 800, 'DNG-P1': 835, 'DNG-P2': 820, 'SGP-EQX-POP1': 745, 'SGP-EQX-POP2': 715, 'HKG-MEGA-POP1': 725, 'HKG-MEGA-POP2': 700, 'HKG-EQX-POP1': 685, 'HKG-EQX-POP2': 670 },
    { time: 'Thu', 'HNI-P1': 830, 'HNI-P2': 740, 'HCM-P1': 845, 'HCM-P2': 760, 'HPG-P1': 760, 'HPG-P2': 780, 'PTO-P1': 785, 'PTO-P2': 770, 'DNG-P1': 810, 'DNG-P2': 790, 'SGP-EQX-POP1': 720, 'SGP-EQX-POP2': 710, 'HKG-MEGA-POP1': 710, 'HKG-MEGA-POP2': 690, 'HKG-EQX-POP1': 675, 'HKG-EQX-POP2': 660 },
    { time: 'Fri', 'HNI-P1': 840, 'HNI-P2': 730, 'HCM-P1': 855, 'HCM-P2': 750, 'HPG-P1': 750, 'HPG-P2': 770, 'PTO-P1': 775, 'PTO-P2': 760, 'DNG-P1': 800, 'DNG-P2': 780, 'SGP-EQX-POP1': 710, 'SGP-EQX-POP2': 700, 'HKG-MEGA-POP1': 700, 'HKG-MEGA-POP2': 680, 'HKG-EQX-POP1': 665, 'HKG-EQX-POP2': 650 }
  ],
  '1m': [
    { time: 'Week 1', 'HNI-P1': 1000, 'HNI-P2': 980, 'HCM-P1': 1020, 'HCM-P2': 990, 'HPG-P1': 970, 'HPG-P2': 980, 'PTO-P1': 985, 'PTO-P2': 975, 'DNG-P1': 1010, 'DNG-P2': 990, 'SGP-EQX-POP1': 940, 'SGP-EQX-POP2': 920, 'HKG-MEGA-POP1': 930, 'HKG-MEGA-POP2': 910, 'HKG-EQX-POP1': 900, 'HKG-EQX-POP2': 890 },
    { time: 'Week 2', 'HNI-P1': 1020, 'HNI-P2': 960, 'HCM-P1': 1030, 'HCM-P2': 980, 'HPG-P1': 960, 'HPG-P2': 970, 'PTO-P1': 975, 'PTO-P2': 965, 'DNG-P1': 1000, 'DNG-P2': 980, 'SGP-EQX-POP1': 930, 'SGP-EQX-POP2': 910, 'HKG-MEGA-POP1': 920, 'HKG-MEGA-POP2': 900, 'HKG-EQX-POP1': 890, 'HKG-EQX-POP2': 880 },
    { time: 'Week 3', 'HNI-P1': 1040, 'HNI-P2': 940, 'HCM-P1': 1040, 'HCM-P2': 970, 'HPG-P1': 950, 'HPG-P2': 960, 'PTO-P1': 965, 'PTO-P2': 955, 'DNG-P1': 990, 'DNG-P2': 970, 'SGP-EQX-POP1': 920, 'SGP-EQX-POP2': 900, 'HKG-MEGA-POP1': 910, 'HKG-MEGA-POP2': 890, 'HKG-EQX-POP1': 880, 'HKG-EQX-POP2': 870 },
    { time: 'Week 4', 'HNI-P1': 1060, 'HNI-P2': 920, 'HCM-P1': 1050, 'HCM-P2': 960, 'HPG-P1': 940, 'HPG-P2': 950, 'PTO-P1': 955, 'PTO-P2': 945, 'DNG-P1': 980, 'DNG-P2': 960, 'SGP-EQX-POP1': 910, 'SGP-EQX-POP2': 890, 'HKG-MEGA-POP1': 900, 'HKG-MEGA-POP2': 880, 'HKG-EQX-POP1': 870, 'HKG-EQX-POP2': 860 }
  ]
};


const timeOptions = [
  { label: '3 tiếng', value: '3h' },
  { label: '12 tiếng', value: '12h' },
  { label: '24 tiếng', value: '24h' },
  { label: '1 tuần', value: '1w' },
  { label: '1 tháng', value: '1m' },
];

const pDataOptions = ['HNI-P1', 'HNI-P2', 'HCM-P1', 'HCM-P2', 'HPG-P1', 'HPG-P2', 'PTO-P1', 'PTO-P2', 'DNG-P1', 'DNG-P2'];
const popDataOptions = ['SGP-EQX-POP1', 'SGP-EQX-POP2', 'HKG-MEGA-POP1', 'HKG-MEGA-POP2', 'HKG-EQX-POP1', 'HKG-EQX-POP2'];

const colorMap = {
  'HNI-P1': '#2563eb', 'HNI-P2': '#3b82f6', 'HCM-P1': '#1d4ed8', 'HCM-P2': '#60a5fa',
  'HPG-P1': '#0ea5e9', 'HPG-P2': '#0284c7', 'PTO-P1': '#0891b2', 'PTO-P2': '#06b6d4',
  'DNG-P1': '#14b8a6', 'DNG-P2': '#10b981',
  'SGP-EQX-POP1': '#dc2626', 'SGP-EQX-POP2': '#ef4444',
  'HKG-MEGA-POP1': '#f97316', 'HKG-MEGA-POP2': '#fb923c',
  'HKG-EQX-POP1': '#f59e0b', 'HKG-EQX-POP2': '#fbbf24'
};

const TableBox = ({ title, headers, rows }) => (
  <div style={{ background: '#fff0f6', borderRadius: 16, padding: 0, flex: 1, margin: '0 8px', border: '1px solid #ddd' }}>
    <div style={{ background: '#ff8c1a', padding: 10, borderTopLeftRadius: 12, borderTopRightRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 18 }}>{title}</div>
    <table style={{ width: '100%', marginTop: 0, tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i} style={{ padding: 10, fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ccc', borderRight: i < headers.length - 1 ? '1px solid #ccc' : 'none' }}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rIdx) => (
          <tr key={rIdx} style={{ borderTop: '1px solid #eee' }}>
            {row.map((cell, cIdx) => (
              <td key={cIdx} style={{ padding: 10, textAlign: 'left', borderRight: cIdx < row.length - 1 ? '1px solid #eee' : 'none' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function LspDashboard() {
  const [selectedRange, setSelectedRange] = useState('24h');
  const [selectedPData, setSelectedPData] = useState(['HNI-P1', 'HNI-P2']);
  const [selectedPOPData, setSelectedPOPData] = useState(['SGP-EQX-POP2', 'HKG-EQX-POP2']);
  const [showPDataDropdown, setShowPDataDropdown] = useState(false);
  const [showPOPDataDropdown, setShowPOPDataDropdown] = useState(false);

  const handleRangeChange = (e) => setSelectedRange(e.target.value);

  const handleCheckboxChange = (value, selectedValues, setFn) => {
    if (selectedValues.includes(value)) {
      setFn(selectedValues.filter(v => v !== value));
    } else {
      setFn([...selectedValues, value]);
    }
  };

  const handleSelectAll = (options, setFn) => setFn([...options]);
  const handleDeselectAll = (setFn) => setFn([]);

  const allLines = [
    ...selectedPData.map(name => ({ name, stroke: colorMap[name] || '#2563eb' })),
    ...selectedPOPData.map(name => ({ name, stroke: colorMap[name] || '#999' }))
  ];

  return (
    <div style={{ padding: 24, background: '#f9f9f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#2563eb', fontSize: 22, fontWeight: 700 }}>LSP Quốc tế / Dashboard</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '18px 0', gap: 40 }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', minWidth: '60%' }}>
          <div style={{ position: 'relative', minWidth: 180 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>P-Data:</div>
            <button onClick={() => setShowPDataDropdown(!showPDataDropdown)} style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, minWidth: 180 }}>Chọn P-Data</button>
            {showPDataDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', padding: 10, zIndex: 10, maxHeight: 240, overflowY: 'auto' }}>
                <div style={{ marginBottom: 8 }}>
                  <button onClick={() => handleSelectAll(pDataOptions, setSelectedPData)} style={{ marginRight: 8 }}>Check all</button>
                  <button onClick={() => handleDeselectAll(setSelectedPData)}>Uncheck all</button>
                </div>
                {pDataOptions.map(opt => (
                  <label key={opt} style={{ display: 'block', fontWeight: 500, color: colorMap[opt] || '#000' }}>
                    <input type="checkbox" checked={selectedPData.includes(opt)} onChange={() => handleCheckboxChange(opt, selectedPData, setSelectedPData)} />{' '}{opt}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', minWidth: 180 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>POP-Data:</div>
            <button onClick={() => setShowPOPDataDropdown(!showPOPDataDropdown)} style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, minWidth: 180 }}>Chọn POP-Data</button>
            {showPOPDataDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', padding: 10, zIndex: 10, maxHeight: 240, overflowY: 'auto' }}>
                <div style={{ marginBottom: 8 }}>
                  <button onClick={() => handleSelectAll(popDataOptions, setSelectedPOPData)} style={{ marginRight: 8 }}>Check all</button>
                  <button onClick={() => handleDeselectAll(setSelectedPOPData)}>Uncheck all</button>
                </div>
                {popDataOptions.map(opt => (
                  <label key={opt} style={{ display: 'block', fontWeight: 500, color: colorMap[opt] || '#000' }}>
                    <input type="checkbox" checked={selectedPOPData.includes(opt)} onChange={() => handleCheckboxChange(opt, selectedPOPData, setSelectedPOPData)} />{' '}{opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600, marginRight: 12 }}>Chọn thời gian hiển thị:</label>
          <select value={selectedRange} onChange={handleRangeChange} style={{ padding: 6, borderRadius: 4 }}>
            {timeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>Lưu lượng LSP (Đơn vị: Mbit/s)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dummyData[selectedRange] || []} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Thời gian (ngày/giờ)', position: 'insideBottom', offset: -30 }} />
            <YAxis label={{ value: 'Mbit/s', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            {allLines.map(line => (
              <Line key={line.name} type="monotone" dataKey={line.name} stroke={line.stroke} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Các bảng phía dưới biểu đồ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, gap: 16 }}>
        <TableBox
          title="Route PECP"
          headers={["UP", "DOWN"]}
          rows={[[<span style={{ color: 'green' }}>green ✕</span>, <span style={{ color: 'red' }}>✕ red</span>],[<span style={{ color: 'green' }}>green ✕</span>, <span style={{ color: 'red' }}>✕ red</span>]]}
        />
        <TableBox
          title="LSP Delegated"
          headers={["Alarms", "Down", "Unknow"]}
          rows={[["5", "0", "1"],["text", "text", "text"]]}
        />
        <TableBox
          title="Route PECP"
          headers={["Title", "Title", "Title"]}
          rows={[["text", "text", "text"],["text", "text", "text"]]}
        />
      </div>
    </div>
  );
}
