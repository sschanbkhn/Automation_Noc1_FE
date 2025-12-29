import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
  ResponsiveContainer,
} from "recharts";
import API_URL from "./apiConfig";

interface Props {
  onClickBox: (apiKey: string | string[]) => void;
}

const COLORS = [
  "#28FFAD", "#FFBB28",
 "#79C400", "#FF28AD",
  "#00FE2A", "#C4B000", "#BB28FF", "#0088FE" ,"#f14c5aff"
];

export default function PieWithPercentage({ onClickBox }: Props) {
  const [counts, setCounts] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const labels = [

    "Trạng thái",
    "Short Code",
    "Bind Type",
  ];

  const endpoints = [
 
    "lech_trang_thai",
    "lech_shortcode",
    "lech_bindtype"
  ];

  // 🔹 Fetch counts từ API
  useEffect(() => {
    Promise.all(
      endpoints.map((ep) =>
        fetch(`${API_URL}/doi-soat/count/${ep}/`)
          .then((res) => (res.ok ? res.json() : { count: 0 }))
          .then((data) => data.count ?? 0)
          .catch(() => 0)
      )
    ).then(setCounts);
  }, []);

  // 🔹 Mapping gốc
  const rawData = labels.map((name, i) => ({
    name,
    value: counts[i] || 0,
    apiKey: [
      "ds_trangthai",
      "ds_shortcode",
      "ds_bindtype",
    ][i]
  }));

  // 🔹 Gộp nhóm <2% thành "Khác"
  const total = rawData.reduce((sum, d) => sum + (d.value || 0), 0);
  const mainGroups = rawData.filter((d) => d.value / total >= 0.02);
  const smallGroups = rawData.filter((d) => d.value / total < 0.02);
  const otherSum = smallGroups.reduce((sum, d) => sum + d.value, 0);

  const data = otherSum > 0
    ? [...mainGroups, { name: "Khác", value: otherSum, apiKey: smallGroups.map(d => d.apiKey) }]
    : mainGroups;

    const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}   // tăng bán kính khi hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
    };

    // 🔹 Custom label màu đen
  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const offset = 20; // khoảng cách ra ngoài pie
  const radius = outerRadius + offset;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const textAnchor = x > cx ? "start" : "end"; // label bên phải thì căn trái, bên trái thì căn phải
  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={14}
    >
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};
  return (
    <div style={{ width: "100%", height: "50vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
           <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="35%"
            outerRadius="75%"
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}   // phóng to khi hover
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(_, index) => {
              if (typeof onClickBox === "function") onClickBox(data[index].apiKey);
            }}
            label={renderLabel}               // chữ label màu đen
            labelLine={true}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
