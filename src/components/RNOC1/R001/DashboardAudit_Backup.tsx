import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from "react-redux";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import Tab from 'components/common/Tab';
import CtrlButton from 'components/common/CtrlButton';
import RnocR001Service from 'services/RnocR001Service';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Interfaces theo cấu trúc API thực tế
interface IR001DashboardResponse {
  date: string;
  statistics: IR001Statistics;
  parameterSummaries: IR001ParameterSummary[];
  configuredSites: IR001ConfiguredSite[];
}

interface IR001Statistics {
  totalConfiguredSites: number;
  correctConfigurations: number;
  incorrectConfigurations: number;
  correctPercentage: number;
}

interface IR001ParameterSummary {
  parameterName: string;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  correctPercentage: number;
}

interface IR001ConfiguredSite {
  neName: string;
  cellId: number;
  reportDate: string;
  createdAt: string;
  isCorrect: boolean;
  parameters: IR001ParameterDetail[];
}

interface IR001ParameterDetail {
  parameterName: string;
  actualValue: string;
  expectedValue: string;
  isCorrect: boolean;
}

interface IR001DataRuntime {
  id: number;
  neName: string;
  cellId: number;
  reportDate: string;
  utranSrvccSwitch: string;
  utranCsfbSwitch: string;
  utranFlashCsfbSwitch: string;
  geranFlashCsfbSwitch: string;
  csfbAdaptiveBlindHoSwitch: string;
  utranCsfbSteeringSwitch: string;
  idleCsfbRedirectOptSwitch: string;
  dlVoipBundlingSwitch: string;
  ulVoipPreAllocationSwitch: string;
  ulVoipDelaySchSwitch: string;
  ulVoipLoadBasedSchSwitch: string;
  ulVoipServStateEnhancedSw: string;
  ulVoipSchOptSwitch: string;
  ulVoLteDataSizeEstSwitch: string;
}

interface Props {
  Apps: any;
}

const DashboardAudit = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<IR001DashboardResponse | null>(null);
  const [runtimeData, setRuntimeData] = useState<IR001DataRuntime[]>([]);
  const [badData, setBadData] = useState<any[]>([]);
  const [correctModalVisible, setCorrectModalVisible] = useState(false);
  const [wrongModalVisible, setWrongModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const refNotification = useRef<any>();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Danh sách tham số cần hiển thị
  const parameterList = [
    'utran_srvcc_switch',
    'utran_csfb_switch', 
    'utran_flash_csfb_switch',
    'geran_flash_csfb_switch',
    'csfb_adaptive_blind_ho_switch',
    'utran_csfb_steering_switch',
    'idle_csfb_redirect_opt_switch',
    'dl_voip_bundling_switch',
    'ul_voip_pre_allocation_switch',
    'ul_voip_delay_sch_switch',
    'ul_voip_load_based_sch_switch',
    'ul_voip_serv_state_enhanced_sw',
    'ul_voip_sch_opt_switch',
    'ul_vo_lte_data_size_est_switch'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = useCallback(async (date?: string) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    
    try {
      // Sử dụng ngày được truyền vào hoặc selectedDate
      const dateToUse = date || selectedDate;
      
      const [dashboardRes, configuredRes, badConfigRes] = await Promise.all([
        RnocR001Service.GetDashboard(dateToUse),
        RnocR001Service.GetConfiguredSites(dateToUse),
        RnocR001Service.GetBadConfigurations(dateToUse)
      ]);

      if (!isMountedRef.current) return;

      if (dashboardRes?.Success) {
        setDashboardData(dashboardRes.Data);
      }
      if (configuredRes?.Success) {
        setRuntimeData(configuredRes.Data || []);
      }
      if (badConfigRes?.Success) {
        setBadData(badConfigRes.Data || []);
      }
      
      refNotification.current?.showNotification("success", "Tải dữ liệu thành công!");
    } catch (err) {
      if (isMountedRef.current) {
        refNotification.current?.showNotification("error", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error('Error fetching data:', err);
      }
    }
    
    if (isMountedRef.current) setLoading(false);
  }, [selectedDate]);

  // Cấu hình Pie Chart
  const pieChartData = {
    labels: ['Đúng', 'Sai'],
    datasets: [
      {
        data: dashboardData?.statistics ? [
          dashboardData.statistics.correctConfigurations, 
          dashboardData.statistics.incorrectConfigurations
        ] : [0, 0],
        backgroundColor: ['#52c41a', '#ff4d4f'],
        borderColor: ['#52c41a', '#ff4d4f'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        if (index === 0) {
          refNotification.current?.showNotification("info", "Hiển thị chi tiết cấu hình đúng");
        } else {
          refNotification.current?.showNotification("info", "Hiển thị chi tiết cấu hình sai");
        }
      }
    }
  };

  // Render region statistics như trong hình mẫu
  const renderRegionStatistics = () => {
    // Mock data cho demo, sau này sẽ lấy từ API
    const regionData = [
      { name: 'HTH', count: 109, color: '#1976d2', percentage: 58 },
      { name: 'HUE', count: 30, color: '#2196f3', percentage: 16 },
      { name: 'QNM', count: 13, color: '#4caf50', percentage: 7 },
      { name: 'QBH', count: 20, color: '#f44336', percentage: 11 },
      { name: 'QTI', count: 15, color: '#ff9800', percentage: 8 }
    ];

    const totalSites = regionData.reduce((sum, region) => sum + region.count, 0);

    return (
      <div className="card h-100">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">
            <i className="fas fa-map-marker-alt me-2 text-primary"></i>
            Total Sites: <span className="text-danger fw-bold">{totalSites}</span>
          </h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-column gap-3">
            {regionData.map((region, index) => (
              <div key={region.name} className="d-flex align-items-center">
                {/* Region label */}
                <div className="d-flex align-items-center" style={{ minWidth: '80px' }}>
                  <div 
                    className="rounded-circle me-2" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: region.color 
                    }}
                  ></div>
                  <span className="fw-semibold">{region.name}</span>
                </div>

                {/* Progress bar */}
                <div className="flex-grow-1 mx-3">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${region.percentage}%`,
                        backgroundColor: region.color
                      }}
                    ></div>
                  </div>
                </div>

                {/* Count */}
                <div className="text-end" style={{ minWidth: '60px' }}>
                  <span className="fw-bold">{region.count} Sites</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render audit parameters với dữ liệu từ API
  const renderAuditParameters = () => {
    if (!dashboardData?.parameterSummaries) {
      return (
        <div className="card h-100">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-cogs me-2 text-primary"></i>
              Các tham số Audit
            </h5>
          </div>
          <div className="card-body d-flex align-items-center justify-content-center">
            <div className="text-center text-muted">
              <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
              <p>Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      );
    }

    // Lấy 8 tham số đầu tiên để hiển thị dạng grid 4x2
    const displayParameters = dashboardData.parameterSummaries.slice(0, 8);

    return (
      <div className="card h-100">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">
            <i className="fas fa-cogs me-2 text-primary"></i>
            Các tham số Audit
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {displayParameters.map((param, index) => {
              const percentage = param.correctPercentage;
              const color = percentage >= 80 ? '#4caf50' : percentage >= 60 ? '#ff9800' : '#f44336';
              
              return (
                <div key={param.parameterName} className="col-6 col-lg-3">
                  <div className="text-center">
                    {/* Parameter name - rút gọn */}
                    <h6 className="fw-semibold mb-2" style={{ fontSize: '12px', height: '40px', overflow: 'hidden' }}>
                      {param.parameterName.replace(/_/g, ' ').replace(/^(.{20}).*/, '$1...')}
                    </h6>
                    
                    {/* Circular progress */}
                    <div className="position-relative d-inline-block mb-2">
                      <div style={{ width: '70px', height: '70px' }}>
                        <Pie 
                          data={{
                            datasets: [{
                              data: [param.correctCount, param.incorrectCount],
                              backgroundColor: [color, '#e0e0e0'],
                              borderWidth: 0
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '50%',
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const label = context.dataIndex === 0 ? 'Đúng' : 'Sai';
                                    return `${label}: ${context.parsed}`;
                                  }
                                }
                              }
                            }
                          } as any}
                        />
                      </div>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="fw-bold" style={{ fontSize: '14px', color }}>
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Status indicators */}
                    <div className="d-flex justify-content-center gap-2 small">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-check-circle text-success me-1"></i>
                        <span>{param.correctCount}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-times-circle text-danger me-1"></i>
                        <span>{param.incorrectCount}</span>
                      </div>
                    </div>

                    {/* Total count */}
                    <div className="mt-1 small text-muted">
                      <span>Tổng: {param.totalCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hiển thị các tham số còn lại nếu có */}
          {dashboardData.parameterSummaries.length > 8 && (
            <div className="mt-3 text-center">
              <small className="text-muted">
                Và {dashboardData.parameterSummaries.length - 8} tham số khác...
              </small>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // Handle submit with selected date
  const handleSubmit = () => {
    fetchAllData(selectedDate);
  };

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Button groups for header
  const ButtonGroupsRender = useCallback(() => {
    return (
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="date-picker" className="form-label mb-0 fw-semibold">
            Chọn ngày:
          </label>
          <input
            id="date-picker"
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            style={{ width: '150px' }}
          />
        </div>
        <CtrlButton 
          title="Tìm kiếm" 
          onClick={handleSubmit} 
          type="primary"
          icon="el-icon-search"
          loading={loading}
        />
        <CtrlButton 
          title="Làm mới" 
          onClick={refreshData} 
          type="default"
          icon="el-icon-refresh"
        />
      </div>
    );
  }, [selectedDate, handleSubmit, refreshData, loading]);

  // Render parameter table using bootstrap
  const renderParameterTable = () => {
    if (!dashboardData || !dashboardData.parameterSummaries) return null;

    return (
      <div className="table-responsive mt-4">
        <table className="table table-striped table-bordered">
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th className="text-center">STT</th>
              <th>Tham số</th>
              <th className="text-center">Tổng số</th>
              <th className="text-center">Đúng</th>
              <th className="text-center">Sai</th>
              <th className="text-center">Tỷ lệ đúng (%)</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.parameterSummaries.map((param, index) => (
              <tr key={param.parameterName}>
                <td className="text-center">{index + 1}</td>
                <td>{param.parameterName}</td>
                <td className="text-center">{param.totalCount}</td>
                <td className="text-center">
                  <span className="badge bg-success">{param.correctCount}</span>
                </td>
                <td className="text-center">
                  <span className="badge bg-danger">{param.incorrectCount}</span>
                </td>
                <td className="text-center">
                  <strong>{param.correctPercentage.toFixed(1)}%</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render executed NE table
  const renderExecutedNeTable = () => {
    // Extract unique NE names from runtime data
    const uniqueNeNames = Array.from(new Set(runtimeData.map(item => item.neName))).filter(name => name);
    
    return (
      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-sm table-striped">
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
            <tr>
              <th>STT</th>
              <th>NE Name</th>
            </tr>
          </thead>
          <tbody>
            {uniqueNeNames.map((neName, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{neName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {uniqueNeNames.length === 0 && (
          <div className="text-center p-3 text-muted">
            <small>Không có dữ liệu</small>
          </div>
        )}
      </div>
    );
  };

  // Render runtime data table
  const renderRuntimeDataTable = () => {
    return (
      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-sm table-striped">
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
            <tr>
              <th>ID</th>
              <th>NE Name</th>
              <th>Cell ID</th>
              <th>Report Date</th>
            </tr>
          </thead>
          <tbody>
            {runtimeData.slice(0, 50).map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.neName}</td>
                <td>{item.cellId}</td>
                <td>{item.reportDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {runtimeData.length > 50 && (
          <div className="text-center p-2 text-muted">
            <small>Hiển thị 50 bản ghi đầu tiên trong tổng số {runtimeData.length} bản ghi</small>
          </div>
        )}
      </div>
    );
  };

  // Render bad data table
  const renderBadDataTable = () => {
    return (
      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-sm table-striped">
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
            <tr>
              <th>ID</th>
              <th>NE Name</th>
              <th>Cell ID</th>
              <th>Detected Date</th>
            </tr>
          </thead>
          <tbody>
            {badData.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.neName}</td>
                <td>{item.cellId}</td>
                <td>{item.detectedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };



  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <>
      <CtrlNotification ref={refNotification} />
      
      <Tab 
        key="r001-dashboard-tabs"
        activeName="dashboard"
        tabsPanel={[
          {
            label: "Dashboard Audit R001",
            name: "dashboard",
            panel: (
              <Card title="Dashboard Audit - R001 Cấu hình tự động mạng vô tuyến" icon="fas fa-chart-pie" buttonGroups={ButtonGroupsRender()}>
                <div className="row g-4">
                  {/* Bên trái - Region Statistics */}
                  <div className="col-lg-5">
                    {renderRegionStatistics()}
                  </div>

                  {/* Bên phải - Audit Parameters */}
                  <div className="col-lg-7">
                    {renderAuditParameters()}
                  </div>
                </div>

                {/* Bảng tham số chi tiết */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="fas fa-list me-2"></i>
                          Chi tiết tham số cấu hình
                        </h6>
                      </div>
                      <div className="card-body">
                        {renderParameterTable()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bảng dữ liệu runtime và bad data */}
                <div className="row mt-4 g-4">
                  <div className="col-lg-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="fas fa-database me-2"></i>
                          Dữ liệu Runtime
                        </h6>
                      </div>
                      <div className="card-body">
                        {renderRuntimeDataTable()}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                          Dữ liệu cấu hình sai
                        </h6>
                      </div>
                      <div className="card-body">
                        {renderBadDataTable()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          }
        ]}
        onTabClick={(tab: any) => {
          console.log('Tab clicked:', tab);
        }}
      />
    </>
  );
};

const mapState = ({ ...state }) => ({
  Apps: state.apps
});

const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(DashboardAudit);