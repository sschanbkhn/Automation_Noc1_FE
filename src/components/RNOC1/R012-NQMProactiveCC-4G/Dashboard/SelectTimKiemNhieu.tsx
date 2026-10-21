// Select chon nhieu, CO O TIM KIEM khi mo, khong phan biet hoa/thuong va khong phan biet dau (yeu cau truc
// tiep user, muc 1: "go 'ha noi' hoac 'hni' ra HNI"). TACH RIENG 1 component dung CHUNG cho CA 3 Select cua
// bo loc chinh (Khu vuc/Tinh/Vendor) LAN bo loc trong Modal chi tiet (DashboardChiTietModal.tsx) - tranh lap
// lai cau hinh filterOption/maxTagCount/showSearch o 2+ cho.
import React from "react";
import { Select } from "antd";
import { khopTimKiemKhongDau } from "./dashboardHelpers";

export interface TuyChonTimKiem {
  label: string; // nhan hien thi VA NOI DUNG duoc so khop khi tim (vd "HNI - Ha Noi")
  value: string;
}

interface SelectTimKiemNhieuProps {
  placeholder: string;
  options: TuyChonTimKiem[];
  value: string[];
  onChange: (value: string[]) => void;
  style?: React.CSSProperties;
  // SUA 20/10/2026 lan 4 (yeu cau truc tiep user: "dung DUNG size cua tab Tac dong tram" - da doc truc tiep
  // TacDongTram.tsx/StationSearchGrid.tsx, XAC NHAN moi Input/Button o do KHONG khai bao size nao ca, tuc
  // dung mac dinh "middle" cua antd, KHONG phai "large") - doi mac dinh "large" (40px, SAI truoc day) ve
  // "middle" (32px, dung voi tab Tac dong tram) de 4 thanh bo loc trong module dong bo CHIEU CAO voi tab do
  size?: "small" | "middle" | "large";
}

const SelectTimKiemNhieu: React.FC<SelectTimKiemNhieuProps> = ({ placeholder, options, value, onChange, style, size = "middle" }) => (
  <Select
    mode="multiple"
    placeholder={placeholder}
    options={options}
    value={value}
    onChange={onChange}
    style={style ?? { minWidth: "180px" }}
    size={size}
    allowClear
    showSearch
    // maxTagCount="responsive" (yeu cau truc tiep user) - antd tu gon cac the da chon thanh "+N" khi khong du
    // cho, thay vi tran dong/day vo bo loc
    maxTagCount="responsive"
    // filterOption nhan (value, option) - option.label la nhan DA GHEP SAN "<ma> - <ten>" cho Tinh (xem
    // Dashboard.tsx noi tao options), nen so khop qua label la du de dap ung "khop ca ma lan ten"
    filterOption={(input, option) => khopTimKiemKhongDau(input, String(option?.label ?? ""))}
  />
);

export default SelectTimKiemNhieu;
