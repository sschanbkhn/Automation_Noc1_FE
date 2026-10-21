// Modal chi tiet (LAM LAI 19/10/2026, yeu cau truc tiep user "LAM TIEP MUC 2") - mo khi bam 1 the/chi so nho
// tren Dashboard, goi GET /dashboard/chi-tiet (+ /dashboard/chi-tiet/excel de xuat). "loai" quyet dinh hinh
// dang dong tra ve - DA XAC NHAN CHINH XAC 5 gia tri "cr"|"qos"|"qoe"|"phieu"|"can_xu_ly" qua doc truc tiep BE
// (xem WHY day du o DashboardChiTietLoai, types/index.ts).
//
// SUA LON (19/10/2026) - BE DA TRIEN KHAI xong tim/sap xep/phan trang THAT o server (commit a67505e/0e946b7
// tren main, DA XAC NHAN LAI qua doc truc tiep api/routers/dashboard.py truoc khi sua file nay): q (tim tu do,
// khong phan biet hoa/thuong/dau, BE tu bo dau), sap_xep + chieu (BE whitelist CHAT theo tung loai qua
// COT_SAP_XEP_DASHBOARD, 422 neu gui cot ngoai danh sach), trang + kich_thuoc (TRAN 200, SQL LIMIT/OFFSET
// THAT, tong tra tu BE). TOAN BO tim/sap xep/phan trang cua Modal nay GIO LA SERVER-SIDE - BO HOAN TOAN logic
// loc/sap xep/phan trang phia trinh duyet tren tap 500 dong cua ban truoc (xem lich su sua trong git blame
// neu can doi chieu lai cach lam cu).
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Input, Modal, Pagination, Spin, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, SortingState } from "@tanstack/react-table";
import { getDashboardBoLoc, getDashboardChiTiet, xuatDashboardChiTietExcel } from "../services/R012Service";
import {
  DashboardBoLocResponse,
  DashboardChiTietLoai,
  DashboardChiTietParams,
  DashboardChiTietResponse,
} from "../types";
import { R012_COLORS } from "../theme";
import { DB_MAU_THEO_LOAI, DB_MODAL } from "./dashboardConstants";
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { layThongBaoLoi } from "../helpers/layThongBaoLoi";
// formatDiemSo: TB truoc/TB sau/Lech (QoS/QoE chi tiet) la DIEM SO 1-5 (MOS-like), CUNG BAN CHAT voi
// avg_before/avg_after/delta cua bang hau kiem session (QosEvaluationTable/QoeCellsTable) - TAI DUNG CHINH
// ham do thay vi viet lai, tranh 2 noi dinh dang khac nhau cho cung 1 loai gia tri
import { formatDiemSo } from "../TacDongTram/DanhGiaChatLuong/ketQuaDanhGia";
import SelectTimKiemNhieu from "./SelectTimKiemNhieu";
import {
  CAN_XU_LY_LOAI_LABEL,
  COT_SAP_XEP_THEO_LOAI,
  KET_QUA_CHI_TIET_LABEL,
  LY_DO_CHI_TIET_LABEL,
  PHUONG_AN_LABEL,
  formatSoDem,
} from "./dashboardHelpers";

type LocConChiTiet = Pick<DashboardChiTietParams, "trang_thai" | "ket_qua" | "ly_do" | "phuong_an">;

interface DashboardChiTietModalProps {
  open: boolean;
  onClose: () => void;
  loai: DashboardChiTietLoai | null;
  tuNgay: string;
  denNgay: string;
  // bo loc CHINH cua Dashboard (dung lam GIA TRI KHOI TAO cho bo loc rieng trong Modal - CO THE chinh tiep
  // trong Modal, doc lap voi bo loc ngoai, xem yeu cau "bo loc trong modal (neu co)")
  khuVucBanDau: string[];
  maTinhBanDau: string[];
  vendorBanDau: string[];
  locCon?: Partial<LocConChiTiet>;
  onMoSessionTrongLichSuCR: (sessionId: number) => void;
}

const NHAN_LOAI: Record<DashboardChiTietLoai, string> = {
  cr: "Danh sach CR",
  qos: "Chi tiet QoS",
  qoe: "Chi tiet QoE",
  phieu: "Danh sach phieu",
  can_xu_ly: "Can xu ly",
};

const columnHelper = createColumnHelper<any>();

// cot "Thao tac" (mo session trong Lich su CR) - DUNG CHUNG cho CA 4 loai, vi ca 4 kieu dong (xem
// DashboardChiTietRow, types/index.ts) deu co field "session_id" cung ten
function cotThaoTac(onMoSessionTrongLichSuCR: (id: number) => void) {
  return columnHelper.display({
    id: "thao_tac",
    header: "Thao tac",
    enableSorting: false,
    cell: (info) => (
      <Button
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onMoSessionTrongLichSuCR(info.row.original.session_id);
        }}
      >
        Mo session
      </Button>
    ),
  });
}

// SUA (19/10/2026) - MOI cot bay gio phai tu khai bao "enableSorting" theo DUNG whitelist BE cua tung loai
// (COT_SAP_XEP_THEO_LOAI, dashboardHelpers.ts) - "bam tieu de cot -> sap_xep + chieu; cot khong co trong danh
// sach BE -> tat sap xep o cot do" (yeu cau truc tiep user). coSapXepDuoc() tra ve false cho CA cot hien thi
// nhung KHONG nam trong whitelist (vd "tram_id"/"ly_do" cua loai qos/qoe - xem WHY day du o
// COT_SAP_XEP_THEO_LOAI) - danh sach cot HIEN THI va danh sach cot SAP XEP DUOC la 2 tap KHAC NHAU, khong
// phai luon trung nhau
function layCotTheoLoai(loai: DashboardChiTietLoai, onMoSessionTrongLichSuCR: (id: number) => void): any[] {
  const coSapXepDuoc = (id: string) => COT_SAP_XEP_THEO_LOAI[loai].includes(id);
  switch (loai) {
    case "cr":
      return [
        columnHelper.accessor("session_id", { header: "Session", enableSorting: coSapXepDuoc("session_id") }),
        columnHelper.accessor("ngay_cr", { header: "Ngay CR", enableSorting: coSapXepDuoc("ngay_cr") }),
        columnHelper.accessor("tram_id", { header: "Ma tram", enableSorting: coSapXepDuoc("tram_id") }),
        columnHelper.accessor("tram_name", { header: "Ten tram", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("tram_name") }),
        columnHelper.accessor("ten_tinh", { header: "Tinh", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("ten_tinh") }),
        columnHelper.accessor("khu_vuc", { header: "Khu vuc", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("khu_vuc") }),
        columnHelper.accessor("vendor_tram", { header: "Vendor", enableSorting: coSapXepDuoc("vendor_tram") }),
        columnHelper.accessor("status", { header: "Trang thai", enableSorting: coSapXepDuoc("status") }),
        columnHelper.accessor("ma_loi", { header: "Ma loi", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("ma_loi") }),
        columnHelper.accessor("so_cell_cr", { header: "So cell CR", cell: (info) => formatSoDem(info.getValue()), enableSorting: coSapXepDuoc("so_cell_cr") }),
        columnHelper.accessor("so_cell_anh_huong", {
          header: "So cell anh huong",
          cell: (info) => formatSoDem(info.getValue()),
          enableSorting: coSapXepDuoc("so_cell_anh_huong"),
        }),
        cotThaoTac(onMoSessionTrongLichSuCR),
      ];
    case "qos":
    case "qoe":
      return [
        columnHelper.accessor("session_id", { header: "Session", enableSorting: coSapXepDuoc("session_id") }),
        columnHelper.accessor("ngay_cr", { header: "Ngay CR", enableSorting: coSapXepDuoc("ngay_cr") }),
        // tram_id HIEN THI nhung KHONG sap xep duoc (BE whitelist loai nay chi co "tram_name" - xem WHY day
        // du o COT_SAP_XEP_THEO_LOAI, dashboardHelpers.ts)
        columnHelper.accessor("tram_id", { header: "Ma tram", enableSorting: false }),
        columnHelper.accessor("tram_name", { header: "Ten tram", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("tram_name") }),
        columnHelper.accessor("cell_name", { header: "Cell", enableSorting: coSapXepDuoc("cell_name") }),
        columnHelper.accessor("vendor_cell", { header: "Vendor", enableSorting: coSapXepDuoc("vendor_cell") }),
        columnHelper.accessor("tb_truoc", { header: "TB truoc", cell: (info) => formatDiemSo(info.getValue()), enableSorting: coSapXepDuoc("tb_truoc") }),
        columnHelper.accessor("tb_sau", { header: "TB sau", cell: (info) => formatDiemSo(info.getValue()), enableSorting: coSapXepDuoc("tb_sau") }),
        columnHelper.accessor("lech", { header: "Lech", cell: (info) => formatDiemSo(info.getValue()), enableSorting: coSapXepDuoc("lech") }),
        columnHelper.accessor("ket_qua", {
          header: "Ket qua",
          cell: (info) => KET_QUA_CHI_TIET_LABEL[info.getValue()] ?? info.getValue(),
          enableSorting: coSapXepDuoc("ket_qua"),
        }),
        // ly_do HIEN THI nhung KHONG sap xep duoc (khong nam trong whitelist BE)
        columnHelper.accessor("ly_do", {
          header: "Ly do",
          cell: (info) => (info.getValue() ? LY_DO_CHI_TIET_LABEL[info.getValue() as string] ?? info.getValue() : "-"),
          enableSorting: false,
        }),
        columnHelper.accessor("so_ngay_co_du_lieu", {
          header: "So ngay co DL",
          cell: (info) => formatSoDem(info.getValue()),
          enableSorting: coSapXepDuoc("so_ngay_co_du_lieu"),
        }),
        columnHelper.accessor("ma_phieu", { header: "Ma phieu", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("ma_phieu") }),
        cotThaoTac(onMoSessionTrongLichSuCR),
      ];
    case "phieu":
      return [
        columnHelper.accessor("ma_phieu", { header: "Ma phieu", enableSorting: coSapXepDuoc("ma_phieu") }),
        columnHelper.accessor("session_id", { header: "Session", enableSorting: coSapXepDuoc("session_id") }),
        columnHelper.accessor("cell_name", { header: "Cell", enableSorting: coSapXepDuoc("cell_name") }),
        columnHelper.accessor("vendor_cell", { header: "Vendor", enableSorting: coSapXepDuoc("vendor_cell") }),
        columnHelper.accessor("phuong_an", {
          header: "Phuong an",
          cell: (info) => (info.getValue() ? PHUONG_AN_LABEL[info.getValue() as string] ?? info.getValue() : "-"),
          enableSorting: coSapXepDuoc("phuong_an"),
        }),
        columnHelper.accessor("trang_thai", { header: "Trang thai", enableSorting: coSapXepDuoc("trang_thai") }),
        columnHelper.accessor("ngay_xuat", { header: "Ngay xuat", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("ngay_xuat") }),
        cotThaoTac(onMoSessionTrongLichSuCR),
      ];
    case "can_xu_ly":
      return [
        columnHelper.accessor("loai", {
          header: "Loai",
          cell: (info) => CAN_XU_LY_LOAI_LABEL[info.getValue()] ?? info.getValue(),
          enableSorting: coSapXepDuoc("loai"),
        }),
        columnHelper.accessor("session_id", { header: "Session", enableSorting: coSapXepDuoc("session_id") }),
        columnHelper.accessor("tram_id", { header: "Ma tram", enableSorting: coSapXepDuoc("tram_id") }),
        columnHelper.accessor("tram_name", { header: "Ten tram", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("tram_name") }),
        columnHelper.accessor("status", { header: "Trang thai", enableSorting: coSapXepDuoc("status") }),
        columnHelper.accessor("ngay", { header: "Ngay", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("ngay") }),
        columnHelper.accessor("ma_loi", { header: "Ma loi", cell: (info) => info.getValue() ?? "-", enableSorting: coSapXepDuoc("ma_loi") }),
        cotThaoTac(onMoSessionTrongLichSuCR),
      ];
    default:
      return [];
  }
}

const DashboardChiTietModal: React.FC<DashboardChiTietModalProps> = ({
  open,
  onClose,
  loai,
  tuNgay,
  denNgay,
  khuVucBanDau,
  maTinhBanDau,
  vendorBanDau,
  locCon,
  onMoSessionTrongLichSuCR,
}) => {
  // bo loc RIENG cua Modal - khoi tao tu bo loc Dashboard moi lan Modal MO LAI (loai doi hoac open: false->true),
  // sau do nguoi dung co the tu chinh tiep TRONG Modal ma khong anh huong bo loc ngoai Dashboard
  const [khuVuc, setKhuVuc] = useState<string[]>(khuVucBanDau);
  const [maTinh, setMaTinh] = useState<string[]>(maTinhBanDau);
  const [vendor, setVendor] = useState<string[]>(vendorBanDau);
  // searchInput: gia tri hien thi TRUC TIEP tren o Input.Search, cap nhat ngay khi go phim. searchTerm: gia
  // tri THAT SU dung goi API (param q), chi doi sau khi nguoi dung ngung go ~400ms - tach 2 state giong quy
  // uoc da dung o StationSearchGrid.tsx/SessionHistoryList.tsx trong module nay
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [trang, setTrang] = useState<number>(1);
  const [kichThuoc, setKichThuoc] = useState<number>(10);
  const [dangXuatExcel, setDangXuatExcel] = useState<boolean>(false);

  const debouncedApplySearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setTrang(1); // ve trang 1 khi doi tu khoa (yeu cau truc tiep user)
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedApplySearch.cancel();
    };
  }, [debouncedApplySearch]);

  useEffect(() => {
    if (open) {
      setKhuVuc(khuVucBanDau);
      setMaTinh(maTinhBanDau);
      setVendor(vendorBanDau);
      debouncedApplySearch.cancel();
      setSearchInput("");
      setSearchTerm("");
      setSorting([]);
      setTrang(1);
      setKichThuoc(10);
    }
    // CHI dong bo lai khi Modal vua duoc MO (hoac doi loai trong khi dang mo) - KHONG phu thuoc
    // khuVucBanDau/maTinhBanDau/vendorBanDau de tranh ghi de lua chon nguoi dung VUA chinh trong Modal moi
    // lan Dashboard ben ngoai render lai (object/array moi moi lan)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loai]);

  const { data: boLoc } = useQuery<DashboardBoLocResponse>({
    queryKey: ["r012", "dashboard-bo-loc"],
    queryFn: getDashboardBoLoc,
    staleTime: 10 * 60 * 1000,
  });

  const khuVucOptions = useMemo(() => (boLoc?.khu_vuc ?? []).map((kv) => ({ label: kv, value: kv })), [boLoc]);
  const vendorOptions = useMemo(() => (boLoc?.vendor ?? []).map((v) => ({ label: v, value: v })), [boLoc]);
  const tinhOptions = useMemo(() => {
    const list = boLoc?.ma_tinh ?? [];
    const daLoc = khuVuc.length > 0 ? list.filter((t) => t.khu_vuc && khuVuc.includes(t.khu_vuc)) : list;
    return daLoc.map((t) => ({ label: `${t.ma} - ${t.ten ?? t.ma}`, value: t.ma }));
  }, [boLoc, khuVuc]);

  // doi bo loc (khu vuc/tinh/vendor) -> ve trang 1, tranh dang o trang 5 ma bo loc moi chi con 2 trang
  const handleKhuVucChange = (v: string[]) => {
    setKhuVuc(v);
    setTrang(1);
  };
  const handleMaTinhChange = (v: string[]) => {
    setMaTinh(v);
    setTrang(1);
  };
  const handleVendorChange = (v: string[]) => {
    setVendor(v);
    setTrang(1);
  };

  // sap_xep/chieu suy tu "sorting" (TanStack chi dieu khien ICON mui ten qua SortableHeaderCell, KHONG tu
  // sap xep - BE sap xep THAT, dung quy uoc da dung o SessionHistoryList.tsx/PhieuHistoryTable.tsx cho moi
  // bang server-side sort khac trong module)
  const sapXep = sorting.length > 0 ? sorting[0].id : undefined;
  const chieu: "asc" | "desc" | undefined = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(updaterOrValue);
    setTrang(1); // doi sap xep -> thu tu toan bo danh sach doi, trang cu khong con cung y nghia
  };

  const params: DashboardChiTietParams | null = loai
    ? {
        loai,
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        khu_vuc: khuVuc.length > 0 ? khuVuc : undefined,
        ma_tinh: maTinh.length > 0 ? maTinh : undefined,
        vendor: vendor.length > 0 ? vendor : undefined,
        q: searchTerm || undefined,
        sap_xep: sapXep,
        chieu,
        trang,
        kich_thuoc: kichThuoc,
        ...locCon,
      }
    : null;

  const { data, isLoading, isFetching, isError, error } = useQuery<DashboardChiTietResponse>({
    queryKey: ["r012", "dashboard-chi-tiet", params],
    queryFn: () => getDashboardChiTiet(params as DashboardChiTietParams),
    enabled: open && params !== null,
    // SUA (19/10/2026, yeu cau truc tiep user: "dang tai: hien trang thai tai tren bang, khong nhay giao
    // dien") - giu lai DU LIEU TRANG CU trong luc dang tai trang/bo loc/sap xep MOI, thay vi xoa trang ve
    // rong roi moi hien lai (gay "nhay" giao dien). isFetching (ben duoi) dung de hien 1 lop Spin MO tren
    // bang cu trong luc cho, KHONG thay the noi dung
    keepPreviousData: true,
  });

  const rows = useMemo(() => data?.dong ?? [], [data]);

  const columns = useMemo(() => (loai ? layCotTheoLoai(loai, onMoSessionTrongLichSuCR) : []), [loai, onMoSessionTrongLichSuCR]);

  // KHONG dang ky getSortedRowModel/getPaginationRowModel - BE da sap xep/phan trang THAT, "rows" da la DUNG
  // trang/thu tu can hien, TanStack o day CHI dung de ve bang + dieu khien icon sort (sorting state)
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleXuatExcel = async () => {
    if (!loai) {
      return;
    }
    setDangXuatExcel(true);
    try {
      // GUI CUNG q/sap_xep/chieu/bo loc DANG CO (yeu cau truc tiep user) - file xuat ra DUNG nhung gi dang
      // thay tren bang (toan bo dong khop, khong chi 1 trang - BE tu kich_thuoc=None o /chi-tiet/excel)
      await xuatDashboardChiTietExcel({
        loai,
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        khu_vuc: khuVuc.length > 0 ? khuVuc : undefined,
        ma_tinh: maTinh.length > 0 ? maTinh : undefined,
        vendor: vendor.length > 0 ? vendor : undefined,
        q: searchTerm || undefined,
        sap_xep: sapXep,
        chieu,
        ...locCon,
      });
    } catch (err) {
      message.error(layThongBaoLoi(err, "Xuat Excel that bai, vui long thu lai"));
    } finally {
      setDangXuatExcel(false);
    }
  };

  // mau header DONG THEO loai (LAM LAI 19/10/2026, "theo thiet ke R003/R005" - mo phong DataTableModal.tsx
  // cua R003: header + vien bang DOI MAU theo dung metric vua bam, xem WHY day du o DB_MAU_THEO_LOAI,
  // dashboardConstants.ts). R012_COLORS.primary la fallback khi Modal chua mo (loai=null, khong hien thuc te)
  const mauHeader = loai ? DB_MAU_THEO_LOAI[loai] : R012_COLORS.primary;

  return (
    <Modal
      // className DUNG de scope CSS override rieng (mau nut dong X - xem <style> ben duoi) - KHONG anh huong
      // Modal khac trong app vi la class RIENG cho component nay
      className="r012-dashboard-chitiet-modal"
      // THEM 19/10/2026 ("theo thiet ke R003/R005") - title la 1 FLEX ROW: [icon chip + ten loai] ben trai,
      // nut "Xuat Excel" ben phai (MO PHONG DataTableModal.tsx: nut xuat nam TRONG thanh header, canh nut
      // dong X) - paddingRight de danh cho nut dong X cua antd (tu render o goc phai header, NGOAI title node)
      title={
        loai && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: DB_MODAL.kichThuocIconHeader,
                  height: DB_MODAL.kichThuocIconHeader,
                  borderRadius: DB_MODAL.boGocIconHeader,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                📋
              </div>
              <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "18px" }}>{NHAN_LOAI[loai]}</span>
            </div>
            <Button
              size="small"
              onClick={handleXuatExcel}
              loading={dangXuatExcel}
              style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff", border: "none" }}
            >
              Xuat Excel
            </Button>
          </div>
        )
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={DB_MODAL.chieuRong}
      style={{ maxWidth: DB_MODAL.chieuRongToiDa, top: "20px" }}
      styles={{
        content: { borderRadius: DB_MODAL.boGoc, boxShadow: DB_MODAL.boBong, padding: 0 },
        header: { background: mauHeader, padding: "20px 24px", margin: 0, borderRadius: `${DB_MODAL.boGoc} ${DB_MODAL.boGoc} 0 0` },
        body: { padding: "16px 24px", maxHeight: DB_MODAL.chieuCao, overflowY: "auto" },
      }}
    >
      {/* nut dong X doi mau trang (header co nen mau dam) - CSS global vi Modal portal ra document.body, scope
          qua class "r012-dashboard-chitiet-modal" tren chinh Modal nay */}
      <style>{`
        .r012-dashboard-chitiet-modal .ant-modal-close { color: #ffffff; top: 20px; }
        .r012-dashboard-chitiet-modal .ant-modal-close:hover { color: #ffffff; background: rgba(255,255,255,0.2); }
      `}</style>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "1rem",
          paddingBottom: "1rem",
          alignItems: "center",
          borderBottom: `1px solid ${DB_MODAL.mauDuongKe}`,
        }}
      >
        <SelectTimKiemNhieu placeholder="Khu vuc" options={khuVucOptions} value={khuVuc} onChange={handleKhuVucChange} style={{ minWidth: "130px" }} />
        <SelectTimKiemNhieu placeholder="Tinh" options={tinhOptions} value={maTinh} onChange={handleMaTinhChange} style={{ minWidth: "180px" }} />
        <SelectTimKiemNhieu placeholder="Vendor" options={vendorOptions} value={vendor} onChange={handleVendorChange} style={{ minWidth: "150px" }} />
        <Input.Search
          placeholder="Tim kiem (khong phan biet hoa/thuong, dau)"
          allowClear
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            debouncedApplySearch(value);
          }}
          style={{ flex: "1 1 200px", maxWidth: "280px", marginLeft: "auto" }}
        />
      </div>

      {isLoading && <Spin tip="Dang tai..." />}

      {isError && <Alert type="error" message="Khong tai duoc danh sach" description={layThongBaoLoi(error, "Loi khong xac dinh")} />}

      {!isLoading && !isError && (
        // SUA (19/10/2026, yeu cau truc tiep user) - Spin BOC NGOAI bang (khong thay the noi dung) trong luc
        // dang tai trang/bo loc/sap xep MOI - ket hop keepPreviousData (o tren) de bang CU van hien (mo di)
        // thay vi nhay ve rong roi hien lai, dung "hien trang thai tai tren bang, khong nhay giao dien"
        <Spin spinning={isFetching}>
          {rows.length === 0 ? (
            <div style={{ color: "#8c8c8c" }}>Khong co dong nao khop.</div>
          ) : (
            <>
              {/* header bang TINT theo mau loai dang xem (LAM LAI 19/10/2026, "theo thiet ke R003/R005" - mo
                  phong DataTableModal.tsx: nen header bang = mau loai pha nhat ~8% (hex + "15"), chu = DUNG
                  mau loai, vien duoi 2px CUNG mau - xem Muc 0 bang E). Hover dong = #e3f2fd (ADOPT R005,
                  R003 khong co - xem WHY day du o DB_MODAL.mauHoverDong) */}
              <style>{`
                .r012-dashboard-chitiet-table { border-collapse: collapse; }
                .r012-dashboard-chitiet-table thead th {
                  text-align: left;
                  padding: 12px 8px;
                  background-color: ${mauHeader}15;
                  color: ${mauHeader};
                  font-weight: 600;
                  border: none;
                  border-bottom: 2px solid ${mauHeader};
                }
                .r012-dashboard-chitiet-table tbody td {
                  padding: 8px;
                  border-bottom: 1px solid ${R012_COLORS.tableBorder};
                }
                .r012-dashboard-chitiet-table tbody tr:nth-child(odd) { background-color: #ffffff; }
                .r012-dashboard-chitiet-table tbody tr:nth-child(even) { background-color: #fafbfc; }
                .r012-dashboard-chitiet-table tbody tr:hover { background-color: ${DB_MODAL.mauHoverDong}; }
              `}</style>
              <div className="r012-table-scroll">
                <table className="r012-table r012-dashboard-chitiet-table">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <SortableHeaderCell key={header.id} header={header} />
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* duong ke phan cach bang/phan trang (R003 DataTableModal.tsx cung co dai nay) */}
              <div style={{ borderTop: `1px solid ${DB_MODAL.mauDuongKe}`, marginTop: "1rem" }} />
              <Pagination
                current={trang}
                pageSize={kichThuoc}
                total={data?.tong ?? 0}
                pageSizeOptions={["10", "20", "50", "100", "200"]}
                showSizeChanger
                showTotal={(t) => `Tong ${t} dong`}
                onChange={(trangMoi, kichThuocMoi) => {
                  setTrang(trangMoi);
                  setKichThuoc(kichThuocMoi);
                }}
                style={{ marginTop: "1rem" }}
              />
            </>
          )}
        </Spin>
      )}
    </Modal>
  );
};

export default DashboardChiTietModal;
