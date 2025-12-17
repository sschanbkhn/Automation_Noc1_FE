import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // ✅ Add this

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels); // ✅ Register

interface PieDataItem {
  label: string;
  value: number;
  color: string;
}

interface MyPieChartProps {
  title: string;
  data: PieDataItem[];
  onClickSlice?: (label: string) => void;
}

const MyPieChart: React.FC<MyPieChartProps> = ({ title, data, onClickSlice }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: data.map(item => item.color),
      borderWidth: 1
    }]
  };

  const chartOptions = {
    onClick: (_event: any, elements: any[]) => {
      if (elements.length && onClickSlice) {
        const index = elements[0].index;
        const label = chartData.labels[index];
        onClickSlice(label);
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 13
        },
        formatter: (value: number, context: any) => {
          const data = context.chart.data.datasets[0].data;
          const total = data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%\n(${value})`;
        }
      }
    }
  };

    return (
        <div
            className="text-center mb-4 d-flex flex-column align-items-center"
            style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
        >
            <h5>{title}</h5>
            <div style={{ width: "100%", height: "300px" }}>
                <Pie
                    data={chartData}
                    options={{
                        ...chartOptions,
                        maintainAspectRatio: false, // ✅ allows it to scale inside fixed div
                    }}
                />
            </div>
        </div>
    );

};

export default MyPieChart;
