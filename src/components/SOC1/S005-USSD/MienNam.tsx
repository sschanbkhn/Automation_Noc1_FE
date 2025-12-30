import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label
} from 'recharts';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoatTQ from "./Bang_thong_tin_doi_soat_TQ";
import BoxThongKeMN from "./Box_thong_ke_MN"
import Circle_box_MN from "./Circle_box_MN"
import Circle_box_MN_chuanhoa from "./Circle_box_MN_chuanhoa"
import Circle_box_ds_MN from "./Circle_box_ds_MN";
import BangThongTinChuanHoaBox from "./Bang_thong_tin_chuan_hoa_TQ_box";
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


interface MienBacProps {
  isDisplayed: boolean;
}

function MienBac({ isDisplayed }: MienBacProps) {
   type ThietBi = {
    SP_ID :string;
    NAME :string;
    SHORTCODE :string;
    TPS :string;
    IP :string;
    PROTOCOL :string;
    ADDRESS :string;
    URL :string;
    STATUS_1 :string;
    USSD :string;
    Ghi_chu :string;
  };
  type DoiSoat = {
    SP_ID : string;
    service_name_csdl : string;
    name_be : string;
    short_code_csdl : string;
    short_code_be : string;
    status_csdl : string;
    status_be : string;
    gateway_name_csdl : string;
    ip_addr_csdl : string;
    url_csdl : string;
    ip_be : string;
    protocol_be : string;
    url_be : string;
    ussd_name : string;
    Ghi_chu : string;
  };



  //Chia loại API để vào dev hoặc production
  // let ENV = "prod"; // hoặc "prod"
  // let ENV = "dev"; // hoặc "prod"
  // let API_URL = "";setSoKenhBeChuanChuanHoaMb
  // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
  // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}
  const [soKenhBeMn, setSoKenhBeMn] = useState(0);
  const [soKenhBeChuaChuanHoaMn, setSoKenhBeChuaChuanHoaMn] = useState(0);
  const [danhSachLechSPID, setDanhSachLechSPID] = useState<ThietBi[]>([]);
  const [danhSachLechName, setDanhSachLechName] = useState<ThietBi[]>([]);
  const [danhSachLechTps, setDanhSachLechTps] = useState<ThietBi[]>([]);
  const [danhSachLechShortCode, setDanhSachLechShortCode] = useState<ThietBi[]>([]);
  const [danhSachLechIps, setDanhSachLechIps] = useState<ThietBi[]>([]);
  const [danhSachLechAddress, setDanhSachLechAddress] = useState<ThietBi[]>([]);
  const [danhSachLechURL, setDanhSachLechUrl] = useState<ThietBi[]>([]);
  const [danhSachKhac, setDanhSachKhac] = useState<ThietBi[]>([]);

  const [danhSachDoiSoatTrangThai, setDanhSachDoiSoatTrangThai] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatShortCode, setDanhSachDoiSoatShortCode] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatIP, setDanhSachDoiSoatIP] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatUrl, setDanhSachDoiSoatUrl] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatGateway, setDanhSachDoiSoatGateway] = useState<DoiSoat[]>([]);
  const [danhSachDoiSoatKhac, setDanhSachDoiSoatKhac] = useState<DoiSoat[]>([]);
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
  "spid"
    | "name"
    | "tps"
    | "shortcode"
    | "ips"
    | "add"
    | "url"
    |"khac"
    | "ds_trangthai"
    | "ds_url"
    | "ds_gateway"
    | "ds_ip"
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
  // Mapping từ key sang action fetch & loại bảng
  const pieHandlers: Record<string, () => void> = {
    spid: () => { displayTongLechSpid().finally(() => setLoadingDs(false)); setLoaiBang("spid"); },
    name: () => { displayTongLechName().finally(() => setLoadingDs(false)); setLoaiBang("name"); },
    tps: () => { displayTongLechTps().finally(() => setLoadingDs(false)); setLoaiBang("tps"); },
    shortcode: () => { displayTongLechShortcode().finally(() => setLoadingDs(false)); setLoaiBang("shortcode"); },
    ips: () => { displayTongLechIp().finally(() => setLoadingDs(false)); setLoaiBang("ips"); },
    add: () => { displayTongLechAddress().finally(() => setLoadingDs(false)); setLoaiBang("add"); },
    url: () => { displayTongLechUrl().finally(() => setLoadingDs(false)); setLoaiBang("url"); },
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
        case "spid": endpoint = "khong_dung_spid"; break;
        case "name": endpoint = "khong_dung_name"; break;
        case "tps": endpoint = "khong_dung_tps"; break;
        case "shortcode": endpoint = "khong_dung_shortcode"; break;
        case "ips": endpoint = "khong_dung_ip"; break;
        case "shortcode": endpoint = "khong_dung_shortcode"; break;
        case "url": endpoint = "khong_dung_url"; break;
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
    else if (apiKey === "ds_ip") {
      setLoaiBang("ds_ip");
      displayDoiSoatIP().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_url") {
      setLoaiBang("ds_url");
      displayDoiSoatUrl().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_gateway") {
      setLoaiBang("ds_gateway");
      displayDoiSoatGateway().finally(() => setLoadingDs(false));
    }
    // Nhóm "Khác"
    else if (Array.isArray(apiKey)) {
      setLoaiBang("ds_khac");
      displayTongHopKhac(apiKey).finally(() => setLoadingDs(false));
    }
  };
  // 🔹 Định nghĩa handlers theo key

  //Các action gọi bảng THỐNG KÊ BE
  //Số kênh BE của MN
  useEffect(() => {
    fetch(`${API_URL}/thong-ke-loi/count/mn/number_be/`)
      .then(res => res.ok ? res.json() : { count: 0 })
      .then(data => setSoKenhBeMn(data.count ?? 0))
      .catch(err => setSoKenhBeMn(0));

    fetch(`${API_URL}/thong-ke-loi/mn/chua-chuan-hoa/`)
      .then(res => res.ok ? res.json() : { count: 0 })
      .then(data => setSoKenhBeChuaChuanHoaMn(data.count ?? 0))
      .catch(err => setSoKenhBeChuaChuanHoaMn(0));
  }, []);

  const displayTongLechSpid = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_spid/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechSPID(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechName = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_name/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechName(data);
        // data là mảng object thiết bị
      });
  }
  const displayTongLechTps= () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_tps/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechTps(data);  // data là mảng object thiết bị
      });
  }
  const displayTongLechShortcode = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_shortcode/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechShortCode(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechIp = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_ip/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechIps(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAddress = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_address/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAddress(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechUrl = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/khong_dung_url/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechUrl(data); // data là mảng object thiết bị
      });
  }
  //Các action gọi bảng ĐỐI SOÁT
  const displayDoiSoatTrangThai = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_trang_thai/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatTrangThai(data);
      });
  };

  const displayDoiSoatShortCode = () => {
    return fetch(`${API_URL}/doi-soat/mn/lech_shortcode/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatShortCode(data);
      });
  };
  const displayDoiSoatIP = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_ip/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatIP(data);
      });
  };
  const displayDoiSoatUrl = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_url/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatUrl(data);
      });
  };
  const displayDoiSoatGateway = () => {
    return fetch(`${API_URL}/doi-soat/mb/lech_gateway/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDoiSoatGateway(data);
      });
  };
  const displayTongHopKhac = (apiKeys: string[]) => {
    // Tạo mảng Promise để fetch từng API
    const fetches = apiKeys.map((key) => {
      let endpoint = "";
      switch (key) {
        case "ds_trangthai": endpoint = "lech_trang_thai"; break;
        case "ds_shortcode": endpoint = "lech_shortcode"; break;
        case "ds_ip": endpoint = "lech_ip"; break;
        case "ds_url": endpoint = "lech_url"; break;
        case "ds_gateway": endpoint = "lech_gateway"; break;
        default: return Promise.resolve([]); // nếu apiKey lạ
      }
      return fetch(`${API_URL}/doi-soat/mn/${endpoint}/`).then((res) => res.json());
    });
    // Chạy tất cả fetches song song
    return Promise.all(fetches)
      .then((results) => {
        // gộp tất cả mảng thành 1 mảng
        const mergedData = results.reduce((acc, curr) => acc.concat(curr), []);
        setDanhSachDoiSoatKhac(mergedData);
      })
      .catch((err) => {
        console.error("Lỗi fetch nhóm Khác:", err);
        setDanhSachDoiSoatKhac([]);
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
                  USSD1B
                </h1>
              </div>
            </Container>
          </animated.div>
        </div>
        {/*Zone 1: Khung 2 ô tròn thể hiện dữ liệu miền Bắc */}
        <div style={{ marginTop: "10px", display: 'flex', position: 'relative' }}>
          {/* Cột bên trái: khối thống kê */}
          <div className="box_trai_zone1_ussd" style={{ width: '50%', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', gap: '10px' }}>
            <h2 className="text_display_tren">DANH SÁCH KHÁCH HÀNG CHƯA CHUẨN HOÁ BACKEND</h2>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                className="soKenhBox" style={{ width: '50%', height: '20vh' }}>
                <Circle_box_MN_chuanhoa isDisplayed={isDisplayed} />
              </div>
              <div style={{ height: '65vh', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' ,padding:'10px 10px'}}>
                <Circle_box_MN onZoneClick={handleClickPieSlice} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
              </div>
            </div>
          </div>

          <div className="box_phai_zone_1_ussd" style={{ width: '50%', height: '65vh' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT GIỮA BACKEND VÀ CSDL</h2>
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

              {loaiBang === "spid" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá SP ID" data={danhSachLechSPID} onClose={handleCloseTable} />
              )}
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Name" data={danhSachLechName} onClose={handleCloseTable} />
              )}
              {loaiBang === "tps" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá TPS" data={danhSachLechTps} onClose={handleCloseTable} />
              )}
              {loaiBang === "add" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Address" data={danhSachLechAddress} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá ShortCode" data={danhSachLechShortCode} onClose={handleCloseTable} />
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
              {loaiBang === "url" && (
                 loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTin title="Danh sách chưa chuẩn hoá URL" data={danhSachLechURL} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá" data={danhSachKhac} onClose={handleCloseTable} />
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
              {loaiBang === "ds_ip" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTinDoiSoatTQ title="Danh sách sai lệch đối soát IP" data={danhSachDoiSoatIP} onClose={handleCloseTable} />
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
                  <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát Short Code" data={danhSachDoiSoatShortCode} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_url" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTinDoiSoatTQ title="Danh sách sai lệch đối soát URL" data={danhSachDoiSoatUrl} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_gateway" && (
                loadingDs
                  ? <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px"
                  }}>
                    <div className="loader"></div>
                  </div>
                  :<BangThongTinDoiSoatTQ title="Danh sách sai lệch đối soát Gateway Name" data={danhSachDoiSoatGateway} onClose={handleCloseTable} />
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
                  :<BangThongTinDoiSoatTQ title="Danh sách sai lệch đối soát" data={danhSachDoiSoatKhac} onClose={handleCloseTable} />
              )}
              
            </div>
          </div>
        )}
      </div>
    </>);
}
export default MienBac;

 