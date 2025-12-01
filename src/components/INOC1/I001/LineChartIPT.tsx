import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

interface ChartDataPoint {
  time: string;
  throughput: number;
  capacity: number;
  efficiency: number;
}

interface LineChartIPTProps {
  data: ChartDataPoint[];
}

const LineChartIPT: React.FC<LineChartIPTProps> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1day');
  const [fromDate, setFromDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '1day':
        return 'Hôm nay';
      case '7day':
        return '7 ngày qua';
      case '30day':
        return '30 ngày qua';
      case 'custom':
        return `${fromDate} đến ${toDate}`;
      default:
        return '';
    }
  };

  return (
    <div className="linechart-container">
      <div className="linechart-header">
        <h3 className="linechart-title">Lưu lượng IPT</h3>
        <div className="linechart-controls">
          <div className="period-buttons">
            <button
              className={`period-btn ${selectedPeriod === '1day' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('1day')}
            >
              1 ngày
            </button>
            <button
              className={`period-btn ${selectedPeriod === '7day' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('7day')}
            >
              7 ngày
            </button>
            <button
              className={`period-btn ${selectedPeriod === '30day' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('30day')}
            >
              30 ngày
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'custom' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('custom')}
            >
              Tùy chỉnh
            </button>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="custom-date-inputs">
              <div className="date-input-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="linechart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3B82F6' }}></span>
          <span>Lưu lượng (Gbps)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#F59E0B' }}></span>
          <span>Độ khả dung (Gbps)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10B981' }}></span>
          <span>Hiệu suất (%)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            interval={Math.floor(data.length / 8)}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ value: 'Gbps', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            label={{ value: '%', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '8px'
            }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return value.toFixed(2);
              }
              return value;
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="throughput"
            stroke="#3B82F6"
            dot={false}
            strokeWidth={2}
            name="Lưu lượng"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="capacity"
            stroke="#F59E0B"
            dot={false}
            strokeWidth={2}
            name="Độ khả dung"
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="efficiency"
            stroke="#10B981"
            dot={false}
            strokeWidth={2}
            name="Hiệu suất"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="linechart-footer">
        <span className="period-label">Thời gian: {getPeriodLabel()}</span>
        <span className="update-info">Cập nhật 1 phút/lần</span>
      </div>
    </div>
  );
};

export default LineChartIPT;
