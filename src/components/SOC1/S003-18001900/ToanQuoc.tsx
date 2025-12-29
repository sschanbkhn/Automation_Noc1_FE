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
import Circle_box_ds_TQ_chi_tiet from "./Circle_box_ds_TQ_chi_tiet";
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
    number : string;
    account_name_csdl : string;
    account_name_be : string;
    so_dich_csdl : string;
    so_dich_be : string;
    so_cgdt_csdl : string;
    so_cgdt_be : string;
    status_csdl : string;
    tam_ngung_be : string;
    chan_goi_ra_be : string;
    Khu_vuc : string;
    Ghi_chu : string;
  };

  const [soKenhBe, setSoKenhBe] = useState(0);
  const [soKenhCsdl, setSoKenhCsdl] = useState(0);
  const [soKenhBEvsCSDL, setSoKenhBEvsCSDL] = useState(0);
  const [soLechLoaiHinh, setSoLechLoaiHinh] = useState(0);
  const [soLechNumber, setSoLechNumber] = useState(0);
  const [soLechAccName, setSoLechAccName] = useState(0);
  const [soLechSoDich, setSoLechSoDich] = useState(0);
  const [soLechDichVu, setSoLechDichVu] = useState(0);
  const [soLechAccInfo, setSoLechAccInfo] = useState(0);
  const [soLechTrung, setSoLechTrung] = useState(0);
  const [tyLePhanTram, setTyLePhanTram] = useState(0);
  const [soKenhOnlyBe, setSoKenhOnlyBe] = useState(0);
  const [soKenhOnlyCsdl, setSoKenhOnlyCsdl] = useState(0);
  const [tyLePhanTramIms, setTyLePhanTramIms] = useState(0);
  const [soKenhBeChuaChuanHoa, setSoKenhBeChuanChuanHoa] = useState(0);
  const [countCsdl, setCountCsdl] = useState(0);
  //fetch danh mục
  const [danhSachLechLoaiHinh, setDanhSachLechLoaiHinh] = useState<ThietBi[]>([]);
  const [danhSachLechNumber, setDanhSachLechNumber] = useState<ThietBi[]>([]);
  const [danhSachLechAccName, setDanhSachLechAccName] = useState<ThietBi[]>([]);
  const [danhSachLechSoDich, setDanhSachLechSoDich] = useState<ThietBi[]>([]);
  const [danhSachLechDichVu, setDanhSachLechDichVu] = useState<ThietBi[]>([]);
  const [danhSachLechAccInfo, setDanhSachLechAccInfo] = useState<ThietBi[]>([]);
  const [danhSachTrung, setDanhSachTrung] = useState<ThietBi[]>([]);
  // const [danhSachTrunglap, setDanhSachLechTrunglap] = useState<ThietBi[]>([]);
  const [danhSachLech18001900MB, setDanhSachLech18001900MB] = useState<ThietBi[]>([]);
  const [danhSachLech18001900MN, setDanhSachLech18001900MN] = useState<ThietBi[]>([]);

  const [danhSachDsAaBothSide, setDanhSachDsAaBothSide] = useState<DoiSoat[]>([]);
  const [danhSachDsAaOnlyBe, setDanhSachDsAaOnlyBe] = useState<DoiSoat[]>([]);
  const [danhSachDsAaOnlyCsdl, setDanhSachDsAaOnlyCsdl] = useState<DoiSoat[]>([]);


  const [soDoiSoatAccName, setSoDoiSoatAccName] = useState<DoiSoat[]>([]);
  const [soDoiSoatSoDich, setSoDoiSoatSoDich] = useState<DoiSoat[]>([]);
  const [soDoiSoatThanhLy, setSoDoiSoatThanhLy] = useState<DoiSoat[]>([]);
  const [soDoiSoatTamNgung, setSoDoiSoatTamNgung] = useState<DoiSoat[]>([]);
  const [soDoiSoatKhac, setSoDoiSoatKhac] = useState<DoiSoat[]>([]);
  const [soDoiSoatOnlyBe, setSoDoiSoatOnlyBe] = useState<DoiSoat[]>([]);
  const [soDoiSoatOnlyCSDL, setSoDoiSoatOnlyCsdl] = useState<DoiSoat[]>([]);
  const [loadingDs, setLoadingDs] = useState(false);


  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [showBang, setShowBang] = useState(false); // hiển thị bảng hay không
  const [titleBang, setTitleBang] = useState(""); // tiêu đề bảng
  type LoaiBangTron =
    | "18001900mienbac"
    | "18001900miennam"
    | "khopbevscsdl_ds"
    | "onlybe_ds"
    | "onlycsdl_ds"


  type LoaiBang =
    "loaihinh"
    | "number"
    | "accname"
    | "accinfo"
    | "sodich"
    | "dichvu"
    | "sipinfo"
    | "route"
    | "trung"
    | "ds_accname"
    | "ds_sodich"
    | "ds_thanhly"
    | "ds_tamngung"
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
  const [loaiBangTron, setLoaiBangTron] = useState<"18001900mienbac" | "18001900miennam" | "khopbevscsdl_ds" | "onlybe_ds" | "onlycsdl_ds"|null>(null);
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
      setLoaiBangTron("18001900mienbac");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSach18001900MB().finally(() => setLoadingDs(false));
      
    } else if (index === 1) {
      setLoaiBangTron("18001900miennam");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSach18001900MN().finally(() => setLoadingDs(false));
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
      displayDanhSachDs18001900OnlyBe().finally(() => setLoadingDs(false));
    }
    else if (index === 2) {
      setLoaiBangTron("onlycsdl_ds");
      setShowBang(true);
      setLoadingDs(true);
      displayDanhSachDs18001900OnlyCsdl().finally(() => setLoadingDs(false));
    }
  }
  //action click vào box
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
  ds_accname: { title: "Danh sách Account Name chưa chuẩn hoá", data: soDoiSoatAccName },
  ds_sodich: { title: "Danh sách đầu số đích chưa chuẩn hoá ", data: soDoiSoatSoDich },
  ds_thanhly: { title: "Danh sách đầu số thanh lý chưa chuẩn hoá", data: soDoiSoatThanhLy },
  ds_tamngung: { title: "Danh sách đầu số tạm ngưng chưa chuẩn hoá", data: soDoiSoatTamNgung },
};

// 🔹 2. Lấy thông tin theo loaiBang
const currentBang = bangMap[loaiBang];

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
    fetch(`${API_URL}/thong-ke-loi/count/so_luong_kenh_be/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBe(data.count ?? 0))
      .catch(() => setSoKenhBe(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/thong-ke-loi/count/number_be_chua_chuan_hoa/`)
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
    fetch(`${API_URL}/doi-soat/count/number_both_be_or_csdl/`)
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhBEvsCSDL(data.count ?? 0)) //số kênh khớp cả BE và CSDL
      .catch(err => (setSoKenhBEvsCSDL(0)));// fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/count/number_only_be/`) //số kênh BE 
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhOnlyBe(data.count ?? 0))
      .catch(() => setSoKenhOnlyBe(0)); // fallback nếu fetch lỗi
    fetch(`${API_URL}/doi-soat/count/number_only_csdl/`) //số kênh CSDL 
      .then(res => (res.ok ? res.json() : { count: 0 }))
      .then(data => setSoKenhOnlyCsdl(data.count ?? 0))
      .catch(() => setSoKenhOnlyCsdl(0)); // fallback nếu fetch lỗi
  }, []);
  useEffect(() => {
    const endpoints = [
      "khong_dung_loaihinh",
      "khong_dung_number",
      "khong_dung_accountname",
      "khong_dung_sodich",
      "khong_dung_dichvu",
      "khong_dung_accinfo",
      "khong_dung_trunglap",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 })
          .then(data => data.count ?? 0)
          .catch(() => 0) // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechLoaiHinh(results[0]);
      setSoLechNumber(results[1]);
      setSoLechAccName(results[2]);
      setSoLechSoDich(results[3]);
      setSoLechDichVu(results[4]);
      setSoLechAccInfo(results[5]);
      setSoLechTrung(results[6]);
    });
  }, []);
  // Click để gọi ra số đầu số chỉ có ở BE hoặc ở CSDL

  const thongKeData = [
    { key: "loaihinh", ten: "Sai loại hình", soLuong: soLechLoaiHinh },
    { key: "number", ten: "Number", soLuong: soLechNumber },
    { key: "accname", ten: "Account Name", soLuong: soLechAccName },
    { key: "accinfo", ten: "Account Info", soLuong: soLechAccInfo },
    { key: "sodich", ten: "Số đích", soLuong: soLechSoDich },
    { key: "dichvu", ten: "Sai loại CFU", soLuong: soLechDichVu },
    { key: "trungnumber", ten: "Trùng Number", soLuong: soLechTrung },
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
  const displayTongLechLoaiHinh = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_loaihinh/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechLoaiHinh(data); // data là mảng object thiết bị
      });
  }

  const displayTongLechNumber = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_number/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechNumber(data); // data là mảng object thiết bị
      });
  }

  const displayTongLechAccName = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_accountname/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAccName(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechAccInfo = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_accinfo/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechAccInfo(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechSoDich = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_sodich/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechSoDich(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechDichVu = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_dichvu/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLechDichVu(data); // data là mảng object thiết bị
      });
  }
  const displayTongLechTrung = () => {
    return fetch(`${API_URL}/thong-ke-loi/khong_dung_trunglap/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachTrung(data); // data là mảng object thiết bị
      });
  }

  const displayDanhSach18001900MB = () => {
  return fetch(`${API_URL}/thong-ke-loi/mb/chua-chuan-hoa/`)
    .then((res) => res.json())
    .then((data) => {
      setDanhSachLech18001900MB(data); // data là mảng lớn
      console.log("Số lượng MB:", data.length);
    })
    .catch((err) => console.error("Lỗi load data", err));
  };
  const displayDanhSach18001900MN = () => {
    return fetch(`${API_URL}/thong-ke-loi/mn/chua-chuan-hoa/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachLech18001900MN(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDsKhopBEvsCSDL = () => {
    return fetch(`${API_URL}/doi-soat/number_both_be_or_csdl/`)
      .then((res) => res.json())
      .then((data) => {
        setDanhSachDsAaBothSide(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDs18001900OnlyBe = () => {
    return fetch(`${API_URL}/doi-soat/number_only_be/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data OnlyBE:", data);
        setDanhSachDsAaOnlyBe(data); // data là mảng object thiết bị
      });
  }
  const displayDanhSachDs18001900OnlyCsdl = () => {
    return fetch(`${API_URL}/doi-soat/number_only_csdl/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data OnlyCsdl:", data);
        setDanhSachDsAaOnlyCsdl(data); // data là mảng object thiết bị
      });
  }
  
  const displayDoiSoatAccName = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_acc_name/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatAccName(data);
      });
  };

  const displayDoiSoatSoDich = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_sodich/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatSoDich(data);
      });
  };
  const displayDoiSoatThanhLy = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_thanh_ly/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatThanhLy(data);
      });
  };
  const displayDoiSoatTamNgung = () => {
    setLoaiBangTron(null)
    return fetch(`${API_URL}/doi-soat/lech_tam_ngung/`)
      .then((res) => res.json())
      .then((data) => {
        setSoDoiSoatTamNgung(data);
      });
  };
 
  const displayTongHopKhac = (apiKeys: string[]) => {
    setLoaiBangTron(null)
    // Tạo mảng Promise để fetch từng API
    const fetches = apiKeys.map((key) => {
      let endpoint = "";
      switch (key) {
        case "ds_accname": endpoint = "lech_acc_name"; break;
        case "ds_sodich": endpoint = "lech_destination"; break;
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
  const displayDoiSoatOnlyBe = () => {
    //  setLoading(true);                // ⚙️ bật trạng thái loading
    setSoDoiSoatOnlyBe([]);          // ✅ reset dữ liệu cũ

    fetch(`${API_URL}/doi-soat/number_only_be/`)
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
    // .finally(() => setLoading(false)); // ✅ tắt loading
  };

  const displayDoiSoatOnlyCsdl = () => {
    setSoDoiSoatOnlyCsdl([]);          // ✅ reset dữ liệu cũ
    fetch(`${API_URL}/doi-soat/number_only_csdl/`)
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
    // .finally(() => setLoading(false)); // ✅ tắt loading
  };

  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 30 }
  });
  const sortedData = [...thongKeData].sort((a, b) => b.soLuong - a.soLuong);

  // 🔹 Định nghĩa handlers theo key
  const handlers = {
    loaihinh: () => { setShowBang(true); setLoadingDs(true); displayTongLechLoaiHinh().finally(() => setLoadingDs(false)); setLoaiBang("loaihinh"); setLoaiBangTron(null); },
    number: () => { setShowBang(true); setLoadingDs(true);displayTongLechNumber().finally(() => setLoadingDs(false)); setLoaiBang("number"); setLoaiBangTron(null); },
    accname: () => {setShowBang(true); setLoadingDs(true); displayTongLechAccName().finally(() => setLoadingDs(false)); setLoaiBang("accname"); setLoaiBangTron(null); },
    accinfo: () => {setShowBang(true); setLoadingDs(true); displayTongLechAccInfo().finally(() => setLoadingDs(false)); setLoaiBang("accinfo"); setLoaiBangTron(null); },
    sodich: () => { setShowBang(true); setLoadingDs(true);displayTongLechSoDich().finally(() => setLoadingDs(false)); setLoaiBang("sodich"); setLoaiBangTron(null); },
    dichvu: () => { setShowBang(true); setLoadingDs(true);displayTongLechDichVu().finally(() => setLoadingDs(false)); setLoaiBang("dichvu"); setLoaiBangTron(null); },
    trungnumber: () => { setShowBang(true); setLoadingDs(true);displayTongLechTrung().finally(() => setLoadingDs(false)); setLoaiBang("trung"); setLoaiBangTron(null); },
  };
  //  "loaihinh"
  //     | "number"
  //     | "accname"
  //     | "accinfo"
  //     | "sodich"
  //     | "des"
  //     | "sipinfo"
  //     | "route"
  //     | "trung"
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

                background: 'linear-gradient(135deg,  #099c7cff 0%, #44dbbbff 50%, #cebcebff 100%)',
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
                    1800/1900 TOÀN QUỐC
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
          {/* <div style={{ width: '20%',height: '50vh' }}> */}

          {/* Cột 3: thống kê chưa chuẩn hoá */}
          {/* <div className="box_trai_zone1" style={{ width: '50%', height: '50vh', position: 'relative' }}>
            <h2 className="text_display_tren">THỐNG KÊ CHƯA CHUẨN HOÁ TRÊN BE</h2>
            <Pie3DChart onZoneClick={handleClickPieSlice} />  

          </div> */}
          <div
          className="box_trai_zone1"
          style={{
            width: "50%",
            height: "60vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 className="text_display_tren">THỐNG KÊ CHƯA CHUẨN HOÁ TRÊN BE</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            className="soKenhBox" style={{ width: '50%', height: '15vh' }}>
            <Circle_box_TQ_chuanhoa/>
          </div>
          {/* <div style={{ height: '50vh', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> */}
            <Circle_box_TQ onZoneClick={handleClickPieSlice} />
          
        </div>
       </div>
          {/* Cột 4: đối soát BE - CSDL */}
          <div className="box_phai_zone1" style={{ width: '50%', height: '60vh', position: 'relative' }}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
            <Circle_Box_ds_TQ onZoneClick={handleClickPieSlice_ds} />
          </div>
        </div>


        {/* Khung zone 3*/}
        {/* Các cột nửa bên trái, hiển thị chưa chuẩn hoá */}
        <div style={{ marginTop: "20px", display: 'flex', gap: '20px', height: '70vh' }}>
          <div className="box_trai_zone2_aa" style={{ width: '50%' }}>
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

            <div className="box_phai_zone2_aa">
              <h2 className="text_display_tren">DANH SÁCH SAI LỆCH GIỮA BE VÀ CSDL</h2>
              <BoxThongKe onClickBox={handleBoxClick}/>
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

              {loaiBangTron === "18001900mienbac" && (
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
                <BangThongTin title="Danh sách chưa chuẩn hoá Miền Bắc" data={danhSachLech18001900MB} onClose={handleCloseTable} />
              )}
              {loaiBangTron === "18001900miennam" && (
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
                <BangThongTin title="Danh sách chưa chuẩn hoá Miền Nam" data={danhSachLech18001900MN} onClose={handleCloseTable} />
              )}
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
                  :<BangThongTin title="Danh sách sai loại hình" data={danhSachLechLoaiHinh} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Number" data={danhSachLechNumber} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Account Name" data={danhSachLechAccName} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá Account Infomation" data={danhSachLechAccInfo} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá số đích" data={danhSachLechSoDich} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách chưa chuẩn hoá loại CFU" data={danhSachLechDichVu} onClose={handleCloseTable} />
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
                  :<BangThongTin title="Danh sách trùng lặp Number" data={danhSachTrung} onClose={handleCloseTable} />
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
                <BangThongTinDoiSoatTQ title="Danh sách đầu số có cả trên BE và CSDL" data={danhSachDsAaBothSide} onClose={handleCloseTable} />
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
                  <BangThongTinDoiSoatTQ title="Danh sách đầu số chỉ có trên BE" data={danhSachDsAaOnlyBe} onClose={handleCloseTable} />
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
                  <BangThongTinDoiSoatTQ title="Danh sách đầu số chỉ có trên CSDL" data={danhSachDsAaOnlyCsdl} onClose={handleCloseTable} />
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
export default ToanQuoc;

