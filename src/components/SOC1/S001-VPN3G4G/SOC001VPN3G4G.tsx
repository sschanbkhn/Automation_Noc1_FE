import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,Cell,Label
} from 'recharts';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoat from "./Bang_thong_tin_doi_soat";
import Header from "./Header";
import BoxDoiSoat from "./Box_doi_soat";
import Circle_box_TQ from "./Circle_box_TQ";
import Circle_Box_ds_TQ from "./Circle_Box_ds_TQ";
import Button from "./Button";
import ToanQuoc from "./ToanQuoc";
import MienBac from "./MienBac";
import MienNam from "./MienNam";
import MienTrung from "./MienTrung";
import ThietLap from "./ThietLap";
import Giamsat from "./GiamSat";
import "./index.css";
import API_URL from './apiConfig';


function VPN3G4G() {
  const [tab, setTab] = useState("toanquoc");

  

const [runTime,setRunTime] = useState<string>("");
//Lấy giá trị runTime
useEffect(() => {
    fetch(`${API_URL}/run_time/`)
      .then(res => res.json())
      .then(json => {
        if (json.run_time) {
          // Parse về Date object
          const dt = new Date(json.run_time);
          // Format theo giờ Việt Nam, dạng: 08/09/2025 22:45:00
          const formatted = dt.toLocaleString("vi-VN", { hour12: false });
          setRunTime(formatted);
        }
      })
      .catch(err => console.error(err));
  }, []);

return (
    // <div style={{ width: '100%' }}>
      <div className="w-full">
      {/* Header */}
      <Header />
      <div className="flex justify-between items-center p-2 w-full">
      {/* Nút bấm */}
      <Button onChangeTab={setTab} tab={tab} />
       {/* Thời gian cập nhật */}
      <span className="text-sm text-gray-500 whitespace-nowrap">
      Cập nhật gần nhất: {runTime ? runTime : "Chưa có dữ liệu"}
      </span>
      </div>
      <div style={{ padding: "1rem" }}>
        {/* Giao diện hiển thị theo tab */}
        {tab === "toanquoc" && <ToanQuoc />}
        {tab === "mienbac" && <MienBac />}
        {tab === "miennam" && <MienNam />}
        {tab === "mientrung" && <MienTrung />}
        {tab === "giamsat" && <Giamsat />}
        {tab === "thietlap" && <ThietLap />}
      </div>
    </div>
  );
}
;
export default VPN3G4G;


//CODE MỚI
// import { useState } from "react";
// import Sidebar from "./Sidebar";
// import Header from "./Header";
// // Các component VPN3G4G
// import ToanQuoc from "./ToanQuoc";
// import MienBac from "./MienBac";
// import MienNam from "./MienNam";
// import MienTrung from "./MienTrung";
// import ThietLap from "./ThietLap";
// import Button from "./Button";

// function VPN3G4G() {
//   const [selectedModule, setSelectedModule] = useState("vpn3g4g"); // vpn3g4g | siptrunk
//   const [tab, setTab] = useState("toanquoc"); // thiết lập nút bấm cho VPN3G4G

//   return (
//     <div style={{ display: 'flex', width: '100%' }}>
//       <div style={{ flex: 1, padding: '1rem' }}>
//         {/* Header */}
//             <Header />
//         {selectedModule === "vpn3g4g" && (
//           <>
//             <Button onChangeTab={setTab} tab={tab} />
//             {tab === "toanquoc" && <ToanQuoc />}
//             {tab === "mienbac" && <MienBac />}
//             {tab === "miennam" && <MienNam />}
//             {tab === "mientrung" && <MienTrung />}
//             {tab === "thietlap" && <ThietLap />}
//           </>
//         )}

//       </div>
//     </div>
//   );
// }

// export default VPN3G4G;
