import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig';
// Đặt type & interface RA NGOÀI component
type DoiSoat = {
    number : string;
    account_name_csdl : string;
    account_name_be : string;
    so_dich_csdl : string;
    so_dich_be : string;
    so_cgdt_csdl : string;
    so_cgdt_be : string;
    status_csdl : string;
    tam_ngung_be : string;
    chan_goi_ra_be : string;
    Khu_vuc : string;
    Ghi_chu : string;
  };


interface Props {
  onClickBox: (index: number) => void; // ✅ chỉ trả index về component cha
  isDisplayed: boolean;
}

const BoxThongKeMN = ({ onClickBox, isDisplayed}: Props) => {
  const [soLechName, setSoLechName] = useState(0);
  const [soLechSystemId, setSoLechSystemId] = useState(0);
  const [soLechState, setSoLechState] = useState(0);
  const [soLechBindType, setSoLechBindType] = useState(0);
  const [soLechIps, setSoLechIps] = useState(0);
  const [soLechShortCode, setSoLechShortCode] = useState(0);
  const [soLechConnection, setSoLechConnection] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     if (!isDisplayed) {
      setError(null); // reset lỗi khi không hiển thị
      return;
    }
    setError(null); // reset lỗi trước khi fetch
    const endpoints = [
      "khong_dung_name",
      "khong_dung_systemid",
      "khong_dung_state",
      "khong_dung_bindtype",
      "khong_dung_ips",
      "khong_dung_shortcode",
      "khong_dung_connection",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/mn/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 }) // nếu HTTP lỗi
          .then(data => data.count ?? 0)                  // fallback nếu count undefined
          .catch(() => 0)                                 // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechName(results[0]);
      setSoLechSystemId(results[1]);
      setSoLechState(results[2]);
      setSoLechBindType(results[3]);
      setSoLechIps(results[4]);
      setSoLechShortCode(results[5]);
      setSoLechConnection(results[6]);
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

  const tongLoi = (soLechName + soLechSystemId + soLechState + soLechBindType +soLechIps + soLechShortCode + soLechConnection);
   // ✅ Khi click, chỉ gửi index về component cha
  const handleClick = (index: number) => {
    console.log("Clicked box index:", index);
    onClickBox(index);
  };
  return (
    <div>
      <div style={{ width: '100%', height: '160px', marginLeft: "10px", marginRight: "10px", display: 'flex' }}>
        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '90%', height: '150px' }}  onClick={() => handleClick(0)}>
            <p className="text-type">📖 SỐ LƯỢNG ACCOUNT NAME CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechName}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechName / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%', height: '150px' }}  onClick={() => handleClick(1)}>
            <p className="text-type">📒 SỐ LƯỢNG SYSTEM_ID CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechSystemId}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechSystemId / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%', height: '150px' }}  onClick={() => handleClick(1)}>
            <p className="text-type">📒 SỐ LƯỢNG STATE CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechState}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechState / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: '160px', marginLeft: "10px", marginRight: "10px", display: 'flex' }}>
        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '90%' }}  onClick={() => handleClick(2)}>
            <p className="text-type">📙 SỐ LƯỢNG  BIND_TYPE CHƯA CHUẨN HOÁ</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechBindType}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechBindType / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%' }}  onClick={() => handleClick(3)}>
            <p className="text-type">📓 SỐ LƯỢNG ALLOW_IPS CHƯA CHUẨN HOÁ</p>
            <p className="number-type">
              <span className="so_chinh_1">{soLechIps}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechIps / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>

        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%' }}  onClick={() => handleClick(3)}>
            <p className="text-type">📓 SỐ LƯỢNG SHORT_CODE CHƯA CHUẨN HOÁ</p>
            <p className="number-type">
              <span className="so_chinh_1">{soLechShortCode}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechShortCode / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: '160px', marginLeft: "10px", marginRight: "10px", display: 'flex' }}>
        <div style={{ width: '33%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '90%' }}  onClick={() => handleClick(2)}>
            <p className="text-type">📙 SỐ LƯỢNG MAX_CONNECTION CHƯA CHUẨN HOÁ</p>
            <p className="number-type">
              <span className="so_chinh_1">{soLechConnection}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechConnection / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        </div>
    </div>

  );
};
export default BoxThongKeMN;
