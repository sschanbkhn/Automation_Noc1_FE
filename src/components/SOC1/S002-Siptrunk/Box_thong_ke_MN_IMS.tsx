import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig';
// Đặt type & interface RA NGOÀI component
type ThietBi = { 
    number: string;
    MTAS: string;
    pbx1: string;
    maxchannels_be: number;
    ibcf1: string;
    Khu_vuc: string;
    number_check: string;
    Ghi_chu: string;
  };


interface Props {
  onClickBox: (index: number) => void; // ✅ chỉ trả index về component cha
  isDisplayed: boolean;
}

const BoxThongKe = ({ onClickBox, isDisplayed}: Props) => {
  

  const [soLechAccName, setSoLechAccName] = useState(0);
  const [soLechKenh, setSoLechKenh] = useState(0);
  const [soLechSipTel, setSoLechSipTel] = useState(0);
  const [soLechDest, setSoLechDest] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     if (!isDisplayed) {
      setError(null); // reset lỗi khi không hiển thị
      return;
    }
    setError(null); // reset lỗi trước khi fetch
    const endpoints = [
      "khong_dung_mtas",
      "khong_dung_kenh",
      "khong_dung_siptel",
      "khong_dung_pbx1",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/ims/mn/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 }) // nếu HTTP lỗi
          .then(data => data.count ?? 0)                  // fallback nếu count undefined
          .catch(() => 0)                                 // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechAccName(results[0]);
      setSoLechKenh(results[1]);
      setSoLechSipTel(results[2]);
      setSoLechDest(results[3]);
    });
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

  const tongLoi = (soLechAccName + soLechKenh + soLechSipTel + soLechDest);
   // ✅ Khi click, chỉ gửi index về component cha
  const handleClick = (index: number) => {
    console.log("Clicked box index:", index);
    onClickBox(index);
  };
  return (
    <div>
      
      
      <div style={{ width: '100%', height: '180px', marginLeft: "30px", marginRight: "30px", display: 'flex' }}>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '85%', height: '150px' }}  onClick={() => handleClick(0)}>
            <p className="text-type">📖 DANH SÁCH ACCOUNT NAME CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechAccName}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechAccName / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '85%', height: '150px' }}  onClick={() => handleClick(1)}>
            <p className="text-type">📒DANH SÁCH KHÁCH HÀNG CÓ SỐ CUỘC GỌI ĐỒNG THỜI CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechKenh}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechKenh / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: '180px', marginLeft: "30px", marginRight: "30px", display: 'flex' }}>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '85%' }}  onClick={() => handleClick(2)}>
            <p className="text-type">📙 DANH SÁCH ĐẦU SỐ CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechSipTel}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechSipTel / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '85%' }}  onClick={() => handleClick(3)}>
            <p className="text-type">📓 DANH SÁCH IP KHÁCH HÀNG CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechDest}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechDest / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};
export default BoxThongKe;
