import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Card from 'components/common/Card';
import CtrlDate from 'components/common/CtrlDate';
import CtrlButton from 'components/common/CtrlButton';
import CtrlSelect from 'components/common/CtrlSelect';
import { CtrlNotification } from 'components/common';
import RnocR009Service from 'services/RnocR009Service';
import dailyBtsSummary from './daily_bts_summary.json';
import provincialSummary from './provincial_summary.json';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  totalSites: number;
  totalCells: number;
  vendorBreakdown: {
    Huawei: number;
    Nokia: number;
    Ericsson: number;
  };
  technologyBreakdown: {
    '4G': number;
    '5G': number;
  };
  bandBreakdown: {
    '900MHz': number;
    '1800MHz': number;
    '2100MHz': number;
    '2600MHz': number;
  };
  dailyTrend: Array<{
    date: string;
    sites: number;
    cells: number;
  }>;
  detailedData: {
    huawei4G: any[];
    nokia4G: any[];
    nokia5G: any[];
  };
  vendorSummary: Array<{
    vendor: string;
    technology: string;
    sites: number;
    cells: number;
    status: string;
    coverage_area: string;
    last_updated: string;
  }>;
  performanceMetrics: {
    average_uptime: number;
    average_throughput: number;
    active_connections: number;
    data_usage_gb: number;
  };
  provincialData: Array<{
    province: string;
    nokia_sites: number;
    huawei_sit: number;
    total_4g_cells: number;
    moran_cells: number;
    iot_cells: number;
    band_900: number;
    band_1800: number;
    band_2100: number;
    config_4t4r: number;
    config_2t4r: number;
    config_2t2r: number;
    config_1t2r: number;
    config_1t1r: number;
  }>;
  provincialTotals: {
    nokia_sites: number;
    huawei_sit: number;
    total_4g_cells: number;
    moran_cells: number;
    iot_cells: number;
    band_900: number;
    band_1800: number;
    band_2100: number;
    config_4t4r: number;
    config_2t4r: number;
    config_2t2r: number;
    config_1t2r: number;
    config_1t1r: number;
  };
}

const VENDOR_COLORS = {
  Huawei: "#f59e0b",
  Nokia: "#ef4444", 
  Ericsson: "#3b82f6"
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('4G');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSites: 0,
    totalCells: 0,
    vendorBreakdown: { Huawei: 0, Nokia: 0, Ericsson: 0 },
    technologyBreakdown: { '4G': 0, '5G': 0 },
    bandBreakdown: { '900MHz': 0, '1800MHz': 0, '2100MHz': 0, '2600MHz': 0 },
    dailyTrend: [
      { date: '2025-07-21', sites: 35678, cells: 47890 },
      { date: '2025-07-22', sites: 35789, cells: 48123 },
      { date: '2025-07-23', sites: 35890, cells: 48345 },
      { date: '2025-07-24', sites: 35901, cells: 48567 },
      { date: '2025-07-25', sites: 36012, cells: 48789 },
      { date: '2025-07-26', sites: 36123, cells: 49012 },
      { date: '2025-07-27', sites: 36234, cells: 49234 },
    ],
    detailedData: {
      huawei4G: [],
      nokia4G: [],
      nokia5G: []
    },
    vendorSummary: [],
    performanceMetrics: {
      average_uptime: 0,
      average_throughput: 0,
      active_connections: 0,
      data_usage_gb: 0
    },
    provincialData: [], // Đảm bảo khi khởi tạo là mảng rỗng, không có object thiếu trường
    provincialTotals: {
      nokia_sites: 0,
      huawei_sit: 0,
      total_4g_cells: 0,
      moran_cells: 0,
      iot_cells: 0,
      band_900: 0,
      band_1800: 0,
      band_2100: 0,
      config_4t4r: 0,
      config_2t4r: 0,
      config_2t2r: 0,
      config_1t2r: 0,
      config_1t1r: 0
    }
  });
  const refNotification = useRef<any>();

  // Sort function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted data
  const sortedProvincialData = useMemo(() => {
    if (!sortConfig) return dashboardData.provincialData;

    return [...dashboardData.provincialData].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [dashboardData.provincialData, sortConfig]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!selectedDate) {
      refNotification.current?.showNotification("warning", "Vui lòng chọn ngày");
      return;
    }

    setIsLoading(true);
    try {
      // Format date for API call
      const dateObj = new Date(selectedDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Load data based on selected technology
      let huaweiData: any[] = [];
      let nokia4GData: any[] = [];
      let nokia5GData: any[] = [];

      if (selectedTechnology === '4G') {
        huaweiData = await RnocR009Service.GetBtsDataByDate(formattedDate);
        nokia4GData = await RnocR009Service.GetNokiaBtsDataByDate(formattedDate);
      } else if (selectedTechnology === '5G') {
        nokia5GData = await RnocR009Service.GetNokiaBtsData5GByDate(formattedDate);
      }

      // Load summary data
      const summaryData = dailyBtsSummary;
      const provincialData = provincialSummary;

      setDashboardData({
        totalSites: summaryData.total_sites,
        totalCells: summaryData.total_cells,
        vendorBreakdown: {
          Huawei: summaryData.vendor_summary.filter((v: any) => v.vendor === 'Huawei').reduce((sum: number, v: any) => sum + v.sites, 0),
          Nokia: summaryData.vendor_summary.filter((v: any) => v.vendor === 'Nokia').reduce((sum: number, v: any) => sum + v.sites, 0),
          Ericsson: summaryData.vendor_summary.filter((v: any) => v.vendor === 'Ericsson').reduce((sum: number, v: any) => sum + v.sites, 0)
        },
        technologyBreakdown: {
          '4G': summaryData.technology_breakdown['4G'].sites,
          '5G': summaryData.technology_breakdown['5G'].sites
        },
        bandBreakdown: {
          '900MHz': summaryData.band_distribution['900MHz'].sites,
          '1800MHz': summaryData.band_distribution['1800MHz'].sites,
          '2100MHz': summaryData.band_distribution['2100MHz'].sites,
          '2600MHz': summaryData.band_distribution['2600MHz'].sites
        },
        dailyTrend: [
          { date: '2025-07-21', sites: 35678, cells: 47890 },
          { date: '2025-07-22', sites: 35789, cells: 48123 },
          { date: '2025-07-23', sites: 35890, cells: 48345 },
          { date: '2025-07-24', sites: 35901, cells: 48567 },
          { date: '2025-07-25', sites: 36012, cells: 48789 },
          { date: '2025-07-26', sites: 36123, cells: 49012 },
          { date: '2025-07-27', sites: 36234, cells: 49234 },
        ],
        detailedData: {
          huawei4G: huaweiData,
          nokia4G: nokia4GData,
          nokia5G: nokia5GData
        },
        vendorSummary: summaryData.vendor_summary,
        performanceMetrics: summaryData.performance_metrics,
        provincialData: provincialData.provincial_data,
        provincialTotals: provincialData.totals
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      refNotification.current?.showNotification("error", "Lỗi khi tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedTechnology]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) {
      return <i className="fas fa-sort text-muted" style={{ fontSize: '12px', marginLeft: '5px' }}></i>;
    }
    return sortConfig.direction === 'asc' ? 
      <i className="fas fa-sort-up text-primary" style={{ fontSize: '12px', marginLeft: '5px' }}></i> :
      <i className="fas fa-sort-down text-primary" style={{ fontSize: '12px', marginLeft: '5px' }}></i>;
  };

  const StatCard = ({ title, value, icon, color, description }: any) => (
    <div className={`col-md-3 mb-4`}>
      <div className={`card ${color} h-100`} style={{
        background: icon.bg === 'bg-gradient-primary' ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' :
                    icon.bg === 'bg-gradient-success' ? 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' :
                    icon.bg === 'bg-gradient-info' ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' :
                    icon.bg === 'bg-gradient-danger' ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' :
                    'linear-gradient(135deg, #6c757d 0%, #545b62 100%)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}>
        <div className="card-body text-white">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title text-white-75 mb-1">{title}</h6>
              <h3 className="font-weight-bold mb-0 text-white">{value}</h3>
              {description && <small className="text-white-50">{description}</small>}
            </div>
            <div className="p-3 rounded" style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <i className={`${icon.class} ${icon.color}`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CtrlNotification ref={refNotification} />
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center p-4 rounded" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div className="d-flex align-items-center">
                <div className="p-3 rounded-circle me-3" style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <i className="fas fa-tower-broadcast fa-2x text-white"></i>
                </div>
                <div>
                  <h2 className="mb-0 text-white">Dashboard Tổng Quan Config Vô Tuyến</h2>
                  <small className="text-white-75">Thống kê và phân tích dữ liệu BTS</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <CtrlDate
                  value={selectedDate}
                  onChange={(date: Date) => setSelectedDate(date.toISOString().slice(0, 10))}
                  placeholder="Chọn ngày"
                />
                <CtrlSelect
                  options={[
                    { value: '4G', label: '4G' },
                    { value: '5G', label: '5G' },
                  ]}
                  value={selectedTechnology}
                  onChange={() => {}} // Không thực hiện gì khi thay đổi
                  placeholder="Chọn công nghệ"
                />
                <CtrlButton
                  title="Thực hiện"
                  icon="fas fa-search"
                  onClick={loadDashboardData}
                  isDisabled={isLoading}
                  type="primary"
                />
                <CtrlButton
                  title="Làm mới"
                  icon="fas fa-sync-alt"
                  onClick={loadDashboardData}
                  isDisabled={isLoading}
                  type="success"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="row mb-4">
          <StatCard
            title="Tổng Sites"
            value={dashboardData.totalSites}
            icon={{ class: "fas fa-broadcast-tower", color: "text-white", bg: "bg-gradient-primary" }}
            color="border-0 shadow-lg"
            description="Tổng số trạm"
          />
          <StatCard
            title="Tổng Cells"
            value={dashboardData.totalCells}
            icon={{ class: "fas fa-mobile-alt", color: "text-white", bg: "bg-gradient-success" }}
            color="border-0 shadow-lg"
            description="Tổng số cell"
          />
          <StatCard
            title="4G Cells"
            value={dashboardData.technologyBreakdown['4G']}
            icon={{ class: "fas fa-signal", color: "text-white", bg: "bg-gradient-info" }}
            color="border-0 shadow-lg"
            description="Cell 4G"
          />
        </div>

        {/* Vendor Distribution */}
        <div className="row mb-4">
          {Object.entries(dashboardData.vendorBreakdown).map(([vendor, count]) => (
            <div key={vendor} className="col-md-4 mb-3">
              <div className="card border-0 shadow-lg h-100" style={{
                background: vendor === 'Huawei' ? 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)' :
                            vendor === 'Nokia' ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' :
                            'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}>
                <div className="card-body text-center text-white">
                  <div className="p-3 rounded-circle d-inline-block mb-3" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className="fas fa-tower-broadcast fa-2x text-white"></i>
                  </div>
                  <h5 className="card-title text-white mb-2">{vendor}</h5>
                  <h3 className="font-weight-bold text-white mb-1">{count}</h3>
                  <small className="text-white-50">Số sites</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Band Distribution */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Phân Bố Tần Số" icon="fas fa-signal">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-wifi fa-2x mb-2"></i>
                    <h5>900MHz</h5>
                    <h3 className="mb-0">{dashboardData.bandBreakdown['900MHz']}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-broadcast-tower fa-2x mb-2"></i>
                    <h5>1800MHz</h5>
                    <h3 className="mb-0">{dashboardData.bandBreakdown['1800MHz']}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-satellite-dish fa-2x mb-2"></i>
                    <h5>2100MHz</h5>
                    <h3 className="mb-0">{dashboardData.bandBreakdown['2100MHz']}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-network-wired fa-2x mb-2"></i>
                    <h5>2600MHz</h5>
                    <h3 className="mb-0">{dashboardData.bandBreakdown['2600MHz']}</h3>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Chỉ Số Hiệu Suất" icon="fas fa-chart-line">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-tachometer-alt fa-2x mb-2"></i>
                    <h5>Uptime Trung Bình</h5>
                    <h3 className="mb-0">{dashboardData.performanceMetrics.average_uptime}%</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-network-wired fa-2x mb-2"></i>
                    <h5>Throughput Trung Bình</h5>
                    <h3 className="mb-0">{dashboardData.performanceMetrics.average_throughput}%</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-users fa-2x mb-2"></i>
                    <h5>Kết Nối Hoạt Động</h5>
                    <h3 className="mb-0">{dashboardData.performanceMetrics.active_connections.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center p-3 rounded" style={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                    color: 'white'
                  }}>
                    <i className="fas fa-database fa-2x mb-2"></i>
                    <h5>Lưu Lượng Dữ Liệu</h5>
                    <h3 className="mb-0">{dashboardData.performanceMetrics.data_usage_gb} GB</h3>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Biến động cell trong 7 ngày */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Biến động cell trong 7 ngày" icon="fas fa-chart-line">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.dailyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cells" stroke="#007bff" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Bảng Theo Tỉnh/Thành Phố */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Báo Cáo Theo Tỉnh/Thành Phố" icon="fas fa-map-marker-alt" buttonGroups={
              <div className="d-flex gap-2">
                <CtrlButton
                  title="Xuất Excel"
                  icon="fas fa-download"
                  onClick={() => {
                    refNotification.current?.showNotification("info", "Tính năng xuất Excel đang được phát triển");
                  }}
                  type="success"
                />
                <CtrlButton
                  title="Làm mới"
                  icon="fas fa-sync-alt"
                  onClick={loadDashboardData}
                  isDisabled={isLoading}
                  type="primary"
                />
              </div>
            }>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-sm" style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <thead style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    border: 'none'
                  }}>
                    <tr>
                      <th style={{ border: 'none', padding: '15px 10px' }}>Ngày Báo Cáo</th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('province')}
                      >
                        Tỉnh/Thành <SortIcon columnKey="province" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('nokia_sites')}
                      >
                        Nokia Sites <SortIcon columnKey="nokia_sites" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('huawei_sit')}
                      >
                        Huawei Sites <SortIcon columnKey="huawei_sit" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('total_4g_cells')}
                      >
                        Tổng 4G Cells <SortIcon columnKey="total_4g_cells" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('moran_cells')}
                      >
                        Moran Cells <SortIcon columnKey="moran_cells" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('iot_cells')}
                      >
                        IoT Cells <SortIcon columnKey="iot_cells" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('band_900')}
                      >
                        Band 900 <SortIcon columnKey="band_900" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('band_1800')}
                      >
                        Band 1800 <SortIcon columnKey="band_1800" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('band_2100')}
                      >
                        Band 2100 <SortIcon columnKey="band_2100" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('config_4t4r')}
                      >
                        4T4R <SortIcon columnKey="config_4t4r" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('config_2t4r')}
                      >
                        2T4R <SortIcon columnKey="config_2t4r" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('config_2t2r')}
                      >
                        2T2R <SortIcon columnKey="config_2t2r" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('config_1t2r')}
                      >
                        1T2R <SortIcon columnKey="config_1t2r" />
                      </th>
                      <th 
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('config_1t1r')}
                      >
                        1T1R <SortIcon columnKey="config_1t1r" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProvincialData.map((item, index) => (
                      <tr key={index} style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(248, 249, 250, 0.8)',
                        transition: 'all 0.3s ease',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(248, 249, 250, 0.8)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <td style={{ padding: '12px 10px', fontWeight: '500' }}>{provincialSummary.report_date}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <strong style={{ 
                            color: '#2c3e50',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>{item.province}</strong>
                        </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.nokia_sites.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.huawei_sit.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.total_4g_cells.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.moran_cells.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.iot_cells.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.band_900.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.band_1800.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.band_2100.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.config_4t4r.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.config_2t4r.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.config_2t2r.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.config_1t2r.toLocaleString()}
                         </td>
                                                 <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                           {item.config_1t1r.toLocaleString()}
                         </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{
                    background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    color: 'white',
                    border: 'none'
                  }}>
                    <tr>
                      <td colSpan={2} style={{ border: 'none', padding: '15px 10px' }}>
                        <strong style={{ fontSize: '16px' }}>TỔNG CỘNG</strong>
                      </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.nokia_sites.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.huawei_sit.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.total_4g_cells.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.moran_cells.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.iot_cells.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.band_900.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.band_1800.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.band_2100.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.config_4t4r.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.config_2t4r.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.config_2t2r.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.config_1t2r.toLocaleString()}</strong>
                       </td>
                                             <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                         <strong style={{ fontSize: '16px' }}>{dashboardData.provincialTotals.config_1t1r.toLocaleString()}</strong>
                       </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;