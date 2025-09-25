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
    rawFail: number;   // number of failed devices
    rawTotal: number;  // total devices
}

interface MyBarChartProps {
    title: string;
    data: BarDataItem[];
    onClickBar?: (barData: BarDataItem) => void;
    passColor?: string; // new
    failColor?: string; // new
}

const MyBarChart: React.FC<MyBarChartProps> = ({ title, data, onClickBar, passColor, failColor }) => {
    const chartData = {
        labels: data.map(item => item.label),
        datasets: [
            {
                label: 'Fail',
                data: data.map(item => (item.rawFail / item.rawTotal) * 100),
                backgroundColor: failColor || '#F44336',
                stack: 'Stack 0',
                borderRadius: 4,
            },
            {
                label: 'Pass',
                data: data.map(item => ((item.rawTotal - item.rawFail) / item.rawTotal) * 100),
                backgroundColor: passColor || '#4CAF50',
                stack: 'Stack 0',
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: { position: 'top' as const },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold' as const, size: 11 },
                formatter: (value: number, context: any) => {
                    if (value === 0) return '';
                    const item = data[context.dataIndex];
                    if (context.dataset.label === 'Fail') {
                        return `${item.rawFail}\n(${value.toFixed(1)}%)`;
                    } else {
                        return `${item.rawTotal - item.rawFail}\n(${value.toFixed(1)}%)`;
                    }
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const item = data[context.dataIndex];
                        if (context.dataset.label === 'Fail') {
                            return `${context.label}: ${item.rawFail}/${item.rawTotal} Fail`;
                        } else {
                            return `${context.label}: ${item.rawTotal - item.rawFail}/${item.rawTotal} Pass`;
                        }
                    },
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                max: 100, // 🔥 lock scale so all bars are same height
                ticks: {
                    callback: (val: number) => `${val}%`,
                },
            },
        },
        onClick: (_: any, elements: any) => {
            if (elements.length > 0 && onClickBar) {
                const index = elements[0].index;
                onClickBar(data[index]);
            }
        },
    };

    return (
        <div className="text-center mb-4" style={{ height: 350 }}>
            <h5 className="mb-2 font-semibold">{title}</h5>
            <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
        </div>
    );
};

export default MyBarChart;
