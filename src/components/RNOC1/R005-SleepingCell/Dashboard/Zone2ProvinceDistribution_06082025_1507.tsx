import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, AreaChart, Area } from 'recharts';
import { Card, Row, Col } from 'react-bootstrap';

interface Zone2TrendChartProps {
  dashboardData?: any;
  loading?: boolean;
}

const Zone2TrendChart: React.FC<Zone2TrendChartProps> = ({ dashboardData, loading }) => {
  const [selectedChart, setSelectedChart] = useState('combined');
  const [data, setData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch 14 days trend data
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setChartLoading(true);
        
        const response = await fetch('https://localhost:7232/api/dashboard/trend');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          // Transform API data to match chart format
          const transformedData = result.data.map((item: any) => ({
            date: item.date.split('-')[2] + '/' + item.date.split('-')[1], // "06/08"
            day: getDayName(item.date),
            detected: item.sleepingCells || 0,
            processed: item.processCells_ || 0,
            success: item.executionCells || 0,
            failed: item.recheckCells || 0,
            successRate: item.successRate || 0
          }));
          
          setData(transformedData);
          setError(null);
        } else {
          setData([]);
          setError('API returned no data for the selected period');
        }
      } catch (err: any) {
        console.error('Error fetching trend data:', err);
        setData([]);
        setError(`API Error: ${err.message}`);
      } finally {
        setChartLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  // Helper function to convert date to day name
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold text-dark mb-2">{`${data.day} - ${label}`}</p>
          <div className="d-flex flex-column gap-1">
            <div className="d-flex justify-content-between">
              <span className="text-primary">Phát hiện:</span>
              <span className="fw-semibold">{data.detected} cells</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-warning">Xử lý:</span>
              <span className="fw-semibold">{data.processed} cells</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-success">Thành công:</span>
              <span className="fw-semibold">{data.success} cells</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-danger">Thất bại:</span>
              <span className="fw-semibold">{data.failed} cells</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1">
              <span className="text-info">Tỷ lệ thành công:</span>
              <span className="fw-bold">{data.successRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartOptions = [
    { id: 'combined', name: '📊 Tổng hợp', icon: '📊' },
    { id: 'detected', name: '🔍 Phát hiện', icon: '🔍' },
    { id: 'processed', name: '⚙️ Xử lý', icon: '⚙️' },
    { id: 'success', name: '✅ Thành công', icon: '✅' },
    { id: 'failed', name: '❌ Thất bại', icon: '❌' },
    { id: 'successRate', name: '📈 Tỷ lệ thành công', icon: '📈' }
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'detected':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="detectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="detected" stroke="#0d6efd" fill="url(#detectedGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'processed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="processedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fd7e14" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#fd7e14" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="processed" stroke="#fd7e14" fill="url(#processedGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'success':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="success" stroke="#198754" fill="url(#successGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'failed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc3545" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="failed" stroke="#dc3545" fill="url(#failedGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'successRate':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              {/* <YAxis domain={[80, 100]} />  */}
              <YAxis domain={[0, 100]} />  {/* ✅ Bắt đầu từ 0% */}
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="#6f42c1" 
                strokeWidth={4}
                dot={{ fill: '#6f42c1', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#6f42c1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default: // combined
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="detectedGradientCombined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="successGradientCombined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#198754" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#198754" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="failedGradientCombined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc3545" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="detected" fill="url(#detectedGradientCombined)" name="🔍 Phát hiện" />
              <Bar yAxisId="left" dataKey="processed" fill="#fd7e14" name="⚙️ Xử lý" />
              <Bar yAxisId="left" dataKey="success" fill="url(#successGradientCombined)" name="✅ Thành công" />
              <Bar yAxisId="left" dataKey="failed" fill="url(#failedGradientCombined)" name="❌ Thất bại" />
              
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="successRate" 
                stroke="#6f42c1" 
                strokeWidth={3}
                name="📈 Tỷ lệ thành công (%)"
                dot={{ fill: '#6f42c1', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  // Loading state
  if (chartLoading) {
    return (
      <div className="mb-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4 text-center">
            <div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
              <div>
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Đang tải dữ liệu xu hướng...</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">


          {/* Header */}
          
          <div className="text-center mb-4">
            {/*
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e3f2fd'}}>
                <span style={{fontSize: '1.5rem'}}>🔧</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0">Hệ Thống Giám Sát Sleeping Cell</h5>
                <small className="text-muted">Theo dõi xu hướng xử lý cell treo trong 2 tuần gần đây</small>
              </div>
            </div>

            */}
            
            {error && (
              <div className="alert alert-warning alert-dismissible" role="alert">
                <small><strong>⚠️ Warning:</strong> {error}</small>
              </div>
            )}
          </div>

          
          {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <div className="p-2 rounded-circle me-3" style={{backgroundColor: '#e3f2fd'}}>
            <span style={{fontSize: '1.5rem'}}>🗺️</span>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Province Distribution</h5>
            <small className="text-muted">Sleeping Cell Analysis Across 6 Provinces</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="text-center">
            <h3 className="fw-bold text-primary mb-0">6</h3>
            <small className="text-muted">Provinces</small>
          </div>
          <div className="text-center">
            <h3 className="fw-bold text-warning mb-0">22</h3>
            <small className="text-muted">Districts</small>
          </div>
          <div className="text-center">
            <h3 className="fw-bold text-success mb-0">85%</h3>
            <small className="text-muted">Avg Success</small>
          </div>
        </div>


{error && (
              <div className="alert alert-warning alert-dismissible" role="alert">
                <small><strong>⚠️ Warning:</strong> {error}</small>
              </div>
            )}


      </div>
      
      {/* phan header */}
{/* ======================================================= */}










          {/* Chart Selection Buttons */}
          <div className="bg-light rounded p-3 mb-4">
            <h6 className="fw-semibold mb-3">Chọn biểu đồ hiển thị:</h6>
            <div className="d-flex flex-wrap gap-2">
              {chartOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedChart(option.id)}
                  className={`btn btn-sm d-flex align-items-center gap-2 ${
                    selectedChart === option.id
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                >
                  {/* <span>{option.icon}</span> */}
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">
                {chartOptions.find(opt => opt.id === selectedChart)?.name}
              </h6>
              <small className="text-muted">
                {/* 📅 Cập nhật: {new Date().toLocaleDateString('vi-VN')} */}
                📅 Cập nhật: {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
              </small>
            </div>
            
            {data.length > 0 ? renderChart() : (
              <div className="text-center py-5">
                <p className="text-muted">Không có dữ liệu để hiển thị</p>
              </div>
            )}
          </div>







        </Card.Body>
      </Card>
    </div>
  );
};

export default Zone2TrendChart;