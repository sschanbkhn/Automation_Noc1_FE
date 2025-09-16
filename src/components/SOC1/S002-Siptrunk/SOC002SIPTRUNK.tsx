import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,Cell,Label
} from 'recharts';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoat from "./Bang_thong_tin_doi_soat";
import Header from "./Header";
import Button from "./Button";
import ToanQuoc from "./ToanQuoc";
// import AaranetMienBac from "./AaranetMienBac";
// import AaranetMienNam from "./AaranetMienNam";
// import ImsMienBac from "./ImsMienBac";
// import ImsMienNam from "./ImsMienNam";
// import ThietLap from "./ThietLap";
import "./index.css";
function SIPTRUNK() {
  const [tab, setTab] = useState("toanquoc");

return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <Header />

      {/* Nút bấm */}
      {/* <Button onChangeTab={setTab} /> */}
      <Button onChangeTab={setTab} tab={tab} />

      <div style={{ padding: "1rem" }}>
        {/* Giao diện hiển thị theo tab */}
        {tab === "toanquoc" && <ToanQuoc />}
        {/* {tab === "a// mienbac" && <AaranetMienBac />}
        {tab === "a// miennam" && <AaranetMienNam />}
        {tab === "ims mienbac" && <ImsMienBac />}
        {tab === "ims miennam" && <ImsMienNam />}
        {tab === "thietlap" && <ThietLap />} */}
      </div>
    </div>
  );
}
;
export default SIPTRUNK;


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
