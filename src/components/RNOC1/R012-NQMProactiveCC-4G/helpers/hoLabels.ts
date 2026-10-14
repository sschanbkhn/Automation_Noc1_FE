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
  // THEM (12/10/2026, BE commit 9811c42) - X la IBS: phan_lop_delaunay() tra l1_l2=[] NGAY (giong X CRAN ve
  // ket qua), B chon THUAN theo HO (bo qua gating vung Z/KHONG_XAC_DINH) - xem domain/services/
  // ho_cell_selector.py muc "X LA IBS"
  TRAM_IBS: "Tram IBS: khong ve vong, chon cell theo HO",
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

// "co" cua 1 cell trong AffectedCellItem.co (bang A - Cell bi anh huong). SUA (14/10/2026, yeu cau truc
// tiep user) - cot hien thi doi ten "Co" -> "Flag" (xem noi dung o cac bang/popup ban do dung chung nguon
// nay), nhan DOI theo noi dung moi (giai thich RO cell co chay CR hay khong thay vi chi noi "bat thuong")
export const CELL_CO_LABELS: Record<string, string> = {
  BAT_THUONG: "Xa tram tat, khong chay CR",
  CAN_GHEP_TEN: "Chua co trong cell_infor, khong chay CR",
};

// giai thich DAY DU cho tung ma Flag - hien qua tooltip khi re chuot vao o Flag (bang A/popup ban do), KHONG
// hien thang tren o (qua dai) - noi dung LAY DUNG tu yeu cau truc tiep user (dong bo CHINH XAC voi dieu kien
// that o domain/services/ho_cell_selector.py::NGUONG_VUNG_Z_PCT=0.20/NGUONG_VUNG_Z_SR=95.0 - DA DOI CHIEU,
// xem WHY chi tiet o AffectedCellsTable.tsx noi dung cot Flag)
export const CELL_CO_TOOLTIPS: Record<string, string> = {
  BAT_THUONG:
    "Cell nam ngoai vong L1/L2 cua tram tat va nhan it HO (< 20% sector) hoac HO hay that bai (SR < 95%). Van danh gia chat luong, khong chinh tham so.",
  CAN_GHEP_TEN:
    "Khong tim thay cell trong cell_infor (tram moi hoac du lieu chua cap nhat). Khong chay CR, khong danh gia duoc.",
};

// layer: "L1"|"L2"|"Z"|"KHONG_XAC_DINH"|"IBS"|"SMALL_CELL" (2 gia tri sau THEM 12/10/2026, BE commit
// 9811c42 - tram DICH la IBS/SMALL_CELL, xem domain/services/ho_cell_selector.py::CellUngVien.layer) -
// dung chung cho AffectedCellItem.layer/CrCellItem.layer/QuanHeDayDuItem.layer. L1/L2/Z giu nguyen (da la
// nhan ro nghia), 3 gia tri con lai can dich
export function layNhanLayer(layer: string | null | undefined): string {
  if (!layer) {
    return "-";
  }
  switch (layer) {
    case "KHONG_XAC_DINH":
      return "Khong xac dinh";
    case "IBS":
      return "IBS (trong nha)";
    case "SMALL_CELL":
      return "Small cell";
    default:
      return layer;
  }
}

// ham DUNG CHUNG cho MOI dinh dang % trong module (SUA 14/10/2026, yeu cau truc tiep user: "dinh dang so
// dong nhat... dung chung 1 ham format") - value da o DUNG DON VI PHAN TRAM roi (vd 34.5 nghia la 34,5%,
// KHONG phai 0.345), ham CHI lo phan hien thi (dau PHAY theo quy uoc so VN thay dau CHAM, so chu so thap
// phan TRUYEN VAO - 2 ham public ben duoi moi chiu trach nhiem quy value ve dung don vi % truoc khi goi ham
// nay, vi pct_ho/pct_trong_sector la fraction 0-1 can *100 con sr da san dang %, xem WHY day du o 2 ham do)
function formatPercent(value: number | null | undefined, soChuSoThapPhan: number): string {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${value.toFixed(soChuSoThapPhan).replace(".", ",")}%`;
}

// % dang fraction 0-1 (CHUA nhan 100) -> chuoi "xx,x%" (1 chu so thap phan, dau phay). Dung cho
// pct_ho/pct_trong_sector/ty_le_ho_tin_cay (ca 3 deu la TY LE SO LUONG/SO LUONG - vd pct = attempt/tong_goc,
// xem domain/services/ho_cell_selector.py - phep chia 2 so nguyen nen luon ra 0-1). DA XAC NHAN qua doc
// source BE that (adapters/netact/import_ho_neighbor.py::sr = float(row[i_sr]) doc THANG tu cot "Adj Inter
// eNB HO SR" cua file NetAct xuat ra, KHONG chia lai cho 100 - NetAct xuat SR o dang PHAN TRAM SAN, vd 99.82)
// - KHAC ban chat voi pct_ho/pct_trong_sector/ty_le_ho_tin_cay la ty le dem duoc - "sr"/"ho_sr" PHAI dung
// formatSrPercent() rieng ben duoi, KHONG duoc dung ham nay (se nhan sai them 100 lan, vd 99.82 -> "9.982,0%")
// null/undefined -> "-"
export function formatPctHo(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  return formatPercent(value * 100, 1);
}

// SUA (14/10/2026, yeu cau truc tiep user) - SR (AffectedCellItem.sr/CrCellItem.sr/QuanHeDayDuItem.ho_sr) LA
// MOT NGOAI LE: BE da tra SAN o dang PHAN TRAM (vd 99.82, DOC THANG tu cot "Adj Inter eNB HO SR" trong file
// NetAct xuat ra - xem adapters/netact/import_ho_neighbor.py ben BE, KHONG co phep chia nao cho 100 trong
// toan bo pipeline doc/gop du lieu) - KHAC HAN pct_ho/pct_trong_sector/ty_le_ho_tin_cay (nhung ty le dem
// duoc, 0-1, PHAI dung formatPctHo() o tren). Ham nay CHI dinh dang lai (2 chu so thap phan, dau phay thay
// dau cham theo quy uoc tieng Viet - "99,82%") - TUYET DOI KHONG nhan lai 100. null/undefined -> "-"
export function formatSrPercent(value: number | null | undefined): string {
  return formatPercent(value, 2);
}

// dinh dang SO DEM DUOC (so lan HO: AffectedCellItem.so_ho/CrCellItem.so_ho/QuanHeDayDuItem.ho_attempt) - dau
// CHAM ngan nghin (quy uoc so VN cho so nguyen, vd 99.837) - NGUOC voi dau PHAY dung cho phan tram
// (formatPercent o tren). Tu viet grouping thay vi toLocaleString("vi-VN") de AN TOAN/XAC DINH (khong phu
// thuoc Intl locale-data cua moi trinh duyet/runtime - cung triet ly voi formatPercent da viet tay). Excel
// GIU gia tri SO RAW (khong qua ham nay) - chi man hinh moi can dinh dang hien thi. null/undefined -> "-"
export function formatSoLuong(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  const phanNguyen = Math.trunc(value);
  const amDau = phanNguyen < 0;
  const nhom = Math.abs(phanNguyen).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return amDau ? `-${nhom}` : nhom;
}
