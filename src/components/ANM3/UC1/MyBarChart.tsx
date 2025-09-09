import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

interface BarDataItem {
  label: string;
  value: number;
  color: string;
  vendors?: string[]; // optional: list of vendors for this bar
}

interface MyBarChartProps {
  title: string;
  data: BarDataItem[];
  onClickBar?: (barData: BarDataItem) => void; // callback when bar is clicked
}

const MyBarChart: React.FC<MyBarChartProps> = ({ title, data, onClickBar }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Số lượng lỗi',
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || '#F44336'),
        borderRadius: 6, // rounded corners
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end' as const,
        align: 'top' as const,
        offset: 4,
        formatter: (value: number) => `${value}% Fail`,
        color: '#111',
        font: { weight: 'bold' as const, size: 12 },
        clamp: true
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y ?? context.parsed;
            const label = context.label || '';
            return `${label}: ${value}% Fail`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { maxRotation: 0, minRotation: 0, font: { size: 12 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxValue > 0 ? maxValue + 5 : 10,
        ticks: { stepSize: 5, precision: 0 },
        grid: { drawTicks: false }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0 && onClickBar) {
        const index = elements[0].index;
        onClickBar(data[index]);
      }
    }
  };

  return (
    <div className="text-center mb-4" style={{ height: 350 }}>
      <h5 className="mb-2 font-semibold">{title}</h5>
      <Bar
        data={chartData}
        options={chartOptions}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
};

export default MyBarChart;
