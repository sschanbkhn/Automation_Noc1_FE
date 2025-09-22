import React,{useState,useEffect} from 'react';
import API_URL from './apiConfig';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
} from 'recharts';
import "./index.css";
const COLORS = ['#035294de', '#2f8af3ff', '#43faccff'];

//Chia loại API để vào dev hoặc production
// let ENV = "prod"; // hoặc "prod"
// const ENV = "dev"; // hoặc "prod"
// let API_URL = "";
// if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
// else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}

interface Props {
  onZoneClick: (index: number) => void;
  isDisplayed: boolean;
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
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
    >
      {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

export default function PieWithPercentage({ onZoneClick , isDisplayed }: Props) {

    const [soLuongMb,setSoLuongMb] = useState<number>(0);
    const [soLuongMt,setSoLuongMt] = useState<number>(0);
    const [soLuongMn,setSoLuongMn] = useState<number>(0);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
        
    //     fetch("http://127.0.0.1:8000/api/doi_soat/count/MB_total/")
    //         .then(res => res.json())
    //         .then(data => setSoLuongMb(data.count));
        
    //     fetch("http://127.0.0.1:8000/api/doi_soat/count/MT_total/")
    //         .then(res => res.json())
    //         .then(data => setSoLuongMt(data.count));
        
    //     fetch("http://127.0.0.1:8000/api/doi_soat/count/MN_total/")
    //         .then(res => res.json())
    //         .then(data => setSoLuongMn(data.count));
    //     }, []); 
      
    useEffect(() => {

        if (!isDisplayed) {
            setError(null); // reset lỗi khi không hiển thị
            return;
          }

          setError(null); // reset lỗi trước khi fetch
        const endpoints = [
          "MB_total",
          "MT_total",
          "MN_total"
        ];
        Promise.all(
          endpoints.map(ep =>
            fetch(`${API_URL}/doi_soat/count/${ep}/`)
              .then(res => res.ok ? res.json() : { count: 0 })
              .then(data => data.count ?? 0)
              .catch(() => 0) // fallback nếu fetch lỗi
          )
        ).then(results => {
          setSoLuongMb(results[0]);
          setSoLuongMt(results[1]);
          setSoLuongMn(results[2]);
        });
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

    const data = [
    { name: 'Miền Bắc', value: soLuongMb },
    { name: 'Miền Trung', value: soLuongMt },
    { name: 'Miền Nam', value: soLuongMn },
    ];
  
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
  <PieChart>
    <Pie
      data={data}
      cx="60%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
      cy="50%"
      // innerRadius={90}
      outerRadius={120}
      dataKey="value"
      label={renderCustomizedLabel}
      labelLine={false}
      onClick={(_, index) => {
          if (typeof onZoneClick === "function") onZoneClick(index); // ✅ gọi callback
        }}
// 👈 xử lý click
      onMouseEnter={(_, index) => setActiveIndex(index)}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {data.map((entry, index) => (
        <Cell className='cell_spec'  key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
      ))}
    </Pie>
    <Tooltip />
    <Legend 
      layout="vertical"
      verticalAlign="middle"
      align="right"
      wrapperStyle={{
    right: 30, // đẩy legend vào trong, gần hình tròn hơn
    top: '15%',
    transform: 'translateY(-50%)',
  }}
    />
  </PieChart>
</ResponsiveContainer>
    </div>
  );
}
