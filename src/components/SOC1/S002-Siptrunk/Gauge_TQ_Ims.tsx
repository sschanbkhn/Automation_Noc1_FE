// import React from "react";
// import { PieChart, Pie, Cell } from "recharts";

// interface Gauge_TQProps {
//   value: number;
// }

// const Gauge_TQ: React.FC<Gauge_TQProps> = ({ value }) => {
//   const data = [
//     { name: "done", value: value },
//     { name: "remaining", value: 100 - value },
//   ];

//   const COLORS = ["#22c55e", "#e5e7eb"]; // xanh lá + xám nhạt

//   return (
//     <div style={{ width: "100%", height: "100%", textAlign: "center" }}>
//       <PieChart width={200} height={120}>
//         <Pie
//           data={data}
//           startAngle={180}
//           endAngle={0}
//           innerRadius={60}
//           outerRadius={80}
//           paddingAngle={2}
//           dataKey="value"
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index]} />
//           ))}
//         </Pie>
//       </PieChart>
//       <div
//         style={{
//           marginTop: "-40px",
//           fontSize: "24px",
//           fontWeight: "bold",
//           color: "#16a34a",
//         }}
//       >
//         {value.toFixed(2)}%
//       </div>
//     </div>
//   );
// };

// export default Gauge_TQ;

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Gauge_TQ_ImsProps {
  value: number;
}

const Gauge_TQ_Ims: React.FC<Gauge_TQ_ImsProps> = ({ value }) => {
  const data = [
      { name: "done", value },
      { name: "remaining", value: 100 - value },
    ];
  
    const COLORS = ["#27f84aff", "#f3ede0ff"];
  
    return (
      <div
      >
        {/* Gauge Chart */}
        <div style={{marginTop: "0.5rem", position: "relative", width: "100%", height: "10vh", }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              startAngle={200}
              endAngle={-20}
              innerRadius="70%"
              outerRadius="110%"
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
          {/* Hiển thị giá trị phần trăm nằm giữa gauge */}
          <div
            style={{
              
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -30%)",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#590f76",
            }}
          >
            {value.toFixed(2)}%
          </div>
        </div>
  
        {/* Tiêu đề nằm dưới gauge */}
        <h3
          style={{
            marginTop: "-1rem",
            fontSize: "13px",
            color: "#2008f3ff",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          TỶ LỆ CHUẨN HOÁ BE
        </h3>
      </div>
    );
  };

export default Gauge_TQ_Ims;
