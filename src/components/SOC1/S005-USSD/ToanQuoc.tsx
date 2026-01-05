import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Label, ResponsiveContainer
} from 'recharts';
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoatTQ from "./Bang_thong_tin_doi_soat_TQ";
import BangThongTinDoiSoatTQBox from "./Bang_thong_tin_doi_soat_TQ_box";
import Circle_box_TQ from "./Circle_box_TQ"
import Circle_box_TQ_chuanhoa from "./Circle_box_TQ_chuanhoa"
import Circle_Box_ds_TQ from "./Circle_Box_ds_TQ";
import Circle_box_ds_TQ_chi_tiet from "./Circle_box_ds_TQ_chi_tiet"
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import BoxThongKe from "./Box_thong_ke"
import API_URL from './apiConfig';

// type ToanQuocProps = {
//   onChangeTab: (tab: string) => void;
// };
interface ToanQuocProps {
  isDisplayed: boolean;
}
function ToanQuoc({ isDisplayed }: ToanQuocProps) {
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

  const [soKenhBe, setSoKenhBe] = useState(0);
  const [soKenhCsdl, setSoKenhCsdl] = useState(0);
  const [soKenhBEvsCSDL, setSoKenhBEvsCSDL] = useState(0);
  const [soLechSPID, setSoLechSPID] = useState(0);
  const [soLechName, setSoLechName] = useState(0);
  const [soLechTps, setSoLechTps] = useState(0);
  const [soLechShortcode, setSoLechShortcode] = useState(0);
  const [soLechIps, setSoLechIps] = useState(0);
  const [soLechAddress, setSoLechAddress] = useState(0);
  const [soLechUrl, setSoLechUrl] = useState(0);
  const [tyLePhanTram, setTyLePhanTram] = useState(0);
  const [soKenhOnlyBe, setSoKenhOnlyBe] = useState(0);
  const [soKenhOnlyCsdl, setSoKenhOnlyCsdl] = useState(0);
  const [tyLePhanTramIms, setTyLePhanTramIms] = useState(0);
  const [soKenhBeChuaChuanHoa, setSoKenhBeChuanChuanHoa] = useState(0);
  const [countCsdl, setCountCsdl] = useState(0);
  //fetch danh mục
  const [danhSachLechSPID, setDanhSachLechSPID] = useState<ThietBi[]>([]);
  const [danhSachLechName, setDanhSachLechName] = useState<ThietBi[]>([]);
  const [danhSachLechTps, setDanhSachLechTps] = useState<ThietBi[]>([]);
  const [danhSachLechShortcode, setDanhSachLechShortcode] = useState<ThietBi[]>([]);
  const [danhSachLechIps, setDanhSachLecIps] = useState<ThietBi[]>([]);
  const [danhSachLechAddress, setDanhSachLechAddress] = useState<ThietBi[]>([]);
  const [danhSachLechUrl, setDanhSachLechUrl] = useState<ThietBi[]>([]);

  const [danhSachLechUssdMB, setDanhSachLechUssdMB] = useState<ThietBi[]>([]);
  const [danhSachLechUssdMN, setDanhSachLechUssdMN] = useState<ThietBi[]>([]);

  const [danhSachDsUssdBothSide, setDanhSachDsUssdBothSide] = useState<DoiSoat[]>([]);
  const [danhSachDsUssdOnlyBe, setDanhSachDsUssdOnlyBe] = useState<DoiSoat[]>([]);
  const [danhSachDsUssdOnlyCsdl, setDanhSachDsUssdOnlyCsdl] = useState<DoiSoat[]>([]);


  const [soDoiSoatTrangThai, setSoDoiSoatTrangThai] = useState<DoiSoat[]>([]);
  const [soDoiSoatIp, setSoDoiSoatIp] = useState<DoiSoat[]>([]);
  const [soDoiSoatShortCode, setSoDoiSoatShortCode] = useState<DoiSoat[]>([]);
  const [soDoiSoatUrl, setSoDoiSoatUrl] = useState<DoiSoat[]>([]);
  const [soDoiSoatKhac, setSoDoiSoatKhac] = useState<DoiSoat[]>([]);
  const [soDoiSoatOnlyBe, setSoDoiSoatOnlyBe] = useState<DoiSoat[]>([]);
  const [soDoiSoatOnlyCSDL, setSoDoiSoatOnlyCsdl] = useState<DoiSoat[]>([]);
  const [loadingDs, setLoadingDs] = useState(false);


  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [showBang, setShowBang] = useState(false); // hiển thị bảng hay không
  const [titleBang, setTitleBang] = useState(""); // tiêu đề bảng
  type LoaiBangTron =
    "smppmienbac"
    | "smppmiennam"
    | "khopbevscsdl_ds"
    | "onlybe_ds"
    | "onlycsdl_ds"


  type LoaiBang =
    "spid"
    | "name"
    | "tps"
    | "shortcode"
    | "ips"
    | "add"
    | "url"
    | "ds_trangthai"
    | "ds_ip"
    | "ds_shortcode"
    | "ds_url"
    | "ds_gateway"
    | "khopbevscsdl_ds"
    | "ds_onlybe"
    | "ds_onlycsdl"
    | "ds_khac"


  const colors = [
    "hsla(243, 81%, 72%, 1.00)", "hsla(143, 86%, 61%, 0.90)", "hsla(40, 87%, 63%, 1.00)", "rgba(207, 105, 68, 1)", "#8dd1e1",
    "#a4de6c", "#5cfafaff", "#d88884", "#87bbceff", "#c084d8", "#e8f66bff"
  ];
  const [loaiBang, setLoaiBang] = useState<string | null>(null);
  // const [loaiBang, setLoaiBang] = useState<LoaiBang | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [loaiBangTron, setLoaiBangTron] = useState<"smppmienbac" | "smppmiennam" | "khopbevscsdl_ds" | "onlybe_ds" | "onlycsdl_ds"|null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tieuDe, setTieuDe] = useState("");
  const [runTime, setRunTime] = useState<string>("");



  // const handleBoxClick = (
  //   dataMoi: any[], // hoặc bạn tạo interface cụ thể
  //   tieuDeMoi: string,
  //   loaiBangMoi: string
  // ) => {
  //   setDataBang(dataMoi);
  //   setTieuDe(tieuDeMoi);
  //   setLoaiBang(loaiBangMoi);
  // };

  const handleClickPieSlice = (index: number) => {
    setLoaiBang(null);
    console.log("Click index:", index); // 👈 kiểm tra log này
    setSelectedIndex(index);
    if (index === 0) {
      setLoaiBangTron("smppmienbac");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSachUssdMB().finally(() => setLoadingDs(false));
      
    } else if (index === 1) {
      setLoaiBangTron("smppmiennam");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSachUssdMN().finally(() => setLoadingDs(false));
    }
  }
  //action đóng bảng
  const handleCloseTable = () => {
    setShowBang(false); // 👉 Đóng bảng
    setSelectedIndex(null);
  };
  //action click vào bảng 
  const handleClickPieSlice_ds = (index: number) => {
    setLoaiBang(null);
    console.log("Click index:", index); // 👈 kiểm tra log này
    setSelectedIndex(index);
    if (index === 0) {
      setLoaiBangTron("khopbevscsdl_ds");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSachDsKhopBEvsCSDL().finally(() => setLoadingDs(false));
    }
    if (index === 1) {
      setLoaiBangTron("onlybe_ds");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSachDsSmppnlyBe().finally(() => setLoadingDs(false));
    }
    else if (index === 2) {
      setLoaiBangTron("onlycsdl_ds");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSachDsSmppOnlyCsdl().finally(() => setLoadingDs(false));
    }
  }
  //action click vào box đối soát chi tiết
  const handleClickPieSlice_ds_chitiet = (apiKey: string | string[]) => {
    setShowBang(true);       // hiển thị bảng ngay
    setLoadingDs(true);       // bật loading
    if (apiKey === "ds_trangthai") {
      setLoaiBang("ds_trangthai");
      displayDoiSoatTrangThai().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_ip") {
      setLoaiBang("ds_ip");
      displayDoiSoatIp().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_shortcode") {
      setLoaiBang("ds_shortcode");
      displayDoiSoatShortCode().finally(() => setLoadingDs(false));
    }
    else if (apiKey === "ds_url") {
      setLoaiBang("ds_url");
      displayDoiSoatUrl().finally(() => setLoadingDs(false));
    }
    // Nhóm "Khác"
    else if (Array.isArray(apiKey)) {
      setLoaiBang("ds_khac");
      displayTongHopKhac(apiKey).finally(() => setLoadingDs(false));
    }

    setShowBang(true);
  };
  //action click vào box
//   const handleBoxClick = async (index: number) => {
//     setShowBang(false);

//     if (index === 0) {
//       setLoaiBang("ds_accname");
//       await displayDoiSoatTrangThai();
//     } else if (index === 1) {
//       setLoaiBang("ds_sodich");
//       await displayDoiSoatBindType();
//     } else if (index === 2) {
//       setLoaiBang("ds_thanhly");
//       await displayDoiSoatThanhLy();
//     } else if (index === 3) {
//       setLoaiBang("ds_tamngung");
//       await displayDoiSoatTamNgung();
//     }

//     setShowBang(true);   // bật lại
// };
    // 🔹 1. Xác định map giữa loaiBang và dataset/title
// const bangMap: Record<
//   string,
//   { title: string; data: any[] }
// > = {
//   ds_trangthai: { title: "Danh sách Account có trạng thái ", data: soDoiSoatTrangThai },
//   ds_sodich: { title: "Danh sách đầu số đích chưa chuẩn hoá ", data: soDoiSoatBindType },
//   ds_thanhly: { title: "Danh sách đầu số thanh lý chưa chuẩn hoá", data: soDoiSoatThanhLy },
//   ds_tamngung: { title: "Danh sách đầu số tạm ngưng chưa chuẩn hoá", data: soDoiSoatTamNgung },
// };

// 🔹 2. Lấy thông tin theo loaiBang
// const currentBang = bangMap[loaiBang];

  // Gọi bảng cho hình tròn chi tiết
  // const handleClickPieSlice_ds_chitiet = (apiKey: string | string[]) => {
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

  //   setShowBang(true);
  // };
  useEffect(() => {
    fetch(`${API_URL}/thong-ke-loi/count/so_luong_account_be/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBe(data.count ?? 0))
      .catch(() => setSoKenhBe(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/thong-ke-loi/count/account_be_chua_chuan_hoa/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBeChuanChuanHoa(data.count ?? 0))
      .catch(() => setSoKenhBeChuanChuanHoa(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/count/so_luong_kenh_CSDL/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhCsdl(data.count ?? 0))
      .catch(() => setSoKenhCsdl(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/run-time/`) //lấy dữ liệu thời gian
      .then(res => res.json())
      .then(json => {
        if (json.run_time) {
          const dt = new Date(json.run_time);
          const formatted = dt.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false
          });
          setRunTime(formatted);
        } else {
          setRunTime("Không có dữ liệu thời gian");
        }
      })
      .catch(err => {
        console.error("Lỗi khi lấy thời gian:", err);
        setRunTime("Lỗi khi tải dữ liệu");
      });
    fetch(`${API_URL}/doi-soat/count/account_both_be_or_csdl/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBEvsCSDL(data.count ?? 0)) //số kênh khớp cả BE và CSDL
      .catch(err => (setSoKenhBEvsCSDL(0)));// fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/count/account_only_be/`) //số kênh BE 
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhOnlyBe(data.count ?? 0))
      .catch(() => setSoKenhOnlyBe(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/count/account_only_csdl/`) //số kênh CSDL 
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhOnlyCsdl(data.count ?? 0))
      .catch(() => setSoKenhOnlyCsdl(0)); // fallback nếu fetch lỗi
  }, []);
  useEffect(() => {
    const endpoints = [
      "khong_dung_spid",
      "khong_dung_name",
      "khong_dung_tps",
      "khong_dung_shortcode",
      "khong_dung_ip",
      "khong_dung_address",
      "khong_dung_url",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 })
          .then(data => data.count ?? 0)
          .catch(() => 0) // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechSPID(results[0]);
      setSoLechName(results[1]);
      setSoLechTps(results[2]);
      setSoLechShortcode(results[3]);
      setSoLechIps(results[4]);
      setSoLechAddress(results[5]);
      setSoLechUrl(results[6]);
    });
  }, []);
  // Click để gọi ra số đầu số chỉ có ở BE hoặc ở CSDL

  const thongKeData = [
    { key: "spid", ten: "SP ID", soLuong: soLechSPID },
    { key: "name", ten: "Account Name", soLuong: soLechName },
    { key: "tps", ten: "TPS", soLuong: soLechTps },
    { key: "shortcode", ten: "ShortCode", soLuong: soLechShortcode },
    { key: "ips", ten: "IP", soLuong: soLechIps },
    { key: "add", ten: "Address", soLuong: soLechAddress },
    { key: "url", ten: "URL", soLuong: soLechUrl },
  ];

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    const totalSoLuong = thongKeData.reduce((sum, item) => sum + item.soLuong, 0);

    if (active && payload && payload.length > 0) {
      const soLuong = payload[0].value as number;
      const percent = ((soLuong / totalSoLuong) * 100).toFixed(1);

      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
          <p style={{ margin: 0 }}><strong>{label}</strong></p>
          <p style={{ margin: 0 }}>Số lượng: {soLuong}</p>
          <p style={{ margin: 0 }}>Chiếm: {percent}%</p>
        </div>
      );
    }

    return null;
  };

  //Các action gọi bảng
  const displayTongLechSpid = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_spid/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechSPID(data); // data là mảng object thiết bị
      });
  }

  const displayTongLechName = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_name/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechName(data); // data là mảng object thiết bị
      });
  }

  const displayTongLechTps = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_tps/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechTps(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechShortcode = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_shortcode/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechShortcode(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAddress = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_address/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAddress(data); // data là mảng object thiết bị
      });
  }
  
  const displayTongLechIps = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_ip/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLecIps(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechUrl = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_url/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechUrl(data); // data là mảng object thiết bị
      });
  }

  const displayDanhSachUssdMB = () => {
  return fetch(`${API_URL}/thong-ke-loi/mb/account_be_chua_chuan_hoa/`)
    .then((res) => res.json())
    .then((data) => {
      setDanhSachLechUssdMB(data); // data là mảng lớn
      console.log("Số lượng MB:", data.length);
    })
    .catch((err) => console.error("Lỗi load data", err));
  };
  const displayDanhSachUssdMN = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/account_be_chua_chuan_hoa/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechUssdMN(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsKhopBEvsCSDL = () => {
    return fetch(`${API_URL}/doi-soat/account_both_be_or_csdl/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDsUssdBothSide(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsSmppnlyBe = () => {
    return fetch(`${API_URL}/doi-soat/account_only_be/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data OnlyBE:", data);
        setDanhSachDsUssdOnlyBe(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsSmppOnlyCsdl = () => {
    return fetch(`${API_URL}/doi-soat/account_only_csdl/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data OnlyCsdl:", data);
        setDanhSachDsUssdOnlyCsdl(data); // data là mảng object thiết bị
      });
  }
  
  const displayDoiSoatTrangThai = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_trang_thai/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatTrangThai(data);
      });
  };

  const displayDoiSoatIp = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_ip/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatIp(data);
      });
  };
  const displayDoiSoatShortCode = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_shortcode/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatShortCode(data);
      });
  };
  const displayDoiSoatUrl = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_url/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatUrl(data);
      });
  };
  const displayTongHopKhac = (apiKeys: string[]) => {
    setLoaiBangTron(null)
    // Tạo mảng Promise để fetch từng API
    const fetches = apiKeys.map((key) => {
      let endpoint = "";
      switch (key) {
        case "ds_trangthai": endpoint = "lech_trang_thai"; break;
        case "ds_ip": endpoint = "lech_ip"; break;
        case "ds_shortcode": endpoint = "lech_shortcode"; break;
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
  const sortedData = [...thongKeData].sort((a, b) => b.soLuong - a.soLuong);

  // 🔹 Định nghĩa handlers theo key
  const handlers = {
    spid: () => { setShowBang(true); setLoadingDs(true); displayTongLechSpid().finally(() => setLoadingDs(false)); setLoaiBang("spid"); setLoaiBangTron(null); },
    name: () => { setShowBang(true); setLoadingDs(true);displayTongLechName().finally(() => setLoadingDs(false)); setLoaiBang("name"); setLoaiBangTron(null); },
    tps: () => {setShowBang(true); setLoadingDs(true); displayTongLechTps().finally(() => setLoadingDs(false)); setLoaiBang("tps"); setLoaiBangTron(null); },
    shortcode: () => { setShowBang(true); setLoadingDs(true);displayTongLechShortcode().finally(() => setLoadingDs(false)); setLoaiBang("shortcode"); setLoaiBangTron(null); },
    ips: () => { setShowBang(true); setLoadingDs(true);displayTongLechIps().finally(() => setLoadingDs(false)); setLoaiBang("ips"); setLoaiBangTron(null); },
    add: () => {setShowBang(true); setLoadingDs(true); displayTongLechAddress().finally(() => setLoadingDs(false)); setLoaiBang("add"); setLoaiBangTron(null); },
    url: () => { setShowBang(true); setLoadingDs(true);displayTongLechUrl().finally(() => setLoadingDs(false)); setLoaiBang("url"); setLoaiBangTron(null); },
  };
  return (
    <>
      <div style={{ width: '100%' }}>
        {/* Khung zone 1*/}
        {/* Khung hiển thị chữ Toàn Quốc + Số lượng kênh BE + Số lượng kênh CSDL + Thời gian lấy dữ liệu*/}
        <div style={{ display: 'flex', width: '100%', gap: '15px', marginBottom: '10px' }}>
          {/* KHUNG HIỂN THỊ CHỮ TOÀN QUỐC */}
          <div style={{ width: '30%' }}>
            <style>{`
              @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.1); opacity: 0.8; }
              }
          `}</style>

            <animated.div
              style={{
                ...headerAnimation,

                background: 'linear-gradient(135deg,  #3070faff 0%, #4f68f7ff 50%, #61faedff 100%)',
                padding: '1.2rem 0',
                marginBottom: '0.5rem',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)'
              }}
            >
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
                    marginBottom: '0.0rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: '0.02em'
                  }}>
                    USSD TOÀN QUỐC
                  </h1>
                </div>
              </Container>
            </animated.div>
          </div>
          {/* <div  style={{ marginTop: "10px", display: 'flex', gap: '20px' }}> */}
          {/* Cột 2: thống kê số lượng BE / CSDL */}

          {/* KHUNG HIỂN THỊ SỐ LƯỢNG KÊNH TRÊN BE */}

          {/* Cột 4: thống kê số lượng BE của IMS */}
          {/* KHUNG HIỂN THỊ SỐ LƯỢNG KÊNH TRÊN BE của IMS */}


          {/* Cột 5: thống kê số lượng CSDL của IMS */}
          {/* KHUNG HIỂN THỊ SỐ LƯỢNG KÊNH TRÊN CSDL của IMS */}

        </div>
        {/* </div> */}

        {/* Khung zone 2*/}
        <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
          {/* CỘT 1: các ô hiển thị dữ liệu, sắp xếp theo chiều dọc */}
          <div
          className="box_trai_zone1_ussd"
          style={{
            width: "50%",
            height: "60vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 className="text_display_tren">THỐNG KÊ CHƯA CHUẨN HOÁ TRÊN BACKEND</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            className="soKenhBox" style={{ width: '35%', height: '15vh' }}>
            <Circle_box_TQ_chuanhoa/>
          </div>
          {/* <div style={{ height: '50vh', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> */}
            <Circle_box_TQ onZoneClick={handleClickPieSlice} />
          
        </div>
       </div>
          {/* Cột 4: đối soát BE - CSDL */}
          <div className="box_phai_zone_1_ussd" style={{ width: '50%', height: '60vh', position: 'relative' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT GIỮA BACKEND VÀ CSDL</h2>
            <Circle_Box_ds_TQ onZoneClick={handleClickPieSlice_ds} />
          </div>
        </div>


        {/* Khung zone 3*/}
        {/* Các cột nửa bên trái, hiển thị chưa chuẩn hoá */}
        <div style={{ marginTop: "20px", display: 'flex', gap: '20px', height: '70vh' }}>
          <div className="box_trai_zone2_ussd" style={{ width: '50%' }}>
            <h2 className="text_display_tren">DANH MỤC LỖI CHUẨN HÓA DỮ LIỆU BE</h2>
            <ResponsiveContainer width="90%" height="90%">
              <BarChart
                barSize={28}
                width={800}
                height={400}
                data={sortedData}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="ten"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12, fill: '#333' }}
                >
                  <Label
                    value="Loại sai lệch"
                    offset={-5}
                    position="insideBottom"
                    style={{ fontSize: '14px', fill: '#333' }}
                  />
                </XAxis>

                <YAxis tick={{ fontSize: 12, fill: '#333' }}>
                  <Label
                    value="Số lượng"
                    angle={-90}
                    position="insideLeft"
                    dy={10}
                    style={{ textAnchor: 'middle', fontSize: '14px', fill: '#333' }}
                  />
                </YAxis>

                <Tooltip content={CustomTooltip} />

                <Bar dataKey="soLuong">
                  {sortedData.map((entry, index) => {
                    const handler = handlers[entry.key as keyof typeof handlers]; // Ép kiểu

                    return (
                      <Cell
                        key={`cell-${entry.key ?? entry.ten ?? 'fallback'}-${index}`}
                        fill={colors[index % colors.length]}
                        cursor={handler ? "pointer" : "default"} // Chỉ đổi con trỏ nếu có handler
                        onClick={() => {
                          console.log("Clicked", entry.key);
                          if (handler) handler(); // Chỉ gọi khi có handler
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>

            </ResponsiveContainer>
          </div>
          {/* Các cột nửa bên phải, hiển thị đối soát */}
          <div
            style={{
              width: '50%',
              height: '70vh',
              display: 'flex',
              flexDirection: 'column', // 👉 sắp xếp theo chiều dọc
              justifyContent: 'space-between', // hoặc dùng gap bên dưới
              gap: '5px' // 👉 khoảng cách dọc giữa các khối
            }}
          >
            {/* Các ô trên: Vùng hiển thị danh sách sai lệch đầu số giữa BE và CSDL */}

            <div className="box_phai_zone_2_ussd">
              <h2 className="text_display_tren">DANH SÁCH SAI LỆCH GIỮA BE VÀ CSDL</h2>
              <Circle_box_ds_TQ_chi_tiet onClickBox={handleClickPieSlice_ds_chitiet}/>
            </div>
          </div>
        </div>
        <hr style={{ margin: '45px 0', border: '2.5', borderTop: '2px solid #ccc' }} />
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

              {loaiBangTron === "smppmienbac" && (
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
                <BangThongTin title="Danh sách chưa chuẩn hoá Miền Bắc" data={danhSachLechUssdMB} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "smppmiennam" && (
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
                <BangThongTin title="Danh sách chưa chuẩn hoá Miền Nam" data={danhSachLechUssdMN} onClose={handleCloseTable} />
              )}
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Account Name" data={danhSachLechName} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá State" data={danhSachLechTps} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá ShortCode" data={danhSachLechShortcode} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá IP" data={danhSachLechIps} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá URL" data={danhSachLechUrl} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "khopbevscsdl_ds" && (
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
                <BangThongTinDoiSoatTQ title="Danh sách đầu số có cả trên BE và CSDL" data={danhSachDsUssdBothSide} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "onlybe_ds" && (
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
                  <BangThongTinDoiSoatTQ title="Danh sách đầu số chỉ có trên BE" data={danhSachDsUssdOnlyBe} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "onlycsdl_ds" && (
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
                  <BangThongTinDoiSoatTQ title="Danh sách đầu số chỉ có trên CSDL" data={danhSachDsUssdOnlyCsdl} onClose={handleCloseTable} />
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
                  <BangThongTinDoiSoatTQ title="Danh sách Account bị sai lệch trạng thái" data={soDoiSoatTrangThai} onClose={handleCloseTable} />
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
                  <BangThongTinDoiSoatTQ title="Danh sách Account bị sai lệch ShortCode" data={soDoiSoatShortCode} onClose={handleCloseTable} />
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
                  :
                  <BangThongTinDoiSoatTQ title="Danh sách Account bị sai lệch IP" data={soDoiSoatIp} onClose={handleCloseTable} />
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
                  :
                  <BangThongTinDoiSoatTQ title="Danh sách Account bị sai lệch URL" data={soDoiSoatUrl} onClose={handleCloseTable} />
              )}
            </div>
          </div>
        )}
      </div>
    </>);
}
export default ToanQuoc;

