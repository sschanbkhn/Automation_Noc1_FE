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
    const [soLuongMn,setSoLuongMn] = useState<number>(0);
    const [soLuongKoKv,setSoLuongKoKv] = useState<number>(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
   
     useEffect(() => {
    // Fetch song song bằng Promise.all
    Promise.all([
      fetch(`${API_URL}/thong-ke-loi/count/mb/ims/total/`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/thong-ke-loi/count/mn/ims/total/`).then((res) =>
        res.json()
      ),
        ])
          .then(([mb, mn]) => {
            setSoLuongMb(mb.count || 0);
            setSoLuongMn(mn.count || 0);
            // setSoLuongKoKv(Kokv.count || 0);
          })
          .catch((error) => console.error("Fetch error:", error));
      }, []);
        const data = [
        { name: 'Miền Bắc', value: soLuongMb },
        { name: 'Miền Nam', value: soLuongMn },
        // { name: 'Khu vực không xác định', value: soLuongKoKv },
        ];
  
  return (
    <div style={{ height: '40vh' }}>
      {/* width: '100%',  */}
      <ResponsiveContainer>
  <PieChart>
    <Pie
      data={data}
      cx="60%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
      cy="50%"
      // innerRadius={90}
      outerRadius="95%"   // ✅ co giãn tự động theo khung
      // innerRadius="20%"
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
      right: 10, // đẩy legend vào trong, gần hình tròn hơn
      top: '15%',
      transform: 'translateY(-50%)',color: 'black', }} 
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