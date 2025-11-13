
// export default BoxDoiSoat;
import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
} from "recharts";
import "./index.css";

type DoiSoat = {
  number: string;
  phantom_digit: string;
  Max_channel_csdl: number;
  Max_channel_be: number;
  Account_name_csdl: string;
  Account_name_be: string;
  Destination_csdl: string;
  Destination_be: string;
  loaihinh_csdl: string;
  loaihinh_be: string;
  status: string;
  Khu_vuc: string;
  Ghi_chu: string;
};

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28",
  "#FE0015", "#79C400", "#FF28AD",
  "#00FE2A", "#C4B000", "#BB28FF", "#28FFAD"
];

interface Props {
  onClickBox: (index: number) => void;
  isDisplayed: boolean;
}

// Hiển thị phần trăm bên trong mỗi miếng
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
      fontSize={12}
    >
      {percent ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};
// 🔹 Khi hover: zoom miếng ra ngoài
const renderActiveShape = (props: any) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 10} // 👈 zoom ra 15px
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export default function PieWithPercentage({ onClickBox, isDisplayed }: Props) {
  const [counts, setCounts] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labels = [
    "Số CGĐT",
    "Account Name",
    "IP Khách hàng",
    "Mở Quốc Tế",
  ];
  const endpoints = [
    "khong_dung_kenh",
    "khong_dung_acc_name",
    "khong_dung_dest",
    "khong_dung_loaihinh_moqte",
  ];

  // Gọi API count
  useEffect(() => {
    if (!isDisplayed) {
      setError(null); // reset lỗi khi không hiển thị
      return;
    }
    setError(null); // reset lỗi trước khi fetch
    Promise.all(
      endpoints.map((ep) =>
        fetch(`${API_URL}/doi-soat/count/ims/mb/${ep}/`)
          .then((res) => (res.ok ? res.json() : { count: 0 }))
          .then((data) => data.count ?? 0)
          .catch(() => 0)
      )
    ).then((results) => setCounts(results));
  }, [isDisplayed]);
  if (!isDisplayed) {
    return (
      <div
        style={{
          fontSize: "24px",       // chữ to hơn
          fontWeight: "bold",     // đậm
          textAlign: "center",    // căn giữa ngang
          marginTop: "20%",       // đẩy xuống giữa màn hình (tương đối)
          color: "#555555ff",          // màu xám nhẹ (tùy chỉnh)
        }}
      >
        No Data
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }
  const data = labels.map((name, i) => ({
    name,
    value: counts[i] || 0,
  }));
  return (
    <div style={{ width: "100%", height: "50vh" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="57%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
            cy="50%"
            // innerRadius={70}
            // outerRadius={120}
            innerRadius="40%"   // inner radius theo %
            outerRadius="75%"   // outer radius theo %
            dataKey="value"
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape} // 👈 Thêm phần này
            label={({ name, percent }) =>
              percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
            }
            labelLine={true}                 // 👈 Bật đường chỉ dẫn ra ngoài

            onClick={(_, index) => {
              if (typeof onClickBox === "function") onClickBox(index); // ✅ gọi callback
            }}
            // 👈 xử lý click
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell className='cell_spec' key={`cell-${index}`} fill={COLORS[index % COLORS.length]}

              />
            ))}
          </Pie>

          {/* ✅ Tooltip hiển thị thông tin khi hover */}
          <Tooltip />

          {/* ✅ Legend căn giữa phía dưới */}
          {/* <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              marginTop: "80px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              fontSize: "clamp(8px, 1.2vw, 14px)",

            }}
            formatter={(value) => (
              <span style={{
                fontSize: "clamp(6px, 1.1vw, 12px)", // 👈 co giãn theo màn hình
                color: "black"
              }}>{value}</span>)}
          /> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
