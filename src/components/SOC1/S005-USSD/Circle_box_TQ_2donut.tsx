import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
  Sector
} from "recharts";
import "./index.css";

const COLORS_OUTER = ["#25adc5ff", "#f75858ff"]; // Số lượng chuẩn hoá và chưa chuẩn hoá
const COLORS_INNER = ["#ffbb28ff", "#b67debff", "#ff42e6ff"]; // Siptrunk Miền Bắc - Miền Nam

interface Props {
  onZoneClick: (index: number) => void;
}

// Hàm hiển thị phần trăm trong mỗi miếng
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
      fill="black"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};
// 👇 Vẽ lại miếng đang active (chuẩn Recharts)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      {/* Phần lát to ra */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // 👈 tăng 8px để "to ra"
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};
export default function DoubleDonutChart({ onZoneClick }: Props) {
  // Vòng ngoài: tổng Miền Bắc / Miền Nam
  const [soLuongSipMb, setSoLuongSipMb] = useState(0);
  const [soLuongSipMn, setSoLuongSipMn] = useState(0);
  // Vòng trong: thống kê lỗi Bắc / Nam
  const [soLuongChuanHoa, setSoLuongChuanHoa] = useState(0);
  const [soLuongChuaChuanHoa, setSoLuongChuaChuanHoa] = useState(0);
  // 👇 Thêm state để biết lát nào đang active
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    // Fetch song song dữ liệu 2 loại
    Promise.all([
      // Vòng ngoài
      fetch(`${API_URL}/thong-ke-loi/count/number_be_chuan_hoa/`).then((res) => res.json()),
      fetch(`${API_URL}/thong-ke-loi/count/number_be_chua_chuan_hoa/`).then((res) => res.json()),
      // Vòng trong
      fetch(`${API_URL}/thong-ke-loi/count/mb/total/`).then((res) => res.json()),
      fetch(`${API_URL}/thong-ke-loi/count/mn/total/`).then((res) => res.json()),
      // Vòng trong
    ])
      .then(([sipChuanHoa, sipChuaChuanHoa,mb, mn]) => {
        setSoLuongChuanHoa(sipChuanHoa.count || 0);
        setSoLuongChuaChuanHoa(sipChuaChuanHoa.count || 0);
        setSoLuongSipMb(mb.count || 0);
        setSoLuongSipMn(mn.count || 0);
        
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const dataOuter = [
    { name: "Toàn Quốc đã chuẩn hoá", value: soLuongChuanHoa  },
    { name: "Toàn Quốc chưa chuẩn hoá", value: soLuongChuaChuanHoa },
  ];

  const dataInner = [
  { name: "Miền Bắc chưa chuẩn hoá", value: soLuongSipMb },
  { name: "Miền Nam chưa chuẩn hoá", value: soLuongSipMn },
  ];
  
  const handleInnerClick = (index: number) => {
    setActiveIndex(index); // lưu lại lát được chọn
    onZoneClick(index); // gọi hàm ở cha
  };

  return (
    <div style={{ height: "40vh" }}>
      <ResponsiveContainer>
        <PieChart>
          {/* Vòng ngoài */}
          <Pie
            data={dataOuter}
            cx="60%"
            cy="50%"
            outerRadius="90%"
            innerRadius="55%"
            paddingAngle={3}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {dataOuter.map((_, index) => (
              <Cell
                    key={`outer-${index}`}
                    fill={COLORS_OUTER[index]}
                    style={{ cursor: "pointer" }}
                />
            ))}
          </Pie>

          {/* Vòng trong */}
          
           {/* Vòng trong (có click & phóng to khi chọn) */}
           <Pie
            data={dataInner}
            cx="60%"
            cy="50%"
            outerRadius="50%"
            innerRadius="25%"
            paddingAngle={3}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
            startAngle={20}   // 👈 lệch thêm 20° so với vòng ngoài
            endAngle={-340}    // 👈 tổng quét vẫn 360°
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)} // 👉 phóng to khi hover
            onMouseLeave={() => setActiveIndex(null)}         // 👉 thu nhỏ khi rời chuột
          >
            {dataInner.map((_, index) => (
              <Cell
                key={`inner-${index}`}
                fill={COLORS_INNER[index]}
                style={{ cursor: "pointer" }}
                onClick={() => handleInnerClick(index)}
              />
            ))}
          </Pie>


          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              right: 10,
              top: "15%",
              transform: "translateY(-50%)",
              color: "black",
            }}
            formatter={(value) => (
              <span
                style={{
                  fontSize: "clamp(6px, 1.2vw, 12px)",
                  color: "black",
                }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

