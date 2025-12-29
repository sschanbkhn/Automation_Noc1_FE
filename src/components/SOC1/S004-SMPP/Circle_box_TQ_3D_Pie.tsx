import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import ReactFusioncharts from "react-fusioncharts";

Charts(FusionCharts);
FusionTheme(FusionCharts);

interface Props {
  onZoneClick: (index: number) => void;
}

export default function Pie3DChart({ onZoneClick }: Props) {
  const [soLuongChuanHoa, setSoLuongChuanHoa] = useState(0);
  const [soLuongChuaChuanHoa, setSoLuongChuaChuanHoa] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/thong-ke-loi/count/number_be_chuan_hoa/`).then((res) => res.json()),
      fetch(`${API_URL}/thong-ke-loi/count/number_be_chua_chuan_hoa/`).then((res) => res.json()),
    ])
      .then(([chuanHoa, chuaChuanHoa]) => {
        setSoLuongChuanHoa(chuanHoa.count || 0);
        setSoLuongChuaChuanHoa(chuaChuanHoa.count || 0);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const data = [
    { label: "Toàn Quốc đã chuẩn hoá", value: soLuongChuanHoa },
    { label: "Toàn Quốc chưa chuẩn hoá", value: soLuongChuaChuanHoa },
  ];

  const chartConfig = {
  type: "pie3d",
  width: "100%",
  height: "100%",   // 👈 Không đặt số cố định nữa   
  dataFormat: "json",
  dataSource: {
    chart: {
       chartTopMargin: "0",
      chartBottomMargin: "0",
      chartLeftMargin: "0",
      chartRightMargin: "0",
      showPercentValues: "1",
      theme: "fusion",
      paperBgColor: "transparent", // nền tổng thể
      plotBgColor: "transparent",  // nền vùng vẽ Pie
       showBorder: "0",                // tắt border tổng thể
  showCanvasBorder: "0",          // tắt border của canvas bên trong
  showPlotBorder: "0",            // tắt border của Pie
      palettecolors: "#25adc5,#9b59b6", // xanh + tím
      showTooltip: "1",

      // 🎯 Chỉ hiển thị %
      showLabels: "0",
      showValues: "1",
      plotToolText: "$label - $value ($percentValue)",   // ✨ tooltip đầy đủ


      // 🎯 Tăng kích cỡ Pie
      pieRadius: "100",

      // 👇 Font trong suốt để kế thừa từ cha
      baseFontColor: "hsl(69, 78%, 79%);", // vẫn giữ trong suốt
      toolTipColor: "#000000",        // chữ trong tooltip luôn đen
      toolTipBgColor: "#ffffff",      // nền tooltip trắng (hoặc tùy)
      toolTipBorderColor: "#000000",
      
      // Border
      // showBorder: "1",
      borderColor: "#000000",
      borderThickness: "1",
      // ✅ Chỉ hiện label trên legend, không kèm %
      showLegendPercentValues: "0",
    },
    data: data,
  },
  events: {
    dataplotClick: (event: any) => {
      onZoneClick(event.dataIndex);
    },
  },
};

  return (
    <div style={{ width: "100%", height: "100%" }}>
    <ReactFusioncharts
      {...chartConfig}
      width="100%"
      height="100%"   // 🔥 Quan trọng
    />
  </div>
  );
}
// import React, { useState, useEffect } from "react";
// import Plot from "react-plotly.js";       // React wrapper
// import API_URL from "./apiConfig";

// interface Props {
//   onZoneClick: (index: number) => void;
// }

// export default function Pie3DChart({ onZoneClick }: Props) {
//   const [soLuongChuanHoa, setSoLuongChuanHoa] = useState(0);
//   const [soLuongChuaChuanHoa, setSoLuongChuaChuanHoa] = useState(0);

//   useEffect(() => {
//     Promise.all([
//       fetch(`${API_URL}/thong-ke-loi/count/number_be_chuan_hoa/`).then((res) => res.json()),
//       fetch(`${API_URL}/thong-ke-loi/count/number_be_chua_chuan_hoa/`).then((res) => res.json()),
//     ])
//       .then(([chuanHoa, chuaChuanHoa]) => {
//         setSoLuongChuanHoa(chuanHoa.count || 0);
//         setSoLuongChuaChuanHoa(chuaChuanHoa.count || 0);
//       })
//       .catch((err) => console.error("Fetch error:", err));
//   }, []);

//   const labels = ["Toàn Quốc đã chuẩn hoá", "Toàn Quốc chưa chuẩn hoá"];
//   const values = [soLuongChuanHoa, soLuongChuaChuanHoa];
//   const colors = ["#25adc5", "#f75858"];

//   return (
//   <div style={{ width: "100%", height: "400px" }}>
//     <Plot
//       data={[
//         {
//           type: "pie",
//           labels: labels,
//           values: values,
//           marker: {
//             colors: colors,
//             line: { color: "#000", width: 1 }, // border quanh từng phần
//           },
//           hoverinfo: "label+value+percent", // tooltip đầy đủ
//           textinfo: "value", // hiển thị giá trị trực tiếp trên Pie
//           hole: 0, // 0 = pie, >0 = donut
//           pull: [0.05, 0], // phần “đã chuẩn hoá” nổi lên 1 chút để giống 3D
//           rotation: 45, // xoay Pie để cảm giác 3D
//         },
//       ]}
//       layout={{
//         margin: { t: 20, b: 20, l: 20, r: 20 },
//         showlegend: true,
//         paper_bgcolor: "transparent",
//         plot_bgcolor: "transparent",
//       }}
//       config={{
//         responsive: true,
//       }}
//       onClick={(data) => {
//         if (data.points && data.points.length > 0) {
//           onZoneClick(data.points[0].pointNumber);
//         }
//       }}
//       style={{ width: "100%", height: "100%" }}
//     />
//   </div>
// );
// }
