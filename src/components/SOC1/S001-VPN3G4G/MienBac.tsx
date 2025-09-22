import { useEffect, useState } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,Cell,Label
} from 'recharts';
import BangThongTin from "./Bang_thong_tin";
import BangThongTinDoiSoat from "./Bang_thong_tin_doi_soat";
import Header from "./Header";
import BoxDoiSoat from "./Box_doi_soat";
import Circle_box_MB from "./Circle_box_MB";
import Circle_box_ds_MB from "./Circle_box_ds_MB";
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


interface MienBacProps {
  isDisplayed: boolean;
}

function MienBac({ isDisplayed }: MienBacProps)
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

   

    //Chia loại API để vào dev hoặc production
    // let ENV = "prod"; // hoặc "prod"
    // let ENV = "dev"; // hoặc "prod"
    // let API_URL = "";
    // if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/vpn3g4g";} 
    // else {API_URL = "http://10.155.43.210:8000/api/vpn3g4g";}

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

    const [danhSachDoiSoatAPN, setDanhSachDoiSoatAPN] = useState<DoiSoat[]>([]);
    const [danhSachDoiSoatAPNID, setDanhSachDoiSoatAPNID] = useState<DoiSoat[]>([]);
    const [danhSachDoiSoatPdpcp, setDanhSachDoiSoatPdpcp] = useState<DoiSoat[]>([]);
    const [danhSachDoiSoatHss, setDanhSachDoiSoatHss] = useState<DoiSoat[]>([]);
    const [danhSachDoiSoatIpsim, setDanhSachDoiSoatIpsim] = useState<DoiSoat[]>([]);
    const [danhSachDoiSoatPgw, setDanhSachDoiSoatPgw] = useState<DoiSoat[]>([]);
    
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1",
    "#a4de6c", "#d0ed57", "#d88884", "#84c2d8", "#c084d8", "#f6b26b"
  ];
  const [loaiBang, setLoaiBang] = useState<string | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [tieuDe, setTieuDe] = useState("");
  
  const [loaiBangTron, setLoaiBangTron] = useState<"tenapn" | "pgw" | "ip" |"ipsim" | "ippgw"| 
                                        "vlan"|"ospf"| "apnid" | "pdpcp" |"hss" | 
                                        "ds_apn"| "ds_apnid"| "ds_pdpcp" | "ds_hss"| "ds_ipsim"| "ds_pgw"|
                                        null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
//     const handleBoxClick = (dataMoi, tieuDeMoi, loaiBangMoi) => {
//   setDataBang(dataMoi);
//   setTieuDe(tieuDeMoi);
//   setLoaiBang(loaiBangMoi);  // ✅ mới thêm
// };
const handleBoxClick = (
  dataMoi: any[], // hoặc bạn tạo interface cụ thể
  tieuDeMoi: string,
  loaiBangMoi: string
) => {
  setDataBang(dataMoi);
  setTieuDe(tieuDeMoi);
  setLoaiBang(loaiBangMoi);
};
 const handleClickPieSlice = (index: number) => {
  // reset loaiBang khi chọn loaiBangTron
  console.log("Click index:", index); // 👈 kiểm tra log này
  setSelectedIndex(index);
 if (index === 0) {
    setLoaiBangTron("tenapn");
    displayDanhSachTenAPN();
  } else if (index === 1) {
    setLoaiBangTron("pgw");
    displayDanhSachPGW();
  } else if (index === 2) {
    setLoaiBangTron("ip");
    displayDanhSachIP();
  } else if (index === 3) {
    setLoaiBangTron("ipsim");
    displayDanhSachIpSim();
  } else if (index === 4) {
    setLoaiBangTron("ippgw");
    displayDanhSachIpPgw();
  } else if (index === 5) {
    setLoaiBangTron("vlan");
    displayDanhSachVlan();
  } else if (index === 6) {
    setLoaiBangTron("ospf");
    displayDanhSachOspf();
  } else if (index === 7) {
    setLoaiBangTron("apnid");
    displayDanhSachApnid();
  } else if (index === 8) {
    setLoaiBangTron("pdpcp");
    displayDanhSachPdpcp();
  } else if (index === 9) {
    setLoaiBangTron("hss");
    displayDanhSachHss();
  } 
  else {
    setLoaiBangTron(null);
  }
}
  const handleClickPieSlice_ds = (index: number) => {
  // reset loaiBang khi chọn loaiBangTron
  console.log("Click index:", index); // 👈 kiểm tra log này
  setSelectedIndex(index);
   if (index === 0) {
    setLoaiBangTron("ds_apn");
    displayDanhSachDsAPN();
  } else if (index === 1) {
    setLoaiBangTron("ds_apnid");
    displayDanhSachDsApnid();
    } 
  else if (index === 2) {
    setLoaiBangTron("ds_pdpcp");
    displayDanhSachDsPdpcp();
  } else if (index === 3) {
    setLoaiBangTron("ds_hss");
    displayDanhSachDsHss();
  } else if (index === 4) {
    setLoaiBangTron("ds_ipsim");
    displayDanhSachDsIpsim();
  } else if (index === 5) {
    setLoaiBangTron("ds_pgw");
    displayDanhSachDsPgw();
  } 
  else {
    setLoaiBangTron(null);
  }
}

  
  //Các action gọi bảng
  const displayDanhSachTenAPN = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_apn/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechAPN(data); // data là mảng object thiết bị
    });}

    const displayDanhSachPGW = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_pgw/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechPGW(data); // data là mảng object thiết bị
    });}
    const displayDanhSachIP = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_ipsim/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechIpSim(data); // data là mảng object thiết bị
    });}
    const displayDanhSachIpSim = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_daiip/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechDaiIp(data); // data là mảng object thiết bị
    });}
    const displayDanhSachIpPgw = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_ippgw/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechIpGw(data); // data là mảng object thiết bị
    });}
    const displayDanhSachVlan = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_vlan/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechVlan(data); // data là mảng object thiết bị
    });}
    const displayDanhSachOspf = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_ospf/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechOspf(data); // data là mảng object thiết bị
    });}
    const displayDanhSachApnid = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_apnid/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechApnid(data); // data là mảng object thiết bị
    });}
    const displayDanhSachPdpcp = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_pdpcp/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechPdpcp(data); // data là mảng object thiết bị
    });}
    const displayDanhSachHss = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_dung_hss/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechHss(data); // data là mảng object thiết bị
    });}
    const displayTongLechTrung = () =>{
    fetch(`${API_URL}/thong-ke-loi/mb/khong_trung_lap/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechTrunglap(data); // data là mảng object thiết bị
    });}

    const displayDanhSachDsAPN = () =>{
    fetch(`${API_URL}/doi_soat/mb/lech_APN/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDoiSoatAPN(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsApnid = () =>{
    fetch(`${API_URL}/doi_soat/mb/lech_APNID/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDoiSoatAPNID(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsPdpcp = () =>{
    fetch(`${API_URL}/doi_soat/mb/lech_PDPCP/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDoiSoatPdpcp(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsHss = () =>{
    fetch(`${API_URL}/doi_soat/mb/lech_Hss/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDoiSoatHss(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsIpsim = () =>{
    fetch(`${API_URL}/doi_soat/mb/lech_IP/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDoiSoatIpsim(data); // data là mảng object thiết bị
    });}

    const displayDanhSachDsPgw = () =>{
    fetch(`${API_URL}/doi_soat/mb/lech_Pgw/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDoiSoatPgw(data); // data là mảng object thiết bị
    });}
    const headerAnimation = useSpring({
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
            config: { tension: 300, friction: 30 }
            });
    return (
    <>
    <div style={{ width: '100%'}}>
    {/* Khung hiển thị chữ Miền Bắc */}
        <div style={{ width: '25%'}}>
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
                MIỀN BẮC
                </h1>
            </div>
            </Container>
        </animated.div>
        </div>
    {/*Zone 1: Khung 2 ô tròn thể hiện dữ liệu miền Bắc */}
      <div  style={{ marginTop: "10px", display: 'flex', gap: '20px' }}>
      {/* Cột bên trái: khối thống kê */}
        <div className= "box_trai_zone1" style={{ width: '50%', height:'400px'}}>
            <h2 className="text_display_tren">DANH SÁCH KHÁCH HÀNG CHƯA CHUẨN HOÁ BE</h2>
                <Circle_box_MB onZoneClick={handleClickPieSlice} isDisplayed={isDisplayed}/>  {/* ✅ truyền callback */}
        
        </div>
        <div className= "box_phai_zone1" style={{ width: '50%', height:'400px'}}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
                <Circle_box_ds_MB onZoneClick={handleClickPieSlice_ds} isDisplayed={isDisplayed} />  {/* ✅ truyền callback */}
        </div>
      </div>
       {/* Khung zone 2*/}
      
    <hr style={{ margin: '40px 0', border: '2.5', borderTop: '2px solid #ccc' }} />
    
      {loaiBangTron === "tenapn" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá tên APN" data={danhSachLechAPN}  />
      )}
      {loaiBangTron === "pgw" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá PGW" data={danhSachLechPGW} />
      )}
      {loaiBangTron === "ip" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá IP cho SIM" data={danhSachIpSim} />
      )}
      {loaiBangTron === "ipsim" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá dải IP" data={danhSachDaiIp} />
      )}
      {loaiBangTron === "ippgw" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá IP Gateway" data={danhSachIpGw} />
      )}
      {loaiBangTron === "vlan" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá VLAN" data={danhSachVlan} />
      )}
      {loaiBangTron === "ospf" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá OSPF Area" data={danhSachOspf} />
      )}
      {loaiBangTron === "apnid" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá HLR APNID" data={danhSachApnid} />
      )}
      {loaiBangTron === "pdpcp" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá HLR PDPCP" data={danhSachPdpcp} />
      )}
      {loaiBangTron === "hss" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá HSS Profile" data={danhSachHss} />
      )}
      
      {loaiBangTron === "ds_apn" && (
        <BangThongTinDoiSoat title="Danh sách lệch APN giữa BE và CSDL" data={danhSachDoiSoatAPN} />
      )}
      {loaiBangTron === "ds_apnid" && (
        <BangThongTinDoiSoat title="Danh sách lệch HLR APNID giữa BE và CSDL" data={danhSachDoiSoatAPNID} />
      )}
      {loaiBangTron === "ds_pdpcp" && (
        <BangThongTinDoiSoat title="Danh sách lệch HLR PDPCP giữa BE và CSDL" data={danhSachDoiSoatPdpcp} />
      )}
      {loaiBangTron === "ds_hss" && (
        <BangThongTinDoiSoat title="Danh sách lệch HSS Profile giữa BE và CSDL" data={danhSachDoiSoatHss} />
      )}
      {loaiBangTron === "ds_ipsim" && (
        <BangThongTinDoiSoat title="Danh sách lệch loại IP của SIM giữa BE và CSDL" data={danhSachDoiSoatIpsim} />
      )}
      {loaiBangTron === "ds_pgw" && (
        <BangThongTinDoiSoat title="Danh sách lệch PGW giữa BE và CSDL" data={danhSachDoiSoatPgw} />
      )}
      </div>
</>);
  }
export default MienBac;



