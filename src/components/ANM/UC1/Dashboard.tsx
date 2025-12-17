import React, { useEffect, useState } from 'react';
import MyPieChart from './MyPieChart';
import MyBarChart from './MyBarChart';
import { useNavigate } from 'react-router-dom';

// Props for tab navigation
interface DashboardProps {
  goToTab?: (tabKey: string) => void;
  setFilters?: React.Dispatch<
    React.SetStateAction<{
      province?: string;
      olt?: string;
      vendor?: string;
    }>
  >;
}

// Province mapping
const provinceCodeMap: Record<string, string> = {
  BGG: 'Viễn thông Bắc Giang',
  BKN: 'Viễn thông Bắc Kạn',
  BNH: 'Viễn thông Bắc Ninh',
  CBG: 'Viễn thông Cao Bằng',
  DBN: 'Viễn thông Điện Biên',
  HBH: 'Viễn thông Hòa Bình',
  HDG: 'Viễn thông Hải Dương',
  HGG: 'Viễn thông Hà Giang',
  HNI: 'Viễn thông Hà Nội',
  HNM: 'Viễn thông Hà Nam',
  HPG: 'Viễn thông Hải Phòng',
  HTH: 'Viễn thông Hà Tĩnh',
  HYN: 'Viễn thông Hưng Yên',
  LCI: 'Viễn thông Lào Cai',
  LCU: 'Viễn thông Lai Châu',
  LSN: 'Viễn thông Lạng Sơn',
  NAN: 'Viễn thông Nghệ An',
  NBH: 'Viễn thông Ninh Bình',
  NDH: 'Viễn thông Nam Định',
  PTO: 'Viễn thông Phú Thọ',
  QNH: 'Viễn thông Quảng Ninh',
  SLA: 'Viễn thông Sơn La',
  TBH: 'Viễn thông Thái Bình',
  THA: 'Viễn thông Thanh Hóa',
  TNN: 'Viễn thông Thái Nguyên',
  TQG: 'Viễn thông Tuyên Quang',
  VPC: 'Viễn thông Vĩnh Phúc',
  YBI: 'Viễn thông Yên Bái',
  AGG: 'Viễn thông An Giang',
  BDG: 'Viễn thông Bình Dương',
  BLU: 'Viễn thông Bạc Liêu',
  BPC: 'Viễn thông Bình Phước',
  BTE: 'Viễn thông Bến Tre',
  BTN: 'Viễn thông Bình Thuận',
  CMU: 'Viễn thông Cà Mau',
  CTO: 'Viễn thông Cần Thơ',
  DNI: 'Viễn thông Đồng Nai',
  DTP: 'Viễn thông Đồng Tháp',
  HCM: 'Viễn thông Hồ Chí Minh',
  HGI: 'Viễn thông Hậu Giang',
  KGG: 'Viễn thông Kiên Giang',
  LAN: 'Viễn thông Long An',
  LDG: 'Viễn thông Lâm Đồng',
  NTN: 'Viễn thông Ninh Thuận',
  STG: 'Viễn thông Sóc Trăng',
  TGG: 'Viễn thông Tiền Giang',
  TNH: 'Viễn thông Tây Ninh',
  TVH: 'Viễn thông Trà Vinh',
  VLG: 'Viễn thông Vĩnh Long',
  VTU: 'Viễn thông Vũng Tàu',
  BDH: 'Viễn thông Bình Định',
  DLK: 'Viễn thông Đắk Lắk',
  DNG: 'Viễn thông Đà Nẵng',
  DNO: 'Viễn thông Đắk Nông',
  GLI: 'Viễn thông Gia Lai',
  HUE: 'Viễn thông Thừa Thiên Huế',
  KHA: 'Viễn thông Khánh Hòa',
  KTM: 'Viễn thông Kon Tum',
  PYN: 'Viễn thông Phú Yên',
  QBH: 'Viễn thông Quảng Bình',
  QNI: 'Viễn thông Quảng Ngãi',
  QNM: 'Viễn thông Quảng Nam',
  QTI: 'Viễn thông Quảng Trị'
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

const Dashboard: React.FC<DashboardProps> = ({ goToTab, setFilters }) => {
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
          const hostname = device.test_result?.tc_hostname || '';
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

  // Dynamically get provinces from dataJson
  const availableProvinces = Array.from(
    new Set(
      dataJson
        .map((device) => {
          const hostname = device.test_result?.tc_hostname || '';
          const match = hostname.trim().match(/([A-Z]{3})\./);
          const code = match ? match[1] : '';
          return provinceCodeMap[code];
        })
        .filter((p) => p)
    )
  );

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
    let pass = 0, fail = 0;
    filteredData.forEach((device) => {
      const results = Object.entries(device.test_result || {})
        .filter(([k, v]) => k !== 'tc_hostname' && v !== 'n/a')
        .map(([, v]) => v);
      if (results.length && results.some((r) => r === 'Fail')) fail++;
      else pass++;
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

  // --- replace getProvinceBarChartData with vendor version ---
    const getVendorBarChartData = () => {
        const stats: Record<string, { pass: number; fail: number; provinces: string[] }> = {};

        dataJson
            .filter((device) => device.vendor && device.vendor !== 'Không rõ')
            .forEach((device) => {
                const v = device.vendor;
                const isFail = Object.values(device.test_result || {}).some(
                    (val: any) => typeof val === 'string' && val.trim().toLowerCase() === 'fail'
                );

                stats[v] = stats[v] || { pass: 0, fail: 0, provinces: [] };
                if (isFail) stats[v].fail++;
                else stats[v].pass++;

                if (!stats[v].provinces.includes(device.province)) {
                    stats[v].provinces.push(device.province);
                }
            });

        return Object.entries(stats)
            .map(([vendor, { pass, fail }]) => ({
                label: vendor,
                rawFail: fail,
                rawTotal: pass + fail, // ✅ matches MyBarChart expectation
            }))
            .sort((a, b) => b.rawTotal - a.rawTotal) // sort by total devices
            .slice(0, 10);
    };

    const getProvinceBarChartData = () => {
        const stats: Record<string, { total: number; fail: number; vendors: string[] }> = {};

        dataJson
            .filter((device) => device.province && device.province !== 'Không rõ')
            .forEach((device) => {
                const p = device.province;
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
                    rawFail: fail,
                    rawTotal: total,
                    color: '#F44336',
                    vendors
                };
            })
            .sort((a, b) => b.rawTotal - a.rawTotal)
            .slice(0, 5);
    };

    // --- New: top 5 criteria fail bar chart ---
    const excludedCriteria = ['tc_hostname', 'tc_patch_info']; // put keys you want to skip

    const getTopCriteriaFailChartData = () => {
        const stats: Record<string, { total: number; fail: number }> = {};

        filteredData.forEach((device) => {
            const testResult = device.test_result || {};
            Object.entries(testResult).forEach(([k, v]) => {
                if (excludedCriteria.includes(k) || v === 'n/a') return;

                stats[k] = stats[k] || { total: 0, fail: 0 };
                stats[k].total++;
                if (typeof v === 'string' && v.trim().toLowerCase() === 'fail') {
                    stats[k].fail++;
                }
            });
        });

        return Object.entries(stats)
            .map(([criterion, { total, fail }]) => {
                const percentFail = total > 0 ? Math.round((fail / total) * 100) : 0;
                return {
                    label: criteriaMap[criterion] || criterion,
                    value: percentFail,
                    rawFail: fail,
                    rawTotal: total,
                    color: '#FF9800',
                };
            })
            // ✅ Sort by fail percentage descending
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };




    

// --- click handler for vendors ---
const handleBarClick = (vendorData: any) => {
  if (goToTab && setFilters) {
    setFilters({ vendor: vendorData.label });
    goToTab('uc2');
  } else {
    const vendorFilter = vendorData.label || '';
    navigate(`/link-uc2?${new URLSearchParams({ vendor: vendorFilter })}`);
  }
};

    const handleBarClickProvince = (vendorData: any) => {
        if (goToTab && setFilters) {
            setFilters({ province: vendorData.label });
            goToTab('uc2');
        } else {
            const vendorFilter = vendorData.label || '';
            navigate(`/link-uc2?${new URLSearchParams({ vendor: vendorFilter })}`);
        }
    };

  // Compute totals
  const totalDevices = dataJson.length;
  const totalFailedDevices = dataJson.filter((device) =>
    Object.values(device.test_result || {}).some(
      (v: any) => typeof v === 'string' && v.trim().toLowerCase() === 'fail'
    )
  ).length;

  const handleClickSlice = (label: string) => {
    if (label === 'Fail') {
      if (goToTab && setFilters) {
        setFilters({ province, olt, vendor });
        goToTab('uc2');
      } else {
        navigate(`/link-uc2?${new URLSearchParams({ type: olt, vendor, province })}`);
      }
    }
  };


  return (
    <div className="container mt-4">
         <h2 className="mb-4">Thiết bị - Báo cáo kiểm tra</h2>
      

      {/* Totals */}
      <div className="mb-3">
        <strong>Tổng số thiết bị:</strong> {totalDevices} &nbsp; | &nbsp;
        <strong>Tổng số thiết bị lỗi:</strong> {totalFailedDevices}
      </div>

      {/* Province bar chart */}
          <div className="row mb-4" style={{ width: '100%', height: '400px' }}>
              <div className="col-md-6">
                  <MyBarChart
                      title="🚩 Tỷ lệ lỗi theo Vendor (%)"
                      data={getVendorBarChartData()}
                      onClickBar={handleBarClick}
                  />
              </div>
              <div className="col-md-6">
                  <MyPieChart
                      title="📊 Phân bổ số lượng thiết bị theo Vendor"
                      data={Object.entries(
                          dataJson.reduce((acc: Record<string, number>, device) => {
                              if (device.vendor && device.vendor !== 'Không rõ') {
                                  acc[device.vendor] = (acc[device.vendor] || 0) + 1;
                              }
                              return acc;
                          }, {})
                      ).map(([vendor, count], i) => {
                          const colors = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#E91E63'];
                          return {
                              label: vendor,
                              value: count as number,  // ✅ force number type
                              color: colors[i % colors.length],
                          };
                      })}
                  />
              </div>

          </div>

          <div className="row mb-4" style={{ width: '100%', height: '400px' }}>
              <div className="col-md-6">
              <MyBarChart
                      title="🚩 Top 5 tỉnh không tuân thủ"
                  data={getProvinceBarChartData()}
                      onClickBar={handleBarClickProvince}
                      failColor="#FF9800"
                      passColor="#2196F3"
              />
              </div>
              <div className="col-md-6">
                  <MyBarChart
                      title="🚩 Top 5 tiêu chí lỗi nhiều nhất"
                      data={getTopCriteriaFailChartData()}
                      failColor="#FF9800"
                      passColor="#2196F3"
                  />
              </div>
          </div>
    </div>
  );
};

export default Dashboard;
