

import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,Cell,Label
} from 'recharts';
import Header from "./Header";
import Button from "./Button";
import ToanQuoc from "./ToanQuoc";
import MienBac from "./MienBac";
import MienNam from "./MienNam";
import ThietLap from "./ThietLap";
import Giamsat from "./GiamSat";
import "./index.css";
import API_URL from './apiConfig';


function DV18001900() {
  const [tab, setTab] = useState("dashboard");
  const [option, setOption] = useState("toanquoc");
  const [isDisplayed, setIsDisplayed] = useState(false);
  const [khuVuc, setKhuVuc] = useState("toanquoc"); // toanquoc, mienbac, miennam
   // Tạo biến kết hợp để render component phù hợp
  const combinedOption = `${khuVuc}`;

  

const [runTime,setRunTime] = useState<string>("");
//Lấy giá trị runTime
useEffect(() => {
    fetch(`${API_URL}/run-time/`) //lấy dữ liệu thời gian
          .then(res => res.json())
    .then(json => {
      if (json.run_time) {
        const dt = new Date(json.run_time);
        const formatted = dt.toLocaleString("vi-VN", { 
          timeZone: "Asia/Ho_Chi_Minh", 
          hour12: false 
        });
        setRunTime(formatted);
      } else {
        setRunTime("Không có dữ liệu thời gian");
      }
    })
    .catch(err => {
      console.error("Lỗi khi lấy thời gian:", err);
      setRunTime("Lỗi khi tải dữ liệu");
    });
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
           {/* Dropdown chọn loại hình và khu vực */}
        {tab === "dashboard" && (
          <span className="position-relative end-0 me-3 bg-info-subtle text-info-emphasis shadow-lg rounded-3 p-2">
            {/* Lựa chọn khu vực */}
            <label className="block text-gray-700 text-sm mb-1">Chọn khu vực:</label>
            <select
              value={khuVuc}
              onChange={(e) => {
                setKhuVuc(e.target.value);
                setIsDisplayed(false);
              }}
              className="border rounded px-2 w-40"
            >
              <option value="toanquoc">Toàn Quốc</option>
              <option value="mienbac">Miền Bắc</option>
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

      {/* Nội dung chính */}
      <div style={{ padding: "1rem" }}>
        {tab === "dashboard" && (
          <>
            {/* Aaranet */}
            {combinedOption === "toanquoc" && (
              <ToanQuoc isDisplayed={isDisplayed} />
            )}
            {combinedOption === "mienbac" && (
              <MienBac isDisplayed={isDisplayed} />
            )}
            {combinedOption === "miennam" && (
              <MienNam isDisplayed={isDisplayed} />
            )}
          </>
        )}
          {tab === "giamsat" && <Giamsat />}
          {tab === "thietlap" && <ThietLap />}
        </div>
      </div>
  );
}
;
export default DV18001900;

