import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig';
// Đặt type & interface RA NGOÀI component
type DoiSoat = {
  Ten_APN: string;
  Ten_PGW_csdl: string;
  IP_cho_SIM_csdl: string;
  HLR_APNID_csdl: string;
  HLR_PDPCP_csdl: string;
  HSS_Profile_csdl: string;
  Ten_PGW_be: string;
  IP_cho_SIM_be: string;
  HLR_APNID_be: string;
  HLR_PDPCP_be: string;
  HSS_Profile_be: string;
  Ghi_chu: string;
};

// //Chia loại API để vào dev hoặc production
// let ENV = "dev"; // hoặc "prod"
// let API_URL = "";
// if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
// else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}

interface Props {
  onClickBox: (data: any[], tieuDe: string, loaiBang: string) => void;
}

// Component duy nhất
const BoxDoiSoat = ({ onClickBox }: Props) => {
  const [soDoiSoatAPN, setSoDoiSoatAPN] = useState(0);
  const [soDoiSoatAPNID, setSoDoiSoatAPNID] = useState(0);
  const [soDoiSoatPDPCP, setSoDoiSoatPDPCP] = useState(0);
  const [soDoiSoatHss, setSoDoiSoatHss] = useState(0);
  const [soDoiSoatIp, setSoDoiSoatIp] = useState(0);
  const [soDoiSoatPgw, setSoDoiSoatPgw] = useState(0);

  const displayDoiSoatAPN = () => {
    fetch(`${API_URL}/doi_soat/lech_APN/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp APN", "ds_apn");
      });
  };

  const displayDoiSoatAPNID = () => {
    fetch(`${API_URL}/doi_soat/lech_APNID/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp APNID", "ds_apnid");
      });
  };

  const displayDoiSoatPDPCP = () => {
    fetch(`${API_URL}/doi_soat/lech_PDPCP/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp PDPCP", "ds_pdpcp");
      });
  };

  const displayDoiSoatHss = () => {
    fetch(`${API_URL}/doi_soat/lech_Hss/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp HSS", "ds_hss");
      });
  };

  const displayDoiSoatIP = () => {
    fetch(`${API_URL}/doi_soat/lech_IP/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp IP", "ds_ip");
      });
  };

  const displayDoiSoatPgw = () => {
    fetch(`${API_URL}/doi_soat/lech_Pgw/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp PGW", "ds_pgw");
      });
  };
  useEffect(() => {
        const endpoints = [
          "lech_APN",
          "lech_APNID",
          "lech_PDPCP",
          "lech_Hss",
          "lech_IP",
          "lech_Pgw"
        ];
  
        Promise.all(
          endpoints.map(ep =>
            fetch(`${API_URL}/doi_soat/count/${ep}/`)
              .then(res => res.ok ? res.json() : { count: 0 }) // nếu HTTP lỗi
              .then(data => data.count ?? 0)                  // fallback nếu count undefined
              .catch(() => 0)                                 // fallback nếu fetch lỗi
          )
        ).then(results => {
          setSoDoiSoatAPN(results[0]);
          setSoDoiSoatAPNID(results[1]);
          setSoDoiSoatPDPCP(results[2]);
          setSoDoiSoatHss(results[3]);
          setSoDoiSoatIp(results[4]);
          setSoDoiSoatPgw(results[5]);
        });
    }, []);

  const tongLoi = soDoiSoatAPN + soDoiSoatAPNID + soDoiSoatPDPCP + soDoiSoatHss + soDoiSoatIp + soDoiSoatPgw;
  return (
    <div>
      <div>
        <h2 className="text_display_tren" style={{  margin: "10px"}}>DANH SÁCH SAI LỆCH BE VÀ CSDL</h2>
      </div>
      <div  style={{ width: '100%', height:'180px', marginLeft: "10px", marginRight:"10px", display: 'flex'}}>
        <div style={{ width: '33.3%', height:'150px'}}>
          <div className="box-status" style={{ width: '90%', height:'150px'}} onClick={displayDoiSoatAPN}>
            <p className="text-type">📚 SỐ LƯỢNG APN SAI KHÁC</p>
            <p className="number-type">
            <span className="so_chinh">{soDoiSoatAPN}</span>
            <span className="phan_tram"> ({((soDoiSoatAPN / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        
        <div style={{ width: '33.3%', height:'150px'}}>
          <div className="box-status_1"  style={{ width: '90%', height:'150px'}} onClick={displayDoiSoatAPNID}>
            <p className="text-type">📖 SỐ LƯỢNG HLR APNID SAI KHÁC</p>
            
            <p className="number-type">
            <span className="so_chinh">{soDoiSoatAPNID}</span>
            <span className="phan_tram"> ({((soDoiSoatAPNID / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height:'150px'}}>
          <div className="box-status_2" style={{ width: '90%', height:'150px'}}  onClick={displayDoiSoatPDPCP}>
            <p className="text-type">📒 SỐ LƯỢNG HLR PDPCP SAI KHÁC</p>
            
            <p className="number-type">
            <span className="so_chinh">{soDoiSoatPDPCP}</span>
            <span className="phan_tram"> ({((soDoiSoatPDPCP / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height:'180px', marginLeft: "10px", marginRight:"10px", display: 'flex'}}>
        <div style={{ width: '33.3%', height:'150px'}}>
          <div className="box-status_1" style={{ width: '90%'}} onClick={displayDoiSoatHss}>
            <p className="text-type">📙 SỐ LƯỢNG HSS PROFILE SAI KHÁC</p>
           
            <p className="number-type">
            <span className="so_chinh">{soDoiSoatHss}</span>
            <span className="phan_tram"> ({((soDoiSoatHss / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height:'150px'}}>
          <div className="box-status_2" style={{ width: '90%'}} onClick={displayDoiSoatIP}>
            <p className="text-type">📓 SỐ LƯỢNG IP SIM SAI KHÁC</p>
            
            <p className="number-type">
            <span className="so_chinh">{soDoiSoatIp}</span>
            <span className="phan_tram"> ({((soDoiSoatIp / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height:'150px'}}>
          <div className="box-status" style={{ width: '90%'}} onClick={displayDoiSoatPgw}>
            <p className="text-type">💳 SỐ LƯỢNG PGW SAI KHÁC</p>
            
            <p className="number-type">
            <span className="so_chinh">{soDoiSoatPgw}</span>
            <span className="phan_tram"> ({((soDoiSoatPgw / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        </div>
    </div>
    
  );
};
export default BoxDoiSoat;
