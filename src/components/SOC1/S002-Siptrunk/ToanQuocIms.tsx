import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Label, ResponsiveContainer
} from 'recharts';
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import BangThongTinIms from "./Bang_thong_tin_IMS"
import BangThongTinDoiSoatIms from "./Bang_thong_tin_doi_soat_IMS";
import Circle_Box_ds_TQ_Ims from "./Circle_Box_ds_TQ_Ims";
import Circle_box_TQ_2donut_Ims from "./Circle_box_TQ_2donut_Ims";
import Circle_box_ds_TQIms_chi_tiet from "./Circle_box_ds_TQIms_chi_tiet";
import Circle_box_TQ_Ims from "./Circle_box_TQ_Ims";
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import API_URL from './apiConfig';
import Gauge_TQ from "./Gauge_TQ";
import Gauge_TQ_Ims from "./Gauge_TQ_Ims";
import BoxThongKe from "./Box_thong_ke_IMS"
// type ToanQuocProps = {
//   onChangeTab: (tab: string) => void;
// };
interface ToanQuocImsProps {
  isDisplayed: boolean;
}
function ToanQuocIms({ isDisplayed }: ToanQuocImsProps) {
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

  const [soKenhBe, setSoKenhBe] = useState(0);
  const [soKenhBeChuaChuanHoa, setSoKenhBeChuaChuanHoa] = useState(0);
  const [soKenhBEvsCSDL, setSoKenhBEvsCSDL] = useState(0);
  const [soLechTruongTT, setSoLechTruongTT] = useState(0);
  const [soLechMtas, setSoLechMtas] = useState(0);
  const [soLechTocDo, setSoLechTocDo] = useState(0);
  const [soLechSipTel, setSoLechSipTel] = useState(0);
  const [soLechPbx1, setSoLechPbx1] = useState(0);


  const [tyLePhanTram, setTyLePhanTram] = useState(0);
  const [soKenhOnlyBe, setSoKenhOnlyBe] = useState(0);
  const [soKenhOnlyCsdl, setSoKenhOnlyCsdl] = useState(0);

  //fetch danh mục
  const [danhSachLechTruongTT, setDanhSachLechTruongTT] = useState<ThietBi[]>([]);
  const [danhSachLechAccName, setDanhSachLechAccName] = useState<ThietBi[]>([]);
  const [danhSachLechKenh, setDanhSachLechKenh] = useState<ThietBi[]>([]);
  const [danhSachLechNumber, setDanhSachLechNumber] = useState<ThietBi[]>([]);
  const [danhSachLechDest, setDanhSachLechDest] = useState<ThietBi[]>([]);


  const [danhSachLechImsMB, setDanhSachLechImsMB] = useState<ThietBi[]>([]);
  const [danhSachLechImsMN, setDanhSachLechImsMN] = useState<ThietBi[]>([]);
  const [danhSachDsImsKhopBeCsdl, setDanhSachDsImsKhopBeCsdl] = useState<DoiSoat[]>([]);
  const [danhSachDsImsOnlyBe, setDanhSachDsImsOnlyBe] = useState<DoiSoat[]>([]);
  const [danhSachDsImsOnlyCsdl, setDanhSachDsImsOnlyCsdl] = useState<DoiSoat[]>([]);

  const [soDoiSoatKenh, setSoDoiSoatKenh] = useState<DoiSoat[]>([]);
  const [soDoiSoatAccName, setSoDoiSoatAccName] = useState<DoiSoat[]>([]);
  const [soDoiSoatDes, setSoDoiSoatDes] = useState<DoiSoat[]>([]);
  const [soDoiSoatMoQte, setSoDoiSoatMoQte] = useState<DoiSoat[]>([]);
  const [soDoiSoatKhoaQte, setSoDoiSoatKhoaQte] = useState<DoiSoat[]>([]);
  const [soDoiSoatOnlyBe, setSoDoiSoatOnlyBe] = useState<DoiSoat[]>([]);
  const [soDoiSoatOnlyCSDL, setSoDoiSoatOnlyCsdl] = useState<DoiSoat[]>([]);
  

  const [showBang, setShowBang] = useState(false); // hiển thị bảng hay không
  const [titleBang, setTitleBang] = useState(""); // tiêu đề bảng
  const [loading, setLoading] = useState(false);
  type LoaiBangTron =
    | "aaranetmienbac"
    | "aaranetmiennam"
    | "imsmienbac"
    | "imsmiennam"
    | "aamienbac_ds"
    | "aamiennam_ds"
    | "imskhopbecsdl_ds"
    | "imsonlybe_ds"
    | "imsonlycsdl_ds";

  type LoaiBang =
    "saikhuvuc"
    | "number"
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


  const colors = [
    "hsla(243, 81%, 72%, 1.00)", "hsla(143, 86%, 61%, 0.90)", "hsla(40, 87%, 63%, 1.00)", "rgba(207, 105, 68, 1)", "#8dd1e1",
    "#a4de6c", "#5cfafaff", "#d88884", "#87bbceff", "#c084d8", "#e8f66bff"
  ];
  const [loaiBang, setLoaiBang] = useState<string | null>(null);
  // const [loaiBang, setLoaiBang] = useState<LoaiBang | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [loaiBangTron, setLoaiBangTron] = useState<"aaranetmienbac" | "aaranetmiennam" | "aamienbac_ds" | "aamiennam_ds" |
    "imsmienbac" | "imsmiennam" | "imskhopbecsdl_ds" | "imsonlybe_ds" | "imsonlycsdl_ds" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tieuDe, setTieuDe] = useState("");
  const [runTime, setRunTime] = useState<string>("");
  
  // Gọi bảng cho các hình tròn thống kê BE
  const handleClickPieSlice = (index: number) => {
    setLoaiBang(null);
    console.log("Click index:", index); // 👈 kiểm tra log này
    setSelectedIndex(index);
    if (index === 0) {
      setLoaiBangTron("imsmienbac");
      displayDanhSachImsMB();
      setShowBang(true);
    } else if (index === 1) {
      setLoaiBangTron("imsmiennam");
      displayDanhSachImsMN();
      setShowBang(true);
    }
  }
  // hàm đóng bảng
  const handleCloseTable = () => {
    setShowBang(false); // 👉 Đóng bảng
    setSelectedIndex(null);
  };
  // Gọi bảng cho các hình tròn đối soát giữa BE và CSDL
  const handleClickPieSlice_ds = (index: number) => {
    console.log("Click index:", index); // 👈 kiểm tra log này
    setSelectedIndex(index);
    if (index === 0) {
      setLoaiBangTron("imskhopbecsdl_ds");
      displayDanhSachDsKhopBeVsCsdl();
      setShowBang(true);
    }
    else if (index === 1) {
      setLoaiBangTron("imsonlybe_ds");
      displayDanhSachDsOnlyBe();
      setShowBang(true);
    }
    else if (index === 2) {
      setLoaiBangTron("imsonlycsdl_ds");
      displayDanhSachDsOnlyCsdl();
      setShowBang(true);
    }
  }

  const handleBoxClick = (index: number) => {
    setLoaiBangTron(null);
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

  // Gọi bảng cho hình tròn chi tiết
  const handleClickPieSlice_ds_chitiet = (index: number) => {
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
  }

  useEffect(() => {
    fetch(`${API_URL}/thong-ke-loi/count/ims/so_luong_kenh_be/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBe(data.count ?? 0))
      .catch(() => setSoKenhBe(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/thong-ke-loi/count/ims/so_luong_chua_chuan_hoa_be/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBeChuaChuanHoa(data.count ?? 0))
      .catch(() => setSoKenhBeChuaChuanHoa(0)); // fallback nếu fetch lỗi
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
    fetch(`${API_URL}/thong-ke-loi/count/ims/phan_tram_be/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setTyLePhanTram(data.count ?? 0))
      .catch(err => (setTyLePhanTram(0)));// fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/count/ims/so_luong_kenh_be_and_csdl/`) //Số kênh khớp cả BE và CSDL trên IMS
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBEvsCSDL(data.count ?? 0))
      .catch(err => (setSoKenhBEvsCSDL(0)));// fallback nếu fetch lỗi

    fetch(`${API_URL}/doi-soat/ims/count/number_only_be/`) //số kênh only BE của IMS
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhOnlyBe(data.count ?? 0))
      .catch(() => setSoKenhOnlyBe(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/ims/count/number_only_csdl/`) //số kênh only CSDL của IMS
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhOnlyCsdl(data.count ?? 0))
      .catch(() => setSoKenhOnlyCsdl(0)); // fallback nếu fetch lỗi
  }, []);
  useEffect(() => {
    const endpoints = [

      "khong_dung_mtas",
      "khong_dung_kenh",
      "khong_dung_siptel",
      "khong_dung_pbx1",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/ims/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 })
          .then(data => data.count ?? 0)
          .catch(() => 0) // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechMtas(results[0]);
      setSoLechTocDo(results[1]);
      setSoLechSipTel(results[2]);
      setSoLechPbx1(results[3]);
    });
  }, []);
  // Click để gọi ra số đầu số chỉ có ở BE hoặc ở CSDL
 
  const handleClickBe = async () => {
    setLoaiBang("ds_onlybe");
        displayDoiSoatOnlyBe();
        // setShowBang(true);
  };

  const handleClickCsdl = async () => {
      setLoaiBang("ds_onlycsdl");
        displayDoiSoatOnlyCsdl();
        // setShowBang(true);
};

  const thongKeData = [
    { ten: "Mtas", soLuong:  soLechMtas },
    { ten: "Tốc độ", soLuong: soLechTocDo  },
    { ten: "Sip Tel", soLuong: soLechSipTel},
    { ten: "pbx1", soLuong:  soLechPbx1 },
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
// 🔹 1. Xác định map giữa loaiBang và dataset/title
const bangMap: Record<
  string,
  { title: string; data: any[] }
> = {
  mtas: { title: "Danh sách Account Name chưa chuẩn hoá", data: danhSachLechAccName },
  number: { title: "Danh sách đầu số chưa chuẩn hoá ", data: danhSachLechNumber },
  kenh: { title: "Danh sách KH có cuộc gọi đồng thời chưa chuẩn hoá", data: danhSachLechKenh },
  dest: { title: "Danh sách IP khách hàng chưa chuẩn hoá", data: danhSachLechDest },
};

// 🔹 2. Lấy thông tin theo loaiBang
const currentBang = bangMap[loaiBang];

  //Các action gọi bảng
   
  const displayDanhSachImsMB = () => {
    fetch(`${API_URL}/thong-ke-loi/mb/ims/total/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechImsMB(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachImsMN = () => {
    fetch(`${API_URL}/thong-ke-loi/mn/ims/total/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechImsMN(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsKhopBeVsCsdl = () => {
    fetch(`${API_URL}/doi-soat/mb/ims/total/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDsImsKhopBeCsdl(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsOnlyBe = () => {
    fetch(`${API_URL}/doi-soat/ims/number_only_be/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data BE:", data);
        setDanhSachDsImsOnlyBe(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsOnlyCsdl = () => {
    fetch(`${API_URL}/doi-soat/ims/number_only_csdl/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data CSDL:", data);
        setDanhSachDsImsOnlyCsdl(data); // data là mảng object thiết bị
      });
  }
  const displayDoiSoatKenh = () => {
    fetch(`${API_URL}/doi-soat/ims/khong_dung_kenh/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatKenh(data); // data là mảng object thiết bị
      });
  };
  const displayDoiSoatAccName = () => {
    fetch(`${API_URL}/doi-soat/ims/khong_dung_acc_name/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatAccName(data);
      });
  };
  const displayDoiSoatDest = () => {
    fetch(`${API_URL}/doi-soat/ims/khong_dung_dest/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatDes(data);
      });
  };
  const displayDoiSoatMoQte = () => {
    fetch(`${API_URL}/doi-soat/ims/khong_dung_loaihinh_moqte/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatMoQte(data);
      });
  };
  const displayDoiSoatKhoaQte = () => {
    fetch(`${API_URL}/doi-soat/ims/khong_dung_loaihinh_khoaqte/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatKhoaQte(data);
      });
  };
  const displayDoiSoatOnlyBe = () => {
        setLoading(true);                // ⚙️ bật trạng thái loading
        setSoDoiSoatOnlyBe([]);          // ✅ reset dữ liệu cũ

        fetch(`${API_URL}/doi-soat/ims/number_only_be/`)
          .then((res) => res.json())
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setSoDoiSoatOnlyBe(list);
            setShowBang(list.length > 0);  // ✅ chỉ hiển thị bảng nếu có dữ liệu
          })
          .catch((err) => {
            console.error("Fetch lỗi:", err);
            setSoDoiSoatOnlyBe([]);
            setShowBang(false);            // ❌ ẩn bảng nếu lỗi
          })
          .finally(() => setLoading(false)); // ✅ tắt loading
      };
  const displayDoiSoatOnlyCsdl = () => {
      setLoading(true);                // ⚙️ bật trạng thái loading
        setSoDoiSoatOnlyCsdl([]);          // ✅ reset dữ liệu cũ
    fetch(`${API_URL}/doi-soat/ims/number_only_csdl/`)
      .then((res) => res.json())
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setSoDoiSoatOnlyCsdl(list);
            setShowBang(list.length > 0);  // ✅ chỉ hiển thị bảng nếu có dữ liệu
          })
          .catch((err) => {
            console.error("Fetch lỗi:", err);
            setSoDoiSoatOnlyCsdl([]);
            setShowBang(false);            // ❌ ẩn bảng nếu lỗi
          })
          .finally(() => setLoading(false)); // ✅ tắt loading
      };
    const displayDanhSachLechKhuVuc = () => {
        setLoading(true);
        setDanhSachLechTruongTT([]);
        fetch(`${API_URL}/thong-ke-loi/ims/kokv/`)
          .then((res) => res.json())
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setDanhSachLechTruongTT(list);
            setShowBang(list.length > 0); // ✅ chỉ hiển thị bảng nếu có dữ liệu
          })
          .catch((err) => {
            console.error("Fetch lỗi:", err);
            setDanhSachLechTruongTT([]);
            setShowBang(false); // ❌ ẩn bảng nếu lỗi
          })
          .finally(() => setLoading(false)); // ✅ luôn tắt loading
      };
    const displayDanhSachLechAccName = () => {
          setLoading(true);
          setDanhSachLechAccName([]);
          fetch(`${API_URL}/thong-ke-loi/ims/khong_dung_mtas/`)
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
          fetch(`${API_URL}/thong-ke-loi/ims/khong_dung_kenh/`)
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
        fetch(`${API_URL}/thong-ke-loi/ims/khong_dung_siptel/`)
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
        fetch(`${API_URL}/thong-ke-loi/ims/khong_dung_pbx1/`)
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

  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 30 }
  });

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

                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)',
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
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    marginBottom: '0.0rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: '0.02em'
                  }}>
                    IMS TOÀN QUỐC
                  </h1>
                </div>
              </Container>
            </animated.div>
          </div>
          {/* <div  style={{ marginTop: "10px", display: 'flex', gap: '20px' }}> */}
         

        </div>
        {/* </div> */}

        {/* Khung zone 2*/}
        <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
          

          {/* Cột 1: thống kê chưa chuẩn hoá */}
          <div className="box_trai_zone1" style={{ width: '50%', height: '55vh',position: 'relative'  }}>
            <h2 className="text_display_tren">THỐNG KÊ CHƯA CHUẨN HOÁ TRÊN BE</h2>
            <Circle_box_TQ_2donut_Ims onZoneClick={handleClickPieSlice} />  {/* ✅ truyền callback */}
                    </div>
          {/* Cột 4: đối soát BE - CSDL */}
          
          <div className="box_phai_zone1" style={{ width: '50%', height: '55vh',position: 'relative'}}>
                <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
                <Circle_Box_ds_TQ_Ims onZoneClick={handleClickPieSlice_ds} />
                      {/* <div
                        className="soKenhBox"
                        style={{
                          position: 'absolute',
                          bottom: '5px',
                          left: '5px', // ✅ thêm dòng này
                          textAlign: 'left',
                        }}
                      >
                        <h4 className="text_tieude_ngan_1">SỐ LƯỢNG ĐẦU SỐ</h4>
                        <h4 className="text_tieude_ngan_1">KHỚP GIỮA BE VÀ CSDL</h4>
                        <div className="position-relative d-flex justify-content-center align-items-center">
                          <span className="text_giatri_nho">{soKenhBEvsCSDL}</span>
                          <span
                            className="text_donvi"
                            style={{
                              position: 'absolute',
                              left: 'calc(50% + 25px)',
                              transform: 'translateY(10%)',
                            }}
                          >
                            (đầu số)
                          </span>
                        </div>
                      </div> */}
                    </div>
                </div>


        {/* Khung zone 3*/}
        {/* Các cột nửa bên trái, hiển thị chưa chuẩn hoá */}
        <div style={{ marginTop: "20px", display: 'flex', gap: '20px', height: '70vh' }}>
          <div className="box_trai_zone2_ims" style={{ width: '50%' }}>
            <h2 className="text_display_tren">DANH MỤC LỖI CHUẨN HÓA DỮ LIỆU BE</h2>
            <BoxThongKe onClickBox={handleBoxClick}/>
          </div>
          {/* Các cột nửa bên phải, hiển thị đối soát */}
          <div
            style={{
              width: '50%',
              height: '60vh',
              display: 'flex',
              flexDirection: 'column', // 👉 sắp xếp theo chiều dọc
              justifyContent: 'space-between', // hoặc dùng gap bên dưới
              gap: '5px' // 👉 khoảng cách dọc giữa các khối
            }}
          >
            
            <div className="box_phai_zone2_aa">
              <h2 className="text_display_tren">DANH SÁCH SAI LỆCH BE VÀ CSDL</h2>
              <Circle_box_ds_TQIms_chi_tiet onClickBox={handleClickPieSlice_ds_chitiet} />
            </div>
          </div>
        </div>
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

              {loaiBangTron === "imsmienbac" && (
                <BangThongTinIms title="Danh sách chưa chuẩn hoá Miền Bắc" data={danhSachLechImsMB} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "imsmiennam" && (
                <BangThongTinIms title="Danh sách chưa chuẩn hoá Miền Nam" data={danhSachLechImsMN} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "imskhopbecsdl_ds" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số có cả trên BE và CSDL" data={danhSachDsImsKhopBeCsdl} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "imsonlybe_ds" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số chỉ có trên BE" data={danhSachDsImsOnlyBe} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "imsonlycsdl_ds" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số chỉ có trên CSDL" data={danhSachDsImsOnlyCsdl} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_onlybe" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số chỉ có trên BE" data={soDoiSoatOnlyBe} onClose={handleCloseTable} />
              )}
              {loaiBang === "ds_onlycsdl" && (
                <BangThongTinDoiSoatIms title="Danh sách đầu số chỉ có trên CSDL" data={soDoiSoatOnlyCSDL} onClose={handleCloseTable} />
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
       
            {currentBang && (
              <div className="relative">
                {loading ? (
                  // 🌀 Giai đoạn đang tải
                  <div className="text-center text-gray-500 py-4 text-lg">
                    Đang tải dữ liệu...
                  </div>
                ) : currentBang.data && currentBang.data.length > 0 ? (
                  // ✅ Có dữ liệu
                  <BangThongTinIms
                    key={loaiBang}
                    title={currentBang.title}
                    data={currentBang.data}
                    loading={loading}
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
export default ToanQuocIms;
