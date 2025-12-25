import React, { useState, useEffect, useRef } from 'react';
import { connect } from "react-redux";
import { Doughnut } from 'react-chartjs-2';
import { Button, Card as ElementCard, Loading } from 'element-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { CtrlNotification } from 'components/common';
import Tab from 'components/common/Tab';
import CtrlButton from 'components/common/CtrlButton';
import RnocR008Service from 'services/RnocR008Service';
import { Cookie } from 'helpers/cookie';
import { IUserInfo } from 'models/Apps';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Interfaces
interface IR008DashboardResponse {
  TotalCells: number;
  CellsExecuted: number;
  CellsNotExecuted: number;
  CellsExecutedOff: number;
  CellsExecutedOn: number;
  TotalExecutionHours: number;
  DailyStatistics?: IR008DailyStatistics[];
}

interface IR008DailyStatistics {
  Date: string;
  TotalCells: number;
  CellsExecuted: number;
  CellsNotExecuted: number;
  CellsExecutedOff: number;
  CellsExecutedOn: number;
  TotalExecutionHours: number;
}

interface Props {
  Apps?: any;
}

const DashboardPowerSaving = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<IR008DashboardResponse | null>(null);
  
  // Date range states for each tab
  const [dayStartDate, setDayStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayEndDate, setDayEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayStartTime, setDayStartTime] = useState<string>('00:00');
  const [dayEndTime, setDayEndTime] = useState<string>(new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0'));
  
  const [weekStartDate, setWeekStartDate] = useState<string>(getStartOfWeek());
  const [weekEndDate, setWeekEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [monthStartDate, setMonthStartDate] = useState<string>(getStartOfMonth());
  const [monthEndDate, setMonthEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const refNotification = useRef<any>();
  const isMountedRef = useRef(true);

  // Helper functions for date calculations
  function getStartOfWeek(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  function getStartOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load user info
  useEffect(() => {
    try {
      const userInfoStr = Cookie.getCookie("UserInfo");
      if (userInfoStr) {
        const parsedUserInfo: IUserInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedUserInfo);
        console.log('👤 R008 UserInfo loaded:', parsedUserInfo);
      }
    } catch (error) {
      console.error('❌ Error parsing UserInfo from cookie:', error);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let response;
      
      if (activeTab === 0) {
        // Day tab with hourly filter
        const startDateTime = `${dayStartDate}T${dayStartTime}:00`;
        const endDateTime = `${dayEndDate}T${dayEndTime}:59`;
        response = await RnocR008Service.getDashboardByDay(startDateTime, endDateTime);
      } else if (activeTab === 1) {
        // Week tab
        response = await RnocR008Service.getDashboardByWeek(weekStartDate, weekEndDate);
      } else {
        // Month tab
        response = await RnocR008Service.getDashboardByMonth(monthStartDate, monthEndDate);
      }

      if (response?.Data) {
        setDashboardData(response.Data);
        console.log('✅ Dashboard data loaded:', response.Data);
      }
    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error);
      refNotification.current?.showNotification("error", `Lỗi tải dữ liệu: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  // Handle filter apply for each tab
  const handleApplyDayFilter = () => {
    loadDashboardData();
  };

  const handleApplyWeekFilter = () => {
    loadDashboardData();
  };

  const handleApplyMonthFilter = () => {
    loadDashboardData();
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      let startDate, endDate;
      
      if (activeTab === 0) {
        startDate = dayStartDate;
        endDate = dayEndDate;
      } else if (activeTab === 1) {
        startDate = weekStartDate;
        endDate = weekEndDate;
      } else {
        startDate = monthStartDate;
        endDate = monthEndDate;
      }

      await RnocR008Service.exportToCsv(startDate, endDate);
      refNotification.current?.showNotification("success", "Xuất file thành công!");
    } catch (error: any) {
      console.error('❌ Error exporting:', error);
      refNotification.current?.showNotification("error", `Lỗi xuất file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Chart data generator
  const generateChartData = (label: string, value: number, total: number, color: string) => {
    return {
      labels: [label, 'Còn lại'],
      datasets: [{
        data: [value, Math.max(0, total - value)],
        backgroundColor: [color, '#e0e0e0'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Render statistics cards with charts
  const renderStatisticsCards = () => {
    if (!dashboardData) {
      return <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>Không có dữ liệu</div>;
    }

    const totalCells = dashboardData.TotalCells || 0;

    return (
      <div className="row" style={{marginTop: '20px'}}>
        {/* Total Cells Executed */}
        <div className="col-md-4" style={{marginBottom: '20px'}}>
          <ElementCard style={{padding: '20px', textAlign: 'center'}}>
            <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Tổng số Cell đã thực hiện</h4>
            <div style={{ margin: '0 auto', width: '200px', height: '200px' }}>
              <Doughnut 
                data={generateChartData('Đã thực hiện', dashboardData.CellsExecuted, totalCells, '#10b981')}
                options={chartOptions}
              />
            </div>
            <div style={{marginTop: '20px'}}>
              <h2 style={{color: '#67C23A', marginBottom: '5px'}}>{dashboardData.CellsExecuted}</h2>
              <p style={{color: '#909399'}}>/ {totalCells} cell</p>
            </div>
          </ElementCard>
        </div>

        {/* Total Cells Not Executed */}
        <div className="col-md-4" style={{marginBottom: '20px'}}>
          <ElementCard style={{padding: '20px', textAlign: 'center'}}>
            <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Tổng số Cell chưa thực hiện</h4>
            <div style={{ margin: '0 auto', width: '200px', height: '200px' }}>
              <Doughnut 
                data={generateChartData('Chưa thực hiện', dashboardData.CellsNotExecuted, totalCells, '#ef4444')}
                options={chartOptions}
              />
            </div>
            <div style={{marginTop: '20px'}}>
              <h2 style={{color: '#F56C6C', marginBottom: '5px'}}>{dashboardData.CellsNotExecuted}</h2>
              <p style={{color: '#909399'}}>/ {totalCells} cell</p>
            </div>
          </ElementCard>
        </div>

        {/* Cells Executed OFF */}
        <div className="col-md-4" style={{marginBottom: '20px'}}>
          <ElementCard style={{padding: '20px', textAlign: 'center'}}>
            <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Tổng số Cell đã OFF</h4>
            <div style={{ margin: '0 auto', width: '200px', height: '200px' }}>
              <Doughnut 
                data={generateChartData('Đã OFF', dashboardData.CellsExecutedOff, totalCells, '#f59e0b')}
                options={chartOptions}
              />
            </div>
            <div style={{marginTop: '20px'}}>
              <h2 style={{color: '#E6A23C', marginBottom: '5px'}}>{dashboardData.CellsExecutedOff}</h2>
              <p style={{color: '#909399'}}>/ {totalCells} cell</p>
            </div>
          </ElementCard>
        </div>

        {/* Cells Executed ON */}
        <div className="col-md-4" style={{marginBottom: '20px'}}>
          <ElementCard style={{padding: '20px', textAlign: 'center'}}>
            <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Tổng số Cell đã ON</h4>
            <div style={{ margin: '0 auto', width: '200px', height: '200px' }}>
              <Doughnut 
                data={generateChartData('Đã ON', dashboardData.CellsExecutedOn, totalCells, '#3b82f6')}
                options={chartOptions}
              />
            </div>
            <div style={{marginTop: '20px'}}>
              <h2 style={{color: '#409EFF', marginBottom: '5px'}}>{dashboardData.CellsExecutedOn}</h2>
              <p style={{color: '#909399'}}>/ {totalCells} cell</p>
            </div>
          </ElementCard>
        </div>

        {/* Total Execution Hours */}
        <div className="col-md-4" style={{marginBottom: '20px'}}>
          <ElementCard style={{padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '350px'}}>
            <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Tổng số giờ đã thực hiện</h4>
            <div>
              <h1 style={{fontSize: '3em', color: '#9C27B0', marginBottom: '10px'}}>
                {Math.floor(Math.abs(dashboardData.TotalExecutionHours))}
              </h1>
              <p style={{fontSize: '1.2em', color: '#606266', marginTop: '10px'}}>giờ</p>
              <p style={{color: '#909399', marginTop: '5px'}}>
                / {dashboardData.CellsExecuted} cell thực hiện
              </p>
              <p style={{color: '#909399', marginTop: '10px'}}>
                (Từ lúc OFF đến lúc ON)
              </p>
            </div>
          </ElementCard>
        </div>

        {/* Total Cells Summary */}
        <div className="col-md-4" style={{marginBottom: '20px'}}>
          <ElementCard style={{padding: '20px', textAlign: 'center'}}>
            <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Tổng số Cell</h4>
            <div style={{ margin: '0 auto', width: '200px', height: '200px' }}>
              <Doughnut 
                data={generateChartData('Tổng số', totalCells, totalCells, '#8b5cf6')}
                options={chartOptions}
              />
            </div>
            <div style={{marginTop: '20px'}}>
              <h2 style={{color: '#9C27B0', marginBottom: '5px'}}>{totalCells}</h2>
              <p style={{color: '#909399'}}>cell</p>
            </div>
          </ElementCard>
        </div>
      </div>
    );
  };

  // Render Day Tab Content
  const renderDayTab = () => (
    <div style={{padding: '20px'}}>
      <ElementCard style={{marginBottom: '20px', padding: '20px'}}>
        <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Bộ lọc theo giờ trong ngày</h4>
        <div className="row">
          <div className="col-md-3">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Ngày bắt đầu</label>
            <input
              type="date"
              className="el-input__inner"
              value={dayStartDate}
              onChange={(e) => setDayStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Giờ bắt đầu</label>
            <input
              type="time"
              className="el-input__inner"
              value={dayStartTime}
              onChange={(e) => setDayStartTime(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Ngày kết thúc</label>
            <input
              type="date"
              className="el-input__inner"
              value={dayEndDate}
              onChange={(e) => setDayEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Giờ kết thúc</label>
            <input
              type="time"
              className="el-input__inner"
              value={dayEndTime}
              onChange={(e) => setDayEndTime(e.target.value)}
            />
          </div>
        </div>
        <div style={{marginTop: '20px'}}>
          <CtrlButton 
            title={loading ? 'Đang tải...' : 'Áp dụng'}
            onClick={handleApplyDayFilter}
            isDisabled={loading}
            type="primary"
            style={{marginRight: '10px'}}
          />
          <CtrlButton 
            title="Xuất Excel"
            onClick={handleExportExcel}
            isDisabled={loading}
            type="success"
          />
        </div>
      </ElementCard>
      {renderStatisticsCards()}
    </div>
  );

  // Render Week Tab Content
  const renderWeekTab = () => (
    <div style={{padding: '20px'}}>
      <ElementCard style={{marginBottom: '20px', padding: '20px'}}>
        <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Bộ lọc theo tuần</h4>
        <div className="row">
          <div className="col-md-6">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Tuần bắt đầu (Thứ 2)</label>
            <input
              type="date"
              className="el-input__inner"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Tuần kết thúc (Chủ nhật)</label>
            <input
              type="date"
              className="el-input__inner"
              value={weekEndDate}
              onChange={(e) => setWeekEndDate(e.target.value)}
            />
          </div>
        </div>
        <div style={{marginTop: '20px'}}>
          <CtrlButton 
            title={loading ? 'Đang tải...' : 'Áp dụng'}
            onClick={handleApplyWeekFilter}
            isDisabled={loading}
            type="primary"
            style={{marginRight: '10px'}}
          />
          <CtrlButton 
            title="Xuất Excel"
            onClick={handleExportExcel}
            isDisabled={loading}
            type="success"
          />
        </div>
      </ElementCard>
      {renderStatisticsCards()}
    </div>
  );

  // Render Month Tab Content
  const renderMonthTab = () => (
    <div style={{padding: '20px'}}>
      <ElementCard style={{marginBottom: '20px', padding: '20px'}}>
        <h4 style={{marginBottom: '20px', color: '#409EFF'}}>Bộ lọc theo tháng</h4>
        <div className="row">
          <div className="col-md-6">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Tháng bắt đầu</label>
            <input
              type="date"
              className="el-input__inner"
              value={monthStartDate}
              onChange={(e) => setMonthStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Tháng kết thúc</label>
            <input
              type="date"
              className="el-input__inner"
              value={monthEndDate}
              onChange={(e) => setMonthEndDate(e.target.value)}
            />
          </div>
        </div>
        <div style={{marginTop: '20px'}}>
          <CtrlButton 
            title={loading ? 'Đang tải...' : 'Áp dụng'}
            onClick={handleApplyMonthFilter}
            isDisabled={loading}
            type="primary"
            style={{marginRight: '10px'}}
          />
          <CtrlButton 
            title="Xuất Excel"
            onClick={handleExportExcel}
            isDisabled={loading}
            type="success"
          />
        </div>
      </ElementCard>
      {renderStatisticsCards()}
    </div>
  );

  return (
    <div className="p-6">
      <CtrlNotification ref={refNotification} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📊 Dashboard Tiết kiệm điện tự động
        </h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và thống kê hoạt động tiết kiệm điện của các Cell
        </p>
      </div>

      <Tab
        key="r008-tabs"
        activeName={activeTab === 0 ? 'day' : activeTab === 1 ? 'week' : 'month'}
        tabsPanel={[
          {
            label: '📅 Theo Ngày',
            name: 'day',
            panel: renderDayTab()
          },
          {
            label: '📆 Theo Tuần',
            name: 'week',
            panel: renderWeekTab()
          },
          {
            label: '🗓️ Theo Tháng',
            name: 'month',
            panel: renderMonthTab()
          }
        ]}
        onTabClick={(tab: any) => {
          const tabIndex = tab.props.name === 'day' ? 0 : tab.props.name === 'week' ? 1 : 2;
          setActiveTab(tabIndex);
        }}
      />
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  Apps: state.Apps,
});

export default connect(mapStateToProps)(DashboardPowerSaving);
