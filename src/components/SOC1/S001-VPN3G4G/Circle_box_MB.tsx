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
type ThietBi = {
      ten_apn: string;
      ten_pgw: string;
      ip_cho_sim: string;
      ospf_area: string;
      dai_ip_sim: string;
      ip_pgw: string;
      vlan: string;
      hlr_apnid: string;
      hlr_pdpcp: string;
      hss_profile: string;
      ghi_chu: string;
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
  

    const [soLechAPNMB, setSoLechAPNMB] = useState(0);
    const [soLechPGWMB, setSoLechPGWMB] = useState(0);
    const [soLechIpSimMB, setSoLechIpSimMB] = useState(0);
    const [soLechDaiIpMB, setSoLechDaiIpMB] = useState(0);
    const [soLechIpGwMB, setSoLechIpGwMB] = useState(0);
    const [soLechVlanMB, setSoLechVlanMB] = useState(0);
    const [soLechOspfMB, setSoLechOspfMB] = useState(0);
    const [soLechApnidMB, setSoLechApnidMB] = useState(0);
    const [soLechPdpcpMB, setSoLechPdpcpMB] = useState(0);
    const [soLechHssMB, setSoLechHssMB] = useState(0);
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

      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_apn/`)
      .then(res => res.json())
      .then(data => setSoLechAPNMB(data.count));

      // Gọi API lấy số lệch PGW
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_pgw/`)
        .then(res => res.json())
        .then(data => setSoLechPGWMB(data.count));

      //Gọi API lấy số lệch IP cho SIM
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_ipsim/`)
        .then(res => res.json())
        .then(data => setSoLechIpSimMB(data.count));

      //Gọi API lấy số lệch dai IP
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_daiip/`)
        .then(res => res.json())
        .then(data => setSoLechDaiIpMB(data.count));
      
      //Gọi API lấy số lệch IP GW
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_ippgw/`)
        .then(res => res.json())
        .then(data => setSoLechIpGwMB(data.count));

        //Gọi API lấy số lệch Vlan
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_vlan/`)
        .then(res => res.json())
        .then(data => setSoLechVlanMB(data.count));

      //Gọi API lấy số lệch Ospf
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_ospf/`)
        .then(res => res.json())
        .then(data => setSoLechOspfMB(data.count));

        //Gọi API lấy số lệch apnid
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_apnid/`)
        .then(res => res.json())
        .then(data => setSoLechApnidMB(data.count));

      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_pdpcp/`)
        .then(res => res.json())
        .then(data => setSoLechPdpcpMB(data.count));

      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_dung_hss/`)
        .then(res => res.json())
        .then(data => setSoLechHssMB(data.count));
      //API gọi số lượng trùng lặp
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_trung_lap/`)
        .then(res => res.json())
        .then(data => setSoLechTrungLapMB(data.count));
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
        { name: 'Tên APN', value: soLechAPNMB },
        { name: 'PGW', value: soLechPGWMB },
        { name: 'Loai Ip SIM', value: soLechIpSimMB },
        { name: 'Dải IP SIM', value: soLechDaiIpMB },
        { name: 'Dải IP PGW', value: soLechIpGwMB },
        { name: 'Vlan', value: soLechVlanMB },
        { name: 'OSPF', value: soLechOspfMB },
        { name: 'HLR APNID', value: soLechApnidMB },
        { name: 'HLR PDPCP', value: soLechPdpcpMB },
        { name: 'HSS Profile', value: soLechHssMB },
        // { name: 'Trùng lặp', value: soLechTrungLapMB },

        ];
        
  return (
  // <div style={{ width: '100%', height: 350 }}>
  // <ResponsiveContainer>
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
        percent != null ? 
         `${name} ${(percent * 100).toFixed(1)}%`
        : name
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
        
        transform: 'translateY(-50%)',color: 'black', }}
        formatter={(value) => (
        <span style={{ fontSize: "11px", color: "black" }}>{value}</span>)}  
        />
    </PieChart>
</ResponsiveContainer>
    </div>
  );
}