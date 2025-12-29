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

const COLORS_OUTER = ["#25adc5ff", "#ff42e6ff"]; // Số lượng chuẩn hoá và chưa chuẩn hoá
const COLORS_INNER = ["#ffbb28ff", "#a65aecff", "#ff42e6ff"]; // Siptrunk Miền Bắc - Miền Nam

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

  const value = percent !== undefined ? Math.floor(percent * 100) : 0;
  const displayValue = value < 1 && percent! > 0 ? 1 : value; //
  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
     {/* {percent !== undefined ? `${Math.floor(percent * 100)}%` : ""} */}
     {percent !== undefined ? `${displayValue}%` : ""}
    </text>
  );
};

// Hàm vẽ miếng to ra khi hover
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8} // 👈 tăng thêm 8px
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export default function DoubleDonutChart({ onZoneClick }: Props) {
  // Vòng ngoài: tổng Miền Bắc / Miền Nam
  const [soLuongImsMb, setSoLuongImsMb] = useState(0);
  const [soLuongImsMn, setSoLuongImsMn] = useState(0);
  // Vòng trong: thống kê lỗi Bắc / Nam
  const [soLuongChuanHoa, setSoLuongChuanHoa] = useState(0);
  const [soLuongChuaChuanHoa, setSoLuongChuaChuanHoa] = useState(0);
  const [activeIndexInner, setActiveIndexInner] = useState<number | null>(null); // 👈 thêm state cho hover


  useEffect(() => {
    // Fetch song song dữ liệu 2 loại
    Promise.all([
      // Vòng ngoài
      fetch(`${API_URL}/thong-ke-loi/count/ims/so_luong_chuan_hoa_be/`).then((res) => res.json()),
      fetch(`${API_URL}/thong-ke-loi/count/ims/so_luong_chua_chuan_hoa_be/`).then((res) => res.json()),
      // Vòng trong
      
      fetch(`${API_URL}/thong-ke-loi/count/mb/ims/total/`).then((res) => res.json()),
      fetch(`${API_URL}/thong-ke-loi/count/mn/ims/total/`).then((res) => res.json()),
      // Vòng trong
    ])
      .then(([imsChuanHoa, imsChuaChuanHoa, mb, mn, ]) => {
        setSoLuongChuanHoa(imsChuanHoa.count || 0);
        setSoLuongChuaChuanHoa(imsChuaChuanHoa.count || 0);
        setSoLuongImsMb(mb.count || 0);
        setSoLuongImsMn(mn.count || 0);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const dataOuter = [
    { name: "Toàn Quốc đã chuẩn hoá", value: soLuongChuanHoa  },
    { name: "Toàn Quốc chưa chuẩn hoá", value: soLuongChuaChuanHoa },
    
  ];

  const dataInner = [
    { name: "Miền Bắc chưa chuẩn hoá", value: soLuongImsMb },
    { name: "Miền Nam chưa chuẩn hoá", value: soLuongImsMn },
  ];

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
            activeIndex={activeIndexInner ?? undefined} // 👈 chỉ định miếng đang hover
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndexInner(index)} // 👈 khi hover
            onMouseLeave={() => setActiveIndexInner(null)} // 👈 khi rời chuột
          >
            {dataInner.map((_, index) => (
              <Cell
                key={`inner-${index}`}
                fill={COLORS_INNER[index]}
                style={{ cursor: "pointer" }}
                onClick={() => onZoneClick(index)}
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

