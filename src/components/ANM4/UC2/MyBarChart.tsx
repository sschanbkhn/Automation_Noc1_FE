import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

export interface BarDataItem {
  label: string;
  value: number;
  color?: string;
  rawFail?: number;
  rawTotal?: number;
  vendors?: string[];
}

export interface MyBarChartProps {
  title: string;
  data: BarDataItem[];
  failColor?: string;
  passColor?: string;
  onClickBar?: (barData: BarDataItem) => void;
}

const MyBarChart: React.FC<MyBarChartProps> = ({
  title,
  data,
  onClickBar,
  failColor = "#F44336",
  passColor = "#4CAF50",
}) => {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500" style={{ height: 350 }}>
        <h5 className="mb-2 font-semibold">{title}</h5>
        <p>Không có dữ liệu</p>
      </div>
    );
  }

  // Support stacked fail/pass datasets
  const failValues = data.map((d) => d.rawFail ?? d.value);
  const passValues = data.map((d) =>
    d.rawTotal && d.rawFail !== undefined ? Math.max(d.rawTotal - d.rawFail, 0) : 0
  );

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Fail",
        data: failValues,
        backgroundColor: failColor,
        borderRadius: 6,
        stack: "combined",
      },
      {
        label: "Pass",
        data: passValues,
        backgroundColor: passColor,
        borderRadius: 6,
        stack: "combined",
      },
    ],
  };

  const maxValue = Math.max(...data.map((item) => item.rawTotal ?? item.value), 0);

  const chartOptions: ChartOptions<"bar"> = {
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      datalabels: {
        anchor: "center",
        align: "center",
        color: "#fff",
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets
            .map((ds: any) => ds.data[context.dataIndex])
            .reduce((a: number, b: number) => a + b, 0);
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;
          return percent > 0 ? `${percent}%` : "";
        },
        font: { weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y;
            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest" as const },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: { size: 12 },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        suggestedMax: maxValue > 0 ? maxValue + 5 : 10,
        ticks: { stepSize: Math.ceil(maxValue / 5) || 1, precision: 0 },
        grid: { drawTicks: false },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0 && onClickBar) {
        const index = elements[0].index;
        onClickBar(data[index]);
      }
    },
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
