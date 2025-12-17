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
  department: string;
  pass: number;
  fail: number;
  vendors: Record<string, number>; // e.g., { Huawei: 5, Juniper: 3, Cisco: 2 }
}

interface MyBarChartProps {
  title: string;
  data: BarDataItem[];
  onClickBar?: (barData: BarDataItem) => void;
}

const colors = ['#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#FF5722'];

const MyBarChart: React.FC<MyBarChartProps> = ({ title, data, onClickBar }) => {
  // Collect all vendor names dynamically without using flatMap
  const vendorNamesSet = new Set<string>();
  data.forEach((d: BarDataItem) => {
    if (d.vendors) {
      Object.keys(d.vendors).forEach(v => vendorNamesSet.add(v));
    }
  });
  const vendorNames = Array.from(vendorNamesSet);

  const labels = data.map((d: BarDataItem) => d.department);

  // Build datasets
  const datasets: any[] = [
    // Fail first → bottom of the stack
    {
      label: 'Fail',
      data: data.map((d: BarDataItem) => d.fail),
      backgroundColor: '#F44336',
      stack: 'PassFail',
      borderRadius: 4,
    },
    {
      label: 'Pass',
      data: data.map((d: BarDataItem) => d.pass),
      backgroundColor: '#4CAF50',
      stack: 'PassFail',
      borderRadius: 4,
    },
    // Vendor datasets
    ...vendorNames.map((vendor, i) => ({
      label: vendor,
      data: data.map((d: BarDataItem) => (d.vendors ? d.vendors[vendor] || 0 : 0)),
      backgroundColor: colors[i % colors.length],
      stack: 'Vendor',
      borderRadius: 4,
    })),
  ];

  const chartData = { labels, datasets };

  const chartOptions = {
    plugins: {
      legend: { position: 'top' as const },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const, size: 12 },
        formatter: (value: number) => (value > 0 ? value : ''),
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label;
            return `${datasetLabel}: ${context.raw}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, grid: { drawTicks: false } },
    },
    onClick: (_: any, elements: any) => {
      if (elements.length > 0 && onClickBar) {
        const index = elements[0].index;
        onClickBar(data[index]);
      }
    },
  };

  return (
    <div style={{ height: 400 }}>
      <h5 className="mb-2">{title}</h5>
      <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
    </div>
  );
};

export default MyBarChart;
