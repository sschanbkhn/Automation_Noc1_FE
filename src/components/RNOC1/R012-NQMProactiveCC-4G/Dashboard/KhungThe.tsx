// "Kieu the trang" dung CHUNG (THEM 19/10/2026, yeu cau truc tiep user, muc 4: "Khoi ket qua hau kiem, theo
// nhom, can xu ly: ap cung kieu card trang + vien trai cho dong bo") - vo boc trung tinh cho 1 KHOI noi dung
// (chart/bang), KHAC voi "the so" rieng o DashboardCards.tsx (co icon/so lon/thanh tien do) - component nay
// CHI lo phan "vo" (nen trang, vien, bo goc, bong, vien trai mau) + 1 dong tieu de, noi dung ben trong hoan
// toan do component cha quyet dinh.
import React from "react";
import { DB_CARD } from "./dashboardConstants";

interface KhungTheProps {
  title: React.ReactNode;
  mauVienTrai: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const KhungThe: React.FC<KhungTheProps> = ({ title, mauVienTrai, extra, children, style }) => (
  <div
    style={{
      backgroundColor: DB_CARD.nen,
      border: DB_CARD.vien,
      borderLeft: `${DB_CARD.doRongVienTrai} solid ${mauVienTrai}`,
      borderRadius: DB_CARD.boGoc,
      boxShadow: DB_CARD.boBong,
      padding: DB_CARD.padding,
      ...style,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#262626" }}>{title}</div>
      {extra}
    </div>
    {children}
  </div>
);

export default KhungThe;
