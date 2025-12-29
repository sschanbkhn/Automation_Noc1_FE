import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label
} from 'recharts';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoatTQ from "./Bang_thong_tin_doi_soat_TQ";
import Circle_box_MB from "./Circle_box_MB";
import Circle_box_MB_chuanhoa from "./Circle_box_MB_chuanhoa";
import Circle_box_ds_MB from "./Circle_box_ds_MB";
import BoxThongKeMB from "./Box_thong_ke_MB"
import BangThongTinDoiSoatTQBox from "./Bang_thong_tin_doi_soat_TQ_box";
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import API_URL from './apiConfig';
// type KhuVucProps = {
//   onChangeTab: (tab: string) => void;
// };
// { onChangeTab }: KhuVucProps


interface MienBacProps {
  isDisplayed: boolean;
}

function MienBac({ isDisplayed }: MienBacProps) {
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
    Loai_CFU: string;
    Khu_vuc : string;
    Ghi_chu : string;
  };
  type DoiSoat = {
    number: string;
    account_name_csdl: string;
    account_name_be: string;
    so_dich_csdl: string;
    so_dich_be: string;
    so_cgdt_csdl: string;
    so_cgdt_be: string;
    status_csdl: string;
    tam_ngung_be: string;
    chan_goi_ra_be: string;
    Khu_vuc: string;
    Ghi_chu: string;
  };



  //Chia loại API để vào dev hoặc production
  // let ENV = "prod"; // hoặc "prod"
  // let ENV = "dev"; // hoặc "prod"
  // let API_URL = "";setSoKenhBeChuanChuanHoaMb
  // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
  // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}
  const [soKenhBeMb, setSoKenhBeMb] = useState(0);
  const [soKenhBeChuaChuanHoaMb, setSoKenhBeChuaChuanHoaMb] = useState(0);
  const [danhSachLechLoaiHinh, setDanhSachLechLoaiHinh] = useState<ThietBi[]>([]);
  const [danhSachLechAccName, setDanhSachLechAccName] = useState<ThietBi[]>([]);
  const [danhSachLechAccInfo, setDanhSachLechAccInfo] = useState<ThietBi[]>([]);
  const [danhSachLechSoDich, setDanhSachLechSoDich] = useState<ThietBi[]>([]);
  const [danhSachLechNumber, setDanhSachLechNumber] = useState<ThietBi[]>([]);
  const [danhSachLechDichVu, setDanhSachLechDichVu] = useState<ThietBi[]>([]);
  const [danhSachTrung, setDanhSachTrung] = useState<ThietBi[]>([]);
  const [danhSachKhac, setDanhSachKhac] = useState<ThietBi[]>([]);

  const [danhSachDoiSoatAccName, setDanhSachDoiSoatAccName] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatSoDich, setDanhSachDoiSoatSoDich] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatThanhLy, setDanhSachDoiSoatThanhLy] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatTamNgung, setDanhSachDoiSoatTamNgung] = useState<DoiSoat[]>([]);
  const [soDoiSoatKhac, setSoDoiSoatKhac] = useState<DoiSoat[]>([]);
  const [loadingDs, setLoadingDs] = useState(false);
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1",
    "#a4de6c", "#d0ed57", "#d88884", "#84c2d8", "#c084d8", "#f6b26b"
  ];
  // const [loaiBang, setLoaiBang] = useState<string | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [tieuDe, setTieuDe] = useState("");
  const [showBang, setShowBang] = useState(false); // hiển thị bảng hay không
  const [loaiBang, setLoaiBang] = useState<"loaihinh"
    | "number"
    | "accname"
    | "accinfo"
    | "sodich"
    | "dichvu"
    | "trung"
    | "khac"
    | "ds_accname"
    | "ds_sodich"
    | "ds_thanhly"
    | "ds_tamngung"
    | "ds_khac"
    | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  //action đóng bảng chi tiết
  const handleCloseTable = () => {
    setShowBang(false); // 👉 Đóng bảng
    setSelectedIndex(null);
  };
  // Mapping từ key sang action fetch & loại bảng
  const pieHandlers: Record<string, () => void> = {
    loaihinh: () => { displayTongLechLoaiHinh().finally(() => setLoadingDs(false)); setLoaiBang("loaihinh"); },
    number: () => { displayTongLechNumber().finally(() => setLoadingDs(false)); setLoaiBang("number"); },
    accname: () => { displayTongLechAccName().finally(() => setLoadingDs(false)); setLoaiBang("accname"); },
    accinfo: () => { displayTongLechAccInfo().finally(() => setLoadingDs(false)); setLoaiBang("accinfo"); },
    sodich: () => { displayTongLechSoDich().finally(() => setLoadingDs(false)); setLoaiBang("sodich"); },
    dichvu: () => { displayTongLechDichVu().finally(() => setLoadingDs(false)); setLoaiBang("dichvu"); },
    trung: () => { displayTongLechTrung().finally(() => setLoadingDs(false)); setLoaiBang("trung"); },
  };

  // Hàm xử lý click Pie, nhận key thay vì index
  const handleClickPieSlice = (key: string | string[]) => {
    setShowBang(true);
    setLoadingDs(true);       // bật loading
    if (Array.isArray(key)) {
      // Nhóm "Khác" (ví dụ dưới 5%)
      setLoaiBang("khac");
      displayLechKhac(key).finally(() => setLoadingDs(false));
    } else if (pieHandlers[key]) {
      pieHandlers[key](); // gọi handler tương ứng
    } else {
      setLoaiBang(null);
    }

  };

  // Hàm gộp dữ liệu nhỏ thành "Khác"
  const displayLechKhac = (keys: string[]) => {
    const fetches = keys.map((key) => {
      let endpoint = "";
      switch (key) {
        case "loaihinh": endpoint = "khong_dung_loaihinh"; break;
        case "number": endpoint = "khong_dung_number"; break;
        case "accname": endpoint = "khong_dung_accountname"; break;
        case "accinfo": endpoint = "khong_dung_accinfo"; break;
        case "sodich": endpoint = "khong_dung_sodich"; break;
        case "dichvu": endpoint = "khong_dung_dichvu"; break;
        case "trung": endpoint = "khong_dung_trunglap"; break;
        default: return Promise.resolve([]);
      }
      return fetch(`${API_URL}/thong-ke-loi/mb/${endpoint}/`).then((res) => res.json());
    });
    return Promise.all(fetches)
      .then((results) => {
        // gộp tất cả mảng thành 1 mảng
        const mergedData = results.reduce((acc, curr) => acc.concat(curr), []);
        setDanhSachKhac(mergedData);
      })
      .catch((err) => {
        console.error("Lỗi fetch nhóm Khác:", err);
        setDanhSachKhac([]);
      });
  };

  //action click vào box thống kê
  const handleBoxClick = async (index: number) => {
    setShowBang(false);

    if (index === 0) {
      setLoaiBang("ds_accname");
      await displayDoiSoatAccName();
    } else if (index === 1) {
      setLoaiBang("ds_sodich");
      await displayDoiSoatSoDich();
    } else if (index === 2) {
      setLoaiBang("ds_thanhly");
      await displayDoiSoatThanhLy();
    } else if (index === 3) {
      setLoaiBang("ds_tamngung");
      await displayDoiSoatTamNgung();
    }

    setShowBang(true);   // bật lại
  };
  // 🔹 1. Xác định map giữa loaiBang và dataset/title
  const bangMap: Record<
    string,
    { title: string; data: any[] }
  > = {
    ds_accname: { title: "Danh sách Account Name chưa chuẩn hoá", data: danhSachDoiSoatAccName },
    ds_sodich: { title: "Danh sách đầu số đích chưa chuẩn hoá ", data: danhSachDoiSoatSoDich },
    ds_thanhly: { title: "Danh sách đầu số thanh lý chưa chuẩn hoá", data: danhSachDoiSoatThanhLy },
    ds_tamngung: { title: "Danh sách đầu số tạm ngưng chưa chuẩn hoá", data: danhSachDoiSoatTamNgung },
  };

  // 🔹 2. Lấy thông tin theo loaiBang
  const currentBang = bangMap[loaiBang];

  //action gọi bảng đối soát
  // const handleClickPieSlice_ds = (apiKey: string | string[]) => {
  //   setShowBang(true);       // hiển thị bảng ngay
  //   setLoadingDs(true);       // bật loading
  //   if (apiKey === "ds_accname") {
  //     setLoaiBang("ds_accname");
  //     displayDoiSoatAccName().finally(() => setLoadingDs(false));
  //   }
  //   else if (apiKey === "ds_sodich") {
  //     setLoaiBang("ds_sodich");
  //     displayDoiSoatSoDich().finally(() => setLoadingDs(false));
  //   }
  //   else if (apiKey === "ds_thanhly") {
  //     setLoaiBang("ds_thanhly");
  //     displayDoiSoatThanhLy().finally(() => setLoadingDs(false));
  //   }
  //   else if (apiKey === "ds_tamngung") {
  //     setLoaiBang("ds_tamngung");
  //     displayDoiSoatTamNgung().finally(() => setLoadingDs(false));
  //   }
  //   // Nhóm "Khác"
  //   else if (Array.isArray(apiKey)) {
  //     setLoaiBang("ds_khac");
  //     displayTongHopKhac(apiKey).finally(() => setLoadingDs(false));
  //   }
  // };
  // 🔹 Định nghĩa handlers theo key
  const handlers = {
    loaihinh: () => { displayTongLechLoaiHinh(); setLoaiBang("loaihinh"); setShowBang(true) },
    number: () => { displayTongLechNumber(); setLoaiBang("number"); setShowBang(true) },
    accname: () => { displayTongLechAccName(); setLoaiBang("accname"); setShowBang(true); },
    accinfo: () => { displayTongLechAccInfo(); setLoaiBang("accinfo"); setShowBang(true); },
    sodich: () => { displayTongLechSoDich(); setLoaiBang("sodich"); setShowBang(true); },
    dichvu: () => { displayTongLechDichVu(); setLoaiBang("dichvu"); setShowBang(true); },
    trungnumber: () => { displayTongLechTrung(); setLoaiBang("trung"); setShowBang(true); },
  };
  //Các action gọi bảng THỐNG KÊ BE
  //Số kênh BE của MB
  useEffect(() => {
    fetch(`${API_URL}/thong-ke-loi/count/mb/number_be/`)
      .then(res => res.ok ? res.json() : { count: 0 })
      .then(data => setSoKenhBeMb(data.count ?? 0))
      .catch(err => setSoKenhBeMb(0));

    fetch(`${API_URL}/thong-ke-loi/mb/chua-chuan-hoa/`)
      .then(res => res.ok ? res.json() : { count: 0 })
      .then(data => setSoKenhBeChuaChuanHoaMb(data.count ?? 0))
      .catch(err => setSoKenhBeChuaChuanHoaMb(0));
  }, []);

  const displayTongLechLoaiHinh = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_loaihinh/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechLoaiHinh(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechNumber = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_number/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechNumber(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAccName = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_accountname/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAccName(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAccInfo = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_accountinfo/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAccInfo(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechSoDich = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_sodich/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechSoDich(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechDichVu = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_dichvu/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechDichVu(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechTrung = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_trunglap/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachTrung(data); // data là mảng object thiết bị
      });
  }
  //Các action gọi bảng ĐỐI SOÁT
  const displayDoiSoatAccName = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_acc_name/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatAccName(data);
      });
  };

  const displayDoiSoatSoDich = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_sodich/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatSoDich(data);
      });
  };
  const displayDoiSoatThanhLy = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_thanh_ly/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatThanhLy(data);
      });
  };
  const displayDoiSoatTamNgung = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_tam_ngung/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatTamNgung(data);
      });
  };
  const displayTongHopKhac = (apiKeys: string[]) => {
    // Tạo mảng Promise để fetch từng API
    const fetches = apiKeys.map((key) => {
      let endpoint = "";
      switch (key) {
        case "ds_accname": endpoint = "lech_acc_name"; break;
        case "ds_sodich": endpoint = "lech_sodich"; break;
        case "ds_thanhly": endpoint = "lech_thanh_ly"; break;
        case "ds_tamngung": endpoint = "lech_tam_ngung"; break;
        default: return Promise.resolve([]); // nếu apiKey lạ
      }
      return fetch(`${API_URL}/doi-soat/${endpoint}/`).then((res) => res.json());
    });
    // Chạy tất cả fetches song song
    return Promise.all(fetches)
      .then((results) => {
        // gộp tất cả mảng thành 1 mảng
        const mergedData = results.reduce((acc, curr) => acc.concat(curr), []);
        setSoDoiSoatKhac(mergedData);
      })
      .catch((err) => {
        console.error("Lỗi fetch nhóm Khác:", err);
        setSoDoiSoatKhac([]);
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
                  1800/1900 MIỀN BẮC
                </h1>
              </div>
            </Container>
          </animated.div>
        </div>
        {/*Zone 1: Khung 2 ô tròn thể hiện dữ liệu miền Bắc */}
        <div style={{ marginTop: "10px", display: 'flex', gap: '20px', position: 'relative' }}>
          {/* Cột bên trái: khối thống kê */}
          <div className="box_trai_zone1" style={{ width: '50%', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <h2 className="text_display_tren">DANH SÁCH KHÁCH HÀNG CHƯA CHUẨN HOÁ BE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                className="soKenhBox" style={{ width: '50%', height: '25vh' }}>
                <Circle_box_MB_chuanhoa isDisplayed={isDisplayed} />
              </div>
              <div style={{ height: '60vh', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Circle_box_MB onZoneClick={handleClickPieSlice} isDisplayed={isDisplayed} />
              </div>
            </div>
          </div>

          <div className="box_phai_zone1" style={{ width: '50%', height: '65vh' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
            <BoxThongKeMB onClickBox={handleBoxClick} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
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

              {loaiBang === "loaihinh" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách sai loại hình" data={danhSachLechLoaiHinh} onClose={handleCloseTable} />
              )}
              {loaiBang === "number" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá Number" data={danhSachLechNumber} onClose={handleCloseTable} />
              )}
              {loaiBang === "accname" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá Account Name" data={danhSachLechAccName} onClose={handleCloseTable} />
              )}
              {loaiBang === "accinfo" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá Account Infomation" data={danhSachLechAccInfo} onClose={handleCloseTable} />
              )}
              {loaiBang === "sodich" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá số đích" data={danhSachLechSoDich} onClose={handleCloseTable} />
              )}
              {loaiBang === "dichvu" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá loại CFU" data={danhSachLechDichVu} onClose={handleCloseTable} />
              )}
              {loaiBang === "trung" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách trùng lặp Number" data={danhSachTrung} onClose={handleCloseTable} />
              )}
              {loaiBang === "khac" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá" data={danhSachKhac} onClose={handleCloseTable} />
              )}
              {/* {loaiBang === "ds_accname" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :
                  <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát Account Name" data={danhSachDoiSoatAccName} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_sodich" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTinDoiSoatTQ title="Danh sách lệch đối soát số đích" data={danhSachDoiSoatSoDich} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_thanhly" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :
                  <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát thanh lý" data={danhSachDoiSoatThanhLy} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_tamngung" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :
                  <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát tạm ngưng" data={danhSachDoiSoatTamNgung} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_khac" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :
                  <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát" data={soDoiSoatKhac} onClose={handleCloseTable} />
              )} */}
              {currentBang && (
                <div className="relative">
                  {loadingDs ? (
                    // 🌀 Giai đoạn đang tải
                    <div className="text-center text-gray-500 py-4 text-lg">
                      Đang tải dữ liệu...
                    </div>
                  ) : currentBang.data && currentBang.data.length > 0 ? (
                    // ✅ Có dữ liệu
                    <BangThongTinDoiSoatTQBox
                      key={loaiBang}
                      title={currentBang.title}
                      data={currentBang.data}
                      loading={loadingDs}
                      onClose={handleCloseTable}
                    />
                  ) : (
                    // ⚠️ Không có dữ liệu
                    <div className="text-center text-gray-500 py-6 text-xl font-semibold relative">
                      <div>Không có dữ liệu</div>
                      <button
                        onClick={handleCloseTable}
                        className="mt-4 px-4 py-2 rounded-lg text-white"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "10px",
                          padding: "5px 12px",
                          backgroundColor: "#d33",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>);
}
export default MienBac;

