// Nhan hien thi cho cac ma co dinh cua nhanh HO (BUOC 4b/4c, 08-10/10/2026, BE chua deploy tai .196) -
// TAT CA ma deu la MA CO DINH ben BE (domain/services/ho_cell_selector.py, application/trigger_cr_use_case.py),
// KHONG phai chuoi da dien giai - FE tu map ma -> text hien thi (giong quy uoc CellNgoaiPhamViTable.tsx voi
// ly_do), tranh doi chu 1 cho phai sua ca 2 phia (FE + BE). Gom 1 file dung chung vi ca 3 bang/alert
// (AffectedCellsTable/CrCellsTable/TacDongTram Alert "Co cua tram X") deu can CUNG 1 nguon nhan nay.

// x_co: "co" cua TRAM GOC (X) - PreviewCrResponse.x_co / BanDoXBlock.co. "IT_DU_LIEU" KHONG tra qua map
// nay - xem layDanhSachNhanXCo() ben duoi (BE da bo sung PreviewCrResponse.sectors_it_du_lieu kem so sector,
// 10/10/2026, THAY THE nhan chung chung truoc do)
export const X_CO_LABELS: Record<string, string> = {
  TOA_DO_DUNG_CHUNG: "Tram CRAN: vi tri cell uoc luong tu HO",
  HO_DI_XA: "UE cua tram chuyen di xa bat thuong",
};

// chuyen mang "co" (PreviewCrResponse.x_co) thanh danh sach nhan hien thi - rieng ma "IT_DU_LIEU" duoc KHAI
// TRIEN thanh 1 nhan/sector (dung PreviewCrResponse.sectors_it_du_lieu, THEM 10/10/2026) thay vi 1 nhan
// chung chung, cac ma con lai tra thang qua X_CO_LABELS. Dung CHUNG cho ca Alert "Co cua tram X"
// (TacDongTram.tsx) va Popup cua marker X tren ban do (PreviewMapHo.tsx) - tranh 2 noi tu khai trien rieng
// roi le nhau khi doi logic sau nay
export function layDanhSachNhanXCo(co: string[], sectorsItDuLieu: number[] | undefined): string[] {
  const ket_qua: string[] = [];
  co.forEach((ma) => {
    if (ma === "IT_DU_LIEU") {
      if (sectorsItDuLieu && sectorsItDuLieu.length > 0) {
        sectorsItDuLieu.forEach((sector) => ket_qua.push(`Sector ${sector} it du lieu HO`));
      } else {
        // BE cu chua tra sectors_it_du_lieu (hoac rong bat thuong du co co IT_DU_LIEU) - fallback nhan chung
        ket_qua.push("Co sector it du lieu HO");
      }
      return;
    }
    ket_qua.push(X_CO_LABELS[ma] ?? ma);
  });
  return ket_qua;
}

// "co" cua 1 cell trong AffectedCellItem.co (bang A - Cell bi anh huong)
export const CELL_CO_LABELS: Record<string, string> = {
  BAT_THUONG: "Bat thuong",
  CAN_GHEP_TEN: "Chua co ten cell",
};

// layer: "L1"|"L2"|"Z"|"KHONG_XAC_DINH" (domain/services/ho_delaunay.py) - dung chung cho AffectedCellItem.layer/
// CrCellItem.layer/QuanHeDayDuItem.layer. CHI "KHONG_XAC_DINH" can dich, L1/L2/Z giu nguyen (da la nhan ro nghia)
export function layNhanLayer(layer: string | null | undefined): string {
  if (!layer) {
    return "-";
  }
  return layer === "KHONG_XAC_DINH" ? "Khong xac dinh" : layer;
}

// % dang fraction 0-1 (CHUA nhan 100, xem WHY tai cac field pct_ho/pct_trong_sector/sr/ty_le_ho_tin_cay
// trong types/index.ts) -> chuoi "xx.x%". null/undefined -> "-"
export function formatPctHo(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${(value * 100).toFixed(1)}%`;
}
