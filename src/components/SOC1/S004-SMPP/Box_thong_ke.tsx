import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig';
// Đặt type & interface RA NGOÀI component
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


interface Props {
  onClickBox: (index: number) => void; // ✅ chỉ trả index về component cha
}

const BoxThongKe = ({ onClickBox }: Props) => {
  
  const [soLechAccName, setSoLechAccName] = useState(0);
  const [soLechSoDich, setSoLechSoDich] = useState(0);
  const [soLechThanhLy, setSoLechThanhLy] = useState(0);
  const [soLechTamNgung, setSoLechTamNgung] = useState(0);


  useEffect(() => {
    const endpoints = [
      "lech_acc_name",
      "lech_sodich",
      "lech_thanh_ly",
      "lech_tam_ngung",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/doi-soat/count/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 }) // nếu HTTP lỗi
          .then(data => data.count ?? 0)                  // fallback nếu count undefined
          .catch(() => 0)                                 // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechAccName(results[0]);
      setSoLechSoDich(results[1]);
      setSoLechThanhLy(results[2]);
      setSoLechTamNgung(results[3]);
    });
  }, []);

  const tongLoi = (soLechAccName + soLechSoDich + soLechThanhLy + soLechTamNgung);
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
            <p className="text-type">📖 SỐ LƯỢNG ACCOUNT NAME SAI LỆCH</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechAccName}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechAccName / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '85%', height: '150px' }}  onClick={() => handleClick(1)}>
            <p className="text-type">📒 SỐ LƯỢNG ĐẦU SỐ ĐÍCH SAI LỆCH</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechSoDich}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechSoDich / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: '180px', marginLeft: "30px", marginRight: "30px", display: 'flex' }}>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '85%' }}  onClick={() => handleClick(2)}>
            <p className="text-type">📙 SỐ LƯỢNG ĐẦU SỐ THANH LÝ SAI LỆCH</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechThanhLy}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechThanhLy / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
        <div style={{ width: '50%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '85%' }}  onClick={() => handleClick(3)}>
            <p className="text-type">📓 SỐ LƯỢNG ĐẦU SỐ TẠM NGƯNG SAI LỆCH</p>

            <p className="number-type">
              <span className="so_chinh_1">{soLechTamNgung}</span>
              <span className="phan_tram_1"> ({tongLoi === 0? "0%": `${((soLechTamNgung / tongLoi) * 100).toFixed(1)}%`})</span>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};
export default BoxThongKe;
