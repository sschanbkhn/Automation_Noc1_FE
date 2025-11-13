import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label
} from 'recharts';

import BoxThongKe from "./Box_thong_ke_MB_IMS";
import BangThongTinDoiSoatIms from "./Bang_thong_tin_doi_soat_IMS";
import Circle_box_ds_MB_Ims from "./Circle_box_ds_MB_Ims"
import Button from "./Button";
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import { FiBarChart2 } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import BangThongTinIms from "./Bang_thong_tin_IMS";
import API_URL from './apiConfig';
// type KhuVucProps = {
//   onChangeTab: (tab: string) => void;
// };
// { onChangeTab }: KhuVucProps


interface MienBacImsProps {
  isDisplayed: boolean;
}

function MienBacIms({ isDisplayed }: MienBacImsProps) {
  type ThietBi = { 
    number: string;
    MTAS: string;
    pbx1: string;
    maxchannels_be: number;
    ibcf1: string;
    loaihinh: string;
    Khu_vuc: string;
    Ghi_chu: string;
  };
  type DoiSoat = {
    number: string;
    phantom_digit: string;
    Max_channel_csdl:  number;
    Max_channel_be:  number;
    Account_name_csdl: string;
    Account_name_be: string;
    Destination_csdl: string;
    Destination_be: string;
    loaihinh_csdl: string;
    loaihinh_be:string;
    status: string;
    Khu_vuc: string;
    Ghi_chu: string;
  };




  //Chia loại API để vào dev hoặc production
  // let ENV = "prod"; // hoặc "prod"
  // let ENV = "dev"; // hoặc "prod"
  // let API_URL = "";
  // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
  // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}
  const [soLechMtas, setSoLechMtas] = useState(0);
  const [soLechTocDo, setSoLechTocDo] = useState(0);
  const [soLechSipTel, setSoLechSipTel] = useState(0);
  const [soLechPbx1, setSoLechPbx1] = useState(0);
  const [danhSachLechAccName, setDanhSachLechAccName] = useState<ThietBi[]>([]);
  const [danhSachLechKenh, setDanhSachLechKenh] = useState<ThietBi[]>([]);
  const [danhSachLechNumber, setDanhSachLechNumber] = useState<ThietBi[]>([]);
  const [danhSachLechDest, setDanhSachLechDest] = useState<ThietBi[]>([]);
 
  const [soDoiSoatKenh, setSoDoiSoatKenh] = useState<DoiSoat[]>([]);
  const [soDoiSoatAccName, setSoDoiSoatAccName] = useState<DoiSoat[]>([]);
  const [soDoiSoatDes, setSoDoiSoatDes] = useState<DoiSoat[]>([]);
  const [soDoiSoatMoQte, setSoDoiSoatMoQte] = useState<DoiSoat[]>([]);
  const [soDoiSoatKhoaQte, setSoDoiSoatKhoaQte] = useState<DoiSoat[]>([]);

  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1",
    "#a4de6c", "#d0ed57", "#d88884", "#84c2d8", "#c084d8", "#f6b26b"
  ];
  // const [loaiBang, setLoaiBang] = useState<string | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [tieuDe, setTieuDe] = useState("");
  const [showBang, setShowBang] = useState(false); // hiển thị bảng hay không
  const [loaiBang, setLoaiBang] = useState<"number"
    | "mtas"
    | "kenh"
    | "dest"
    | "ds_kenh"
    | "ds_accname"
    | "ds_dest"
    |"ds_onlybe"
    |"ds_onlycsdl"
    |"ds_mo_qte"
    |"ds_khoa_qte"
    |
    null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
 
  const handleCloseTable = () => {
    setShowBang(false); // 👉 Đóng bảng
    setSelectedIndex(null);
  };
  
  const handleBoxClick = (index: number) => {
    console.log("Click index:", index); // 👈 kiểm tra log này
    setSelectedIndex(index);
    setShowBang(false);   // ✅ ẩn bảng cũ trước khi fetch mới
    if (index === 0) {
      setLoaiBang("mtas");
      displayDanhSachLechAccName();
      // setShowBang(true);
    }else if (index === 1) {
      setLoaiBang("kenh");
      displayDanhSachLechKenh();
      // setShowBang(true);
    }else if (index === 2) {
      setLoaiBang("number");
      displayDanhSachLechNumber();
      // setShowBang(true);
    }
    else if (index === 3) {
      setLoaiBang("dest");
      displayDanhSachLechDest();
      // setShowBang(true);
    }
    }

  //INDEX ĐỂ SHOW TABLE CHO PHẦN ĐỐI SOÁT
  const handleClickPieSlice_ds = (index: number) => {
    console.log("Click index:", index); // 👈 kiểm tra log này
    setSelectedIndex(index);
    if (index === 0) {
      setLoaiBang("ds_kenh");
      displayDoiSoatKenh();
      setShowBang(true);
    }
    else if (index === 1) {
      setLoaiBang("ds_accname");
      displayDoiSoatAccName();
      setShowBang(true);
    }
    else if (index === 2) {
      setLoaiBang("ds_dest");
      displayDoiSoatDest();
      setShowBang(true);
    }
    else if (index === 3) {
      setLoaiBang("ds_mo_qte");
      displayDoiSoatMoQte();
      setShowBang(true);
    }
    else if (index === 4) {
      setLoaiBang("ds_khoa_qte");
      displayDoiSoatKhoaQte();
      setShowBang(true);
    }
    else {
      setLoaiBang(null);
    }
  }


  //Các action gọi bảng THỐNG KÊ BE
   const displayDanhSachLechAccName = () => {
          setLoading(true);
          setDanhSachLechAccName([]);
          fetch(`${API_URL}/thong-ke-loi/ims/mb/khong_dung_mtas/`)
            .then((res) => res.json())
            .then((data) => {
              const list = Array.isArray(data) ? data : [];
              setDanhSachLechAccName(list);
              setShowBang(list.length > 0); // ✅ chỉ hiển thị bảng nếu có dữ liệu
            })
            .catch((err) => {
              console.error("Fetch lỗi:", err);
              setDanhSachLechAccName([]);
              setShowBang(false); // ❌ ẩn bảng nếu lỗi
            })
            .finally(() => setLoading(false));
        };
    const displayDanhSachLechKenh = () => {
          setLoading(true);
          setDanhSachLechKenh([]);
          fetch(`${API_URL}/thong-ke-loi/ims/mb/khong_dung_kenh/`)
            .then((res) => res.json())
            .then((data) => {
              const list = Array.isArray(data) ? data : [];
              console.log("API data:", list);

              setDanhSachLechKenh(list);
              setShowBang(list.length > 0); // ✅ chỉ hiển thị bảng nếu có dữ liệu
            })
            .catch((err) => {
              console.error("Fetch lỗi:", err);
              setDanhSachLechKenh([]);
              setShowBang(false); // ❌ ẩn bảng nếu lỗi
            })
            .finally(() => setLoading(false)); // ✅ luôn tắt loading
        };
   const displayDanhSachLechNumber = () => {
        setLoading(true);
        setDanhSachLechNumber([]);
        fetch(`${API_URL}/thong-ke-loi/ims/mb/khong_dung_siptel/`)
          .then((res) => res.json())
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setDanhSachLechNumber(list);
            setShowBang(list.length > 0); // ✅ chỉ hiển thị bảng nếu có dữ liệu
          })
          .catch((err) => {
            console.error("Fetch lỗi:", err);
            setDanhSachLechNumber([]);
            setShowBang(false); // ❌ ẩn bảng nếu lỗi
          })
          .finally(() => setLoading(false)); // ✅ luôn tắt loading
      };
    const displayDanhSachLechDest = () => {
        setLoading(true);
        setDanhSachLechDest([]);
        fetch(`${API_URL}/thong-ke-loi/ims/mb/khong_dung_pbx1/`)
          .then((res) => res.json())
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setDanhSachLechDest(list);
            setShowBang(list.length > 0); // ✅ chỉ hiển thị bảng nếu có dữ liệu
          })
          .catch((err) => {
            console.error("Fetch lỗi:", err);
            setDanhSachLechDest([]);
            setShowBang(false); // ❌ ẩn bảng nếu lỗi
          })
          .finally(() => setLoading(false));
      };
  //Các action gọi bảng ĐỐI SOÁT
  const displayDoiSoatKenh = () => {
    fetch(`${API_URL}/doi-soat/ims/mb/khong_dung_kenh/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatKenh(data); // data là mảng object thiết bị
      });
  }
  const displayDoiSoatAccName = () => {
    fetch(`${API_URL}/doi-soat/ims/mb/khong_dung_acc_name/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatAccName(data); // data là mảng object thiết bị
      });
  }
  const displayDoiSoatDest = () => {
    fetch(`${API_URL}/doi-soat/ims/mb/khong_dung_dest/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatDes(data); // data là mảng object thiết bị
      });
  }
  const displayDoiSoatMoQte = () => {
    fetch(`${API_URL}/doi-soat/ims/mb/khong_dung_loaihinh_moqte/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatMoQte(data);
      });
  };
  const displayDoiSoatKhoaQte = () => {
    fetch(`${API_URL}/doi-soat/ims/mb/khong_dung_loaihinh_khoaqte/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatKhoaQte(data);
      });
  };

  

  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 30 }
  });
  return (
    <>
      <div style={{ width: '100%' }}>
        {/* Khung hiển thị chữ Miền Bắc */}
        <div style={{ width: '25%' }}>
          <style>{`
            @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.8; }
            }
        `}</style>
          <animated.div
            style={{
              ...headerAnimation,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)',
              padding: '0.7rem 0',
              marginBottom: '0.5rem',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)'
            }}>
            <Container fluid>
              <div className="d-flex align-items-center">
                {/* Icon Container */}
                {/* Background pattern */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background:
                      'radial-gradient(circle, rgba(255, 255, 255, 0.26) 20%, transparent 70%)',
                    animation: 'pulse 3s infinite'
                  }}
                />
                {/* Main Icon */}
              </div>
              <div className="flex-grow-1">
                <h1 style={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.02em'
                }}>
                  IMS MIỀN BẮC
                </h1>
              </div>
            </Container>
          </animated.div>
        </div>
        {/*Zone 1: Khung 2 ô tròn thể hiện dữ liệu miền Bắc */}
        <div style={{ marginTop: "10px", display: 'flex', gap: '20px' }}>
          {/* Cột bên trái: khối thống kê */}
          <div className="box_trai_zone1" style={{ width: '50%', height: '65vh' }}>
            <h2 className="text_display_tren">DANH SÁCH KHÁCH HÀNG CHƯA CHUẨN HOÁ BE</h2>
            <BoxThongKe onClickBox={handleBoxClick} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
          </div>
          <div className="box_phai_zone1" style={{ width: '50%', height: '65vh' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
            <Circle_box_ds_MB_Ims onClickBox={handleClickPieSlice_ds} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
          </div>
        </div>
        {/* Khung zone 2*/}

        <hr style={{ margin: '40px 0', border: '2.5', borderTop: '2px solid #ccc' }} />
        {showBang && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '10px',
                width: '90%',
                height: '85%',
                overflow: 'auto',
                position: 'relative'
              }}
            >

              {loaiBang === "mtas" && (
                <BangThongTinIms title="Danh sách Account Name chưa chuẩn hoá" data={danhSachLechAccName} onClose={handleCloseTable} />
              )}
              {loaiBang === "number" && (
                <BangThongTinIms title="Danh sách đầu số chưa chuẩn hoá" data={danhSachLechNumber} onClose={handleCloseTable} />
              )}
              {loaiBang === "kenh" && (
                <BangThongTinIms title="Danh sách KH có cuộc gọi đồng thời chưa chuẩn hoá" data={danhSachLechKenh} onClose={handleCloseTable} />
              )}
              {loaiBang === "dest" && (
                <BangThongTinIms title="Danh sách IP khách hàng chưa chuẩn hoá" data={danhSachLechDest} onClose={handleCloseTable} />
              )}
                {loaiBang === "ds_kenh" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số không khớp MaxChannels" data={soDoiSoatKenh} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_accname" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số không khớp Account Name" data={soDoiSoatAccName} onClose={handleCloseTable} />
              )}
               {loaiBang === "ds_dest" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số không khớp Destination" data={soDoiSoatDes} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_mo_qte" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số không khớp Mở quốc tế" data={soDoiSoatMoQte} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_khoa_qte" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số không khớp Khoá quốc tế" data={soDoiSoatKhoaQte} onClose={handleCloseTable} />
              )}
            </div>
          </div>
        )}
      </div>
    </>);
}
export default MienBacIms;



