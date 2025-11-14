import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label
} from 'recharts';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoatTQ from "./Bang_thong_tin_doi_soat_TQ";
import BangThongTinDoiSoatTQp2 from "./Bang_thong_tin_doi_soat_TQ_p2";
import Header from "./Header";
import BoxDoiSoat from "./Box_doi_soat";
import Circle_box_MN from "./Circle_box_MN"
import Circle_box_MN_chuanhoa from "./Circle_box_MN_chuanhoa"
import Circle_box_ds_MN from "./Circle_box_ds_MN";
import Button from "./Button";
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import { FiBarChart2 } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import API_URL from './apiConfig';
// type KhuVucProps = {
//   onChangeTab: (tab: string) => void;
// };
// { onChangeTab }: KhuVucProps
interface MienNamProps {
  isDisplayed: boolean;
}
function MienNam({ isDisplayed }: MienNamProps) {
  type ThietBi = {
    TENANT_ID: string;
    ACCOUNT_NAME: string;
    ACC_INFO: string;
    MAX_CHANNELS: string;
    ADDRESS_NUMBER: string;
    ADDRESS_DISABLE: string;
    ADDRESS_INCOMING: string;
    ROUTING_TABLE_NAME: string;
    GROUP_ID: string;
    SIPTRUNK_NAME: string;
    SIPTRUNK_INFO: string;
    SIP_CONTACT: string;
    DEST_REPLACE: string;
    Khu_vuc: string;
    Ghi_chu: string;
  };
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
    Khu_vuc: string;
    Ghi_chu: string
  };



  //Chia loại API để vào dev hoặc production
  // let ENV = "prod"; // hoặc "prod"
  // let ENV = "dev"; // hoặc "prod"
  // let API_URL = "";
  // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
  // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}
  const [soKenhBeMn, setSoKenhBeMn] = useState(0);
  const [soKenhBeChuaChuanHoaMn, setSoKenhBeChuanChuanHoaMn] = useState(0);
  const [danhSachLechLoaiHinh, setDanhSachLechLoaiHinh] = useState<ThietBi[]>([]);
  const [danhSachLechAccName, setDanhSachLechAccName] = useState<ThietBi[]>([]);
  const [danhSachLechAccInfo, setDanhSachLechAccInfo] = useState<ThietBi[]>([]);
  const [danhSachLechChannel, setDanhSachLechChannel] = useState<ThietBi[]>([]);
  const [danhSachLechNumber, setDanhSachLechNumber] = useState<ThietBi[]>([]);
  const [danhSachLechDes, setDanhSachLechDes] = useState<ThietBi[]>([]);
  const [danhSachLechSipInfo, setDanhSachLechSipInfo] = useState<ThietBi[]>([]);
  const [danhSachLechRoute, setDanhSachLechRoute] = useState<ThietBi[]>([]);
  const [danhSachTrung, setDanhSachTrung] = useState<ThietBi[]>([]);
  const [danhSachKhac, setDanhSachKhac] = useState<ThietBi[]>([]);

  const [danhSachDoiSoatTocDo, setDanhSachDoiSoatTocDo] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatAccName, setDanhSachDoiSoatAccName] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatDes, setDanhSachDoiSoatDes] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatThanhLy, setDanhSachDoiSoatThanhLy] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatTamNgung, setDanhSachDoiSoatTamNgung] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatInfo, setDanhSachDoiSoatInfo] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatMoQt, setDanhSachDoiSoatMoQt] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatBrandname, setDanhSachDoiSoatBrandname] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatAddIncoming, setDanhSachDoiSoatAddIncoming] = useState<DoiSoat[]>([]);
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
    | "kenh"
    | "des"
    | "sipinfo"
    | "route"
    | "trung"
    | "khac"
    | "ds_tocdo"
    | "ds_accname"
    | "ds_dest"
    | "ds_thanhly"
    | "ds_tamngung"
    | "ds_info"
    | "ds_qte"
    | "ds_brand"
    | "ds_addincome" 
    | "ds_khac" |
    null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  //     const handleBoxClick = (dataMoi, tieuDeMoi, loaiBangMoi) => {
  //   setDataBang(dataMoi);
  //   setTieuDe(tieuDeMoi);
  //   setLoaiBang(loaiBangMoi);  // ✅ mới thêm
  // };
  // const handleBoxClick = (
  //   dataMoi: any[], // hoặc bạn tạo interface cụ thể
  //   tieuDeMoi: string,
  //   loaiBangMoi: string
  // ) => {
  //   setDataBang(dataMoi);
  //   setTieuDe(tieuDeMoi);
  //   setLoaiBang(loaiBangMoi);
  // };
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
  kenh: () => { displayTongLechChannel().finally(() => setLoadingDs(false)); setLoaiBang("kenh"); },
  des: () => { displayTongLechDes().finally(() => setLoadingDs(false)); setLoaiBang("des"); },
  sipinfo: () => { displayTongLechSipInfo().finally(() => setLoadingDs(false)); setLoaiBang("sipinfo"); },
  route: () => { displayTongLechRoute().finally(() => setLoadingDs(false)); setLoaiBang("route"); },
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
      case "accinfo": endpoint = "khong_dung_accountinfo"; break;
      case "kenh": endpoint = "khong_dung_kenh"; break;
      case "des": endpoint = "khong_dung_sip_contact"; break;
      case "sipinfo": endpoint = "khong_dung_sip_info"; break;
      case "route": endpoint = "khong_dung_routing"; break;
      case "trung": endpoint = "khong_dung_trung_number"; break;
      default: return Promise.resolve([]);
    }
    return fetch(`${API_URL}/thong-ke-loi/mn/${endpoint}/`).then((res) => res.json());
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
  //INDEX ĐỂ SHOW TABLE CHO PHẦN ĐỐI SOÁT
  // const handleClickPieSlice_ds = (index: number) => {
  //   // reset loaiBang khi chọn loaiBangTron
  //   console.log("Click index:", index); // 👈 kiểm tra log này
  //   setSelectedIndex(index);
  //   if (index === 0) {
  //     setLoaiBang("ds_tocdo");
  //     displayDoiSoatTocDo();
  //     setShowBang(true);
  //   }
  //   else if (index === 1) {
  //     setLoaiBang("ds_accname");
  //     displayDoiSoatAccName();
  //     setShowBang(true);
  //   }
  //   else if (index === 2) {
  //     setLoaiBang("ds_dest");
  //     displayDoiSoatDest();
  //     setShowBang(true);
  //   }
  //   else if (index === 3) {
  //     setLoaiBang("ds_thanhly");
  //     displayDoiSoatThanhLy();
  //     setShowBang(true);
  //   }
  //   else if (index === 4) {
  //     setLoaiBang("ds_tamngung");
  //     displayDoiSoatTamNgung();
  //     setShowBang(true);
  //   }
  //   else if (index === 5) {
  //     setLoaiBang("ds_info");
  //     displayDoiSoatInfo();
  //     setShowBang(true);
  //   }
  //   else if (index === 6) {
  //     setLoaiBang("ds_qte");
  //     displayDoiSoatMoQte();
  //     setShowBang(true);
  //   }
  //   else if (index === 7) {
  //     setLoaiBang("ds_brand");
  //     displayDoiSoatBrandName();
  //     setShowBang(true);
  //   }
  //   else if (index === 8) {
  //     setLoaiBang("ds_addincome");
  //     displayDoiSoatAddIncome();
  //     setShowBang(true);
  //   }
  //   else {
  //     setLoaiBang(null);
  //   }
  // }
const handleClickPieSlice_ds = (apiKey: string | string[]) => {
  setShowBang(true);       // hiển thị bảng ngay
  setLoadingDs(true);       // bật loading
  if (apiKey === "ds_tocdo") { setLoaiBang("ds_tocdo"); displayDoiSoatTocDo().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_accname") { setLoaiBang("ds_accname"); displayDoiSoatAccName().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_dest") { setLoaiBang("ds_dest"); displayDoiSoatDest().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_thanhly") { setLoaiBang("ds_thanhly"); displayDoiSoatThanhLy().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_tamngung") { setLoaiBang("ds_tamngung"); displayDoiSoatTamNgung().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_info") { setLoaiBang("ds_info"); displayDoiSoatInfo().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_qte") { setLoaiBang("ds_qte"); displayDoiSoatMoQte().finally(() => setLoadingDs(false))}
  else if (apiKey === "ds_brand") { setLoaiBang("ds_brand"); displayDoiSoatBrandName().finally(() => setLoadingDs(false)); }
  else if (apiKey === "ds_addincome") { setLoaiBang("ds_addincome"); displayDoiSoatAddIncome().finally(() => setLoadingDs(false)); }
  // Nhóm "Khác"
  else if (Array.isArray(apiKey)) { setLoaiBang("ds_khac"); displayTongHopKhac(apiKey).finally(() => setLoadingDs(false)); }
  };
// 🔹 Định nghĩa handlers theo key
const handlers = {
  loaihinh:   () => { displayTongLechLoaiHinh(); setLoaiBang("loaihinh"); setShowBang(true) },
  number:     () => { displayTongLechNumber(); setLoaiBang("number"); setShowBang(true) },
  accname:    () => { displayTongLechAccName(); setLoaiBang("accname"); setShowBang(true); },
  accinfo:    () => { displayTongLechAccInfo(); setLoaiBang("accinfo"); setShowBang(true); },
  maxchannels:() => { displayTongLechChannel(); setLoaiBang("kenh"); setShowBang(true);},
  destination:() => { displayTongLechDes(); setLoaiBang("des"); setShowBang(true); },
  sipinfo:    () => { displayTongLechSipInfo(); setLoaiBang("sipinfo"); setShowBang(true); },
  routetable: () => { displayTongLechRoute(); setLoaiBang("route"); setShowBang(true); },
  trungnumber:() => { displayTongLechTrung(); setLoaiBang("trung"); setShowBang(true); },
};

  //Các action gọi bảng THỐNG KÊ BE
  //Số kênh BE của MN
  fetch(`${API_URL}/thong-ke-loi/count/mn/number_be/`)
    .then(res => res.ok ? res.json() : { count: 0 })
    .then(data => setSoKenhBeMn(data.count ?? 0))
    .catch(err => setSoKenhBeMn(0))
  //Số kênh BE của MB chưa chuẩn hoá
  fetch(`${API_URL}/thong-ke-loi/count/mn/total/`)
    .then(res => res.ok ? res.json() : { count: 0 })
    .then(data => setSoKenhBeChuanChuanHoaMn(data.count ?? 0))
    .catch(err => setSoKenhBeChuanChuanHoaMn(0))
  const displayTongLechLoaiHinh = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_loaihinh/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechLoaiHinh(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechNumber = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_number/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechNumber(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAccName = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_accountname/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAccName(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAccInfo = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_accountinfo/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAccInfo(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechChannel = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_kenh/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechChannel(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechDes = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_sip_contact/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechDes(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechSipInfo = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_sip_info/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechSipInfo(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechRoute = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_routing/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechRoute(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechTrung = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_trung_number/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachTrung(data); // data là mảng object thiết bị
      });
  }
  //Các action gọi bảng ĐỐI SOÁT
  const displayDoiSoatTocDo = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_tocdo/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatTocDo(data); // data là mảng object thiết bị
      });
  };
  const displayDoiSoatAccName = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_acc_name/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatAccName(data);
      });
  };

  const displayDoiSoatDest = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_destination/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatDes(data);
      });
  };
  const displayDoiSoatThanhLy = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_thanh_ly/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatThanhLy(data);
      });
  };
  const displayDoiSoatTamNgung = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_tam_ngung/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatTamNgung(data);
      });
  };
  const displayDoiSoatInfo = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_acc_info/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatInfo(data);
      });
  };
  const displayDoiSoatMoQte = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_mo_qte/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatMoQt(data);
      });
  };
  const displayDoiSoatBrandName = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_brandname/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatBrandname(data);
      });
  };
  const displayDoiSoatAddIncome = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_address_incoming/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatAddIncoming(data);
      });
  };
  const displayTongHopKhac = (apiKeys: string[]) => {
      // Tạo mảng Promise để fetch từng API
      const fetches = apiKeys.map((key) => {
        let endpoint = "";
        switch (key) {
          case "ds_tocdo": endpoint = "lech_tocdo"; break;
          case "ds_accname": endpoint = "lech_acc_name"; break;
          case "ds_dest": endpoint = "lech_destination"; break;
          case "ds_thanhly": endpoint = "lech_thanh_ly"; break;
          case "ds_tamngung": endpoint = "lech_tam_ngung"; break;
          case "ds_info": endpoint = "lech_acc_info"; break;
          case "ds_qte": endpoint = "lech_mo_qte"; break;
          case "ds_brand": endpoint = "lech_brandname"; break;
          case "ds_addincome": endpoint = "lech_address_incoming"; break;
          default: return Promise.resolve([]); // nếu apiKey lạ
        }
        return fetch(`${API_URL}/doi-soat/mn/${endpoint}/`).then((res) => res.json());
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
        {/* Khung hiển thị chữ Miền Nam */}
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
                  AARENET MIỀN NAM
                </h1>
              </div>
            </Container>
          </animated.div>
        </div>
        {/*Zone 1: Khung tròn bên phải thể hiện dữ liệu thống kê chưa chuẩn hoá của MB */}
        <div style={{ marginTop: "10px", display: 'flex', gap: '20px' }}>
          {/* Cột bên trái: khối thống kê */}
          <div className="box_trai_zone1" style={{ width: '50%', height: '90vh', position: 'relative' }}>
            <h2 className="text_display_tren">DANH SÁCH KHÁCH HÀNG CHƯA CHUẨN HOÁ BE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="soKenhBox" style={{ width: '50%', height: '25vh' }}>
                <Circle_box_MN_chuanhoa isDisplayed={isDisplayed} />
            </div>
            <div style={{ height: '65vh', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Circle_box_MN onZoneClick={handleClickPieSlice} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
            </div>
            </div>
          </div>

          {/*Zone 2: Khung tròn bên trái thể hiện dữ liệu đối soát của MB  */}
          <div className="box_phai_zone1" style={{ width: '50%', height: '65vh' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
            <Circle_box_ds_MN onZoneClick={handleClickPieSlice_ds} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
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
              {loaiBang === "kenh" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá số cuộc gọi đồng thời" data={danhSachLechChannel} onClose={handleCloseTable} />
              )}
              {loaiBang === "des" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá IP khách hàng" data={danhSachLechDes} onClose={handleCloseTable} />
              )}
              {loaiBang === "sipinfo" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá Sip Infomation" data={danhSachLechSipInfo} onClose={handleCloseTable} />
              )}
              {loaiBang === "route" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTin title="Danh sách chưa chuẩn hoá Route Table Name" data={danhSachLechRoute} onClose={handleCloseTable} />
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
              {loaiBang === "ds_tocdo" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát số cuộc gọi đồng thời" data={danhSachDoiSoatTocDo} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_accname" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát Account Name" data={danhSachDoiSoatAccName} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_dest" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát IP khách hàng" data={danhSachDoiSoatDes} onClose={handleCloseTable} />
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
                  : <BangThongTinDoiSoatTQp2 title="Danh sách lệch đối soát thanh lý" data={danhSachDoiSoatThanhLy} onClose={handleCloseTable} />
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
                  : <BangThongTinDoiSoatTQp2 title="Danh sách lệch đối soát tạm ngưng" data={danhSachDoiSoatTamNgung} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_info" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát Accout Information" data={danhSachDoiSoatInfo} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_qte" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQp2 title="Danh sách lệch đối soát Mở Quốc tế" data={danhSachDoiSoatMoQt} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_brand" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQp2 title="Danh sách lệch đối soát Brandname" data={danhSachDoiSoatBrandname} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_addincome" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  : <BangThongTinDoiSoatTQp2 title="Danh sách lệch đối soát chặn gọi ra" data={danhSachDoiSoatAddIncoming} onClose={handleCloseTable} />
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
                  : <BangThongTinDoiSoatTQp2 title="Danh sách lệch đối soát" data={soDoiSoatKhac} onClose={handleCloseTable} />
              )}
            </div>
          </div>
        )}
      </div>
    </>);
}
export default MienNam;
