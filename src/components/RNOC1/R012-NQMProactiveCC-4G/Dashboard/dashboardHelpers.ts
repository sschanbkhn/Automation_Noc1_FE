// Helper dung chung cho tab Dashboard (THEM 18/10/2026, yeu cau truc tiep user, GET /dashboard/tong-quan -
// xem WHY day du o DashboardTongQuanResponse, types/index.ts).

// ty_le tra ve tu BE DA LA PHAN TRAM SAN (vd 87.5 nghia la 87,5%) - DA XAC NHAN qua doc truc tiep
// application/dashboard_use_case.py::_ty_le() ben BE ("round(so*100/tong, 1)"), KHONG phai fraction 0-1 nen
// KHONG duoc nhan lai 100 (se hien sai nhu "8.750,0%"). Dau PHAY thay dau CHAM (quy uoc so VN), 1 chu so thap
// phan (dung BANG do chinh xac BE da tra, khong lam tron them lan 2 o FE). null (BE chia cho 0, tong=0) -> "-"
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

// "YYYY-MM-DD" (ngay THU HAI dau tuan ISO, xem WHY day du o DashboardXuHuongDiem) -> nhan ngan "dd/mm" cho
// truc X cua bieu do xu huong - BE KHONG tra nhan "Tuan N", FE tu rut gon de truc khong qua dai
export function nhanTuanNgan(tuan: string): string {
  const [, mm, dd] = tuan.split("-");
  return `${dd}/${mm}`;
}

// 3 gia tri CO DINH cua khu_vuc (DUNG DUNG enum BE, xem api/routers/dashboard.py::Literal["KV1","KV2","KV3"])
export const KHU_VUC_OPTIONS = [
  { label: "KV1", value: "KV1" },
  { label: "KV2", value: "KV2" },
  { label: "KV3", value: "KV3" },
];
