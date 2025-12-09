import React, { useState, useEffect } from 'react';
import API_URL from './apiConfig';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
  Sector
} from 'recharts';
import "./index.css";
const COLORS = ['#0088FE', '#00c458ff', '#FFBB28'];

interface Props {
  onZoneClick: (index: number) => void;
}

// Hiển thị % nằm trong mỗi miếng Pie
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
      fontSize={14}
    >
      {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

export default function PieWithPercentage({ onZoneClick }: Props) {

  const [soLuongKhopBevsCsdl, setSoLuongKhopBevsCsdl] = useState<number>(0);
  const [soLuongOnlyBe, setSoLuongOnlyBe] = useState<number>(0);
  const [soLuongOnlyCsdl, setSoLuongOnlyCsdl] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    // const endpoints = [
    //   "mb/total",
    //   "mn/total"
    // ];
    // Promise.all(
    //   endpoints.map(ep =>
    //     fetch(`${API_URL}/doi-soat/count/${ep}/`)
    //       .then(res => res.ok ? res.json() : { count: 0 })
    //       .then(data => data.count ?? 0)
    //       .catch(() => 0) // fallback nếu fetch lỗi
    //   )
    // ).then(results => {
    //   setSoLuongKhopBevsCsdl(results[0]);
    //   setSoLuongOnlyBe(results[1]);
    // });
    fetch(`${API_URL}/doi-soat/count/number_both_be_or_csdl/`)
    .then(res => (res.ok? res.json() : { count: 0 }))
    .then(data =>setSoLuongKhopBevsCsdl(data.count??0))
    .catch(err => setSoLuongKhopBevsCsdl(0))
    fetch(`${API_URL}/doi-soat/count/number_only_be/`)
    .then(res => (res.ok? res.json(): {count: 0}))
    .then(data => setSoLuongOnlyBe(data.count??0))
    .catch(err=>setSoLuongOnlyBe(0))
    fetch(`${API_URL}/doi-soat/count/number_only_csdl/`)
    .then(res => (res.ok?res.json(): {count:0}))
    .then(data => setSoLuongOnlyCsdl(data.count??0))
    .catch(err => setSoLuongOnlyCsdl(0))

  }, []);
  const data = [
    { name: 'Đầu số có cả trên BE và CSDL', value: soLuongKhopBevsCsdl },
    { name: 'Đầu số chỉ có trên BE ', value: soLuongOnlyBe },
    { name: 'Đầu số chỉ có trên CSDL ', value: soLuongOnlyCsdl },
  ];
  //Hàm để phóng to kích cỡ mỗi miếng Pie
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

  return (
    <div style={{ height: '40vh' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="70%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
            cy="50%"
            // innerRadius={90}
            outerRadius="90%"   // ✅ co giãn tự động theo khung
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
            onClick={(entry, index) => {
              console.log("Clicked slice:", entry, "index:", index); // kiểm tra log
              if (typeof onZoneClick === "function") onZoneClick(index);
            }}
            activeIndex={activeIndex ?? undefined} 
            activeShape={renderActiveShape}     // << thêm dòng này
            onMouseEnter={(entry, index) => {
              console.log("Mouse enter slice:", entry, "index:", index);
              setActiveIndex(index);
            }}

            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell className='cell_spec' key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              right: 10, // đẩy legend vào trong, gần hình tròn hơn
              top: '15%',
              transform: 'translateY(-50%)',
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
