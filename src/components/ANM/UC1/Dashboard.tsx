import React, { useEffect, useState } from 'react';
import MyPieChart from './MyPieChart';
import MyBarChart from './MyBarChart';
import { useNavigate } from 'react-router-dom';

// Province mapping
const provinceCodeMap: Record<string, string> = {
  AGG: 'Viễn thông An Giang',
  BRA: 'Viễn thông Bà Rịa - Vũng Tàu',
  BGG: 'Viễn thông Bắc Giang',
  CTV: 'Viễn thông Bắc Ninh',
  BTE: 'Viễn thông Bến Tre',
  BDG: 'Viễn thông Bình Dương',
  BTN: 'Viễn thông Bình Thuận',
  CMU: 'Viễn thông Cà Mau',
  CBG: 'Viễn thông Cao Bằng',
  DLC: 'Viễn thông Đắk Lắk',
  DBN: 'Viễn thông Điện Biên',
  GLI: 'Viễn thông Gia Lai',
  HNM: 'Viễn thông Hà Nam',
  HNI: 'Viễn thông Hà Nội',
  HTH: 'Viễn thông Hà Tĩnh',
  HYN: 'Viễn thông Hưng Yên',
  KGG: 'Viễn thông Kiên Giang',
  KHA: 'Viễn thông Khánh Hòa',
  LCI: 'Viễn thông Lào Cai',
  LDG: 'Viễn thông Lâm Đồng',
  LAN: 'Viễn thông Long An',
  NDH: 'Viễn thông Nam Định',
  NBH: 'Viễn thông Ninh Bình',
  NAN: 'Viễn thông Nghệ An',
  QNM: 'Viễn thông Quảng Nam',
  STG: 'Viễn thông Sóc Trăng',
  TNH: 'Viễn thông Tây Ninh',
  TGG: 'Viễn thông Tiền Giang',
  TBH: 'Viễn thông Thái Bình',
  THA: 'Viễn thông Thanh Hóa',
  TVH: 'Viễn thông Trà Vinh',
  VLG: 'Viễn thông Vĩnh Long'
};

const criteriaMap: Record<string, string> = {
  tc_hostname: 'Kiểm tra hostname',
  tc_patch_info: 'Kiểm tra bản vá',
  tc_telnet_status: 'Trạng thái Telnet',
  tc_ssh_sec: 'SSH bảo mật',
  tc_ssh_version: 'Phiên bản SSH',
  tc_ssh_root: 'Truy cập root SSH',
  tc_remote_access: 'Truy cập từ xa',
  tc_ssh_timeout: 'SSH timeout',
  tc_snmp_version: 'Phiên bản SNMP',
  tc_snmp_access: 'Quyền SNMP',
  tc_snmp_community: 'Cộng đồng SNMP',
  tc_ntp_sec: 'Bảo mật NTP'
};

const provinces = Object.values(provinceCodeMap);

const Dashboard = () => {
  const [dataJson, setDataJson] = useState<any[]>([]);
  const [province, setProvince] = useState<string>('');
  const [olt, setOlt] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          'http://10.155.43.198:5678/webhook/7bd100c2-3a64-4242-928a-b5ecda899f60'
        );
        const apiData: any[] = await res.json();

        const enriched = apiData.map((device) => {
          const hostname = device.test_result?.hostname || '';
          const match = hostname.trim().match(/([A-Z]{3})\./);
          const code = match ? match[1] : '';

          let provinceName = device.province;
          if (!provinceName || provinceName === 'Không rõ') {
            provinceName = provinceCodeMap[code] || 'Không rõ';
          }

          return {
            olt: device.olt || device.test_result?.device_type || 'Không rõ',
            vendor: device.vendor || device.test_result?.vendor || 'Không rõ',
            province: provinceName,
            device: hostname,
            test_result: device.test_result
          };
        });

        setDataJson(enriched);
      } catch (err) {
        console.error('❌ Failed loading device data:', err);
      }
    })();
  }, []);

  const handleClickSlice = (label: string) => {
    if (label === 'Fail') {
      navigate(`/link-uc2?${new URLSearchParams({ type: olt, vendor, province })}`);
    }
  };

  const olts = Array.from(
    new Set(
      dataJson
        .filter((d) => !province || d.province === province)
        .map((d) => d.olt)
    )
  );

  const vendors = Array.from(
    new Set(
      dataJson
        .filter(
          (d) =>
            (!province || d.province === province) &&
            (!olt || d.olt === olt)
        )
        .map((d) => d.vendor)
    )
  );

  const filteredData = dataJson.filter(
    (device) =>
      (!province || device.province === province) &&
      (!olt || device.olt === olt) &&
      (!vendor || device.vendor === vendor)
  );

  const getDeviceStatusChart = () => {
    let pass = 0,
      fail = 0;
    filteredData.forEach((device) => {
      const results = Object.entries(device.test_result || {})
        .filter(([k, v]) => k !== 'tc_hostname' && v !== 'n/a')
        .map(([, v]) => v);
      if (results.length && results.every((r) => r === 'pass')) pass++;
      else fail++;
    });
    return [
      { label: 'Pass', value: pass, color: '#4CAF50' },
      { label: 'Fail', value: fail, color: '#F44336' }
    ];
  };

  const getCriteriaFailChart = () => {
    const failCounts: Record<string, number> = {};
    filteredData.forEach((device) => {
      Object.entries(device.test_result || {}).forEach(([k, v]) => {
        if (v === 'Fail') {
          failCounts[k] = (failCounts[k] || 0) + 1;
        }
      });
    });
    const palette = [
      '#F44336', '#FF9800', '#FFEB3B', '#4FC3F7', '#2196F3',
      '#9C27B0', '#795548', '#00BCD4', '#8BC34A', '#CDDC39',
      '#E91E63', '#607D8B'
    ];
    return Object.entries(failCounts).map(([k, v], i) => ({
      label: criteriaMap[k] || k,
      value: v,
      color: palette[i % palette.length]
    }));
  };

  const getProvinceBarChartData = () => {
    const stats: Record<string, { total: number; fail: number; vendors: string[] }> = {};

    dataJson.forEach((device) => {
      const p = device.province || 'Không rõ';
      const isFail = Object.values(device.test_result || {}).some(
        (v: any) => typeof v === 'string' && v.trim().toLowerCase() === 'fail'
      );

      stats[p] = stats[p] || { total: 0, fail: 0, vendors: [] };
      stats[p].total++;
      if (isFail) stats[p].fail++;
      if (!stats[p].vendors.includes(device.vendor)) stats[p].vendors.push(device.vendor);
    });

    return Object.entries(stats)
      .map(([province, { total, fail, vendors }]) => {
        const percentFail = total > 0 ? Math.round((fail / total) * 100) : 0;
        return {
          label: province,
          value: percentFail,
          color: '#F44336',
          vendors
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const handleBarClick = (provinceData: any) => {
  // Use the province from the clicked bar
  const provinceFilter = provinceData.label || ''; // label contains the province name
  navigate(`/link-uc2?${new URLSearchParams({ province: provinceFilter })}`);
};

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Thiết bị - Báo cáo kiểm tra</h2>

      <div className="row mb-4" style={{ width: '100%', height: '400px' }}>
        <MyBarChart
          title="🚩 Tỷ lệ lỗi theo tỉnh (%)"
          data={getProvinceBarChartData()}
          onClickBar={handleBarClick} // <-- new handler
        />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label">Các tỉnh:</label>
          <select
            className="form-select"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setOlt('');
              setVendor('');
            }}
          >
            <option value="">-- Tất cả --</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Chọn phân vùng:</label>
          <select
            className="form-select"
            value={olt}
            onChange={(e) => {
              setOlt(e.target.value);
              setVendor('');
            }}
          >
            <option value="">-- Tất cả --</option>
            {olts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Chọn Vendor:</label>
          <select
            className="form-select"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            disabled={!olt && !province}
          >
            <option value="">-- Tất cả --</option>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {olt && vendor ? (
        <div className="row">
          <div className="col-md-6">
            <MyPieChart
              title="1️⃣ Tổng kết thiết bị (Đạt/ không đạt)"
              data={getDeviceStatusChart()}
              onClickSlice={handleClickSlice}
            />
          </div>
          <div className="col-md-6">
            <MyPieChart
              title="2️⃣ Tổng kết tiêu chí không đạt"
              data={getCriteriaFailChart()}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted mt-4">
          🎯 Vui lòng chọn phân vùng và Vendor để hiển thị biểu đồ.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
