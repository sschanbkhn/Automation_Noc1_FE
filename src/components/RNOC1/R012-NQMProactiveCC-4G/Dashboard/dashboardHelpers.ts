// Helper dung chung cho tab Dashboard (LAM LAI 18/10/2026, yeu cau truc tiep user - doi chieu BE commit
// 124b72b, xem WHY day du o types/index.ts cac type Dashboard*).
import dayjs from "dayjs";
import { DashboardChiTietLoai } from "../types";

// Whitelist cot duoc phep sap_xep theo tung loai (THEM 19/10/2026, BE commit 0e946b7 tren main) - COPY CHINH
// XAC tu domain/ports/outbound/repo_ports.py::COT_SAP_XEP_DASHBOARD ben BE (KHONG tu suy/doan them cot nao) -
// dung de TAT sap xep (enableSorting: false) tren cot khong nam trong danh sach, tranh gui sap_xep gay 422.
// LUU Y 2 cho DE NHAM lan BE that su loai ra (doi chieu ky, KHONG phai thieu sot FE):
//   - loai "qos"/"qoe": KHONG co "tram_id" (chi co "tram_name") va KHONG co "ly_do" trong danh sach sap xep
//     duoc, du ca 2 field nay CO hien thi tren bang va CO trong DashboardChiTietCellRow
//   - "qoe" dung CHUNG 1 mang voi "qos" (BE: COT_SAP_XEP_DASHBOARD["qoe"] = COT_SAP_XEP_DASHBOARD["qos"])
export const COT_SAP_XEP_THEO_LOAI: Record<DashboardChiTietLoai, string[]> = {
  cr: [
    "ngay_cr",
    "session_id",
    "tram_id",
    "tram_name",
    "ma_tinh",
    "ten_tinh",
    "khu_vuc",
    "vendor_tram",
    "status",
    "so_cell_cr",
    "so_cell_anh_huong",
    "ma_loi",
  ],
  qos: ["ngay_cr", "session_id", "tram_name", "cell_name", "vendor_cell", "tb_truoc", "tb_sau", "lech", "ket_qua", "so_ngay_co_du_lieu", "ma_phieu"],
  qoe: ["ngay_cr", "session_id", "tram_name", "cell_name", "vendor_cell", "tb_truoc", "tb_sau", "lech", "ket_qua", "so_ngay_co_du_lieu", "ma_phieu"],
  phieu: ["ngay_xuat", "ma_phieu", "session_id", "cell_name", "vendor_cell", "phuong_an", "trang_thai"],
  can_xu_ly: ["ngay", "loai", "session_id", "tram_id", "tram_name", "status", "ma_loi"],
};

// ty_le tra ve tu BE DA LA PHAN TRAM SAN (vd 87.5 nghia la 87,5%) - DA XAC NHAN qua doc truc tiep
// application/dashboard_use_case.py::_ty_le() ben BE ("round(so*100/tong, 1)"), KHONG phai fraction 0-1 nen
// KHONG duoc nhan lai 100. Dau PHAY thay dau CHAM (quy uoc so VN), 1 chu so thap phan. null (BE chia cho 0,
// tong=0) -> "-" (KHAC 0%, xem WHY o DashboardTyLe)
export function formatTyLe(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${value.toFixed(1).replace(".", ",")}%`;
}

// dinh dang SO DEM DUOC (so_session/so_tram/so_cell_cr/so_luong...) - dau CHAM ngan nghin (quy uoc so VN cho
// so nguyen). Tu viet grouping thay vi toLocaleString("vi-VN") de AN TOAN/XAC DINH, khong phu thuoc Intl
// locale-data cua moi trinh duyet/runtime - cung triet ly voi helpers/hoLabels.ts::formatSoLuong (nhanh HO),
// tach rieng ban sao o day vi Dashboard KHONG thuoc nhanh HO (hoLabels.ts gan rieng cho nhanh do)
export function formatSoDem(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  return Math.trunc(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// "YYYY-MM-DD" -> "dd/mm" (dung cho CA moc ngay lan moc tuan - tuan cung la 1 ngay cu the, ngay DAU TUAN ISO,
// xem WHY day du o DashboardXuHuongDiem.moc) - truc X cua bieu do xu huong khong can phan biet 2 dang
export function nhanMocNgan(moc: string): string {
  const [, mm, dd] = moc.split("-");
  return `${dd}/${mm}`;
}

// "Tuan dd/mm - dd/mm" cho tooltip bieu do xu huong (THEM 19/10/2026 lan 2, yeu cau truc tiep user: "Tooltip:
// 'Tuan dd/mm - dd/mm'") - chi_tiet_thoi_gian nay LUON la "tuan", moc la ngay DAU TUAN ISO (thu 2), tuan 7
// ngay nen ngay CUOI tuan = moc + 6
export function nhanTuanKhoang(moc: string): string {
  const dauTuan = dayjs(moc);
  return `Tuan ${dauTuan.format("DD/MM")} - ${dauTuan.add(6, "day").format("DD/MM")}`;
}

// === TIM KIEM KHONG PHAN BIET HOA/THUONG VA KHONG PHAN BIET DAU (yeu cau truc tiep user, muc 1) ===
// "ha noi" hoac "hni" deu phai ra duoc "HNI - Ha Noi". NFD + xoa dau ket hop (combining diacritical marks) la
// cach chuan de bo dau tieng Viet (vd "à" = "a" + U+0300) - rieng "đ/Đ" KHONG tach duoc qua NFD (no la 1 ky tu
// Latin rieng, khong phai "d" + dau) nen phai thay THEM 1 buoc rieng
export function boDauTiengViet(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// dung lam filterOption cho antd Select mode="multiple" - so khop CA MA LAN TEN vi nhan hien thi da ghep san
// "<ma> - <ten>" (vd "HNI - Ha Noi"), input "hni" se khop qua chinh chuoi nhan nay (khong can so sanh rieng
// voi ma)
export function khopTimKiemKhongDau(input: string, nhan: string): boolean {
  return boDauTiengViet(nhan).includes(boDauTiengViet(input));
}

// nhan tieng Viet cho 6 khoa cua DashboardTrangThaiCount (yeu cau truc tiep user, muc 2) - DUNG CHUNG voi
// layNhanTrangThaiCr() (LichSuCR/crSessionStatus.ts) cho rieng khoa KHONG_CHAY (ham do DA map san "Khong
// chay"), map BO SUNG o day cho 5 khoa con lai: layNhanTrangThaiCr() CO Y GIU NGUYEN cac trang thai khac o
// dang raw ("DONE"/"FAILED"/...) vi noi dung do (SessionHistoryList/EvaluationDetail) hien trang thai THAT
// cua 1 session cu the, KHONG phai nhan tong hop nhu Dashboard nay - KHONG sua layNhanTrangThaiCr de tranh
// doi hanh vi noi khac dang dung dung
export const NHAN_TRANG_THAI_DASHBOARD: Record<string, string> = {
  DONE: "Thanh cong",
  PARTIAL_SUCCESS: "Thanh cong mot phan",
  FAILED: "Loi",
  dang_chay: "Dang chay",
  khac: "Khac",
};

// nhan phuong an xuat phieu (DashboardChiTietPhieuRow.phuong_an / request_payload.PhuongAnXuLyDuKien o BE) -
// gia tri THO tu BE la "1"|"2" (JSON KHONG dien giai, CHI Excel ben BE moi dich - xem WHY day du o
// DashboardChiTietPhieuRow, types/index.ts), FE tu dich khi hien de nguoi dung khong phai nho ma so
export const PHUONG_AN_LABEL: Record<string, string> = {
  "1": "He thong",
  "2": "Hien truong",
};

// nhan ket_qua/ly_do cua /dashboard/chi-tiet (loai=qos|qoe) - DUNG DUNG 3+2 gia tri BE tra (xem
// DashboardChiTietCellRow, types/index.ts)
export const KET_QUA_CHI_TIET_LABEL: Record<string, string> = {
  DAT: "DAT",
  KHONG_DAT: "KHONG DAT",
  INSUFFICIENT_DATA: "Thieu du lieu",
};

export const LY_DO_CHI_TIET_LABEL: Record<string, string> = {
  duoi_muc: "TB sau duoi muc",
  tut: "Tut qua nguong",
};

// nhan "loai" cua /dashboard/chi-tiet khi loai cap tham so la "can_xu_ly" (2 nhanh UNION, gia tri UPPERCASE -
// xem WHY day du o DashboardChiTietCanXuLyRow, types/index.ts - LUU Y khac voi "loai" cap tham so dang
// lowercase, 2 khai niem "loai" khac nhau trong cung 1 endpoint)
export const CAN_XU_LY_LOAI_LABEL: Record<string, string> = {
  QUA_HAN_XUAT_PHIEU: "Qua han xuat phieu",
  KHONG_CHAY: "Khong chay",
};
