import React from "react";
import { Tabs } from "antd";
import TacDongTram from "../TacDongTram/TacDongTram";
import LichSuCR from "../LichSuCR/LichSuCR";
import CellXau from "../CellXau/CellXau";
import LichSuPhieu from "../LichSuPhieu/LichSuPhieu";

const R012Tabs: React.FC = () => {
  const items = [
    {
      key: "tab1",
      label: "Tác động trạm",
      children: <TacDongTram />,
    },
    {
      key: "tab2",
      label: "Lịch sử CR",
      children: <LichSuCR />,
    },
    // DOI CHO tab "Lich su phieu" LEN TRUOC "Cell xau" (truoc day nguoc lai). Ly do: 3 tab Tac dong tram /
    // Lich su CR / Lich su phieu deu la NOI DUNG CUA R012, doc CUNG 1 BE (FastAPI R012) va la 3 buoc lien
    // tiep cua cung quy trinh (tac dong tram -> theo doi CR -> xuat phieu) - phai nam lien nhau de NOC di
    // tu trai sang phai dung theo trinh tu lam viec. "Cell xau" la module S006-CELL cua HE THONG SOC RIENG
    // (BE khac han, xem comment ben duoi) chi duoc nhung nho vao day, nen day XUONG CUOI de khong cat ngang
    // mach 3 tab R012.
    // GIU NGUYEN key "tab3"/"tab4" da gan voi tung noi dung (khong danh so lai theo vi tri moi): key chi la
    // dinh danh noi bo cua antd Tabs, doi no khong lam thay doi thu tu hien thi ma chi tao rui ro cho bat ky
    // cho nao dang tro toi key cu.
    {
      key: "tab4",
      label: "Lịch sử phiếu",
      children: <LichSuPhieu />,
    },
    {
      key: "tab3",
      label: "Cell xấu",
      // Module S006-CELL, goi truc tiep BE ben SOC (10.155.43.210:8000/api/cell) qua apiConfig.tsx
      // rieng cua no, KHONG qua BE cua R012 - xem CellXau/apiConfig.tsx
      children: <CellXau />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        padding: "0.5rem 1rem",
      }}
    >
      <Tabs defaultActiveKey="tab1" items={items} />
    </div>
  );
};

export default R012Tabs;
