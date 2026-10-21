// Khoi "Ket qua hau kiem" (LAM LAI 19/10/2026 LAN 2, yeu cau truc tiep user - "SUA GIAO DIEN DASHBOARD R012
// THEO GOP Y" muc 3) - KHONG con la 1 the rieng canh "Xu huong", ma la 1 LUA CHON Segmented thu 7 cua
// DashboardTrend.tsx (component nay nay chi con lo phan VE, duoc DashboardTrend goi khi chiSoXem ===
// "ket_qua_hau_kiem"). Doi tu BarChart cot ngang (recharts) SANG 2 thanh ngang 100% TU VE bang <div> - moi
// thanh chia 3 doan Dat/Khong dat/Thieu du lieu, GHI SO + % NGAY TREN doan du rong; doan qua nho (<12%) CHI
// hien qua Tooltip (chu se bi cat/de doc neu co ep vao) - dung ty_le co san tu BE (CUNG mau so so_cell cho ca 3
// doan) lam BE RONG %, KHONG tu tinh lai. Tinh theo TOAN khoang ngay dang loc (hauKiem la tong hop ca ky, khac
// xu_huong la chuoi THEO TUNG TUAN) - yeu cau truc tiep user: "Tinh theo TOAN khoang ngay bo loc".
//
// MAU (SUA 19/10/2026 LAN 3, yeu cau truc tiep user "Thay toan bo bang mau") - Dat->success, Khong dat
// ->critical, Thieu du lieu->warning, CA 2 thanh QoS/QoE dung CHUNG 1 bo mau nay (truoc day "Khong dat" tach
// rieng mau cho tung thanh QoS/QoE - nay gop ve 1 vai tro "critical" duy nhat theo dung yeu cau moi).
import React from "react";
import { Tooltip } from "antd";
import { DashboardHauKiem, DashboardHauKiemChiSo } from "../types";
import { formatSoDem, formatTyLe } from "./dashboardHelpers";
import { MAU } from "./dashboardConstants";

export type KetQuaHauKiem = "DAT" | "KHONG_DAT" | "INSUFFICIENT_DATA";

interface DashboardHauKiemStackProps {
  hauKiem: DashboardHauKiem;
  onClickSegment: (loai: "qos" | "qoe", ketQua: KetQuaHauKiem) => void;
}

// doan rong duoi nguong nay (%) thi KHONG du cho ghi chu "so (ty le%)" - CHI hien qua Tooltip khi tro chuot
// (yeu cau truc tiep user: "doan nho -> tooltip")
const NGUONG_AN_CHU = 12;

interface DoanThanh {
  khoa: KetQuaHauKiem;
  nhan: string;
  so: number;
  tyLe: number | null;
  mau: string;
}

const ThanhHauKiem100: React.FC<{ nhan: string; doan: DoanThanh[]; onClick: (khoa: KetQuaHauKiem) => void }> = ({ nhan, doan, onClick }) => (
  <div style={{ marginBottom: "16px" }}>
    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#595959", marginBottom: "4px" }}>{nhan}</div>
    <div style={{ display: "flex", height: "28px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
      {doan
        .filter((d) => d.so > 0)
        .map((d) => {
          const rong = d.tyLe ?? 0;
          const chuDoan = `${formatSoDem(d.so)} (${formatTyLe(d.tyLe)})`;
          const doNho = rong < NGUONG_AN_CHU;
          return (
            <Tooltip key={d.khoa} title={`${d.nhan}: ${chuDoan}`}>
              <div
                onClick={() => onClick(d.khoa)}
                style={{
                  width: `${rong}%`,
                  backgroundColor: d.mau,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  color: "#ffffff",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {!doNho && chuDoan}
              </div>
            </Tooltip>
          );
        })}
    </div>
  </div>
);

const taoDoan = (chiSo: DashboardHauKiemChiSo): DoanThanh[] => [
  { khoa: "DAT", nhan: "Dat", so: chiSo.dat.so, tyLe: chiSo.dat.ty_le, mau: MAU.success.dam },
  { khoa: "KHONG_DAT", nhan: "Khong dat", so: chiSo.khong_dat.so, tyLe: chiSo.khong_dat.ty_le, mau: MAU.critical.dam },
  { khoa: "INSUFFICIENT_DATA", nhan: "Thieu du lieu", so: chiSo.thieu_du_lieu.so, tyLe: chiSo.thieu_du_lieu.ty_le, mau: MAU.warning.dam },
];

const DashboardHauKiemStack: React.FC<DashboardHauKiemStackProps> = ({ hauKiem, onClickSegment }) => (
  <div>
    <ThanhHauKiem100 nhan="QoS" doan={taoDoan(hauKiem.qos)} onClick={(khoa) => onClickSegment("qos", khoa)} />
    <ThanhHauKiem100 nhan="QoE" doan={taoDoan(hauKiem.qoe)} onClick={(khoa) => onClickSegment("qoe", khoa)} />
  </div>
);

export default DashboardHauKiemStack;
