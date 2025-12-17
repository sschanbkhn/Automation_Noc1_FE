// Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import MyPieChart from './MyPieChart';
import MyBarChart from './MyBarChart';

interface Device {
  hostname: string;
  type: string;         // vendor
  filename: string;
  version: string;
  department: string;
  status: string;       // "true" / "false"
  total_failed: string; // number in string
}

interface Filters {
  department?: string;
  vendor?: string;
}

interface DashboardProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: (filters: Filters) => void;
}

interface BarDataItem {
  department: string;
  pass: number;
  fail: number;
  vendors: Record<string, number>;
}

const Dashboard: React.FC<DashboardProps> = ({ goToTab, setFilters }) => {
  const [dataJson, setDataJson] = useState<Device[]>([]);
  const [department, setDepartment] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          'http://10.147.50.118:5678/webhook/0ccdc9e0-f2fb-448f-9661-9fd3ef11c049?datamode=device_details'
        );
        const apiResp = await res.json();
        const apiData: Device[] = apiResp.data || [];
        setDataJson(apiData);
      } catch (err) {
        console.error('❌ Failed loading device data:', err);
        setDataJson([]);
      }
    })();
  }, []);

  // Unique departments and vendors based on current selection
  const departments = useMemo(
    () => Array.from(new Set(dataJson.map(d => d.department || 'Không rõ'))),
    [dataJson]
  );

  const vendors = useMemo(() => {
    return Array.from(
      new Set(
        dataJson
          .filter(d => !department || d.department === department)
          .map(d => d.type || 'Không rõ')
      )
    );
  }, [dataJson, department]);

  // Filter devices according to current department/vendor selection
  const filteredDevices = useMemo(() => {
    return dataJson.filter(
      d =>
        (!department || d.department === department) &&
        (!vendor || d.type === vendor)
    );
  }, [dataJson, department, vendor]);

  // Pie chart data (Pass / Fail)
  const getDeviceStatusChart = () => {
    let pass = 0, fail = 0;
    filteredDevices.forEach(device => {
      if (device.status === 'true') fail++; // true = FAIL
      else pass++;
    });
    return [
      { label: 'Pass', value: pass, color: '#4CAF50' },
      { label: 'Fail', value: fail, color: '#F44336' }
    ];
  };

  // New Bar chart data: department → pass/fail + vendors
  const getDepartmentBarChartData = (): BarDataItem[] => {
    const stats: Record<string, BarDataItem> = {};

    dataJson.forEach(d => {
      const dep = d.department || 'Không rõ';
      const vendorKey: string = d.type || 'Không rõ';
      const status = d.status === 'true' ? 'fail' : 'pass';

      if (!stats[dep]) {
        stats[dep] = { department: dep, pass: 0, fail: 0, vendors: {} };
      }

      stats[dep][status]++;
      stats[dep].vendors[vendorKey] = (stats[dep].vendors[vendorKey] || 0) + 1;
    });

    // Convert to array and sort by total devices (fail + pass + vendor counts)
    const dataArr = Object.values(stats);
    dataArr.sort((a, b) => {
      const totalA = a.fail + a.pass + Object.values(a.vendors).reduce((sum, v) => sum + v, 0);
      const totalB = b.fail + b.pass + Object.values(b.vendors).reduce((sum, v) => sum + v, 0);
      return totalB - totalA; // descending → more devices left
    });

    return dataArr;
  };

  const handleBarClick = (depData: BarDataItem) => {
    if (setFilters) {
      setFilters({ department: depData.department });
      if (goToTab) goToTab('uc2');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thiết bị - Báo cáo kiểm tra</h2>

      {/* Department Fail Rate / Vendor Chart */}
      <div className="row mb-4" style={{ width: '100%', height: '400px' }}>
        <MyBarChart
          title="🚩 Tỷ lệ lỗi theo phòng ban & Vendor"
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
            onChange={e => {
              setDepartment(e.target.value);
              setVendor('');
            }}
          >
            <option value="">-- Tất cả --</option>
            {departments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Vendor (Type):</label>
          <select
            className="form-select"
            value={vendor}
            onChange={e => setVendor(e.target.value)}
            disabled={!department}
          >
            <option value="">-- Tất cả --</option>
            {vendors.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pie Chart */}
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
