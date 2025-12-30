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
      fill="black"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
    >
      {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

export default function PieWithPercentage({  isDisplayed }: Props) {
  

    const [soLuongChuanHoa,setSoLuongChuanHoa] = useState<number>(0);
    const [soLuongChuaChuanHoa,setSoLuongChuaChuanHoa] = useState<number>(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
     useEffect(() => {
    // Fetch song song bằng Promise.all
    Promise.all([
      fetch(`${API_URL}/thong-ke-loi/count/mb/account_be_chuan_hoa/`).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/thong-ke-loi/count/mb/account_be_chua_chuan_hoa/`).then((res) =>
        res.json()
      ),
        ])
          .then(([chuanhoa, chuachuanhoa]) => {
            setSoLuongChuanHoa(chuanhoa.count || 0);
            setSoLuongChuaChuanHoa(chuachuanhoa.count || 0);
          })
          .catch((error) => console.error("Fetch error:", error));
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
        { name: 'Số lượng chuẩn hoá', value: soLuongChuanHoa },
        { name: 'Số lượng chưa chuẩn hoá', value: soLuongChuaChuanHoa },
        ];
  
  return (
    <div style={{ height: '20vh' }}>
      {/* width: '100%',  */}
      <ResponsiveContainer>
    <PieChart>
    <Pie
      data={data}
      cx="50%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
      cy="50%"
      // innerRadius={90}
      outerRadius="90%"   // ✅ co giãn tự động theo khung
      // innerRadius="20%"
      dataKey="value"
      // label={({ name, percent }) =>
      //   percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
      // }
      label={renderCustomizedLabel}
      labelLine={false}
      // labelLine={true}    
     
      
// 👈 xử lý click
      onMouseEnter={(_, index) => setActiveIndex(index)}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {data.map((entry, index) => (
        <Cell className='cell_spec' key={`cell-${index}`} fill={COLORS[index % COLORS.length]}
         />
      ))}
    </Pie>
    <Tooltip
    content={({ payload }) => {
      if (payload && payload.length) {
        return (
          <div style={{ background: 'white', padding: '4px 8px', border: '1px solid #ccc' }}>
            <span>{payload[0].value}</span>
          </div>
        );
      }
      return null;
    }}
  />
    <Legend 
       layout="vertical"       // xếp theo cột
  verticalAlign="middle"  // căn giữa theo chiều dọc
  align="right"           // đặt ở bên phải
  wrapperStyle={{
    
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    fontSize: "clamp(6px, 1.2vw, 12px)",
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