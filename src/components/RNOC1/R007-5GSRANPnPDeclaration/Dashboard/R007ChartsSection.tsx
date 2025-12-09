// R007ChartsSection.tsx
// Charts section component

import React from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./R007ChartsSection.css";
import { ChartData, RegionData } from "./R007types";

interface ChartsSectionProps {
  chartData: ChartData[];
  regionData: RegionData[];
}

const R007ChartsSection: React.FC<ChartsSectionProps> = ({ chartData, regionData }) => {
  // Colors for charts
  // const COLORS = ["#1976d2", "#2e7d32", "#9c27b0", "#ed6c02", "#0288d1"];

  /*
    
  const COLORS = [
    "#4caf50", // Green (như trong gauge)
    "#8bc34a", // Light Green
    "#cddc39", // Lime
    "#ffeb3b", // Yellow
    "#ffc107", // Amber
    "#ff9800", // Orange
    "#ff5722", // Deep Orange
    "#f44336", // Red
    "#e91e63", // Pink
    "#9c27b0", // Purple
    "#673ab7", // Deep Purple
    "#3f51b5", // Indigo
    "#2196f3", // Blue
    "#03a9f4", // Light Blue
    "#00bcd4", // Cyan
  ];
*/

  const COLORS = [
    "#1976d2", // Blue
    "#2e7d32", // Green
    "#9c27b0", // Purple
    "#ed6c02", // Orange
    "#0288d1", // Light Blue
    "#d32f2f", // Red
    "#7b1fa2", // Deep Purple
    "#00796b", // Teal
    "#f57c00", // Deep Orange
    "#c2185b", // Pink
    "#5d4037", // Brown
    "#455a64", // Blue Grey
    "#fbc02d", // Yellow
    "#388e3c", // Light Green
    "#00acc1", // Cyan
  ];

  /*

  const COLORS = [
    "#64b5f6", // Light Blue (nhạt từ #1976d2)
    "#81c784", // Light Green (nhạt từ #2e7d32)
    "#ba68c8", // Light Purple (nhạt từ #9c27b0)
    "#ffb74d", // Light Orange (nhạt từ #ed6c02)
    "#4dd0e1", // Light Cyan (nhạt từ #0288d1)
    "#ef5350", // Light Red (nhạt từ #d32f2f)
    "#9575cd", // Light Deep Purple (nhạt từ #7b1fa2)
    "#4db6ac", // Light Teal (nhạt từ #00796b)
    "#ff8a65", // Light Deep Orange (nhạt từ #f57c00)
    "#f06292", // Light Pink (nhạt từ #c2185b)
    "#a1887f", // Light Brown (nhạt từ #5d4037)
    "#78909c", // Light Blue Grey (nhạt từ #455a64)
    "#fff176", // Light Yellow (nhạt từ #fbc02d)
    "#aed581", // Light Lime (nhạt từ #388e3c)
    "#4fc3f7", // Light Cyan (nhạt từ #00acc1)
  ];

  */

  /*
  
  // Colors for charts - Light & Bright
  const COLORS = [
    "#64b5f6", // Light Blue
    "#81c784", // Light Green
    "#ba68c8", // Light Purple
    "#ffb74d", // Light Orange
    "#4dd0e1", // Light Cyan
    "#e57373", // Light Red
    "#9575cd", // Light Deep Purple
    "#4db6ac", // Light Teal
    "#ff8a65", // Light Deep Orange
    "#f06292", // Light Pink
    "#a1887f", // Light Brown
    "#90a4ae", // Light Blue Grey
    "#fff176", // Light Yellow
    "#aed581", // Light Lime
    "#4fc3f7", // Bright Cyan
  ];

  /*

  const COLORS = [
    "#90caf9", // Lighter Blue
    "#a5d6a7", // Lighter Green
    "#ce93d8", // Lighter Purple
    "#ffcc80", // Lighter Orange
    "#80deea", // Lighter Cyan
    "#ef9a9a", // Lighter Red
    "#b39ddb", // Lighter Deep Purple
    "#80cbc4", // Lighter Teal
    "#ffab91", // Lighter Deep Orange
    "#f48fb1", // Lighter Pink
    "#bcaaa4", // Lighter Brown
    "#b0bec5", // Lighter Blue Grey
    "#fff59d", // Lighter Yellow
    "#c5e1a5", // Lighter Lime
    "#81d4fa", // Lighter Sky Blue
    ];
    
    */

  // Calculate success rate data for trend chart
  const successRateData = chartData.map((item) => ({
    date: item.date,
    rate: Math.round(((item.siteConfig + item.autoPnP) / (item.siteConfig + item.autoPnP + 5)) * 100),
  }));

  return (
    <div className="r007-charts-section">
      {/* Chart 1: Jobs by Type */}
      <div className="r007-chart-card">
        <h3 className="r007-chart-title">Jobs by Type (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="siteConfig" fill="#ed6c02" name="Site Config" />
            <Bar dataKey="autoPnP" fill="#0288d1" name="Auto PnP" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Success Rate Trend */}
      <div className="r007-chart-card">
        <h3 className="r007-chart-title">Success Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={successRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[90, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rate" stroke="#2e7d32" strokeWidth={2} name="Success Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Sites by Region */}
      <div className="r007-chart-card">
        <h3 className="r007-chart-title">Sites by Region</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={regionData} dataKey="sites" nameKey="region" cx="50%" cy="50%" outerRadius={100} label>
              {regionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default R007ChartsSection;
