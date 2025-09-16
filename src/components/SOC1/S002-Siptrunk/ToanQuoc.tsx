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
import BangThongTinDoiSoatTQ from "./Bang_thong_tin_doi_soat_TQ";
// import BoxDoiSoat from "./Box_doi_soat";
import Circle_box_TQ from "./Circle_box_TQ";
import Circle_Box_ds_TQ from "./Circle_Box_ds_TQ";
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
// type ToanQuocProps = {
//   onChangeTab: (tab: string) => void;
// };
function ToanQuoc()
  {
type ThietBi = {
  TENANT_ID: string;
  ACCOUNT_NAME : string;
  ACC_INFO : string;
  MAX_CHANNELS : string;
  ADDRESS_NUMBER : string;
  ADDRESS_DISABLE : string;
  ADDRESS_INCOMING : string;
  ROUTING_TABLE_NAME : string;
  GROUP_ID : string;
  SIPTRUNK_NAME : string;
  SIPTRUNK_INFO : string;
  SIP_CONTACT : string;
  Khu_vuc : string;
  Ghi_chu : string;
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
  Ghi_chu: string
};
  
    const [soLechNumber, setSoLechNumber] = useState(0);
    const [soLechAccName, setSoLechAccName] = useState(0);
    const [soLechAccInfo, setSoLechAccInfo] = useState(0);
    const [soLechChannel, setSoLechChannel] = useState(0);
    const [soLechDes, setSoLechDes] = useState(0);
    const [soLechTennantID, setSoLechTennantID] = useState(0);
    const [soLechSipInfo, setSoLechSipInfo] = useState(0);
    const [soLechRoute, setSoLechRoute] = useState(0);
    const [soLechGroupID, setSoLechGroupID] = useState(0);
    const [soLechTrung, setSoLechTrung] = useState(0);
    

    const [danhSachLechNumber, setDanhSachLechNumber] = useState<ThietBi[]>([]);
    const [danhSachLechAccName, setDanhSachLechAccName] = useState<ThietBi[]>([]);
    const [danhSachLechAccInfo, setDanhSachLechAccInfo] = useState<ThietBi[]>([]);
    const [danhSachLechChannel, setDanhSachLechChannel] = useState<ThietBi[]>([]);
    const [danhSachLechDes, setDanhSachLechDes] = useState<ThietBi[]>([]);
    const [danhSachLechSipInfo, setDanhSachLechSipInfo] = useState<ThietBi[]>([]);
    const [danhSachLechRoute, setDanhSachLechRoute] = useState<ThietBi[]>([]);
    const [danhSachLechGroupID, setDanhSachLechGroupID] = useState<ThietBi[]>([]);
    const [danhSachTrung, setDanhSachTrung] = useState<ThietBi[]>([]);
    // const [danhSachTrunglap, setDanhSachLechTrunglap] = useState<ThietBi[]>([]);

    const [danhSachLechAaMB, setDanhSachLechAaMB] = useState<ThietBi[]>([]);
    const [danhSachLechAaMN, setDanhSachLechAaMN] = useState<ThietBi[]>([]);
    
    const [danhSachDsAaMB, setDanhSachDsAaMB] = useState<DoiSoat[]>([]);
    const [danhSachDsAaMN, setDanhSachDsAaMN] = useState<DoiSoat[]>([]);
    

    type LoaiBangTron = 
  | "aaranetmienbac"
  | "aaranetmiennam"
  | "imsmienbac"
  | "imsmiennam"
  | "aamienbac_ds"
  | "aamiennam_ds"
  | "imsmienbac_ds"
  | "imsmiennam_ds";

type LoaiBang =
  | "number"
  | "accname"
  | "accinfo"
  | "kenh"
  | "des"
  | "sipinfo"
  | "route"
  | "groupid"
  | "trung"

  | "hss"
  | "ds_apn"
  | "ds_apnid"
  | "ds_pdpcp"
  | "ds_hss"
  | "ds_ip"
  | "ds_pgw";

  const colors = [
    "hsla(243, 81%, 72%, 1.00)", "hsla(143, 86%, 61%, 0.90)", "hsla(40, 87%, 63%, 1.00)", "rgba(207, 105, 68, 1)", "#8dd1e1",
    "#a4de6c", "#5cfafaff", "#d88884", "#87bbceff", "#c084d8", "#e8f66bff"
  ];
  const [loaiBang, setLoaiBang] = useState<string | null>(null);
  // const [loaiBang, setLoaiBang] = useState<LoaiBang | null>(null);
  const [dataBang, setDataBang] = useState([] as any[]);
  const [loaiBangTron, setLoaiBangTron] = useState<"aaranetmienbac" | "aaranetmiennam" | "aamienbac_ds" | "aamiennam_ds"| 
                                                  "imsmienbac"| "imsmiennam"| "imsmienbac_ds"| "imsmiennam_ds"|null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tieuDe, setTieuDe] = useState("");

  //Chia loại API để vào dev hoặc production
  const ENV = "dev"; // hoặc "prod"
  let API_URL = "";
  if (ENV === "dev") {API_URL = "http://127.0.0.1:8001";} 
  else {API_URL = "http://10.155.43.210:8000";}

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
  console.log("Click index:", index); // 👈 kiểm tra log này
  setSelectedIndex(index);
 if (index === 0) {
    setLoaiBangTron("aaranetmienbac");
    displayDanhSachAaMB();
  } else if (index === 1) {
    setLoaiBangTron("aaranetmiennam");
    displayDanhSachAaMN();
  } 
}
const handleClickPieSlice_ds = (index: number) => {
  console.log("Click index:", index); // 👈 kiểm tra log này
  setSelectedIndex(index);
 if (index === 0) {
    setLoaiBangTron("aamienbac_ds");
    displayDanhSachDsAaMB();}
  else if (index === 1) {
    setLoaiBangTron("aamiennam_ds");
    displayDanhSachDsAaMN();
  } 
}
    
    useEffect(() => {
    const endpoints = [
      "khong_dung_number",
      "khong_dung_accountname",
      "khong_dung_accountinfo",
      "khong_dung_kenh",
      "khong_dung_sip_contact",
      "khong_dung_sip_info",
      "khong_dung_routing",
      "khong_dung_group",
      "khong_dung_trung_number",
    ];

    Promise.all(
      endpoints.map(ep =>
        fetch(`${API_URL}/api/siptrunk/thong-ke-loi/count/${ep}/`)
          .then(res => res.ok ? res.json() : { count: 0 })
          .then(data => data.count ?? 0)
          .catch(() => 0) // fallback nếu fetch lỗi
      )
    ).then(results => {
      setSoLechNumber(results[0]);
      setSoLechAccName(results[1]);
      setSoLechAccInfo(results[2]);
      setSoLechChannel(results[3]);
      setSoLechDes(results[4]);
      setSoLechSipInfo(results[5]);
      setSoLechRoute(results[6]);
      setSoLechGroupID(results[7]);
      setSoLechTrung(results[8]);
    });
  }, []);

  const thongKeData = [
    { ten: "Number", soLuong: soLechNumber },
    { ten: "Account Name", soLuong: soLechAccName },
    { ten: "Account Info", soLuong: soLechAccInfo },
    { ten: "Max channels", soLuong: soLechChannel },
    { ten: "Destination", soLuong: soLechDes },
    { ten: "Sip Info", soLuong: soLechSipInfo },
    { ten: "Route Name", soLuong: soLechRoute },
    { ten: "Group ID", soLuong: soLechGroupID },
    { ten: "Trung number", soLuong: soLechTrung },
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
  const displayTongLechNumber = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_number/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechNumber(data); // data là mảng object thiết bị
    });}

    const displayTongLechAccName = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_accountname/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechAccName(data); // data là mảng object thiết bị
    });}
    const displayTongLechAccInfo = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_accountinfo/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechAccInfo(data); // data là mảng object thiết bị
    });}
    const displayTongLechChannel = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_kenh/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechChannel(data); // data là mảng object thiết bị
    });}
    const displayTongLechDes = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_sip_contact/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechDes(data); // data là mảng object thiết bị
    });}
    const displayTongLechSipInfo = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_sip_info/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechSipInfo(data); // data là mảng object thiết bị
    });}
    const displayTongLechRoute = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_routing/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechRoute(data); // data là mảng object thiết bị
    });}
    const displayTongLechGroupID = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_group/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechGroupID(data); // data là mảng object thiết bị
    });}
    const displayTongLechTrung = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/khong_dung_trung_number/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachTrung(data); // data là mảng object thiết bị
    });}

    const displayDanhSachAaMB = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/mb/total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechAaMB(data); // data là mảng object thiết bị
    });}
    const displayDanhSachAaMN = () =>{
    fetch(`${API_URL}/api/siptrunk/thong-ke-loi/mn/total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachLechAaMN(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsAaMB = () =>{
    fetch(`${API_URL}/api/siptrunk/doi-soat/mb/total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDsAaMB(data); // data là mảng object thiết bị
    });}
    const displayDanhSachDsAaMN = () =>{
    fetch(`${API_URL}/api/siptrunk/doi-soat/mn/total/`)
      .then((res) => res.json())
      .then((data) => {
      setDanhSachDsAaMN(data); // data là mảng object thiết bị
    });}

    const headerAnimation = useSpring({
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
            config: { tension: 300, friction: 30 }
            });


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
          <Circle_box_TQ onZoneClick={handleClickPieSlice} />  {/* ✅ truyền callback */}
        </div>
        <div className= "box_phai_zone1" style={{ width: '40%', height:'400px'}}>
            <h2 className="text_display_tren">THỐNG KÊ ĐỐI SOÁT BE VÀ CSDL</h2>
            {/* <Circle_Box_ds_TQ onZoneClick={handleClickPieSlice_ds}/> */}
        </div>
      </div>
    
       {/* Khung zone 2*/}
      <div  style={{ marginTop: "20px", display: 'flex', gap: '20px' }}>
        <div className = "box_trai_zone2" style={{ width: '50%', height:'420px'}}>
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
                  () => { displayTongLechNumber(); setLoaiBang("number"); },
                  () => { displayTongLechAccName(); setLoaiBang("accname"); },
                  () => { displayTongLechAccInfo(); setLoaiBang("accinfo"); },
                  () => { displayTongLechChannel(); setLoaiBang("kenh"); },
                  () => { displayTongLechDes(); setLoaiBang("des"); },
                  () => { displayTongLechSipInfo(); setLoaiBang("sipinfo"); },
                  () => { displayTongLechRoute(); setLoaiBang("route"); },
                  () => { displayTongLechGroupID(); setLoaiBang("groupid"); },
                  () => { displayTongLechTrung(); setLoaiBang("trung"); },
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

        {/* <div className= "box_phai_zone2" style={{ width: '50%', height:'420px'}}>
          <BoxDoiSoat onClickBox={handleBoxClick} />
        </div> */}
      </div>
    <hr style={{ margin: '40px 0', border: '2.5', borderTop: '2px solid #ccc' }} />
    <div style={{ width: '95%'}}>
      {/* {loaiBangTron === "aaranetmienbac" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Bắc" data={danhSachLechAaMB}  />
      )}
      {loaiBangTron === "aaranetmiennam" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Nam" data={danhSachLechAaMN}  />
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
      )} */}
      {loaiBangTron === "aaranetmienbac" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Bắc" data={danhSachLechAaMB}  />
      )}
      {loaiBangTron === "aaranetmiennam" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Miền Nam" data={danhSachLechAaMN}  />
      )}
      {loaiBang === "number" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Number" data={danhSachLechNumber}  />
      )}
      {loaiBang === "accname" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Account Name" data={danhSachLechAccName} />
      )}
      {loaiBang === "accinfo" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Account Infomation" data={danhSachLechAccInfo} />
      )}
      {loaiBang === "kenh" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá số lượng kênh" data={danhSachLechChannel} />
      )}
      {loaiBang === "des" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Destination" data={danhSachLechDes} />
      )}
      {loaiBang === "sipinfo" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Sip Infomation" data={danhSachLechSipInfo} />
      )}
      {loaiBang === "route" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Route Table Name" data={danhSachLechRoute} />
      )}
      {loaiBang === "groupid" && (
        <BangThongTin title="Danh sách chưa chuẩn hoá Group ID" data={danhSachLechGroupID} />
      )}
      {loaiBang === "trung" && (
        <BangThongTin title="Danh sách trùng lặp Number" data={danhSachTrung} />
      )}
      {loaiBangTron === "aamienbac_ds" && (
        <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát Miền Bắc" data={danhSachDsAaMB}  />
      )}
      {loaiBangTron === "aamiennam_ds" && (
        <BangThongTinDoiSoatTQ title="Danh sách lệch đối soát Miền Nam" data={danhSachDsAaMN}  />
      )}
      </div>
      </div>
</>);
  }
export default ToanQuoc;
