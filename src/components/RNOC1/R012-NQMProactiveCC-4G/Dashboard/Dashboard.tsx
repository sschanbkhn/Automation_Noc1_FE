// Tab "Dashboard" (LAM LAI HOAN TOAN 18/10/2026, yeu cau truc tiep user - doi chieu BE commit 124b72b tren
// main, xem Muc 0 khao sat trong bao cao gui nguoi dung). Dat DAU TIEN trong R012Tabs (xem Designer/
// R012Tabs.tsx).
//
// QUAN TRONG: BE KHONG co Pydantic schema cho ca 5 endpoint dashboard (response la dict dung tay) - moi type
// dung o day (Dashboard*, types/index.ts) lay TRUC TIEP tu doc source code BE, KHONG co openapi.json de doi
// chieu. Neu BE doi hinh dang response sau nay ma khong bao, man hinh nay se la noi phat hien dau tien.
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Spin, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { getDashboardTongQuan, xuatDashboardExcel } from "../services/R012Service";
import { DashboardChiTietLoai, DashboardChiTietParams, DashboardTongQuanResponse } from "../types";
import { layThongBaoLoi } from "../helpers/layThongBaoLoi";
import DashboardFilters from "./DashboardFilters";
import DashboardCards from "./DashboardCards";
import DashboardTrend from "./DashboardTrend";
import DashboardGroupTable from "./DashboardGroupTable";
import DashboardCanXuLy from "./DashboardCanXuLy";
import DashboardChiTietModal from "./DashboardChiTietModal";
import KhungThe from "./KhungThe";
import { MAU } from "./dashboardConstants";

type LocConChiTiet = Pick<DashboardChiTietParams, "trang_thai" | "ket_qua" | "ly_do" | "phuong_an">;

interface DashboardProps {
  // "bam -> mo session trong Lich su CR" (yeu cau truc tiep user) - R012Tabs.tsx truyen xuong ham DOI active
  // tab + dat YeuCauMoSession cho SessionHistoryList.tsx
  onMoSessionTrongLichSuCR: (sessionId: number) => void;
}

interface ChiTietMo {
  loai: DashboardChiTietLoai;
  locCon?: Partial<LocConChiTiet>;
}

const Dashboard: React.FC<DashboardProps> = ({ onMoSessionTrongLichSuCR }) => {
  // mac dinh 30 ngay GAN NHAT (yeu cau truc tiep user tu task truoc, giu nguyen) - [today-29, today]
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(29, "day"), dayjs()]);
  const [khuVucFilter, setKhuVucFilter] = useState<string[]>([]);
  const [maTinhFilter, setMaTinhFilter] = useState<string[]>([]);
  const [vendorFilter, setVendorFilter] = useState<string[]>([]);
  const [chiTietMo, setChiTietMo] = useState<ChiTietMo | null>(null);
  const [dangXuatExcel, setDangXuatExcel] = useState<boolean>(false);

  const tuNgay = dateRange[0].format("YYYY-MM-DD");
  const denNgay = dateRange[1].format("YYYY-MM-DD");

  // chi_tiet_thoi_gian LUON la "tuan" (SUA 19/10/2026 lan 2, yeu cau truc tiep user: "LUON goi
  // chi_tiet_thoi_gian=tuan; BO moi lua chon theo ngay") - khong con la state, khong con UI chon "Theo ngay"
  const { data, isLoading, isError, error } = useQuery<DashboardTongQuanResponse>({
    queryKey: ["r012", "dashboard-tong-quan", tuNgay, denNgay, khuVucFilter, maTinhFilter, vendorFilter],
    queryFn: () =>
      getDashboardTongQuan({
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        khu_vuc: khuVucFilter.length > 0 ? khuVucFilter : undefined,
        ma_tinh: maTinhFilter.length > 0 ? maTinhFilter : undefined,
        vendor: vendorFilter.length > 0 ? vendorFilter : undefined,
        chi_tiet_thoi_gian: "tuan",
      }),
  });

  const handleXuatExcel = async () => {
    setDangXuatExcel(true);
    try {
      await xuatDashboardExcel({
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        khu_vuc: khuVucFilter.length > 0 ? khuVucFilter : undefined,
        ma_tinh: maTinhFilter.length > 0 ? maTinhFilter : undefined,
        vendor: vendorFilter.length > 0 ? vendorFilter : undefined,
        chi_tiet_thoi_gian: "tuan",
      });
    } catch (err) {
      message.error(layThongBaoLoi(err, "Xuat Excel that bai, vui long thu lai"));
    } finally {
      setDangXuatExcel(false);
    }
  };

  const moModal = (loai: DashboardChiTietLoai, locCon?: Partial<LocConChiTiet>) => setChiTietMo({ loai, locCon });

  // THEM 18/10/2026 (yeu cau truc tiep user, muc 6) - bam 1 dong bang "theo nhom" -> LOC CA DASHBOARD theo
  // dung gia tri dong do (thay the toan bo lua chon hien tai cua chieu do, KHONG cong them)
  const handleClickNhom = (nhom: "khu_vuc" | "ma_tinh" | "vendor", giaTri: string) => {
    if (nhom === "khu_vuc") {
      setKhuVucFilter([giaTri]);
    } else if (nhom === "ma_tinh") {
      setMaTinhFilter([giaTri]);
    } else {
      setVendorFilter([giaTri]);
    }
  };

  const handleClickHauKiemSegment = (loai: "qos" | "qoe", ketQua: "DAT" | "KHONG_DAT" | "INSUFFICIENT_DATA") =>
    moModal(loai, { ket_qua: [ketQua] });

  return (
    // nen trang toan trang = MAU.nen.trang (yeu cau truc tiep user lan 5, muc 3: "nen trang = nen.trang") -
    // padding nho de mau nen khong bi "dinh" sat canh man hinh/khung tab ngoai
    <div style={{ backgroundColor: MAU.nen.trang, padding: "4px", borderRadius: "8px" }}>
      <DashboardFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        khuVuc={khuVucFilter}
        onKhuVucChange={setKhuVucFilter}
        maTinh={maTinhFilter}
        onMaTinhChange={setMaTinhFilter}
        vendor={vendorFilter}
        onVendorChange={setVendorFilter}
        onXuatExcel={handleXuatExcel}
        dangXuatExcel={dangXuatExcel}
      />

      {isLoading && <Spin tip="Dang tai du lieu dashboard..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc dashboard"
          description={layThongBaoLoi(error, "Loi khong xac dinh")}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {data && (
        <>
          <DashboardCards data={data} onMoModal={moModal} />

          {/* "Xu huong"/"Theo nhom" gom nhieu chi so (So CR/So phieu/QoS/QoE...) khong thuoc rieng 1 vai tro -
          dung "primary" lam vai tro mac dinh cho khoi noi dung tong hop (judgement call, bao cao rieng) */}
          <KhungThe title="Xu huong theo tuan" mauVienTrai={MAU.primary.dam} style={{ marginBottom: "1rem" }}>
            <DashboardTrend xuHuong={data.xu_huong} hauKiem={data.hau_kiem} onClickHauKiemSegment={handleClickHauKiemSegment} />
          </KhungThe>

          <KhungThe title="Theo nhom" mauVienTrai={MAU.primary.dam} style={{ marginBottom: "1rem" }}>
            <DashboardGroupTable data={data} onClickNhom={handleClickNhom} />
          </KhungThe>

          <DashboardCanXuLy data={data.can_xu_ly} onMoSessionTrongLichSuCR={onMoSessionTrongLichSuCR} />
        </>
      )}

      <DashboardChiTietModal
        open={chiTietMo !== null}
        onClose={() => setChiTietMo(null)}
        loai={chiTietMo?.loai ?? null}
        tuNgay={tuNgay}
        denNgay={denNgay}
        khuVucBanDau={khuVucFilter}
        maTinhBanDau={maTinhFilter}
        vendorBanDau={vendorFilter}
        locCon={chiTietMo?.locCon}
        onMoSessionTrongLichSuCR={onMoSessionTrongLichSuCR}
      />
    </div>
  );
};

export default Dashboard;
