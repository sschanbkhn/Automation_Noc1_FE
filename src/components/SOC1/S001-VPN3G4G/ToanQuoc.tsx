import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Label, ResponsiveContainer
} from 'recharts';
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoat from "./Bang_thong_tin_doi_soat";

import BoxDoiSoat from "./Box_doi_soat";
import Circle_box_TQ from "./Circle_box_TQ";
import Circle_Box_ds_TQ from "./Circle_Box_ds_TQ";
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import API_URL from "./apiConfig"
// type ToanQuocProps = {
//   onChangeTab: (tab: string) => void;
// };
interface ToanQuocProps {
  isDisplayed: boolean;
}
function ToanQuoc({ isDisplayed }: ToanQuocProps)
  {
    type ThietBi = {
      ten_apn: string;
      ten_pgw: string;
      ip_cho_sim: string;
      ospf_area: string;
      dai_ip_sim: string;
      ip_pgw: string;
      vlan: string;
      hlr_apnid: string;
      hlr_pdpcp: string;
      hss_profile: string;
      ghi_chu: string;
  };
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
  
    const [soLechAPN, setSoLechAPN] = useState(0);
    const [soLechPGW, setSoLechPGW] = useState(0);
    const [soLechIpSim, setSoLechIpSim] = useState(0);
    const [soLechDaiIp, setSoLechDaiIp] = useState(0);
    const [soLechIpGw, setSoLechIpGw] = useState(0);
    const [soLechVlan, setSoLechVlan] = useState(0);
    const [soLechOspf, setSoLechOspf] = useState(0);
    const [soLechApnid, setSoLechApnid] = useState(0);
    const [soLechPdpcp, setSoLechPdpcp] = useState(0);
    const [soLechHss, setSoLechHss] = useState(0);
    const [soLechTrungLap, setSoLechTrungLap] = useState(0);

    const [danhSachLechAPN, setDanhSachLechAPN] = useState<ThietBi[]>([]);
    const [danhSachLechPGW, setDanhSachLechPGW] = useState<ThietBi[]>([]);
    const [danhSachIpSim, setDanhSachLechIpSim] = useState<ThietBi[]>([]);
    const [danhSachDaiIp, setDanhSachLechDaiIp] = useState<ThietBi[]>([]);
    const [danhSachIpGw, setDanhSachLechIpGw] = useState<ThietBi[]>([]);
    const [danhSachVlan, setDanhSachLechVlan] = useState<ThietBi[]>([]);
    const [danhSachOspf, setDanhSachLechOspf] = useState<ThietBi[]>([]);
    const [danhSachApnid, setDanhSachLechApnid] = useState<ThietBi[]>([]);
    const [danhSachPdpcp, setDanhSachLechPdpcp] = useState<ThietBi[]>([]);
    const [danhSachHss, setDanhSachLechHss] = useState<ThietBi[]>([]);
    const [danhSachTrunglap, setDanhSachLechTrunglap] = useState<ThietBi[]>([]);

    const [danhSachLechMB, setDanhSachLechMB] = useState<ThietBi[]>([]);
    const [danhSachLechMN, setDanhSachLechMN] = useState<ThietBi[]>([]);
    const [danhSachLechMT, setDanhSachLechMT] = useState<ThietBi[]>([]);
    const [danhSachDsMB, setDanhSachDsMB] = useState<DoiSoat[]>([]);
    const [danhSachDsMN, setDanhSachDsMN] = useState<DoiSoat[]>([]);
    const [danhSachDsMT, setDanhSachDsMT] = useState<DoiSoat[]>([]);

    type LoaiBangTron = 
  | "mienbac"
  | "miennam"
  | "mientrung"
  | "mienbac_ds"
  | "miennam_ds"
  | "mientrung_ds";

type LoaiBang =
  | "apn"
  | "pgw"
  | "ipsim"
  | "daiip"
  | "ipgw"
  | "vlan"
  | "ospf"
  | "apnid"
  | "pdpcp"
  | "hss"
  | "trung"
  | "ds_apn"
  | "ds_apnid"
  | "ds_pdpcp"
  | "ds_hss"
  | "ds_ip"
  | "ds_pgw";



  const colors = [
    "hsla(243, 81%, 72%, 1.00)", "hsla(143, 68%, 73%, 0.90)", "hsla(40, 86%, 72%, 1.00)", "rgba(207, 105, 68, 1)", "#8dd1e1",
    "#a4de6c", "#d0ed57", "#d88884", "#84c2d8", "#c084d8", "#f6b26b"
  ];
  const [loaiBang, setLoaiBang] = useState<string | null>(null);
  // const [loaiBang, setLoaiBang] = useState<LoaiBang | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [loaiBangTron, setLoaiBangTron] = useState<"mienbac" | "miennam" | "mientrung" |"mienbac_ds" | "miennam_ds"| "mientrung_ds"|null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tieuDe, setTieuDe] = useState("");
  const [error, setError] = useState<string | null>(null);

  // //Chia loại API để vào dev hoặc production
  // let ENV = "dev"; // hoặc "prod"
  // let API_URL = "";
  // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
  // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}
  
//   // Chia loại API để vào dev hoặc production
// let ENV: "dev" | "prod" = "prod";  // hoặc "dev"
// let API_URL = "";

// if (ENV === "dev") {
//   API_URL = "http://127.0.0.1:8000/api/vpn3g4g";
// } else {
//   API_URL = "http://10.155.43.210:8000/api/vpn3g4g";
// }
const headerAnimation = useSpring({
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
            config: { tension: 300, friction: 30 }
            });
const handleBoxClick = (
  dataMoi: any[], // hoặc bạn tạo interface cụ thể
  tieuDeMoi: string,
  loaiBangMoi: string
) => {
  setLoaiBangTron(null);
  setDataBang(dataMoi);
  setTieuDe(tieuDeMoi);
  setLoaiBang(loaiBangMoi);
};

 const handleClickPieSlice = (index: number) => {
  // reset loaiBang khi chọn loaiBangTron
  setLoaiBang(null);
  console.log("Click index:", index); // 👈 kiểm tra log này
  setSelectedIndex(index);
 if (index === 0) {
    setLoaiBangTron("mienbac");
    displayDanhSachMB();
  } else if (index === 2) {
    setLoaiBangTron("miennam");
    displayDanhSachMN();
  } else if (index === 1) {
    setLoaiBangTron("mientrung");
    displayDanhSachMT();
  // } else {
  //   setLoaiBangTron(null);
  }
}
const handleClickPieSlice_ds = (index: number) => {
  // reset loaiBang khi chọn loaiBangTron
  setLoaiBang(null);
  console.log("Click index:", index); // 👈 kiểm tra log này
  setSelectedIndex(index);
 if (index === 0) {
    setLoaiBangTron("mienbac_ds");
    displayDanhSachDsMB();}
  else if (index === 1) {
    setLoaiBangTron("mientrung_ds");
    displayDanhSachDsMT();
  } else if (index === 2) {
    setLoaiBangTron("miennam_ds");
    displayDanhSachDsMN();
  }
}
 
    useEffect(() => {
     if (!isDisplayed) {
        setError(null); // reset lỗi
        // reset dữ liệu
        setSoLechAPN(0);
        setSoLechPGW(0);
        setSoLechIpSim(0);
        setSoLechDaiIp(0);
        setSoLechIpGw(0);
        setSoLechVlan(0);
        setSoLechOspf(0);
        setSoLechApnid(0);
        setSoLechPdpcp(0);
        setSoLechHss(0);
        setSoLechTrungLap(0);
        return;
      }
    setError(null); // reset lỗi trước khi fetch
    const endpoints = [
      "khong_dung_apn",
      "khong_dung_pgw",
      "khong_dung_ipsim",
      "khong_dung_daiip",
      "khong_dung_ippgw",
      "khong_dung_vlan",
      "khong_dung_ospf",
      "khong_dung_apnid",
      "khong_dung_pdpcp",
      "khong_dung_hss",
      "khong_trung_lap"
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/thong-ke-loi/count/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 })
          .then(data => data.count ?? 0)
          .catch(() => 0) // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechAPN(results[0]);
      setSoLechPGW(results[1]);
      setSoLechIpSim(results[2]);
      setSoLechDaiIp(results[3]);
      setSoLechIpGw(results[4]);
      setSoLechVlan(results[5]);
      setSoLechOspf(results[6]);
      setSoLechApnid(results[7]);
      setSoLechPdpcp(results[8]);
      setSoLechHss(results[9]);
      setSoLechTrungLap(results[10]);
    });
  }, [isDisplayed]);
  
  //  if (!isDisplayed) {
  //       return (
  //         <div
  //           style={{
  //             fontSize: "24px",       // chữ to hơn
  //             fontWeight: "bold",     // đậm
  //             textAlign: "center",    // căn giữa ngang
  //             marginTop: "20%",       // đẩy xuống giữa màn hình (tương đối)
  //             color: "#555555ff",          // màu xám nhẹ (tùy chỉnh)
  //           }}
  //         >
  //           No Data
  //         </div>
  //       );
  //     }

  //   if (error) {
  //     return <div style={{ color: "red" }}>Error: {error}</div>;
  //   }

  const thongKeData = [
    { ten: "APN", soLuong: soLechAPN },
    { ten: "PGW", soLuong: soLechPGW },
    { ten: "IP SIM", soLuong: soLechIpSim },
    { ten: "Dải IP SIM", soLuong: soLechDaiIp },
    { ten: "IP PGW", soLuong: soLechIpGw },
    { ten: "VLAN", soLuong: soLechVlan },
    { ten: "OSPF", soLuong: soLechOspf },
    { ten: "APNID", soLuong: soLechApnid },
    { ten: "PDPCP", soLuong: soLechPdpcp },
    { ten: "HSS", soLuong: soLechHss },
    { ten: "Trùng Lặp", soLuong: soLechTrungLap },
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
  const displayTongLechAPN = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_apn/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechAPN(data); // data là mảng object thiết bị
    });}

    const displayTongLechPGW = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_pgw/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechPGW(data); // data là mảng object thiết bị
    });}
    const displayTongLechIpSim = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_ipsim/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechIpSim(data); // data là mảng object thiết bị
    });}
    const displayTongLechDaiIp = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_ipsim/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechDaiIp(data); // data là mảng object thiết bị
    });}
    const displayTongLechIpGw = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_ippgw/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechIpGw(data); // data là mảng object thiết bị
    });}
    const displayTongLechVlan = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_vlan/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechVlan(data); // data là mảng object thiết bị
    });}
    const displayTongLechOspf = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_ospf/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechOspf(data); // data là mảng object thiết bị
    });}
    const displayTongLechApnid = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_apnid/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechApnid(data); // data là mảng object thiết bị
    });}
    const displayTongLechPdpcp = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_pdpcp/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechPdpcp(data); // data là mảng object thiết bị
    });}
    const displayTongLechHss = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_dung_hss/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechHss(data); // data là mảng object thiết bị
    });}
    const displayTongLechTrung = () =>{
    fetch(`${API_URL}/thong-ke-loi/khong_trung_lap/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechTrunglap(data); // data là mảng object thiết bị
    });}

    const displayDanhSachMB = () =>{
    fetch(`${API_URL}/thong-ke-loi/MB_total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechMB(data); // data là mảng object thiết bị
    });}
    const displayDanhSachMN = () =>{
    fetch(`${API_URL}/thong-ke-loi/MN_total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechMN(data); // data là mảng object thiết bị
    });}
    const displayDanhSachMT = () =>{
    fetch(`${API_URL}/thong-ke-loi/MT_total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechMT(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsMB = () =>{
    fetch(`${API_URL}/doi_soat/MB_total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDsMB(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsMT = () =>{
    fetch(`${API_URL}/doi_soat/MT_total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDsMT(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsMN = () =>{
    fetch(`${API_URL}/doi_soat/MN_total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDsMN(data); // data là mảng object thiết bị
    });}

    


    return (
    <>
    <div style={{ width: '100%'}}>
    
     {/* Khung zone 1*/}
    {/* Khung hiển thị chữ Miền Bắc */}
      <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
        <div style={{ width: '15%'}}>
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
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '0.02em'
                }}>
                TOÀN QUỐC
                </h1>
                </div>
            </Container>
        </animated.div>
        </div>
        {/* <div  style={{ marginTop: "10px", display: 'flex', gap: '20px' }}> */}
          {/* Cột bên trái: khối thống kê */}
          <div className = "box_trai_zone1" style={{ width: '40%', height:'400px'}}>
          <h2 className="text_display_tren">THỐNG KÊ CHƯA CHUẨN HOÁ BE</h2>
          <Circle_box_TQ onZoneClick={handleClickPieSlice} isDisplayed={isDisplayed}/>  {/* ✅ truyền callback */}
        </div>
        <div className= "box_phai_zone1" style={{ width: '40%', height:'400px'}}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
            <Circle_Box_ds_TQ onZoneClick={handleClickPieSlice_ds} isDisplayed={isDisplayed}/>
        </div>
      </div>
      

       {/* Khung zone 2*/}
      <div  style={{ marginTop: "20px", display: 'flex', gap: '20px' }}>
        <div className = "box_trai_zone2" style={{ width: '50%', height:'420px'}}>
           {/* Thông báo No Data khi isDisplayed = false */}
        <h2 className="text_display_tren">DANH MỤC LỖI CHUẨN HÓA DỮ LIỆU BE</h2>
        <ResponsiveContainer width="90%" height="90%">
        <BarChart barSize={28} data={thongKeData}>
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
            {thongKeData.map((entry, index) => {
              const handleClick = () => {
                const actions = [
                  () => { displayTongLechAPN(); setLoaiBang("apn");setLoaiBangTron(null); },
                  () => { displayTongLechPGW(); setLoaiBang("pgw"); setLoaiBangTron(null);},
                  () => { displayTongLechIpSim(); setLoaiBang("ipsim");setLoaiBangTron(null); },
                  () => { displayTongLechDaiIp(); setLoaiBang("daiip");setLoaiBangTron(null); },
                  () => { displayTongLechIpGw(); setLoaiBang("ipgw");setLoaiBangTron(null); },
                  () => { displayTongLechVlan(); setLoaiBang("vlan");setLoaiBangTron(null);},
                  () => { displayTongLechOspf(); setLoaiBang("ospf");setLoaiBangTron(null); },
                  () => { displayTongLechApnid(); setLoaiBang("apnid");setLoaiBangTron(null); },
                  () => { displayTongLechPdpcp(); setLoaiBang("pdpcp");setLoaiBangTron(null); },
                  () => { displayTongLechHss(); setLoaiBang("hss");setLoaiBangTron(null); },
                  () => { displayTongLechTrung(); setLoaiBang("trung");setLoaiBangTron(null); }
                ];
                if (index < actions.length) actions[index]();
              };

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  onClick={handleClick}
                  cursor="pointer"
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
        </div>

        <div className= "box_phai_zone2" style={{ width: '50%', height:'420px'}}>
          <BoxDoiSoat onClickBox={handleBoxClick} isDisplayed={isDisplayed}/>
        </div>
      </div>
    <hr style={{ margin: '40px 0', border: '2.5', borderTop: '2px solid #ccc' }} />
    <div style={{ width: '95%'}}>
      {loaiBangTron === "mienbac" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Bắc" data={danhSachLechMB}  />
      )}
      {loaiBangTron === "miennam" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Nam" data={danhSachLechMN}  />
      )}
       {loaiBangTron === "mientrung" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Trung" data={danhSachLechMT}  />
      )}

      {loaiBangTron === "mienbac_ds" && (
        <BangThongTinDoiSoat title="Danh sách lệch đối soát Miền Bắc" data={danhSachDsMB}  />
      )}
      {loaiBangTron === "miennam_ds" && (
        <BangThongTinDoiSoat title="Danh sách lệch đối soát Miền Nam" data={danhSachDsMN}  />
      )}
       {loaiBangTron === "mientrung_ds" && (
        <BangThongTinDoiSoat title="Danh sách lệch đối soát Miền Trung" data={danhSachDsMT}  />
      )}

      {loaiBang === "apn" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá tên APN" data={danhSachLechAPN}  />
      )}
      {loaiBang === "pgw" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá PGW" data={danhSachLechPGW} />
      )}
      {loaiBang === "ipsim" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá IP cho SIM" data={danhSachIpSim} />
      )}
      {loaiBang === "daiip" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá dải IP" data={danhSachDaiIp} />
      )}
      {loaiBang === "ipgw" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá IP Gateway" data={danhSachIpGw} />
      )}
      {loaiBang === "vlan" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá VLAN" data={danhSachVlan} />
      )}
      {loaiBang === "ospf" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá OSPF Area" data={danhSachOspf} />
      )}
      {loaiBang === "apnid" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá HLR APNID" data={danhSachApnid} />
      )}
      {loaiBang === "pdpcp" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá HLR PDPCP" data={danhSachPdpcp} />
      )}
      {loaiBang === "hss" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá HSS Profile" data={danhSachHss} />
      )}
      {loaiBang === "trung" && (
        <BangThongTin title="Danh sách trùng lặp cấu hình" data={danhSachTrunglap} />
      )}

      {loaiBang === "ds_apn" && (
        <BangThongTinDoiSoat title={tieuDe} data={dataBang} />
      )}
      
       {loaiBang === "ds_apnid" && (
        <BangThongTinDoiSoat title={tieuDe} data={dataBang} />
      )}
      {loaiBang === "ds_pdpcp" && (
        <BangThongTinDoiSoat title={tieuDe} data={dataBang} />
      )}
      {loaiBang === "ds_hss" && (
        <BangThongTinDoiSoat title={tieuDe} data={dataBang} />
      )}
      {loaiBang === "ds_ip" && (
        <BangThongTinDoiSoat title={tieuDe} data={dataBang} />
      )}
      {loaiBang === "ds_pgw" && (
        <BangThongTinDoiSoat title={tieuDe} data={dataBang} />
      )}
      </div>
      </div>
</>);
  }
export default ToanQuoc;
