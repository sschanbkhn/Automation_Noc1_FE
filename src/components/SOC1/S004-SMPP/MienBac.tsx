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
import BangThongTinChuanHoaBox from "./Bang_thong_tin_chuan_hoa_TQ_box";
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
    name :string;
    system_id : string;
    state : string;
    bind_type : string;
    allowed_ips : string;
    allowed_shortcodes : string;
    max_connection : string;
    created_at : string;
    smpp_name : string;
    Ghi_chu : string;
  };
  type DoiSoat = {
    system_id : string;
    status_csdl : string;
    state_be : string;
    short_code_csdl : string;
    allowed_shortcodes_be : string;
    bind_type_csdl : string;
    bind_type_be : string;
    service_name_csdl: string;
    document_number_csdl : string;
    smpp_name_csdl : string;
    name_be : string;
    max_connection_be : string;
    Khu_vuc : string;
    Ghi_chu : string;
  };



  //Chia loại API để vào dev hoặc production
  // let ENV = "prod"; // hoặc "prod"
  // let ENV = "dev"; // hoặc "prod"
  // let API_URL = "";setSoKenhBeChuanChuanHoaMb
  // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
  // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}
  const [soKenhBeMb, setSoKenhBeMb] = useState(0);
  const [soKenhBeChuaChuanHoaMb, setSoKenhBeChuaChuanHoaMb] = useState(0);
  const [danhSachLechName, setDanhSachLechName] = useState<ThietBi[]>([]);
  const [danhSachLechSystemId, setDanhSachLechSystemId] = useState<ThietBi[]>([]);
  const [danhSachLechState, setDanhSachLechState] = useState<ThietBi[]>([]);
  const [danhSachLechBindType, setDanhSachLechBindType] = useState<ThietBi[]>([]);
  const [danhSachLechIps, setDanhSachLechIps] = useState<ThietBi[]>([]);
  const [danhSachLechShortCode, setDanhSachLechShortCode] = useState<ThietBi[]>([]);
  const [danhSachLechConnection, setDanhSachLechConnection] = useState<ThietBi[]>([]);
  const [danhSachKhac, setDanhSachKhac] = useState<ThietBi[]>([]);

  const [danhSachDoiSoatTrangThai, setDanhSachDoiSoatTrangThai] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatShortCode, setDanhSachDoiSoatShortCode] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatBindType, setDanhSachDoiSoatBinhdType] = useState<DoiSoat[]>([]);
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
  const [loaiBang, setLoaiBang] = useState<
  "name"
    | "systemid"
    | "state"
    | "bindtype"
    | "ips"
    | "shortcode"
    | "connection"
    // | "ds_accname"
    // | "ds_sodich"
    // | "ds_thanhly"
    // | "ds_tamngung"
    // | "ds_khac"
    | "ds_trangthai"
    | "ds_bindtype"
    | "ds_shortcode"
    | "ds_khac"
    | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  //action đóng bảng chi tiết
  const handleCloseTable = () => {
    setShowBang(false); // 👉 Đóng bảng
    setSelectedIndex(null);
  };

  //action click vào box thống kê
  const handleBoxClick = async (index: number) => {
    setShowBang(false);

    if (index === 0) {
      setLoaiBang("name");
      await displayTongLechName();
    } else if (index === 1) {
      setLoaiBang("systemid");
      await displayTongLechSystemId();
    } else if (index === 2) {
      setLoaiBang("state");
      await displayTongLechState();
    } else if (index === 3) {
      setLoaiBang("bindtype");
      await displayTongLechBindType();
    }
    else if (index === 4) {
      setLoaiBang("ips");
      await displayTongLechIps();
    }
    else if (index === 5) {
      setLoaiBang("shortcode");
      await displayTongLechShortCode();
    }
    else if (index === 6) {
      setLoaiBang("connection");
      await displayTongLechConnection();
    }

    setShowBang(true);   // bật lại
  };
  // 🔹 1. Xác định map giữa loaiBang và dataset/title
  const bangMap: Record<
    string,
    { title: string; data: any[] }
  > = {

    name: { title: "Danh sách Account Name chưa chuẩn hoá", data: danhSachLechName },
    systemid: { title: "Danh sách System ID chưa chuẩn hoá ", data: danhSachLechSystemId },
    state: { title: "Danh sách State chưa chuẩn hoá", data: danhSachLechState },
    bindtype: { title: "Danh sách Bind Type chưa chuẩn hoá", data: danhSachLechBindType},
    ips: { title: "Danh sách Allowed_IPS chưa chuẩn hoá ", data: danhSachLechIps },
    shortcode: { title: "Danh sách Short Code chưa chuẩn hoá", data: danhSachLechShortCode },
    connection: { title: "Danh sách MaxConnection chưa chuẩn hoá", data: danhSachLechConnection },
  };

  // 🔹 2. Lấy thông tin theo loaiBang
  const currentBang = bangMap[loaiBang];

  //action gọi bảng đối soát
  const handleClickPieSlice_ds = (apiKey: string | string[]) => {
    setShowBang(true);       // hiển thị bảng ngay
    setLoadingDs(true);       // bật loading
    if (apiKey === "ds_trangthai") {
      setLoaiBang("ds_trangthai");
      displayDoiSoatTrangThai().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_shortcode") {
      setLoaiBang("ds_shortcode");
      displayDoiSoatShortCode().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_bindtype") {
      setLoaiBang("ds_bindtype");
      displayDoiSoatBindType().finally(() => setLoadingDs(false));
    }
    // Nhóm "Khác"
    else if (Array.isArray(apiKey)) {
      setLoaiBang("ds_khac");
      displayTongHopKhac(apiKey).finally(() => setLoadingDs(false));
    }
  };
  // 🔹 Định nghĩa handlers theo key

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

  const displayTongLechName = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_name/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechName(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechSystemId = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_systemid/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechSystemId(data);
        // data là mảng object thiết bị
      });
  }
  const displayTongLechState= () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_state/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechState(data);  // data là mảng object thiết bị
      });
  }
  const displayTongLechBindType = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_bindtype/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechBindType(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechIps = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_ips/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechIps(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechShortCode = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_shortcode/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechShortCode(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechConnection = () => {
    return fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_connection/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechConnection(data); // data là mảng object thiết bị
      });
  }
  //Các action gọi bảng ĐỐI SOÁT
  const displayDoiSoatTrangThai = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_trang_thai/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatTrangThai(data);
      });
  };

  const displayDoiSoatShortCode = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_shortcode/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatShortCode(data);
      });
  };
  const displayDoiSoatBindType = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_bindtype/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatBinhdType(data);
      });
  };
  const displayTongHopKhac = (apiKeys: string[]) => {
    // Tạo mảng Promise để fetch từng API
    const fetches = apiKeys.map((key) => {
      let endpoint = "";
      switch (key) {
        case "ds_trangthai": endpoint = "lech_trang_thai"; break;
        case "ds_bindtype": endpoint = "lech_bindtype"; break;
        case "ds_shortcode": endpoint = "lech_shortcode"; break;
        default: return Promise.resolve([]); // nếu apiKey lạ
      }
      return fetch(`${API_URL}/doi-soat/mb/${endpoint}/`).then((res) => res.json());
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
                  MIỀN BẮC (SMPPT1A)
                </h1>
              </div>
            </Container>
          </animated.div>
        </div>
        {/*Zone 1: Khung 2 ô tròn thể hiện dữ liệu miền Bắc */}
        <div style={{ marginTop: "10px", display: 'flex', position: 'relative' }}>
          {/* Cột bên trái: khối thống kê */}
          <div className="box_trai_zone1" style={{ width: '50%', height: '110vh', display: 'flex', flexDirection: 'column', position: 'relative', gap: '10px' }}>
            <h2 className="text_display_tren">DANH SÁCH KHÁCH HÀNG CHƯA CHUẨN HOÁ BACKEND</h2>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                className="soKenhBox" style={{ width: '50%', height: '15vh' }}>
                <Circle_box_MB_chuanhoa isDisplayed={isDisplayed} />
              </div>
              <div style={{ height: '65vh', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' ,padding:'10px 10px'}}>
                <BoxThongKeMB onClickBox={handleBoxClick} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
              </div>
            </div>
          </div>

          <div className="box_phai_zone1" style={{ width: '50%', height: '65vh' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT GIỮA BACKEND VÀ CSDL</h2>
            <Circle_box_ds_MB onZoneClick={handleClickPieSlice_ds} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
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

              {loaiBang === "name" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Account Name" data={danhSachLechName} onClose={handleCloseTable} />
              )}
              {loaiBang === "systemid" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá SystemID" data={danhSachLechSystemId} onClose={handleCloseTable} />
              )}
              {loaiBang === "state" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá State" data={danhSachLechState} onClose={handleCloseTable} />
              )}
              {loaiBang === "shortcode" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Short Code" data={danhSachLechShortCode} onClose={handleCloseTable} />
              )}
              {loaiBang === "bindtype" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Bind Type" data={danhSachLechBindType} onClose={handleCloseTable} />
              )}
              {loaiBang === "ips" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Allow IPS" data={danhSachLechIps} onClose={handleCloseTable} />
              )}
              {loaiBang === "connection" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Max Connection" data={danhSachLechConnection} onClose={handleCloseTable} />
              )}
             {loaiBang === "ds_trangthai" && (
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
                  <BangThongTinDoiSoatTQ title="Danh sách sai lệch đối soát Trạng Thái" data={danhSachDoiSoatTrangThai} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_bindtype" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTinDoiSoatTQ title="Danh sách lệch đối soát số đích" data={danhSachDoiSoatBindType} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_shortcode" && (
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
                  <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát thanh lý" data={danhSachDoiSoatShortCode} onClose={handleCloseTable} />
              )}
              {currentBang && (
                <div className="relative">
                  {loadingDs ? (
                    // 🌀 Giai đoạn đang tải
                    <div className="text-center text-gray-500 py-4 text-lg">
                      Đang tải dữ liệu...
                    </div>
                  ) : currentBang.data && currentBang.data.length > 0 ? (
                    // ✅ Có dữ liệu
                    <BangThongTinChuanHoaBox
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

 