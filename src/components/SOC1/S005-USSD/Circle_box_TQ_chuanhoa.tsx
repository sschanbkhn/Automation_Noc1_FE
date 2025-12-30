// import React, { useState, useEffect } from 'react';
// import API_URL from './apiConfig';
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
//   PieLabelRenderProps,
//   Sector
// } from 'recharts';
// import "./index.css";
// const COLORS = ['#00c458ff','#bff73bff'];


// // Hiển thị % nằm trong mỗi miếng Pie
// const renderCustomizedLabel = ({

//   cx,
//   cy,
//   midAngle,
//   innerRadius,
//   outerRadius,
//   percent,
// }: PieLabelRenderProps) => {
//   const RADIAN = Math.PI / 180;
//   const radius =
//     Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
//   const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
//   const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

//   return (
//     <text
//       x={x}
//       y={y}
//       fill="black"
//       textAnchor="middle"
//       dominantBaseline="central"
//       fontSize={14}
//     >
//       {percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
//     </text>
//   );
// };
// //Hàm để phóng to kích cỡ mỗi miếng Pie
// const renderActiveShape = (props: any) => {
//   const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
//   return (
//     <Sector
//       cx={cx}
//       cy={cy}
//       innerRadius={innerRadius}
//       outerRadius={outerRadius + 5}   // tăng bán kính khi hover
//       startAngle={startAngle}
//       endAngle={endAngle}
//       fill={fill}
//     />
//   );
// };


// export default function PieWithPercentage() {
//   const [soLuongTQChuanHoa, setSoLuongTQChuanHoa] = useState<number>(0);
//   const [soLuongTQChuaChuanHoa, setSoLuongTQChuaChuanHoa] = useState<number>(0);
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   useEffect(() => {
//     // Fetch song song bằng Promise.all
//     Promise.all([
//       fetch(`${API_URL}/thong-ke-loi/count/account_be_chuan_hoa/`).then((res) =>
//         res.json()
//       ),
//       fetch(`${API_URL}/thong-ke-loi/count/account_be_chua_chuan_hoa/`).then((res) =>
//         res.json()
//       ),
//     ])
//       .then(([chuanhoa, chuachuanhoa]) => {
//         setSoLuongTQChuanHoa(chuanhoa.count || 0);
//         setSoLuongTQChuaChuanHoa(chuachuanhoa.count || 0);
//       })
//       .catch((error) => console.error("Fetch error:", error));
//   }, []);

//   const data = [
//     { name: 'Toàn Quốc chuẩn hoá', value: soLuongTQChuanHoa },
//     { name: 'Toàn Quốc chưa chuẩn hoá', value: soLuongTQChuaChuanHoa },
//   ];

//   return (
//     <div style={{ height: '14vh' }}>
//       {/* width: '100%',  */}
//       <ResponsiveContainer>
//         <PieChart>
//           <Pie
//             data={data}
//             cx="50%"           // Dịch hình tròn sang trái để nhường chỗ cho legend
//             cy="50%"
//             // innerRadius={90}
//             outerRadius="95%"   // ✅ co giãn tự động theo khung
//             // innerRadius="20%"
//             dataKey="value"
//             // label={({ name, percent }) =>
//             //   percent != null ? `${name} ${(percent * 100).toFixed(1)}%` : name
//             // }
//             label={renderCustomizedLabel}
//             labelLine={false}
//             // labelLine={true}    
//             activeIndex={activeIndex ?? undefined}
//             activeShape={renderActiveShape}     // << thêm dòng này

//             // 👈 xử lý click
//             onMouseEnter={(_, index) => setActiveIndex(index)}
//             onMouseLeave={() => setActiveIndex(null)}
//           >
//             {data.map((entry, index) => (
//               <Cell className='cell_spec' key={`cell-${index}`} fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//           <Tooltip
//             content={({ payload }) => {
//               if (payload && payload.length) {
//                 return (
//                   <div style={{ background: 'white', padding: '4px 4px', border: '1px solid #ccc' }}>
//                     <span>{payload[0].value}</span>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />
//           <Legend
//             layout="vertical"       // xếp theo cột
//             verticalAlign="middle"  // căn giữa theo chiều dọc
//             align="right"           // đặt ở bên phải
//             wrapperStyle={{

//               backgroundColor: "#f8f9fa",
//               borderRadius: "8px",
//               fontSize: "clamp(6px, 1.2vw, 12px)",
//             }}
//             formatter={(value) => (
//               <span
//                 style={{
//                   fontSize: "clamp(6px, 1.2vw, 12px)",
//                   color: "black",
//                 }}
//               >
//                 {value}
//               </span>
//             )}
//           />

//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import API_URL from './apiConfig';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector
} from 'recharts';
import "./index.css";

const COLORS = ['#00c458', '#d9f5adff'];   // Xanh = đạt, xám = còn lại

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export default function GaugeChuanHoa() {
  const [chuanHoa, setChuanHoa] = useState(0);
  const [chuaChuanHoa, setChuaChuanHoa] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/thong-ke-loi/count/account_be_chuan_hoa/`).then(r => r.json()),
      fetch(`${API_URL}/thong-ke-loi/count/account_be_chua_chuan_hoa/`).then(r => r.json()),
    ]).then(([chuan, chua]) => {
      setChuanHoa(chuan.count || 0);
      setChuaChuanHoa(chua.count || 0);
    });
  }, []);

  const total = chuanHoa + chuaChuanHoa;
  const percent = total ? (chuanHoa / total) * 100 : 0;

  const data = [
    { name: 'Toàn Quốc chuẩn hoá', value: chuanHoa },
    { name: 'Toàn Quốc chưa chuẩn hoá', value: chuaChuanHoa },
  ];

  return (
    <div style={{ width: "100%", height: "18vh" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="60%"          // 👈 tạo nửa vòng gauge
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="95%"
            dataKey="value"
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          {/* % ở trung tâm gauge */}
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="clamp(14px, 2vw, 22px)"
            fontWeight="bold"
            fill="#333"
          >
            {percent.toFixed(1)}%
          </text>
          <text
            x="50%"
            y="78%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="clamp(9px, 1.4vw, 14px)"
            fill="#5937f3ff"
          >
            TỶ LỆ CHUẨN HOÁ
          </text>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
