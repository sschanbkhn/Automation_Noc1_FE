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
type DoiSoat = {
  Ten_APN: string;
  Ten_PGW_csdl: string;
  IP_cho_SIM_csdl: string;
  HLR_APNID_csdl: string;
  HLR_PDPCP_csdl: string;
  HSS_Profile_csdl: string;
  Ten_PGW_be: string;
  IP_cho_SIM_be: string;
  HLR_APNID_be: string;
  HLR_PDPCP_be: string;
  HSS_Profile_be: string;
  Ghi_chu: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28',
    '#fe0015ff', '#79c400ff', '#ff28adff',
    '#00fe2aff', '#c4b000ff', '#bb28ffff','#28ffadff'
];

//Chia loại API để vào dev hoặc production
// let ENV = "dev"; // hoặc "prod"
// // const ENV = "dev"; // hoặc "prod"
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

export default function PieWithPercentage({ onZoneClick, isDisplayed }: Props) {
  

    const [soDoiSoatAPNMB, setDoiSoatAPNMB] = useState(0);
    const [soDoiSoatApnidMB, setDoiSoatApnidMB] = useState(0);
    const [soDoiSoatPdpcpMB, setDoiSoatPdpcpMB] = useState(0);
    const [soDoiSoatHssMB, setDoiSoatHssMB] = useState(0);
    const [soDoiSoatIpSimMB, setDoiSoatIpSimMB] = useState(0);
    const [soDoiSoatPgwMB, setDoiSoatPgwMB] = useState(0);
    const [soLechTrungLapMB, setSoLechTrungLapMB] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
         
  useEffect(() => {
        if (!isDisplayed) {
          setError(null); // reset lỗi khi không hiển thị
          return;
        }

        setError(null); // reset lỗi trước khi fetch
        const endpoints = [
        "lech_APN",
        "lech_APNID",
        "lech_PDPCP",
        "lech_Hss",
        "lech_IP",
        "lech_Pgw"
      ];

      Promise.all(
        endpoints.map(ep =>
          fetch(`${API_URL}/doi_soat/count/mb/${ep}/`)
            .then(res => res.json())
        )
      ).then(results => {
        setDoiSoatAPNMB(results[0].count);
        setDoiSoatApnidMB(results[1].count);
        setDoiSoatPdpcpMB(results[2].count);
        setDoiSoatHssMB(results[3].count);
        setDoiSoatIpSimMB(results[4].count);
        setDoiSoatPgwMB(results[5].count);
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
        { name: 'Tên APN', value: soDoiSoatAPNMB },
        { name: 'HLR APNID', value: soDoiSoatApnidMB },
        { name: 'HLR PDPCP', value: soDoiSoatPdpcpMB },
        { name: 'HSS Profile', value: soDoiSoatHssMB },
        { name: 'IP cho SIM', value: soDoiSoatIpSimMB },
        { name: 'PGW', value: soDoiSoatPgwMB },
        ];
        // { name: 'Trùng lặp', value: soLechTrungLapMB },
        
        
  return (
    // <div style={{ width: '100%', height: 350 }}>
    //   <ResponsiveContainer>
    <div style={{ width: '100%',  height: '50vh' }}>
    <ResponsiveContainer width="100%" height="100%">
     <PieChart>
      <Pie
      data={data}
      cx="50%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
      cy="50%"
      // innerRadius={70}
      // outerRadius={120}
      innerRadius="45%"   // inner radius theo %
      outerRadius="80%"   // outer radius theo %
      dataKey="value"
      
      label={({ name, percent }) =>
        percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
        }
      labelLine={true}                 // 👈 Bật đường chỉ dẫn ra ngoài

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
    top: '30%',
    transform: 'translateY(-50%)',color: 'black', 
    }} 
    formatter={(value) => (
    <span style={{ fontSize: "11px", color: "black" }}>{value}</span>)}  
     />
  </PieChart>
</ResponsiveContainer>
    </div>
  );
}