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
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

//Chia loại API để vào dev hoặc production
// let ENV = "dev"; // hoặc "prod"
// // const ENV = "dev"; // hoặc "prod"
// let API_URL = "";
// if (ENV === "dev") {
//   API_URL = "http://127.0.0.1:8000/api/vpn3g4g";
// } else {
//   API_URL = "http://10.155.43.210:8000/api/vpn3g4g";
// }

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
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
    >
      {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

export default function PieWithPercentage({ onZoneClick }: Props) {
  

    const [soLuongMb,setSoLuongMb] = useState<number>(0);
    const [soLuongMt,setSoLuongMt] = useState<number>(0);
    const [soLuongMn,setSoLuongMn] = useState<number>(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    // useEffect(() => {
        
    //     fetch(`${API_URL}/api/thong-ke-loi/count/MB_total/`)
    //         .then(res => res.json())
    //         .then(data => setSoLuongMb(data.count));
        
    //     fetch(`${API_URL}/api/thong-ke-loi/count/MT_total/`)
    //         .then(res => res.json())
    //         .then(data => setSoLuongMt(data.count));
        
    //     fetch(`${API_URL}/api/thong-ke-loi/count/MN_total/`)
    //         .then(res => res.json())
    //         .then(data => setSoLuongMn(data.count));
    //     }, []); 
     useEffect(() => {
    // Fetch song song bằng Promise.all
    Promise.all([
      fetch(`${API_URL}/thong-ke-loi/count/MB_total/`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/thong-ke-loi/count/MT_total/`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/thong-ke-loi/count/MN_total/`).then((res) =>
        res.json()
      ),
        ])
          .then(([mb, mt, mn]) => {
            setSoLuongMb(mb.count || 0);
            setSoLuongMt(mt.count || 0);
            setSoLuongMn(mn.count || 0);
          })
          .catch((error) => console.error("Fetch error:", error));
      }, []);
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
      // label={({ name, percent }) =>
      //   percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
      // }
      label={renderCustomizedLabel}
      labelLine={false}
      // labelLine={true}    
     
      onClick={(_, index) => {
          if (typeof onZoneClick === "function") onZoneClick(index); // ✅ gọi callback
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
    <Tooltip />
    <Legend 
      layout="vertical"
      verticalAlign="middle"
      align="right"
      wrapperStyle={{
      right: 30, // đẩy legend vào trong, gần hình tròn hơn
      top: '15%',
      transform: 'translateY(-50%)',color: 'black', }}  />
    </PieChart>
    </ResponsiveContainer>
    </div>
  );
}