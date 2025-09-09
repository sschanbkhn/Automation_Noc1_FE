import React, { useEffect, useState } from 'react';
import MyPieChart from './MyPieChart';
import MyBarChart from './MyBarChart';
import { useNavigate } from 'react-router-dom';

interface Device {
  hostname: string;
  type: string;         // vendor
  filename: string;
  version: string;
  department: string;
  status: string;       // "true" / "false"
  total_failed: string; // number in string
}

const Dashboard = () => {
  const [dataJson, setDataJson] = useState<Device[]>([]);
  const [department, setDepartment] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://10.155.43.198:5678/webhook/0ccdc9e0-f2fb-448f-9661-9fd3ef11c049?datamode=device_details');
        const apiResp = await res.json();
        const apiData: Device[] = apiResp.data || []; // <-- unwrap "data"
        setDataJson(apiData);
      } catch (err) {
        console.error('❌ Failed loading device data:', err);
      }
    })();
  }, []);

  // unique departments and vendors
  const departments = Array.from(new Set(dataJson.map(d => d.department || 'Không rõ')));
  const vendors = Array.from(
    new Set(
      dataJson
        .filter(d => !department || d.department === department)
        .map(d => d.type || 'Không rõ')
    )
  );

  // filtering
  const filteredData = dataJson.filter(
    d =>
      (!department || d.department === department) &&
      (!vendor || d.type === vendor)
  );

  // pie chart (pass/fail by status)
const getDeviceStatusChart = () => {
  let pass = 0, fail = 0;
  filteredData.forEach(device => {
    if (device.status === 'true') fail++;   // ✅ true = FAIL
    else pass++;
  });
  return [
    { label: 'Pass', value: pass, color: '#4CAF50' },
    { label: 'Fail', value: fail, color: '#F44336' }
  ];
};

// bar chart (fail rate per department)
const getDepartmentBarChartData = () => {
  const stats: Record<string, { total: number; fail: number }> = {};
  dataJson.forEach(d => {
    const dep = d.department || 'Không rõ';
    stats[dep] = stats[dep] || { total: 0, fail: 0 };
    stats[dep].total++;
    if (d.status === 'true') stats[dep].fail++;  // ✅ count fail correctly
  });

  return Object.entries(stats)
    .map(([dep, { total, fail }]) => {
      const percentFail = total > 0 ? Math.round((fail / total) * 100) : 0;
      return { label: dep, value: percentFail, color: '#F44336' };
    })
    .sort((a, b) => b.value - a.value);
};

  const handleBarClick = (depData: any) => {
    const dep = depData.label || '';
    navigate(`/vn2mane_details?${new URLSearchParams({ department: dep })}`);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thiết bị - Báo cáo kiểm tra</h2>

      {/* Department Fail Rate */}
      <div className="row mb-4" style={{ width: '100%', height: '400px' }}>
        <MyBarChart
          title="🚩 Tỷ lệ lỗi theo phòng ban (%)"
          data={getDepartmentBarChartData()}
          onClickBar={handleBarClick}
        />
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Phòng ban:</label>
          <select
            className="form-select"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setVendor('');
            }}
          >
            <option value="">-- Tất cả --</option>
            {departments.map(dep => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Vendor (Type):</label>
          <select
            className="form-select"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            disabled={!department}
          >
            <option value="">-- Tất cả --</option>
            {vendors.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {department && vendor ? (
        <div className="row">
          <div className="col-md-6">
            <MyPieChart
              title="1️⃣ Tổng kết thiết bị (Đạt/ Không đạt)"
              data={getDeviceStatusChart()}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted mt-4">
          🎯 Vui lòng chọn phòng ban và Vendor để hiển thị biểu đồ.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
