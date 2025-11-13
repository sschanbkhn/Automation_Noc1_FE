import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import API_URL from './apiConfig';
// Đặt type & interface RA NGOÀI component
type DoiSoat = {
  Number: string;
  Phantom_number: string;
  Account_name_csdl: string;
  Account_name_be: string;
  account_info_csdl: string;
  account_info_be: string;
  Max_channel_csdl: string;
  Max_channel_be: string;
  Destination_csdl: string;
  Destionation_be: string;
  status: string;
  ADDRESS_DISABLE: string;
  values_added: string;
  ADDRESS_INCOMING: string;
  ROUTING_TABLE_NAME: string;
  category: string;
  service_type: string;
  brand_name: string;
  Ghi_chu: string
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
  const [soDoiSoatNumberBE, setSoDoiSoatNumberBE] = useState(0);
  const [soDoiSoatNumberCSDL, setSoDoiSoatNumberCSDL] = useState(0);
  const [soDoiSoatTocDo, setSoDoiSoatTocDo] = useState(0);
  const [soDoiSoatAccName, setSoDoiSoatAccName] = useState(0);
  const [soDoiSoatDes, setSoDoiSoatDes] = useState(0);
  const [soDoiSoatThanhLy, setSoDoiSoatThanhLy] = useState(0);
  const [soDoiSoatTamNgung, setSoDoiSoatTamNgung] = useState(0);
  const [soDoiSoatInfo, setSoDoiSoatInfo] = useState(0);
  const [soDoiSoatMoQt, setSoDoiSoatMoQt] = useState(0);
  const [soDoiSoatBrandname, setSoDoiSoatBrandname] = useState(0);
  const [soDoiSoatAddIncoming, setSoDoiSoatAddIncoming] = useState(0);

  const displayDoiSoatTocDo = () => {
    fetch(`${API_URL}/doi-soat/lech_tocdo/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách lệch tốc độ", "ds_tocdo");
      });
  };

  const displayDoiSoatAccName = () => {
    fetch(`${API_URL}/doi-soat/lech_acc_name/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp Accoung Name", "ds_accname");
      });
  };

  const displayDoiSoatDestination = () => {
    fetch(`${API_URL}/doi-soat/lech_destination/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp Destination", "ds_dest");
      });
  };

  const displayDoiSoatThanhLy = () => {
    fetch(`${API_URL}/'doi-soat/lech_thanh_ly/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp thanh lý", "ds_thanhly");
      });
  };

  const displayDoiSoatTamNgung = () => {
    fetch(`${API_URL}/doi-soat/lech_tam_ngung/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp tạm ngưng", "ds_tamngung");
      });
  };

  const displayDoiSoatInfo = () => {
    fetch(`${API_URL}/doi-soat/lech_acc_info/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp Account Info", "ds_info");
      });
  };
  const displayDoiSoatMoQte = () => {
    fetch(`${API_URL}/doi-soat/lech_mo_qte/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp Mở Quốc tế", "ds_qte");
      });
  };
  const displayDoiSoatBrandName = () => {
    fetch(`${API_URL}/doi-soat/lech_brandname/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp Brandname", "ds_brand");
      });
  };
  const displayDoiSoatAddIncome = () => {
    fetch(`${API_URL}/doi-soat/lech_address_incoming/`)
      .then((res) => res.json())
      .then((data) => {
        onClickBox(data, "Danh sách không khớp Address Incoming", "ds_addincome");
      });
  };
  useEffect(() => {
    const endpoints = [
      "lech_tocdo",
      "lech_acc_name",
      "lech_destination",
      "lech_thanh_ly",
      "lech_tam_ngung",
      "lech_acc_info",
      "lech_mo_qte",
      "lech_brandname",
      "lech_address_incoming"
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/doi-soat/count/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 }) // nếu HTTP lỗi
          .then(data => data.count ?? 0)                  // fallback nếu count undefined
          .catch(() => 0)                                 // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoDoiSoatTocDo(results[0]);
      setSoDoiSoatAccName(results[1]);
      setSoDoiSoatDes(results[2]);
      setSoDoiSoatThanhLy(results[3]);
      setSoDoiSoatTamNgung(results[4]);
      setSoDoiSoatInfo(results[5]);
      setSoDoiSoatMoQt(results[6]);
      setSoDoiSoatBrandname(results[7]);
      setSoDoiSoatAddIncoming(results[8]);
    });
  }, []);

  const tongLoi = (soDoiSoatTocDo + soDoiSoatAccName + soDoiSoatDes + soDoiSoatThanhLy + soDoiSoatTamNgung
    + soDoiSoatInfo + soDoiSoatMoQt + soDoiSoatBrandname + soDoiSoatAddIncoming);
  return (
    <div>
      <div>
        <h2 className="text_display_tren" style={{ margin: "10px" }}>DANH SÁCH SAI LỆCH BE VÀ CSDL</h2>
      </div>
      <div style={{ width: '100%', height: '180px', marginLeft: "10px", marginRight: "10px", display: 'flex' }}>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status" style={{ width: '90%', height: '150px' }} onClick={displayDoiSoatTocDo}>
            <p className="text-type">📚 SỐ LƯỢNG TỐC ĐỘ SAI KHÁC</p>
            <p className="number-type">
              <span className="so_chinh">{soDoiSoatTocDo}</span>
              <span className="phan_tram"> ({((soDoiSoatTocDo / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>

        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '90%', height: '150px' }} onClick={displayDoiSoatAccName}>
            <p className="text-type">📖 SỐ LƯỢNG ACCOUNT NAME SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatAccName}</span>
              <span className="phan_tram"> ({((soDoiSoatAccName / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%', height: '150px' }} onClick={displayDoiSoatDestination}>
            <p className="text-type">📒 SỐ LƯỢNG DESTINATION SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatDes}</span>
              <span className="phan_tram"> ({((soDoiSoatDes / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: '180px', marginLeft: "10px", marginRight: "10px", display: 'flex' }}>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '90%' }} onClick={displayDoiSoatThanhLy}>
            <p className="text-type">📙 SỐ LƯỢNG THANH LÝ SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatThanhLy}</span>
              <span className="phan_tram"> ({((soDoiSoatThanhLy / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%' }} onClick={displayDoiSoatTamNgung}>
            <p className="text-type">📓 SỐ LƯỢNG TẠM NGƯNG SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatTamNgung}</span>
              <span className="phan_tram"> ({((soDoiSoatTamNgung / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status" style={{ width: '90%' }} onClick={displayDoiSoatInfo}>
            <p className="text-type">💳 SỐ LƯỢNG ACCOUNT INFO SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatInfo}</span>
              <span className="phan_tram"> ({((soDoiSoatInfo / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '180px', marginLeft: "10px", marginRight: "10px", display: 'flex' }}>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status_1" style={{ width: '90%' }} onClick={displayDoiSoatMoQte}>
            <p className="text-type">📙 SỐ LƯỢNG MỞ QUỐC TẾ SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatMoQt}</span>
              <span className="phan_tram"> ({((soDoiSoatMoQt / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status_2" style={{ width: '90%' }} onClick={displayDoiSoatBrandName}>
            <p className="text-type">📓 SỐ LƯỢNG BRANDNAME SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatBrandname}</span>
              <span className="phan_tram"> ({((soDoiSoatBrandname / tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div style={{ width: '33.3%', height: '150px' }}>
          <div className="box-status" style={{ width: '90%' }} onClick={displayDoiSoatAddIncome}>
            <p className="text-type">💳 SỐ LƯỢNG ADDRESS INCOMING SAI KHÁC</p>

            <p className="number-type">
              <span className="so_chinh">{soDoiSoatAddIncoming}</span>
              <span className="phan_tram"> ({((soDoiSoatAddIncoming/ tongLoi) * 100).toFixed(1)}%)</span>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};
export default BoxDoiSoat;
