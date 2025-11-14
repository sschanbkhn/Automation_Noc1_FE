import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  PieLabelRenderProps,
  Sector
} from "recharts";
import API_URL from "./apiConfig";
import "./index.css";

// 🔹 Kiểu dữ liệu (nếu muốn dùng sau)
type DoiSoat = {
  Number: string;
  Phantom_number: string;
  Account_name_csdl: string;
  Account_name_be: string;
  account_info_csdl: string;
  account_info_be: string;
  Max_channel_csdl: string;
  Max_channel_be: string;
  Destination_csdl: string;
  Destination_be: string;
  status: string;
  ADDRESS_DISABLE: string;
  values_added: string;
  ADDRESS_INCOMING: string;
  ROUTING_TABLE_NAME: string;
  category: string;
  service_type: string;
  brand_name: string;
  Khu_vuc: string;
  Ghi_chu: string;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FE0015",
  "#79C400",
  "#FF28AD",
  "#00FE2A",
  "#C4B000",
  "#BB28FF",
  "#28FFAD",
];

interface Props {
  onZoneClick: (apiKey: string | string[]) => void;
  isDisplayed: boolean;
}

// 🔹 Hiển thị % trong Pie
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  const RADIAN = Math.PI / 180;
  const radius =
    Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
    >
      {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};
// Khi hover: zoom miếng ra ngoài
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
      startAngle={startAngle} endAngle={endAngle} fill={fill}
    />
  );
};
export default function PieWithPercentage({ onZoneClick, isDisplayed }: Props) {
  const [counts, setCounts] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labels = [
    "Số CGĐT",
    "Account Name",
    "IP khách hàng",
    "Thanh lý",
    "Tạm ngưng",
    "Information",
    "Mở Quốc tế",
    "Brandname",
    "Chặn gọi ra",
  ];

  const endpoints = [
    "lech_tocdo",
    "lech_acc_name",
    "lech_destination",
    "lech_thanh_ly",
    "lech_tam_ngung",
    "lech_acc_info",
    "lech_mo_qte",
    "lech_brandname",
    "lech_address_incoming",
  ];

  // 🔹 Gọi API lấy dữ liệu
  useEffect(() => {
    if (!isDisplayed) return;

    Promise.all(
      endpoints.map((ep) =>
        fetch(`${API_URL}/doi-soat/count/mb/${ep}/`)
          .then((res) => (res.ok ? res.json() : { count: 0 }))
          .then((data) => data.count ?? 0)
          .catch(() => 0)
      )
    )
      .then(setCounts)
      .catch(() => setError("Không thể tải dữ liệu"));
  }, [isDisplayed]);

  if (!isDisplayed) {
    return (
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "20%",
          color: "#555",
        }}
      >
        No Data
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>⚠️ {error}</div>;
  }

  // 🔹 Mapping dữ liệu
  const rawData = labels.map((name, i) => ({
    name,
    value: counts[i] || 0,
    apiKey: [
      "ds_tocdo",
      "ds_accname",
      "ds_dest",
      "ds_thanhly",
      "ds_tamngung",
      "ds_info",
      "ds_qte",
      "ds_brand",
      "ds_addincome",
    ][i],
  }));

  // 🔹 Gom nhóm "Khác" nếu <3%
  const total = rawData.reduce((sum, d) => sum + (d.value || 0), 0);
  const mainGroups = rawData.filter((d) => (d.value || 0) / total >= 0.03);
  const smallGroups = rawData.filter((d) => (d.value || 0) / total < 0.03);
  const otherSum = smallGroups.reduce((sum, d) => sum + (d.value || 0), 0);

  const data =
    otherSum > 0
      ? [
          ...mainGroups,
          {
            name: "Khác",
            value: otherSum,
            apiKey: smallGroups.map((d) => d.apiKey),
          },
        ]
      : mainGroups;

  // 🔹 Render chart
  return (
    <div style={{ width: "100%", height: "55vh" }}>
      <ResponsiveContainer width="95%" height="95%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="75%"
            activeIndex={activeIndex ?? undefined}
      activeShape={renderActiveShape} // 👈 Thêm phần này
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(_, index) => {
              if (typeof onZoneClick === "function")
                onZoneClick(data[index].apiKey);
            }}
            label={({ name, percent }) =>
               percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
               }
            labelLine={true}
      
          >
            
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
