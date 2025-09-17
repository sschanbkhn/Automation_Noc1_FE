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
    '#4ffc91ff', '#c4b000ff', '#bb28ffff','#28ffadff'
];

//Chia loại API để vào dev hoặc production
// let ENV = "prod"; // hoặc "prod"
// const ENV = "dev"; // hoặc "prod"
// let API_URL = "";
// if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
// else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}

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
  

    const [soLechAPNMN, setSoLechAPNMN] = useState(0);
    const [soLechPGWMN, setSoLechPGWMN] = useState(0);
    const [soLechIpSimMN, setSoLechIpSimMN] = useState(0);
    const [soLechDaiIpMN, setSoLechDaiIpMN] = useState(0);
    const [soLechIpGwMN, setSoLechIpGwMN] = useState(0);
    const [soLechVlanMN, setSoLechVlanMN] = useState(0);
    const [soLechOspfMN, setSoLechOspfMN] = useState(0);
    const [soLechApnidMN, setSoLechApnidMN] = useState(0);
    const [soLechPdpcpMN, setSoLechPdpcpMN] = useState(0);
    const [soLechHssMN, setSoLechHssMN] = useState(0);
    const [soLechTrungLapMB, setSoLechTrungLapMB] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
         
      useEffect(() => {
        
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_apn/`)
        .then(res => res.json())
        .then(data => setSoLechAPNMN(data.count));
  
      // Gọi API lấy số lệch PGW
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_pgw/`)
        .then(res => res.json())
        .then(data => setSoLechPGWMN(data.count));

      //Gọi API lấy số lệch IP cho SIM
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_ipsim/`)
        .then(res => res.json())
        .then(data => setSoLechIpSimMN(data.count));

      //Gọi API lấy số lệch dai IP
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_daiip/`)
        .then(res => res.json())
        .then(data => setSoLechDaiIpMN(data.count));
      
      //Gọi API lấy số lệch IP GW
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_ippgw/`)
        .then(res => res.json())
        .then(data => setSoLechIpGwMN(data.count));

        //Gọi API lấy số lệch Vlan
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_vlan/`)
        .then(res => res.json())
        .then(data => setSoLechVlanMN(data.count));

      //Gọi API lấy số lệch Ospf
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_ospf/`)
        .then(res => res.json())
        .then(data => setSoLechOspfMN(data.count));

        //Gọi API lấy số lệch apnid
      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_apnid/`)
        .then(res => res.json())
        .then(data => setSoLechApnidMN(data.count));

      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_pdpcp/`)
        .then(res => res.json())
        .then(data => setSoLechPdpcpMN(data.count));

      fetch(`${API_URL}/thong-ke-loi/count/mn/khong_dung_hss/`)
        .then(res => res.json())
        .then(data => setSoLechHssMN(data.count));
      //API gọi số lượng trùng lặp
      fetch(`${API_URL}/thong-ke-loi/count/mb/khong_trung_lap/`)
        .then(res => res.json())
        .then(data => setSoLechTrungLapMB(data.count));
      }, []);

        const data = [
        { name: 'Tên APN', value: soLechAPNMN },
        { name: 'PGW', value: soLechPGWMN },
        { name: 'Loại Ip SIM', value: soLechIpSimMN },
        { name: 'Dải IP SIM', value: soLechDaiIpMN },
        { name: 'Dải IP PGW', value: soLechIpGwMN },
        { name: 'Vlan', value: soLechVlanMN },
        { name: 'OSPF', value: soLechOspfMN },
        { name: 'HLR APNID', value: soLechApnidMN },
        { name: 'HLR PDPCP', value: soLechPdpcpMN },
        { name: 'HSS Profile', value: soLechHssMN },
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
    transform: 'translateY(-50%)',color: 'black', }}  
    formatter={(value) => (
        <span style={{ fontSize: "11px", color: "black" }}>{value}</span>)}  
    />
  </PieChart>
</ResponsiveContainer>
    </div>
  );
}