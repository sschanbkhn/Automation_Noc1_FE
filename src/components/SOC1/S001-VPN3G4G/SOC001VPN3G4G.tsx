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
  const [tab, setTab] = useState("dashboard");
  const [option, setOption] = useState("toanquoc");
  const [isDisplayed, setIsDisplayed] = useState(false);

  

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
        </div>
         {/* Lựa chọn tab bên trong */}
        {/* <div className="flex justify-between items-center w-full"> */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-nowrap">
        {/* Thời gian cập nhật */}
          <div className="d-flex align-items-center" style={{ marginLeft: "1rem" }}>
                <span style={{ fontSize: "1.2rem", marginRight: "4px" }}>⏰</span>
                <h6 className="fw-bold mb-0">Cập nhật gần nhất: {runTime ? runTime : "Chưa có dữ liệu"}</h6>
          </div>
          {tab === "dashboard" && (
              <span 
                // className="position-fixed end-0 me-3 bg-info shadow-lg rounded p-3" 
                className="position-relative end-0 me-3 bg-info-subtle text-info-emphasis shadow-lg rounded-3 p-2"
              >
                <label className="block text-gray-700 text-sm mb-2" >Chọn khu vực:</label>
                <select
                  value={option}
                  onChange={(e) => {
                    setOption(e.target.value);
                    setIsDisplayed(false); // reset dữ liệu mỗi lần chuyển khu vực
                  }}
                  className="border rounded px-2 w-40"
                >
                  <option value="toanquoc">Toàn Quốc</option>
                  <option value="mienbac">Miền Bắc</option>
                  <option value="mientrung">Miền Trung</option>
                  <option value="miennam">Miền Nam</option>
                </select>
                <button
                  className="btn btn-success ms-3"
                  onClick={() => setIsDisplayed(!isDisplayed)}
                >
                  {isDisplayed ? "Ẩn dữ liệu" : "Display"}
                </button>
          </span>
            )}
        </div>
        <div style={{ padding: "1rem" }}>
          {/* Giao diện hiển thị theo tab */}
          {/* {tab === "toanquoc" && <ToanQuoc />}
          {tab === "mienbac" && <MienBac />}
          {tab === "miennam" && <MienNam />}
          {tab === "mientrung" && <MienTrung />} */}
          {tab === "dashboard" && (
            <>
            {option === "toanquoc" && <ToanQuoc isDisplayed={isDisplayed} />}
            {option === "mienbac" && <MienBac isDisplayed={isDisplayed} />}
            {option === "mientrung" && <MienTrung isDisplayed={isDisplayed} />}
            {option === "miennam" && <MienNam isDisplayed={isDisplayed} />}
            </>
          )}
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
