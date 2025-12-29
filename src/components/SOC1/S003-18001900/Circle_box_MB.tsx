import React, { useState, useEffect } from 'react';
import API_URL from './apiConfig';
import {
  PieChart,
  Sector,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
} from 'recharts';
import "./index.css";
 type ThietBi = {
    ACCOUNT_NAME: string;
    NUMBER: string;
    ACC_INFO : string;
    SO_CGĐT : string;
    ROUTING_TABLE_NAME : string;
    SIPTRUNK_Name : string;
    SIP_CONTACT : string;
    SIPTRUNK_INFO : string;
    TENANT_NAME : string;
    Chan_goi_ra : string;
    Tam_ngung : string;
    SO_DICH : string;
    Khu_vuc : string;
    Ghi_chu : string;
  };



const COLORS = ['#0088FE', '#00C49F', '#FFBB28',
  '#fe0015ff', '#79c400ff', '#ff28adff',
  '#00fe2aff', '#c4b000ff', '#bb28ffff', '#28ffadff'
];
//Chia loại API để vào dev hoặc production
// let ENV = "dev"; // hoặc "prod"
// // const ENV = "dev"; // hoặc "prod"
// let API_URL = "";
// if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
// else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}

interface Props {
  onZoneClick: (keys: string | string[]) => void;
  isDisplayed: boolean;
}

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
// 🔹 Khi hover: zoom miếng ra ngoài
const renderActiveShape = (props: any) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 10} // 👈 zoom ra 15px
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};
export default function PieWithPercentage({ onZoneClick, isDisplayed }: Props) {
  const [counts, setCounts] = useState<{ key: string; value: number }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const keys = ["loaihinh", "number", "accname", "accinfo", "sodich", "dichvu"];
  const labels = ["Sai loại hình", "Number", "Account Name", "Account Info", "Số đích", "Sai loại CFU"];

  useEffect(() => {
    if (!isDisplayed) return;

    const endpoints = [
      "khong_dung_loaihinh", "khong_dung_number", "khong_dung_accountname", "khong_dung_accinfo",
      "khong_dung_sodich", "khong_dung_dichvu"
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/mb/${ep}/`).then(res => res.json()).then(data => data.count ?? 0)
      )
    )
      .then(values => {
        const arr = values.map((v, i) => ({ key: keys[i], value: v }));
        setCounts(arr);
      })
      .catch(() => setError("Không thể tải dữ liệu"));
  }, [isDisplayed]);

  if (!isDisplayed) return <div className="no-data">No Data</div>;
  if (error) return <div className="error">⚠️ {error}</div>;

  // 🔹 Gom nhóm nhỏ <3% thành "Khác"
  const total = counts.reduce((sum, d) => sum + d.value, 0);
  const mainGroups = counts.filter(d => d.value / total >= 0.03);
  const smallGroups = counts.filter(d => d.value / total < 0.03);
  const otherSum = smallGroups.reduce((sum, d) => sum + d.value, 0);

  const data = otherSum > 0
    ? [
      ...mainGroups.map(d => ({ name: labels[keys.indexOf(d.key)], value: d.value, key: d.key })),
      { name: "Khác", value: otherSum, key: smallGroups.map(d => d.key) }
    ]
    : mainGroups.map(d => ({ name: labels[keys.indexOf(d.key)], value: d.value, key: d.key }));
   // 🔹 Custom label màu đen
  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const offset = 20; // khoảng cách ra ngoài pie
  const radius = outerRadius + offset;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const textAnchor = x > cx ? "start" : "end"; // label bên phải thì căn trái, bên trái thì căn phải
  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={14}
    >
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};
  return (
    // <div style={{ width: '100%', height: 350 }}>
    //   <ResponsiveContainer>
    <div style={{ width: '100%', height: '55vh' }}>
      <ResponsiveContainer width="95%" height="95%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="80%"
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            label={({ name, percent }) =>
              percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
            }
            
            labelLine={true}
            onClick={(_, index) => {
              if (typeof onZoneClick === "function") onZoneClick(data[index].key);
            }}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}