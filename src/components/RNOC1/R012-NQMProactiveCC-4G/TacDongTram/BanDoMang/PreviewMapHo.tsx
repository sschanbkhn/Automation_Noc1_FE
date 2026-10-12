// Ban do xem truoc CR RIENG cho nhanh HO (BUOC 4c, 10/10/2026, yeu cau truc tiep user, BE CHUA DEPLOY tai
// .196 - xem PreviewCrResponse.ban_do trong types/index.ts). CHI duoc NetworkMap.tsx goi toi khi
// previewData.ban_do co gia tri (nhanh CDS/BE cu VAN giu nguyen PreviewMap cu, KHONG dung component nay).
//
// Khac nhanh CDS (chi ve tram_goc + tram_bi_anh_huong don gian): nhanh HO co THEM ngu canh phong phu hon -
// toan bo tram CUNG TINH (de NOC thay X nam o dau trong tong the), vi tri UOC LUONG cua cac cell CRAN (X
// khong co toa do RIMS dang tin cay), vong L1/L2 (tram "dang tin cay" lan 1/lan 2 quanh X theo thuat toan
// Delaunay ben BE), nan ty le %HO va duong bao hinh sao quanh X - xem
// TriggerCrUseCase._xay_du_lieu_ban_do()/domain/services/geo_utils.py::duong_bao_hinh_sao() ben BE de biet
// CHINH XAC tung field nay duoc tinh nhu the nao.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  LayersControl,
  LayerGroup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";
import { Button, Tag } from "antd";
import {
  PreviewCrResponse,
  BanDoCellAnhHuong,
  BanDoDuongBaoDiem,
  BanDoTramBiAnhHuong,
  BanDoDiemTram,
  AffectedCellItem,
  CrCellItem,
  QuanHeDayDuItem,
  LoaiTram,
  StationMapPoint,
} from "../../types";
import { R012_COLORS } from "../../theme";
import { useStationsMap } from "../../hooks/useStationsMap";
import { layDanhSachNhanXCo, formatPctHo, layNhanLayer, CELL_CO_LABELS } from "../../helpers/hoLabels";
// SUA (11/10/2026, loi runtime sau deploy 9463f85) - import TU mapCommon.tsx (KHONG con tu "./NetworkMap"
// nua) - xem WHY day du trong chinh file mapCommon.tsx: NetworkMap.tsx import PreviewMapHo.tsx (file nay),
// neu file nay LAI import nguoc tu "./NetworkMap" se tao VONG LAP import giua 2 file, gay crash "buildDotIcon
// is not a function" LUC NAP MODULE (goi buildDotIcon() o cap module ben duoi TRUOC KHI NetworkMap.tsx kip
// chay toi dong gan gia tri cho no, do dang ket qua giua chung o doan import PreviewMapHo.tsx). mapCommon.tsx
// la module LA (khong import NetworkMap.tsx/PreviewMapHo.tsx) nen KHONG con vong lap nao de xay ra loi nay.
import {
  TILE_URL,
  TILE_MIN_ZOOM,
  TILE_MAX_ZOOM,
  TILE_ATTRIBUTION,
  SINGLE_STATION_ZOOM,
  useTileErrorTracker,
  ThieuTileOverlay,
  buildDotIcon,
} from "./mapCommon";

// === PHAN LOAI TRAM - HINH MARKER THEO LOAI (THEM 12/10/2026, yeu cau truc tiep user) ===
// MACRO=tron, IBS=vuong, SMALL_CELL=tam giac, KHAC=hinh thoi - ap dung CHUNG cho moi noi can ve marker theo
// loai (tram cung tinh/L1/L2/tram bi anh huong/X). Dung SVG (khong phai CSS div thuan nhu buildDotIcon cu)
// vi CSS/clip-path KHONG the ve dong thoi "net dut" (stroke-dasharray) cho CA 4 hinh mot cach nhat quan -
// SVG <g stroke-dasharray> ap dung DUNG cho moi loai shape con (circle/rect/polygon) ma khong can ky thuat
// rieng tung hinh.
function duongVienHinhSvg(hinh: LoaiTram, size: number): string {
  const c = size / 2;
  const r = c - 2;
  switch (hinh) {
    case "IBS": // vuong
      return `<rect x="2" y="2" width="${size - 4}" height="${size - 4}" />`;
    case "SMALL_CELL": // tam giac
      return `<polygon points="${c},2 ${size - 2},${size - 2} 2,${size - 2}" />`;
    case "KHAC": // hinh thoi
      return `<polygon points="${c},2 ${size - 2},${c} ${c},${size - 2} 2,${c}" />`;
    case "MACRO":
    default: // tron
      return `<circle cx="${c}" cy="${c}" r="${r}" />`;
  }
}

// Icon dang HINH theo loai tram, dung CHUNG cho CA 5 ngu canh (tram cung tinh/L1/L2/tram bi anh huong/X) -
// GIU MAU hien tai cua tung ngu canh (truyen qua mauNen/mauVien), CHI doi HINH DANG. netDut=true dung cho X
// khi la vi tri UOC LUONG (thay the buildDashedDotIcon cu, gio ho tro CA 4 hinh chu khong chi hinh tron).
// fillOpacity (0-1) dung de ve do dam/nhat cua "tram bi anh huong" (tinhFillOpacity) - GIU NGUYEN y nghia cu,
// chi chuyen tu CircleMarker.pathOptions.fillOpacity sang SVG fill-opacity khi marker la hinh KHAC hinh tron.
function buildHinhIcon(
  hinh: LoaiTram,
  mauVien: string,
  mauNen: string,
  sizePx: number,
  opts?: { netDut?: boolean; fillOpacity?: number }
): L.DivIcon {
  const netDut = opts?.netDut ?? false;
  const doMoNen = opts?.fillOpacity ?? 1;
  const dash = netDut ? ` stroke-dasharray="4 2"` : "";
  const svg = `<svg width="${sizePx}" height="${sizePx}" viewBox="0 0 ${sizePx} ${sizePx}" style="overflow:visible;filter:drop-shadow(0 0 2px rgba(0,0,0,0.6));"><g fill="${mauNen}" fill-opacity="${doMoNen}" stroke="${mauVien}" stroke-width="2"${dash}>${duongVienHinhSvg(hinh, sizePx)}</g></svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
  });
}

// gom 8 ky tu loai tram THAT (M/W/B/E/X/R/F/S/P, xem domain/services/loai_tram.py ben BE) ve 1 trong 4 nhom
// HIEN THI - FE KHONG tu lam lai viec gom nhom (BE da gom san qua nhom_loai_tram()/loai_tram_tu_ten_tram(),
// FE chi NHAN gia tri cuoi "MACRO"/"IBS"/"SMALL_CELL"/"KHAC" roi chon hinh tuong ung). Ham nay CHI xu ly truong
// hop field OPTIONAL chua co gia tri (undefined - BE chua wire xong, xem WHY day du o LoaiTram trong
// types/index.ts) -> fallback "MACRO" (hinh tron) de GIU NGUYEN giao dien cu khi chua co du lieu, dung yeu
// cau "Khong co loai_tram -> tron nhu cu"
function nhomHienThi(loai: LoaiTram | undefined): LoaiTram {
  return loai ?? "MACRO";
}

const NHAN_HINH_TRAM: Record<LoaiTram, string> = {
  MACRO: "Macro",
  IBS: "IBS",
  SMALL_CELL: "Small cell",
  KHAC: "Khac",
};

// === MAC DINH LOP BAN DO + NHO LUA CHON (THEM 12/10/2026, yeu cau truc tiep user) ===
// Ten CHINH XAC cua tung overlay (PHAI khop 100% voi props "name=" truyen cho moi LayersControl.Overlay
// ben duoi) - dung LAM KHOA luu localStorage (xem WHY o docLuaChonDaLuu()). Khai bao hang so rieng (khong
// ghi chuoi lap lai nhieu noi) de tranh go sai lech giua noi dang ky overlay va noi doc/ghi localStorage.
const TEN_LOP_DUONG_BAO = "Duong bao vung anh huong";
const TEN_LOP_NAN = "Nan (ty le %HO tung tram)";
const TEN_LOP_PHAN_TRAM_CELL = "% theo cell";
const TEN_LOP_L1 = "Vong L1";
const TEN_LOP_L2 = "Vong L2";
function tenLopTramCungTinh(hinh: LoaiTram): string {
  return `Tram cung tinh - ${NHAN_HINH_TRAM[hinh]}`;
}

// Mac dinh LAN DAU (yeu cau truc tiep user) - BAT: duong bao/nan/L1/tram cung tinh Macro; TAT: % theo
// cell/L2/tram cung tinh IBS-Small cell-Khac
const MAC_DINH_LOP: Record<string, boolean> = {
  [TEN_LOP_DUONG_BAO]: true,
  [TEN_LOP_NAN]: true,
  [TEN_LOP_L1]: true,
  [TEN_LOP_L2]: false,
  [TEN_LOP_PHAN_TRAM_CELL]: false,
  [tenLopTramCungTinh("MACRO")]: true,
  [tenLopTramCungTinh("IBS")]: false,
  [tenLopTramCungTinh("SMALL_CELL")]: false,
  [tenLopTramCungTinh("KHAC")]: false,
};

// khoa RIENG cho ban do R012 (khong trung voi localStorage key nao khac trong toan bo app) - "v1" de danh
// cho truong hop sau nay doi cau truc du lieu luu (them lop moi, doi ten...) can invalidate cache cu
const R012_MAP_LAYERS_STORAGE_KEY = "r012_preview_map_ho_layers_v1";

// Doc lua chon DA LUU tu localStorage - BOC try/catch THEO YEU CAU: localStorage co the nem loi (private
// browsing mode cua Safari cu chan hoan toan, quota exceeded...) hoac du lieu JSON hong (vd nguoi dung tu
// sua tay trong DevTools) - MOI truong hop loi deu phai tra ve {} (coi nhu chua luu gi) THAY VI de loi
// lam vo (crash) ca trang ban do
function docLuaChonDaLuu(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(R012_MAP_LAYERS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, boolean>;
    }
    return {};
  } catch {
    return {};
  }
}

// Ghi 1 lua chon MOI (giu nguyen cac lua chon khac da luu truoc do) - CUNG boc try/catch, im lang bo qua
// neu localStorage loi (KHONG throw lam gian doan thao tac bat/tat cua nguoi dung)
function luuLuaChon(ten: string, bat: boolean): void {
  try {
    const hienTai = docLuaChonDaLuu();
    hienTai[ten] = bat;
    window.localStorage.setItem(R012_MAP_LAYERS_STORAGE_KEY, JSON.stringify(hienTai));
  } catch {
    // im lang - khong lam gian doan trai nghiem bat/tat lop cua nguoi dung chi vi khong luu duoc
  }
}

function xoaLuaChonDaLuu(): void {
  try {
    window.localStorage.removeItem(R012_MAP_LAYERS_STORAGE_KEY);
  } catch {
    // im lang
  }
}

// Trang thai checked THAT SU cua 1 overlay - uu tien lua chon DA LUU (neu co), fallback ve MAC_DINH_LOP khi
// chua tung luu (lan dau mo ban do, hoac sau khi bam "Mac dinh")
function layTrangThaiLop(ten: string): boolean {
  const daLuu = docLuaChonDaLuu();
  if (Object.prototype.hasOwnProperty.call(daLuu, ten)) {
    return daLuu[ten];
  }
  return MAC_DINH_LOP[ten] ?? false;
}

// marker do CHAC CHAN cho X (tram goc bi tat, vi tri la CHINH toa do RIMS/khong phai CRAN hoac CRAN nhung
// khong uoc luong duoc) - SUA (12/10/2026): THAY buildDotIcon/buildDashedDotIcon cu (chi hinh tron) bang
// buildHinhIcon (ho tro 4 hinh) - tinh toan TRONG component (useMemo) vi phu thuoc x.loai_tram, KHONG con la
// hang so module-level co dinh nhu truoc (xem cho goi trong PreviewMapHo ben duoi)

// SUA (11/10/2026, yeu cau truc tiep user) - mau TIM NHAT rieng cho tram cung tinh (context), TACH KHOI
// token statusRunning (xam) cu: "noi hon nen OSM nhung nhat hon tram bi anh huong" - tim nhat (#a78bfa,
// violet-400) du tuong phan voi nen OSM (vang nhat/trang) hon mau xam cu, nhung van NHAT HON han mau xanh
// duong dac (primary, fillOpacity cao) cua marker "tram bi anh huong" nen khong gay nham lan ve muc do quan
// trong. Vien dam hon (#7c3aed, violet-600) de vien ro net tren nen nhat. KHONG co san trong theme.ts (gia
// tri moi, rieng cho muc dich nay) nen khai bao truc tiep o day, khong dung token chung
const MAU_TRAM_CUNG_TINH_NEN = "#a78bfa";
const MAU_TRAM_CUNG_TINH_VIEN = "#7c3aed";
// ban kinh hien thi THAT (px) cua cham tron tram cung tinh (4-5px theo yeu cau) - KHAC voi ban kinh VUNG BAT
// CHUOT lon hon o duoi (BAN_KINH_BAT_CHUOT_TRAM_CUNG_TINH), xem comment tai noi dung CircleMarker
const BAN_KINH_TRAM_CUNG_TINH = 4;
// vung bat chuot (invisible, lon hon han cham tron hien thi) - de de hover/click hon o zoom thap khi cham
// chi con 4px that su rat kho trung chuot. CircleMarker THAT hien thi (4px, tim nhat) duoc ve SAU, interactive
// false, de khong tranh su kien voi vong bat chuot nay
const BAN_KINH_BAT_CHUOT_TRAM_CUNG_TINH = 8;

// marker rieng cho vi tri TONG DAI cua X khi X la CRAN (THEM 10/10/2026) - mau XAM (TAI SU DUNG token
// statusRunning co san trong theme.ts, KHAC han mau tim cua tram cung tinh o tren - 2 khai niem khac nhau,
// "tong dai CRAN" la 1 DIEM DUY NHAT dac biet, khong phai 1 phan cua lop ngu canh tram cung tinh) - to hon
// cham tron tram cung tinh 1 chut (16px, co vien trang + shadow qua buildDotIcon)
const tongDaiIcon = buildDotIcon(R012_COLORS.statusRunning, 16);

// khoang fillOpacity cho marker "tram bi anh huong" - thap nhat van du nhin thay (0.35), cao nhat la 1
// (dam nhat). Cong thuc noi suy TUYEN TINH theo tong_pct_ho/maxTongPct trong CHINH preview nay (tuong doi,
// KHONG phai thang tuyet doi 0-100%) - spec yeu cau "dam nhat theo tong % HO" nhung KHONG cho cong thuc cu
// the, day la lua chon hien thi cua FE, co the dieu chinh lai de nhin ro hon neu can
const FILL_OPACITY_MIN = 0.35;
const FILL_OPACITY_MAX = 1;

function tinhFillOpacity(tongPctHo: number, maxTongPctHo: number): number {
  if (maxTongPctHo <= 0) {
    return FILL_OPACITY_MIN;
  }
  const ti_le = Math.min(1, Math.max(0, tongPctHo / maxTongPctHo));
  return FILL_OPACITY_MIN + (FILL_OPACITY_MAX - FILL_OPACITY_MIN) * ti_le;
}

// do day (px) cho "nan" (tia tu TAM den tung dinh duong bao, THEM 10/10/2026, yeu cau truc tiep user) - ty
// le THEO %HO cua dinh do, cung co che noi suy tuyen tinh voi tinhFillOpacity o tren (tuong doi trong CHINH
// preview nay, KHONG phai thang tuyet doi)
const NAN_WEIGHT_MIN = 1;
const NAN_WEIGHT_MAX = 6;
// chi hien nhan %HO canh moi dinh tu zoom nay tro len (yeu cau truc tiep user) - duoi muc nay cac dinh qua
// gan nhau tren man hinh, chu se de len nhau khong doc duoc
const ZOOM_HIEN_NHAN_NAN = 14;
// THEM (11/10/2026, yeu cau truc tiep user) - nhan %HO CHI hien cho tram >= nguong nay (0.05 = 5%, fraction
// CHUA nhan 100 - xem formatPctHo trong hoLabels.ts); tram nho hon van co tia (do day van ty le %HO binh
// thuong) nhung KHONG gan nhan permanent de tranh ban do qua nhieu chu so chi/de len nhau - % chinh xac cua
// tram nho van xem duoc qua Tooltip hover cua CHINH marker tram do (xem CircleMarker "tram bi anh huong" ben
// duoi, Tooltip o do KHONG bi gioi han nguong nay)
const NGUONG_HIEN_NHAN_PCT = 0.05;
// THEM (11/10/2026, yeu cau truc tiep user) - "dat nhan lech ra ngoai theo huong nan, khong de len X": day
// vi tri nhan ra xa TAM mot doan = ty le nay NHAN voi do dai vector (tam -> dinh), tuc nhan nam LUI RA SAU
// dinh (xa TAM/X hon chinh dinh do) thay vi dat dung tai toa do dinh (de chong len marker tram tai do)
const NAN_LABEL_OFFSET_RATIO = 0.15;

function tinhDoDayNan(pctHo: number, maxPctHo: number): number {
  if (maxPctHo <= 0) {
    return NAN_WEIGHT_MIN;
  }
  const ti_le = Math.min(1, Math.max(0, pctHo / maxPctHo));
  return NAN_WEIGHT_MIN + (NAN_WEIGHT_MAX - NAN_WEIGHT_MIN) * ti_le;
}

// THEM (11/10/2026, yeu cau truc tiep user) - khoang cach THAT (km) tu TAM den 1 tram bi anh huong, dung cho
// Popup/Tooltip (B10). BE HIEN KHONG tra san field "km" nao cho tram_bi_anh_huong (da doi chieu truc tiep
// application/trigger_cr_use_case.py::_xay_du_lieu_ban_do() + api/schemas/cr_schemas.py::AffectedCellItem -
// khong co key "km" o ca 2 noi) nen FE tu tinh (haversine chuan) - dung dung "neu co" theo yeu cau, phan
// "neu co" KHONG ap dung duoc o day vi BE chua co, FE tiep tuc tu tinh nhu truoc
const BAN_KINH_TRAI_DAT_KM = 6371;
function tinhKhoangCachKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * BAN_KINH_TRAI_DAT_KM * Math.asin(Math.sqrt(a));
}

// SUA (11/10/2026, yeu cau truc tiep user) - "Layer" cua 1 TRAM bi anh huong gio lay TU DU LIEU BE THAT
// (AffectedCellItem.layer trong data.cells_bi_anh_huong - danh sach A o CAP TREN CUNG cua PreviewCrResponse,
// KHONG phai suy tu banDo.l1/l2 nhu ban truoc - da BO cach lam cu vi "tu suy" co the SAI lech voi gia tri
// THAT BE da tinh, vd truong hop KHONG_XAC_DINH). TOAN BO cell cung tram_dich_id deu CHIA SE 1 gia tri layer
// DUY NHAT (BE gan layer theo PHAN LOAI CUA TRAM DICH, khong phai tung cell rieng - xem domain/services/
// ho_cell_selector.py: "Tram dich la TOA_DO_DUNG_CHUNG (BAT KE X co la gi): layer gan = KHONG_XAC_DINH"), nen
// chi can lay gia tri cua CELL DAU TIEN khop tram_id la du, khong co nguy co mau thuan giua cac cell
function layLayerCuaTramTuBE(tramId: string, cellsBiAnhHuong: AffectedCellItem[]): string | null {
  const cell = cellsBiAnhHuong.find((c) => c.tram_id === tramId && c.layer !== null && c.layer !== undefined);
  return cell?.layer ?? null;
}

// "KHONG_XAC_DINH" (BE gan khi TRAM DICH la CRAN - TOA_DO_DUNG_CHUNG, xem WHY day du o
// layLayerCuaTramTuBE()) - hien ro "(CRAN)" theo yeu cau truc tiep user, thay vi chi "Khong xac dinh" chung
// chung nhu layNhanLayer() dung chung trong hoLabels.ts (ham do dung cho ngu canh CELL/sector khac, KHONG
// doi o day de tranh anh huong cac bang khac dang dung chung ham do)
// SUA (12/10/2026, BE commit 9811c42) - dung lai layNhanLayer() dung chung (hoLabels.ts) lam NEN cho
// IBS/SMALL_CELL (nhan giong moi noi khac trong module), CHI "KHONG_XAC_DINH" la rieng cho ngu canh nay
// (them hau to "(CRAN)" - xem WHY day du o layLayerCuaTramTuBE truoc do)
function layNhanLayerTramBiAnhHuong(layer: string | null): string {
  if (!layer) {
    return "-";
  }
  return layer === "KHONG_XAC_DINH" ? "Khong xac dinh (CRAN)" : layNhanLayer(layer);
}

// THEM (12/10/2026, yeu cau truc tiep user) - chi tiet % HO THEO TUNG CELL cua 1 tram bi anh huong, LAY
// THANG tu du lieu BE da tra (KHONG tinh lai):
//   - data.quan_he_day_du (QuanHeDayDuItem[]) - nguon CHINH, GIU CA cac sector "phu" TRUOC dedup (xem
//     domain/services/ho_cell_selector.py comment dong "quan_he_day_du (THEM 08/10/2026)") - 1 cell co the
//     xuat hien NHIEU LAN neu nhieu sector cua X cung HO sang no, moi lan la 1 dong rieng (dung y "S<sector>
//     > cell <lcr>" - the hien RO quan he tu sector nao). Loc theo target_enb === Number(tram.tram_id) vi
//     target_enb CHINH LA LNBTS cua tram dich (= tram_id).
//   - data.cells_chay_cr (CrCellItem[]) - tra cuu "vai tro CR" (action_type: "rsboost"|"qrxlevmin") theo
//     cell_name, CHI co gia tri khi cell nay THAT SU nam trong nhanh B (12/47 vd).
//   - data.cells_bi_anh_huong (AffectedCellItem[]) - tra cuu co "BAT_THUONG"/"CAN_GHEP_TEN" theo cell_name.
// cell_name cua tung dong: tra tu BanDoCellAnhHuong (t.cells, ban_do) theo target_lcr - day la noi DUY NHAT
// map (target_enb,target_lcr) -> cell_name THAT (quan_he_day_du khong tu co cell_name).
interface ChiTietCellTheoSector {
  sector: number;
  target_lcr: number;
  cell_name: string | null;
  pct_trong_sector: number;
  so_ho: number;
  sr: number | null;
  layer: string;
  vai_tro_cr: string | null;
  co: string[];
}

function layChiTietCellTheoTram(
  t: BanDoTramBiAnhHuong,
  quanHeDayDu: QuanHeDayDuItem[],
  cellsChayCr: CrCellItem[],
  cellsBiAnhHuong: AffectedCellItem[]
): ChiTietCellTheoSector[] {
  const tramIdSo = Number(t.tram_id);
  const cellNameTheoLcr = new Map<number, string | null>();
  t.cells.forEach((c) => cellNameTheoLcr.set(c.target_lcr, c.cell_name));

  return quanHeDayDu
    .filter((q) => q.target_enb === tramIdSo)
    .map((q): ChiTietCellTheoSector => {
      const cellName = cellNameTheoLcr.get(q.target_lcr) ?? null;
      const crCell = cellName ? cellsChayCr.find((c) => c.cell_name === cellName) : undefined;
      const affectedCell = cellName ? cellsBiAnhHuong.find((c) => c.cell_name === cellName) : undefined;
      const co = affectedCell?.co ? [...affectedCell.co] : [];
      // cell_name null (CAN_GHEP_TEN - BE khong resolve duoc ten/DN, xem AffectedCellItem trong
      // types/index.ts) - gan truc tiep co nay, KHONG tra cuu duoc qua cells_bi_anh_huong (key cell_name
      // cung la null o do, co the trung voi cell CAN_GHEP_TEN KHAC trong cung tram - KHONG tin cay de match)
      if (cellName === null && !co.includes("CAN_GHEP_TEN")) {
        co.push("CAN_GHEP_TEN");
      }
      return {
        sector: q.sector,
        target_lcr: q.target_lcr,
        cell_name: cellName,
        pct_trong_sector: q.pct_trong_sector,
        so_ho: q.ho_attempt,
        sr: q.ho_sr,
        layer: q.layer,
        vai_tro_cr: crCell?.action_type ?? null,
        co,
      };
    })
    .sort((a, b) => b.pct_trong_sector - a.pct_trong_sector); // % cao nhat len dau cho de doc
}

// THEM (12/10/2026, yeu cau truc tiep user) - "nho lua chon bat/tat" cua nguoi dung vao localStorage. Leaflet
// tu ban su kien 'overlayadd'/'overlayremove' TREN CHINH MAP INSTANCE moi khi 1 overlay cua LayersControl
// duoc bat/tat (ke ca khi NOC tu click, KHONG rieng goi qua code) - "e.name" la DUNG chuoi da truyen cho
// prop "name=" cua LayersControl.Overlay, nen dung THANG lam khoa luu, khong can bang tra rieng. Component
// RIENG vi useMapEvents BAT BUOC goi trong con chau cua MapContainer (cung ly do voi NanLayer ben duoi)
const LayerStateListener: React.FC = () => {
  useMapEvents({
    overlayadd: (e) => luuLuaChon(e.name, true),
    overlayremove: (e) => luuLuaChon(e.name, false),
  });
  return null;
};

// lop "Nan" (THEM 10/10/2026, yeu cau truc tiep user) - tia duong thang tu TAM den TUNG dinh duong bao
// (polygon neu co, hoac doan neu duong bao khong du 3 diem de tao polygon - CA 2 truong hop deu dung CHUNG
// danh sach dinh nay, xem cach goi o duoi), do day ty le %HO, nhan %HO canh dinh CHI hien tu zoom 14. Tach
// rieng component vi CAN doc zoom HIEN TAI cua map (useMapEvents) - hook nay BAT BUOC goi trong 1 component
// la CON CHAU cua MapContainer, khong the goi thang trong PreviewMapHo (ham cha, nam NGOAI MapContainer luc
// khai bao JSX dau return)
const NanLayer: React.FC<{ tam: [number, number]; diem: BanDoDuongBaoDiem[] }> = ({ tam, diem }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  // CHI ve nan toi diem CO %HO rieng - loai diem LA CHINH X duoc BE chen vao polygon khi x_tren_vien=true
  // (diem do khong co key "pct_ho", xem BanDoDuongBaoDiem trong types/index.ts) vi 1 tia "tu tam den chinh
  // no" vo nghia
  const diemCoTyLe = useMemo(() => diem.filter((d) => !d.la_x && typeof d.pct_ho === "number"), [diem]);
  const maxPctHo = useMemo(
    () => Math.max(0.0001, ...diemCoTyLe.map((d) => d.pct_ho as number)),
    [diemCoTyLe]
  );

  return (
    <>
      {diemCoTyLe.map((d) => {
        const pct = d.pct_ho as number;
        // nhan lech ra ngoai (yeu cau truc tiep user) - diem neo cua Tooltip la TAM + vector (tam->dinh)
        // nhan them he so NAN_LABEL_OFFSET_RATIO, tuc LUI RA SAU dinh (xa tam hon chinh dinh), KHONG de ngay
        // tai toa do dinh (se de len marker tram tai do) va cang KHONG the de len X (X nam o tam, huong lech
        // la huong RA XA tam/X)
        const diemNhan: [number, number] = [
          tam[0] + (d.lat - tam[0]) * (1 + NAN_LABEL_OFFSET_RATIO),
          tam[1] + (d.lon - tam[1]) * (1 + NAN_LABEL_OFFSET_RATIO),
        ];
        return (
          <Polyline
            key={`${d.tram_id}-${d.lat}-${d.lon}`}
            positions={[tam, [d.lat, d.lon]]}
            pathOptions={{ color: R012_COLORS.primaryDark, weight: tinhDoDayNan(pct, maxPctHo) }}
          >
            {/* THEM (11/10/2026): nhan CHI hien tu zoom 14 TRO LEN VA tram >= 5% (NGUONG_HIEN_NHAN_PCT) -
                tram nho hon van co tia (do day van ty le binh thuong), % van xem duoc qua Tooltip hover cua
                CHINH marker tram do (khong gioi han nguong nay) */}
            {zoom >= ZOOM_HIEN_NHAN_NAN && pct >= NGUONG_HIEN_NHAN_PCT && (
              <Tooltip permanent direction="center" position={diemNhan}>
                {formatPctHo(pct)}
              </Tooltip>
            )}
          </Polyline>
        );
      })}
    </>
  );
};

// THEM (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user) - marker 1 tram CUNG TINH, hinh theo loai_tram.
// Tach component rieng (thay vi viet thang trong .map() o PreviewMapHo) de dung CHUNG code (Popup/dieu kien
// hinh) cho CA 4 nhom hien thi khac nhau trong LayersControl ben duoi, tranh lap code 4 lan.
//
// QUYET DINH HIEU NANG: nhom MACRO (gom CA truong hop loai_tram=undefined - xem nhomHienThi) VAN dung CircleMarker
// (canvas, 2 lop invisible-hit-area + visible-dot nhu TRUOC khi co PHAN LOAI TRAM) - GIU Y NGUYEN cho ~6.200
// tram/tinh (vd Ha Noi) khong lam nang trinh duyet. CHI 3 nhom con lai (IBS/SMALL_CELL/KHAC - theo du lieu
// BE da doi chieu, chiem ~13% tong so tram CA NUOC, xem domain/services/loai_tram.py) moi chuyen sang
// Marker+icon SVG (DOM, KHONG con canvas) - Leaflet KHONG ho tro hinh VUONG/TAM GIAC/THOI qua Path canvas
// (CircleMarker LUON la hinh tron theo dinh nghia cua chinh Leaflet), bat buoc phai dung Marker/divIcon cho
// 3 hinh con lai. So luong marker DOM phat sinh THEM van nho (thieu so, KHONG phai toan bo ~6.200).
const TramCungTinhMarker: React.FC<{ t: StationMapPoint; hinh: LoaiTram; khuVuc: string | null }> = ({
  t,
  hinh,
  khuVuc,
}) => {
  if (t.lat === null || t.lon === null) {
    return null;
  }
  const lat = t.lat;
  const lon = t.lon;
  const popupNoiDung = (
    <>
      <div>
        <strong>{t.ten}</strong>
      </div>
      <div>Ma tram: {t.tram_id}</div>
      <div>Vendor: {t.vendor}</div>
      {/* THEM (12/10/2026) - "moi tram ghi them loai tram" - "Khong xac dinh" khi field chua co gia tri
          (BE chua wire xong o /stations/map, xem WHY day du o LoaiTram trong types/index.ts) */}
      <div>Loai tram: {t.loai_tram ? NHAN_HINH_TRAM[hinh] : "Khong xac dinh"}</div>
      {/* KV suy tu x.khu_vuc (KHONG phai field rieng tu /stations/map - BE chi tra 6 cot co
          dinh, xem StationMapPoint trong types/index.ts) - HOP LE vi query ma_tinh=x.ma_tinh
          nen MOI tram trong tramCungTinh CHAC CHAN cung tinh, tuc CUNG khu vuc voi X */}
      {khuVuc && <div>Khu vuc: {khuVuc}</div>}
    </>
  );

  if (hinh === "MACRO") {
    return (
      <>
        <CircleMarker
          center={[lat, lon]}
          radius={BAN_KINH_BAT_CHUOT_TRAM_CUNG_TINH}
          pathOptions={{ opacity: 0, fillOpacity: 0, weight: 0 }}
        >
          <Tooltip>{t.ten}</Tooltip>
          <Popup>{popupNoiDung}</Popup>
        </CircleMarker>
        <CircleMarker
          center={[lat, lon]}
          radius={BAN_KINH_TRAM_CUNG_TINH}
          interactive={false}
          pathOptions={{
            color: MAU_TRAM_CUNG_TINH_VIEN,
            fillColor: MAU_TRAM_CUNG_TINH_NEN,
            fillOpacity: 0.85,
            weight: 1.5,
          }}
        />
      </>
    );
  }

  return (
    <Marker position={[lat, lon]} icon={buildHinhIcon(hinh, MAU_TRAM_CUNG_TINH_VIEN, MAU_TRAM_CUNG_TINH_NEN, 10)}>
      <Tooltip>{t.ten}</Tooltip>
      <Popup>{popupNoiDung}</Popup>
    </Marker>
  );
};

// THEM (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user) - marker 1 tram BI ANH HUONG, hinh theo
// loai_tram. Tach component rieng vi noi dung Tooltip/Popup kha dai (bang chi tiet cell) - tranh viet 2 lan
// cho nhanh MACRO (CircleMarker) va nhanh khac (Marker+icon).
const TramBiAnhHuongMarker: React.FC<{
  t: BanDoTramBiAnhHuong;
  data: PreviewCrResponse;
  maxTongPctHo: number;
  tamLat: number;
  tamLon: number;
}> = ({ t, data, maxTongPctHo, tamLat, tamLon }) => {
  if (t.lat === null || t.lon === null) {
    return null;
  }
  const lat = t.lat;
  const lon = t.lon;
  const hinh = nhomHienThi(t.loai_tram);
  const fillOpacity = tinhFillOpacity(t.tong_pct_ho, maxTongPctHo);
  const layerNhan = layNhanLayerTramBiAnhHuong(layLayerCuaTramTuBE(t.tram_id, data.cells_bi_anh_huong));
  const khoangCachKm = tinhKhoangCachKm(tamLat, tamLon, lat, lon);
  const chiTiet = layChiTietCellTheoTram(t, data.quan_he_day_du ?? [], data.cells_chay_cr, data.cells_bi_anh_huong);

  const tooltipNoiDung = (
    <>
      {/* SUA (12/10/2026) - dong dau THEM layer + km + loai tram (truoc chi co tong %HO) */}
      <div>{`${formatPctHo(t.tong_pct_ho)} tong HO cua tram tat - ${layerNhan}, ${khoangCachKm.toFixed(1)} km, ${NHAN_HINH_TRAM[hinh]}`}</div>
      {chiTiet.map((c) => (
        <div key={`${c.sector}-${c.target_lcr}`}>
          {`S${c.sector} > cell ${c.cell_name ?? c.target_lcr}  ${formatPctHo(c.pct_trong_sector)}`}
          {c.vai_tro_cr && ` - CR ${c.vai_tro_cr}`}
          {c.co.length > 0 && ` [${c.co.map((ma) => CELL_CO_LABELS[ma] ?? ma).join(", ")}]`}
        </div>
      ))}
    </>
  );

  const popupNoiDung = (
    <>
      <div>
        <strong>{t.ten ?? t.tram_id}</strong>
      </div>
      <div>Ma tram: {t.tram_id}</div>
      <div>Layer: {layerNhan}</div>
      <div>Khoang cach: {khoangCachKm.toFixed(1)} km</div>
      <div>Loai tram: {t.loai_tram ? NHAN_HINH_TRAM[hinh] : "Khong xac dinh"}</div>
      <div>Tong % HO: {formatPctHo(t.tong_pct_ho)}</div>
      <table style={{ marginTop: "6px", borderCollapse: "collapse", fontSize: "0.72rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "2px 6px 2px 0" }}>Cell</th>
            <th style={{ textAlign: "right", padding: "2px 6px" }}>Sector</th>
            <th style={{ textAlign: "right", padding: "2px 6px" }}>% sector</th>
            <th style={{ textAlign: "right", padding: "2px 6px" }}>So HO</th>
            <th style={{ textAlign: "right", padding: "2px 6px" }}>SR</th>
            <th style={{ textAlign: "left", padding: "2px 6px" }}>Layer</th>
            <th style={{ textAlign: "left", padding: "2px 0 2px 6px" }}>Vai tro CR</th>
          </tr>
        </thead>
        <tbody>
          {chiTiet.map((c) => (
            <tr key={`${c.sector}-${c.target_lcr}`}>
              <td style={{ padding: "2px 6px 2px 0" }}>{c.cell_name ?? `LCR ${c.target_lcr}`}</td>
              <td style={{ textAlign: "right", padding: "2px 6px" }}>{c.sector}</td>
              <td style={{ textAlign: "right", padding: "2px 6px" }}>{formatPctHo(c.pct_trong_sector)}</td>
              <td style={{ textAlign: "right", padding: "2px 6px" }}>{c.so_ho}</td>
              <td style={{ textAlign: "right", padding: "2px 6px" }}>{formatPctHo(c.sr)}</td>
              <td style={{ padding: "2px 6px" }}>{layNhanLayer(c.layer)}</td>
              <td style={{ padding: "2px 0 2px 6px" }}>{c.vai_tro_cr ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  if (hinh === "MACRO") {
    return (
      <CircleMarker
        center={[lat, lon]}
        radius={10}
        pathOptions={{
          color: R012_COLORS.primaryDark,
          fillColor: R012_COLORS.primary,
          fillOpacity,
          weight: 2,
        }}
      >
        <Tooltip>{tooltipNoiDung}</Tooltip>
        <Popup>{popupNoiDung}</Popup>
      </CircleMarker>
    );
  }

  return (
    <Marker
      position={[lat, lon]}
      icon={buildHinhIcon(hinh, R012_COLORS.primaryDark, R012_COLORS.primary, 16, { fillOpacity })}
    >
      <Tooltip>{tooltipNoiDung}</Tooltip>
      <Popup>{popupNoiDung}</Popup>
    </Marker>
  );
};

// THEM (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user) - marker 1 diem tram trong vong L1/L2, hinh theo
// loai_tram, mau GIU NGUYEN mau duong Vong L1/L2 hien co (truyen qua "mau"). Truoc day L1/L2 CHI co duong
// Polyline noi cac diem, KHONG co marker rieng tung diem - THEM moi hoan toan (khong anh huong Polyline).
function renderDiemTramMarker(d: BanDoDiemTram, layerNhan: "L1" | "L2", mau: string) {
  if (d.lat === null || d.lon === null) {
    return null;
  }
  const hinh = nhomHienThi(d.loai_tram);
  return (
    <Marker key={d.tram_id} position={[d.lat, d.lon]} icon={buildHinhIcon(hinh, mau, mau, 10)}>
      <Tooltip>
        {`${d.ten ?? d.tram_id} - ${layerNhan}${d.loai_tram ? `, ${NHAN_HINH_TRAM[hinh]}` : ""}`}
      </Tooltip>
    </Marker>
  );
}

// swatch nho cho legend - 3 kieu: cham tron (marker), vong net dut (CRAN), duong ke (polygon/polyline)
const ChamTron: React.FC<{ mau: string }> = ({ mau }) => (
  <span
    style={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      backgroundColor: mau,
      marginRight: 6,
    }}
  />
);
const VongNetDut: React.FC<{ mau: string }> = ({ mau }) => (
  <span
    style={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      border: `2px dashed ${mau}`,
      marginRight: 6,
    }}
  />
);
const DuongKe: React.FC<{ mau: string }> = ({ mau }) => (
  <span
    style={{
      display: "inline-block",
      width: 14,
      height: 2,
      backgroundColor: mau,
      marginRight: 6,
      verticalAlign: "middle",
    }}
  />
);
// THEM (11/10/2026) - duong ke NET DUT, dung rieng cho "Duong bao vung anh huong" (SUA B6: doi sang net dut
// de phan biet voi "Nan" net lien, xem comment pathOptions cua Polygon duong bao ben duoi)
const DuongKeNetDut: React.FC<{ mau: string }> = ({ mau }) => (
  <span
    style={{
      display: "inline-block",
      width: 14,
      height: 0,
      borderTop: `2px dashed ${mau}`,
      marginRight: 6,
      verticalAlign: "middle",
    }}
  />
);

// THEM (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user) - swatch HINH DANG cho chu giai (B4: "Chu giai
// them 4 hinh") - dung SVG JSX THAT (khac buildHinhIcon o tren dung chuoi HTML cho L.divIcon cua Leaflet) vi
// day la React render binh thuong, khong can qua Leaflet. Mau XAM trung tinh DUY NHAT (khac mau cua tung
// ngu canh) vi hinh dang la thuoc tinh CHUNG, khong gan voi 1 mau/vai tro cu the nao
const HinhSwatch: React.FC<{ hinh: LoaiTram }> = ({ hinh }) => {
  const mau = "#595959";
  let shape: React.ReactNode;
  switch (hinh) {
    case "IBS":
      shape = <rect x="1" y="1" width="10" height="10" fill={mau} />;
      break;
    case "SMALL_CELL":
      shape = <polygon points="6,1 11,11 1,11" fill={mau} />;
      break;
    case "KHAC":
      shape = <polygon points="6,1 11,6 6,11 1,6" fill={mau} />;
      break;
    case "MACRO":
    default:
      shape = <circle cx="6" cy="6" r="5" fill={mau} />;
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ marginRight: 6, verticalAlign: "middle" }}>
      {shape}
    </svg>
  );
};

// SUA (11/10/2026, yeu cau truc tiep user) - chu giai mau gio THU GON duoc (B3: "nho lai, thu gon duoc, MAC
// DINH THU GON") VA CHI hien cac muc THAT SU lien quan den preview dang xem (B4: "muc CRAN chi hien khi X
// la CRAN") - nhan props dieu kien tu PreviewMapHo de biet CHINH XAC lop nao dang duoc ve, tranh hien 1 dong
// chu giai cho 1 thu khong co tren ban do (vd "Vi tri uoc luong cell CRAN" khi X la CRAN nhung 0 cell nao
// uoc luong duoc - dung flag RIENG cho tung dong, khong dung 1 flag "isCran" chung chung cho tat ca)
interface LegendProps {
  coXUocLuong: boolean; // marker X dang o dang net dut (coViTriUocLuongRieng)
  coTongDaiRieng: boolean; // marker "Tong dai CRAN" rieng co dang hien
  coViTriUocLuongCell: boolean; // CircleMarker net dut vi tri uoc luong tung cell co dang hien
  coDuongBao: boolean;
  coNan: boolean;
  coL1: boolean;
  coL2: boolean;
}

const Legend: React.FC<LegendProps> = ({
  coXUocLuong,
  coTongDaiRieng,
  coViTriUocLuongCell,
  coDuongBao,
  coNan,
  coL1,
  coL2,
}) => {
  // MAC DINH THU GON (B3, yeu cau truc tiep user) - chi 1 nut nho "Chu giai" hien san, bam de mo rong xem
  // chi tiet, bam lai de thu gon
  const [moRong, setMoRong] = useState(false);

  return (
    <div style={{ position: "absolute", bottom: 8, right: 8, zIndex: 600 }}>
      <button
        type="button"
        onClick={() => setMoRong((v) => !v)}
        style={{
          display: "block",
          marginLeft: "auto",
          background: "rgba(255,255,255,0.92)",
          border: `1px solid ${R012_COLORS.tableBorder}`,
          borderRadius: 4,
          padding: "4px 8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: R012_COLORS.primaryDark,
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        Chu giai {moRong ? "▾" : "▸"}
      </button>
      {moRong && (
        <div
          style={{
            marginTop: 4,
            background: "rgba(255,255,255,0.92)",
            padding: "8px 10px",
            borderRadius: 4,
            fontSize: "0.75rem",
            lineHeight: 1.7,
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            maxWidth: 220,
          }}
        >
          <div>
            <ChamTron mau={MAU_TRAM_CUNG_TINH_NEN} /> Tram cung tinh
          </div>
          <div>
            <ChamTron mau={R012_COLORS.dangerRed} /> Tram X (goc, bi tat)
          </div>
          {coXUocLuong && (
            <div>
              <VongNetDut mau={R012_COLORS.dangerRed} /> X - vi tri uoc luong (CRAN)
            </div>
          )}
          {coTongDaiRieng && (
            <div>
              <ChamTron mau={R012_COLORS.statusRunning} /> Tong dai CRAN (toa do RIMS goc cua X)
            </div>
          )}
          {coViTriUocLuongCell && (
            <div>
              <VongNetDut mau={R012_COLORS.primary} /> Vi tri uoc luong cell CRAN
            </div>
          )}
          <div>
            <ChamTron mau={R012_COLORS.primary} /> Tram bi anh huong (dam = %HO cao)
          </div>
          {coNan && (
            <div>
              <DuongKe mau={R012_COLORS.primaryDark} /> Nan (ty le %HO, net lien)
            </div>
          )}
          {coDuongBao && (
            <div>
              <DuongKeNetDut mau={R012_COLORS.statusSuccess} /> Duong bao vung anh huong (net dut)
            </div>
          )}
          {coL1 && (
            <div>
              <DuongKe mau={R012_COLORS.chartCrDay} /> Vong L1
            </div>
          )}
          {coL2 && (
            <div>
              <DuongKe mau={R012_COLORS.primaryLight} /> Vong L2
            </div>
          )}
          {/* THEM (12/10/2026, PHAN LOAI TRAM, B4) - 4 hinh dang, LUON hien (khong dieu kien theo du lieu
              preview nhu cac muc tren) vi ap dung CHUNG cho moi marker tren ban do, khong gan rieng 1 lop nao */}
          <div style={{ marginTop: "4px", borderTop: `1px solid ${R012_COLORS.tableBorder}`, paddingTop: "4px" }}>
            Hinh dang theo loai tram:
          </div>
          <div>
            <HinhSwatch hinh="MACRO" /> Macro
          </div>
          <div>
            <HinhSwatch hinh="IBS" /> IBS
          </div>
          <div>
            <HinhSwatch hinh="SMALL_CELL" /> Small cell
          </div>
          <div>
            <HinhSwatch hinh="KHAC" /> Khac / chua xac dinh
          </div>
        </div>
      )}
    </div>
  );
};

interface PreviewMapHoProps {
  data: PreviewCrResponse;
}

const PreviewMapHo: React.FC<PreviewMapHoProps> = ({ data }) => {
  // bo dem tile RIENG cua ban do nay - reset khi doi tram goc (giong quy uoc useTileErrorTracker da dung
  // o moi che do map khac trong module)
  const { thieuTile, eventHandlers } = useTileErrorTracker(`ho-${data.tram_goc.tram_id}`);

  // tham chieu map instance THAT cua Leaflet - dung cho nut "Xem toan vung anh huong" (fitBounds thu cong,
  // KHONG qua prop "bounds" cua MapContainer vi ban do nay mo mac dinh o zoom co dinh tren X, xem B7)
  const mapRef = useRef<LeafletMap | null>(null);
  // THEM (12/10/2026) - tham chieu instance L.Control.Layers THAT (de chen nut "Mac dinh" truc tiep vao
  // panel cua no, xem useEffect ben duoi) + bo dem tang MOI LAN bam "Mac dinh" de EP MapContainer remount
  // (key doi) - checked cua LayersControl.Overlay CHI doc 1 LAN LUC MOUNT (khong tu dong cap nhat lai neu
  // doi prop sau do), nen cach DUY NHAT "ve lai mac dinh" sau khi da xoa localStorage la remount toan bo
  // MapContainer de no doc lai layTrangThaiLop() tu dau
  const layersControlRef = useRef<L.Control.Layers | null>(null);
  const [soLanResetLop, setSoLanResetLop] = useState<number>(0);

  // THEM (12/10/2026, yeu cau truc tiep user: "them nut nho 'Mac dinh' TRONG bang Layer") - Leaflet
  // Control.Layers la 1 widget DOM thuan (khong phai component React), LayersControl cua react-leaflet CHI
  // chap nhan children la LayersControl.Overlay/BaseLayer (khong the chen <button> React thuong vao giua).
  // Cach DUNG de "chen 1 nut vao TRONG panel that su cua no" la thao tac THANG vao DOM cua control qua ref -
  // "_section" la <section> chua danh sach overlay (xem node_modules/leaflet/dist/leaflet-src.js::
  // Control.Layers._initLayout(), thuoc tinh PRIVATE nen phai ep kieu any). Chay lai moi khi MapContainer
  // remount (doi tram HOAC bam "Mac dinh" - ca 2 deu doi key cua MapContainer) vi ref gan lai instance MOI.
  useEffect(() => {
    const control = layersControlRef.current as unknown as { _section?: HTMLElement } | null;
    const section = control?._section;
    if (!section) {
      return undefined;
    }
    const nutMacDinh = L.DomUtil.create("button", "r012-layer-reset-btn", section);
    nutMacDinh.type = "button";
    nutMacDinh.textContent = "Mac dinh";
    const xuLyBam = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      xoaLuaChonDaLuu();
      setSoLanResetLop((v) => v + 1);
    };
    nutMacDinh.addEventListener("click", xuLyBam);
    return () => {
      nutMacDinh.removeEventListener("click", xuLyBam);
      nutMacDinh.remove();
    };
  }, [data.tram_goc.tram_id, soLanResetLop]);

  // ban_do LUON co gia tri o day - NetworkMap.tsx (noi GOI component nay) da kiem tra data.ban_do truoc khi
  // render <PreviewMapHo>, nhung TypeScript khong suy duoc qua ranh gioi component nen van phai tu guard lai
  const banDo = data.ban_do;

  // danh sach tram cung tinh (B2) - CHI goi khi x.ma_tinh co gia tri (enabled:false neu khong, xem
  // useStationsMap). Cache THEO TINH (yeu cau truc tiep user) qua queryKey cua hook, KHONG tu cache lai o day
  const { data: tramCungTinh, isLoading: dangTaiTramCungTinh, isError: loiTaiTramCungTinh } = useStationsMap(
    banDo?.x.ma_tinh
  );

  // tinh fillOpacity toi da (B4) - theo TUONG QUAN giua cac tram bi anh huong trong CHINH preview nay
  const maxTongPctHo = useMemo(() => {
    if (!banDo) {
      return 0;
    }
    return Math.max(0, ...banDo.tram_bi_anh_huong.map((t) => t.tong_pct_ho));
  }, [banDo]);

  // cell khong xac dinh duoc vi tri (tu TAT CA tram bi anh huong, gop lai 1 cho) - lam theo YEU CAU B4
  // "Cell khong xac dinh vi tri -> khong ve, liet ke o tooltip cua X" (lam o Popup cua X, ro hon tooltip ngan)
  const cellKhongXacDinhViTri = useMemo(() => {
    // KHONG dung flatMap (target tsconfig.json la "es5", flatMap thuoc ES2019) - gop bang reduce() thay the,
    // tuong duong ve ket qua, tuong thich dung target hien tai cua repo
    if (!banDo) {
      return [];
    }
    return banDo.tram_bi_anh_huong.reduce<Array<BanDoCellAnhHuong & { tram_dich: string }>>((acc, t) => {
      const cellsThieuViTri = t.cells
        .filter((c) => c.khong_xac_dinh_vi_tri)
        .map((c) => ({ ...c, tram_dich: t.ten ?? t.tram_id }));
      return acc.concat(cellsThieuViTri);
    }, []);
  }, [banDo]);

  // vong L1/L2 (B6 cu) - BE da sap theo goc quanh X (sap_theo_goc), FE KHONG sort lai. Loc bo diem thieu toa
  // do truoc, roi KHEP KIN bang cach noi lai diem dau vao cuoi (Polyline KHONG tu khep kin nhu Polygon)
  const l1Positions = useMemo((): [number, number][] => {
    if (!banDo) {
      return [];
    }
    const diem = banDo.l1.filter((d): d is typeof d & { lat: number; lon: number } => d.lat !== null && d.lon !== null);
    const toa_do: [number, number][] = diem.map((d) => [d.lat, d.lon]);
    return toa_do.length >= 2 ? [...toa_do, toa_do[0]] : toa_do;
  }, [banDo]);

  const l2Positions = useMemo((): [number, number][] => {
    if (!banDo) {
      return [];
    }
    const diem = banDo.l2.filter((d): d is typeof d & { lat: number; lon: number } => d.lat !== null && d.lon !== null);
    const toa_do: [number, number][] = diem.map((d) => [d.lat, d.lon]);
    return toa_do.length >= 2 ? [...toa_do, toa_do[0]] : toa_do;
  }, [banDo]);

  // THEM (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user) - gom tram cung tinh THEO NHOM loai_tram (dung
  // nhomHienThi() de fallback "MACRO" khi field chua co gia tri), phuc vu "Bang Layer: them bat/tat tram
  // cung tinh THEO TUNG LOAI (mac dinh hien tat ca)" - moi nhom la 1 LayersControl.Overlay rieng ben duoi.
  // DAT TRUOC early-return guard ben duoi (giong moi useMemo/hook khac trong component nay) - KHONG duoc dat
  // SAU guard (vi pham "Rules of Hooks": hook KHONG duoc goi co dieu kien/sau return som)
  const tramCungTinhTheoNhom = useMemo(() => {
    const nhom: Record<LoaiTram, StationMapPoint[]> = { MACRO: [], IBS: [], SMALL_CELL: [], KHAC: [] };
    (tramCungTinh ?? []).forEach((t) => {
      if (t.lat === null || t.lon === null) {
        return;
      }
      nhom[nhomHienThi(t.loai_tram)].push(t);
    });
    return nhom;
  }, [tramCungTinh]);

  // SUA (10/10/2026, yeu cau truc tiep user): duong bao gio la dict {polygon, doan, x_tren_vien} (THAY THE
  // convex hull/mang [lat,lon] phang cu - xem BanDoDuongBao, types/index.ts) - danh sach DINH dung CHUNG cho
  // ca lop "Duong bao" (Polygon, CHI khi >= 3 diem) lan lop "Nan" (tia tu TAM, dung ca khi < 3 diem/"doan")
  const danhSachDinhDuongBao: BanDoDuongBaoDiem[] = banDo?.duong_bao.polygon ?? banDo?.duong_bao.doan ?? [];
  const duongBaoPolygonPositions: [number, number][] = (banDo?.duong_bao.polygon ?? []).map((d) => [d.lat, d.lon]);

  // B7 (SUA 10/10/2026): "Xem toan vung anh huong" gio tinh theo TAM (BanDoXBlock.tam_lat/tam_lon, KHONG
  // phai x.lat/x.lon goc) + TOAN BO dinh duong bao (polygon hoac doan, CUNG danh sach voi lop Nan o tren) -
  // khong con fallback rieng theo tram_bi_anh_huong.lat/lon vi danh sach dinh duong bao DA LA CHINH xac vi
  // tri cac tram/cell do (ke ca truong hop CRAN co nhieu dinh/sector rieng)
  const handleXemToanVungAnhHuong = () => {
    const map = mapRef.current;
    if (!map || !banDo || banDo.x.tam_lat === null || banDo.x.tam_lon === null) {
      return;
    }
    const diem: [number, number][] = [[banDo.x.tam_lat, banDo.x.tam_lon]];
    danhSachDinhDuongBao.forEach((d) => diem.push([d.lat, d.lon]));
    map.fitBounds(diem, { padding: [40, 40] });
  };

  if (!banDo || banDo.x.tam_lat === null || banDo.x.tam_lon === null) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "500px",
          border: "1px dashed #d9d9d9",
          borderRadius: "4px",
          color: "#8c8c8c",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        Tram {data.tram_goc.tram_name ?? data.tram_goc.tram_id} khong co toa do - khong hien duoc ban do.
      </div>
    );
  }

  const x = banDo.x;
  const tamLat = x.tam_lat as number;
  const tamLon = x.tam_lon as number;
  // SUA (10/10/2026, yeu cau truc tiep user): X la CRAN qua ma "TOA_DO_DUNG_CHUNG" trong x.co (CUNG nguon
  // voi PreviewCrResponse.x_co, xem BanDoXBlock.co)
  const isCran = x.co.includes("TOA_DO_DUNG_CHUNG");
  // CRAN VA uoc luong duoc tam (KHAC toa do tong dai goc) -> marker X net dut + marker tong dai rieng
  const coViTriUocLuongRieng = isCran && !x.tam_la_tong_dai;
  // THEM (12/10/2026, PHAN LOAI TRAM) - hinh marker cua X, fallback "MACRO" (tron) khi x.loai_tram chua co
  // gia tri (BE chua wire, xem WHY day du o LoaiTram trong types/index.ts)
  const xHinh = nhomHienThi(x.loai_tram);
  // tong dai CHI ve duoc khi CHINH no co toa do (x.lat/x.lon - toa do RIMS goc, co the null doc lap voi tam -
  // xem comment BanDoXBlock.tam_lat trong types/index.ts)
  const hienThiTongDaiRieng = coViTriUocLuongRieng && x.lat !== null && x.lon !== null;
  // THEM (11/10/2026, B4) - flag CHINH XAC khop voi dieu kien render CircleMarker vi tri uoc luong cell ben
  // duoi, dung truyen cho Legend de "muc CRAN chi hien khi X la CRAN" (va CHI khi THAT SU co marker nao ve)
  const coViTriUocLuongCell = (x.vi_tri_uoc_luong_cell?.length ?? 0) > 0;
  const coDuongBao = duongBaoPolygonPositions.length >= 3;
  const coNan = danhSachDinhDuongBao.length > 0;
  const coL1 = l1Positions.length >= 2;
  const coL2 = l2Positions.length >= 2;
  // THEM (12/10/2026, B3, yeu cau truc tiep user) - lop "% theo cell" CHI dang ky khi co it nhat 1 tram bi
  // anh huong co toa do VA co it nhat 1 cell (t.cells.length>0) de hien nhan
  const coPhanTramTheoCell = banDo.tram_bi_anh_huong.some(
    (t) => t.lat !== null && t.lon !== null && t.cells.length > 0
  );

  return (
    <div>
      {/* SUA (11/10/2026, B2, yeu cau truc tiep user): icon mac dinh cua LayersControl (anh layers.png/
          layers-2x.png cua leaflet.css) hien ra O TRANG - duong dan anh qua CSS url() cua thu vien node_modules
          KHONG duoc webpack resolve dung trong production (khac marker-icon.png/marker-icon-2x.png o
          NetworkMap.tsx: 2 anh do duoc import TRUC TIEP qua JS nen KHONG phu thuoc CSS url() resolution).
          THAY vi do webpack asset-pipeline cho 1 file CSS cua thu vien ngoai (rui ro, kho kiem chung lai
          bang mat), DUNG PHUONG AN DON GIAN HON da duoc chinh user chap thuan: thay the hoan toan background-
          image bang nut CHU qua CSS thuan (scope rieng duoi class r012-preview-map-ho de KHONG anh huong
          ban do khac trong module neu sau nay co them LayersControl o cho khac).
          SUA (12/10/2026, yeu cau truc tiep user): doi chu nut tu "Lop" -> "Layer" (ten CAC LOP ben trong
          - "Nan", "Duong bao vung anh huong", "Vong L1/L2", "% theo cell" - GIU NGUYEN tieng Viet khong
          dau nhu cu, CHI doi DUY NHAT chu tren nut bam o goc tren-phai) */}
      <style>{`
        .r012-preview-map-ho .leaflet-control-layers-toggle {
          background-image: none;
          width: auto;
          height: 26px;
          line-height: 26px;
          padding: 0 8px;
          font-size: 12px;
          font-weight: 700;
          color: #333;
        }
        .r012-preview-map-ho .leaflet-control-layers-toggle::after {
          content: "Layer";
        }
        /* THEM (12/10/2026) - nut "Mac dinh" chen truc tiep vao panel cua LayersControl qua DOM ref (xem
           useEffect goi L.DomUtil.create trong PreviewMapHo) - dat CUOI danh sach overlay, ngan cach bang
           duong ke mo o tren de ro day la 1 HANH DONG (reset), khong phai 1 overlay co the bat/tat */
        .r012-preview-map-ho .r012-layer-reset-btn {
          display: block;
          width: 100%;
          margin-top: 6px;
          padding-top: 6px;
          border: none;
          border-top: 1px solid ${R012_COLORS.tableBorder};
          background: none;
          color: ${R012_COLORS.primaryDark};
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }
        .r012-preview-map-ho .r012-layer-reset-btn:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="r012-preview-map-ho" style={{ position: "relative" }}>
        <MapContainer
          center={[tamLat, tamLon]}
          // B7: "Giu hanh vi cu: chon tram mo o zoom 15" - mo CO DINH tai zoom nay tren TAM cua X (KHONG tu
          // fitBounds toan vung ngay tu dau), nut "Xem toan vung anh huong" moi la hanh dong CHU DONG de
          // phong rong ra
          zoom={SINGLE_STATION_ZOOM}
          minZoom={TILE_MIN_ZOOM}
          maxZoom={TILE_MAX_ZOOM}
          // B2: renderer CANVAS (preferCanvas) - BAT BUOC cho ~6.200 tram cung tinh (vd Ha Noi) khong lam
          // treo trinh duyet, Leaflet mac dinh dung SVG (1 DOM node/hinh) se qua nang voi so luong nay
          preferCanvas
          style={{ height: "500px", width: "100%" }}
          // THEM (12/10/2026) - "-${soLanResetLop}" EP MapContainer remount MOI LAN bam "Mac dinh" (xem
          // useEffect chen nut o tren) - checked cua LayersControl.Overlay chi doc 1 lan luc mount, remount
          // la cach DUY NHAT de no doc lai layTrangThaiLop() (localStorage da bi xoa) tu dau
          key={`preview-ho-${data.tram_goc.tram_id}-${soLanResetLop}`}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} eventHandlers={eventHandlers} />
          {/* THEM (12/10/2026) - lang nghe su kien bat/tat overlay cua Leaflet de tu dong luu vao
              localStorage, xem WHY day du o dinh nghia component LayerStateListener */}
          <LayerStateListener />

          {/* SUA (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user): tram cung tinh CHUYEN vao trong
              LayersControl ben duoi (4 nhom rieng theo loai_tram, bat/tat DOC LAP - xem "Bang Layer them
              bat/tat tram cung tinh THEO TUNG LOAI"), KHONG con ve CO DINH ngoai LayersControl nhu truoc.
              Noi dung render THAT su (TramCungTinhMarker) nam trong khoi LayersControl phia duoi. */}

          {/* B3: X la CRAN - vi tri uoc luong cua tung cell (vong tron net dut). SUA (10/10/2026): tooltip
              gio dung DUNG cell_name THAT (BE da bo sung, xem BanDoViTriUocLuongCell trong types/index.ts) -
              fallback "Sector <lcr>" CHI khi cell_name la null (khong resolve duoc ten qua dn_map, vd chua
              sync cell_infor) */}
          {x.vi_tri_uoc_luong_cell?.map((v) => (
            <CircleMarker
              key={v.lcr}
              center={[v.lat, v.lon]}
              radius={8}
              pathOptions={{ color: R012_COLORS.primary, fill: false, weight: 2, dashArray: "4" }}
            >
              <Tooltip>{`${v.cell_name ?? `Sector ${v.lcr}`} - vi tri uoc luong tu HO`}</Tooltip>
            </CircleMarker>
          ))}

          {/* B4: tram bi anh huong - marker noi bat (radius lon hon han tram cung tinh), dam nhat theo
              tong % HO (xem tinhFillOpacity o tren). Cell khong_xac_dinh_vi_tri=true KHONG ve rieng (da loc
              trong t.cells ngay duoi), liet ke gop tai Popup cua X (cellKhongXacDinhViTri o tren).
              SUA (12/10/2026, PHAN LOAI TRAM): rut gon thanh TramBiAnhHuongMarker (hinh theo loai_tram, xem
              WHY day du o dinh nghia component do) - noi dung Tooltip/Popup GIU NGUYEN, chi chuyen vao component */}
          {banDo.tram_bi_anh_huong.map((t) => (
            <TramBiAnhHuongMarker
              key={t.tram_id}
              t={t}
              data={data}
              maxTongPctHo={maxTongPctHo}
              tamLat={tamLat}
              tamLon={tamLon}
            />
          ))}

          {/* THEM (10/10/2026, yeu cau truc tiep user): marker rieng tai toa do TONG DAI goc cua X (x.lat/
              x.lon - toa do RIMS THAT, KHAC voi tam_lat/tam_lon la vi tri UOC LUONG dung lam tam ve) - CHI
              hien khi X la CRAN VA da uoc luong duoc tam (coViTriUocLuongRieng), de NOC thay ro 2 vi tri
              KHAC NHAU (tong dai thuc te vs anten uoc luong tu HO) */}
          {hienThiTongDaiRieng && (
            <Marker position={[x.lat as number, x.lon as number]} icon={tongDaiIcon}>
              <Tooltip>Tong dai CRAN</Tooltip>
            </Marker>
          )}

          {/* B3: marker X (tram goc bi tat) - SUA (10/10/2026): dat tai TAM (tam_lat/tam_lon, co the la vi
              tri uoc luong trung binh cac cell CRAN cua chinh X) thay vi x.lat/x.lon goc. Icon net dut khi
              la vi tri uoc luong (coViTriUocLuongRieng), icon dac dinh binh thuong cho moi truong hop con
              lai. Luon ve CUOI CUNG trong nhom marker de noi tren het (Leaflet ve theo thu tu mount, phan tu
              sau cung nam tren cung khi trung vi tri).
              SUA (12/10/2026, PHAN LOAI TRAM): icon dung buildHinhIcon (ho tro 4 hinh) thay vi
              buildDotIcon/buildDashedDotIcon cu (chi hinh tron) - mau GIU NGUYEN dangerRed */}
          <Marker
            position={[tamLat, tamLon]}
            icon={buildHinhIcon(
              xHinh,
              R012_COLORS.dangerRed,
              coViTriUocLuongRieng ? "#ffffff" : R012_COLORS.dangerRed,
              22,
              { netDut: coViTriUocLuongRieng }
            )}
          >
            {coViTriUocLuongRieng && <Tooltip>Vi tri uoc luong tu HO</Tooltip>}
            <Popup>
              <div>
                <strong>{data.tram_goc.tram_name ?? data.tram_goc.tram_id} (X - tram tat)</strong>
              </div>
              <div>Ma tram: {data.tram_goc.tram_id}</div>
              {/* THEM (12/10/2026) - "moi tram ghi them loai tram" */}
              <div>Loai tram: {x.loai_tram ? NHAN_HINH_TRAM[xHinh] : "Khong xac dinh"}</div>
              {/* B1: khung thong tin ten tinh/KV - LAP LAI o day cho tien xem khi click truc tiep vao X,
                  BEN CANH khung co dinh goc tren-trai (xem ngay duoi MapContainer) */}
              {x.ten_tinh && (
                <div>
                  Tinh: {x.ten_tinh}
                  {x.khu_vuc ? ` (${x.khu_vuc})` : ""}
                </div>
              )}
              {/* SUA (10/10/2026): ghi chu rieng khi CRAN nhung KHONG uoc luong duoc tam (BE fallback ve toa
                  do tong dai, do tin cay THAP - xem BanDoXBlock.tam_la_tong_dai trong types/index.ts) */}
              {x.tam_la_tong_dai && (
                <div style={{ marginTop: "4px", color: R012_COLORS.dangerRed }}>
                  Khong uoc luong duoc vi tri anten - dang hien thi tam vi tri tong dai
                </div>
              )}
              {x.co.length > 0 && (
                <div style={{ marginTop: "4px" }}>
                  {layDanhSachNhanXCo(x.co, data.sectors_it_du_lieu).map((nhan) => (
                    <Tag key={nhan} color="orange">
                      {nhan}
                    </Tag>
                  ))}
                </div>
              )}
              {cellKhongXacDinhViTri.length > 0 && (
                <div style={{ marginTop: "4px", color: "#8c8c8c" }}>
                  {cellKhongXacDinhViTri.length} cell khong xac dinh duoc vi tri (khong ve tren ban do):
                  <ul style={{ paddingLeft: "1rem", margin: "2px 0 0" }}>
                    {cellKhongXacDinhViTri.map((c) => (
                      <li key={`${c.target_enb}-${c.target_lcr}`}>
                        {c.cell_name ?? `enb ${c.target_enb} / lcr ${c.target_lcr}`} (tram dich: {c.tram_dich})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Popup>
          </Marker>

          {/* Duong bao/Nan/L1/L2 - dang ky qua LayersControl de NOC tu bat/tat (position topright, doi voi
              Legend o goc duoi-phai de khong de len nhau). Nan + Duong bao BAT mac dinh (checked), L1/L2 TAT
              mac dinh (checked=false) - DUNG theo yeu cau. Bo qua hoan toan 1 overlay (khong dang ky) khi
              khong du du lieu de ve, thay vi dang ky voi layer rong (LayersControl.Overlay can CHINH XAC 1
              layer con, khong chiu duoc Fragment/null) */}
          <LayersControl ref={layersControlRef} position="topright">
            {/* THEM (12/10/2026, PHAN LOAI TRAM, yeu cau truc tiep user): "Bang Layer them bat/tat tram
                cung tinh THEO TUNG LOAI (mac dinh hien tat ca)" - 4 overlay RIENG (1/nhom), checked MAC
                DINH (hien tat ca theo yeu cau), NOC tu tat tung nhom neu muon. Bo qua nhom RONG (khong dang
                ky overlay) - vd tinh khong co tram SMALL_CELL nao thi khong hien muc do trong Layer */}
            {(Object.keys(tramCungTinhTheoNhom) as LoaiTram[])
              .filter((hinh) => tramCungTinhTheoNhom[hinh].length > 0)
              .map((hinh) => (
                <LayersControl.Overlay
                  key={hinh}
                  name={tenLopTramCungTinh(hinh)}
                  checked={layTrangThaiLop(tenLopTramCungTinh(hinh))}
                >
                  <LayerGroup>
                    {tramCungTinhTheoNhom[hinh].map((t) => (
                      <TramCungTinhMarker key={t.tram_id} t={t} hinh={hinh} khuVuc={x.khu_vuc} />
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>
              ))}
            {/* SUA (10/10/2026): "Duong bao" gio ve DUNG mang "polygon" BE tra (da sap theo goc quanh X,
                KHONG tu tinh lai) - CHI khi BE co tra polygon (>= 3 dinh, xem BanDoDuongBao trong
                types/index.ts). x_tren_vien=true (X la 1 dinh cua polygon nay) KHONG can xu ly gi rieng -
                ve DUNG mang nay la tu nhien ra hinh quat, giong yeu cau "van ve binh thuong" */}
            {coDuongBao && (
              <LayersControl.Overlay name={TEN_LOP_DUONG_BAO} checked={layTrangThaiLop(TEN_LOP_DUONG_BAO)}>
                {/* SUA (11/10/2026, B6, yeu cau truc tiep user): NET DUT (dashArray) + mau rieng (statusSuccess,
                    xanh la - KHAC han primaryDark cua "Nan" net lien ben duoi) de 2 lop phan biet ro rang khi
                    cung hien 1 luc, khong con dung CHUNG 1 mau nhu truoc. fillOpacity GIU NGUYEN ~0.08 (mo) */}
                <Polygon
                  positions={duongBaoPolygonPositions}
                  pathOptions={{
                    color: R012_COLORS.statusSuccess,
                    weight: 2,
                    dashArray: "6 4",
                    fillColor: R012_COLORS.statusSuccess,
                    fillOpacity: 0.08,
                  }}
                />
              </LayersControl.Overlay>
            )}
            {/* THEM (10/10/2026): "Nan" - tia tu TAM den tung dinh (dung CHUNG danh sach dinh voi "Duong
                bao" o tren, ke ca khi duong bao KHONG co polygon - luc do danh sach la "doan"). LayerGroup
                BAT BUOC o day: NanLayer render NHIEU Polyline (1 component composite, khong phai 1 layer
                Leaflet don le), LayersControl.Overlay chi chap nhan DUNG 1 layer con - LayerGroup gom nhieu
                layer thanh 1 don vi bat/tat duoc */}
            {coNan && (
              <LayersControl.Overlay name={TEN_LOP_NAN} checked={layTrangThaiLop(TEN_LOP_NAN)}>
                <LayerGroup>
                  <NanLayer tam={[tamLat, tamLon]} diem={danhSachDinhDuongBao} />
                </LayerGroup>
              </LayersControl.Overlay>
            )}
            {/* SUA (12/10/2026, yeu cau truc tiep user) - lop "% theo cell": nhan nho CANH diem tram bi anh
                huong, MOI cell 1 dong (GOP trong 1 Tooltip permanent DUY NHAT moi tram - cac dong xep chong
                THEO KHOI block HTML binh thuong nen tu nhien KHONG de len nhau, khong can tinh offset px
                thu cong cho tung cell). MAC DINH TAT (checked={false}) theo yeu cau - GIU NGUYEN nhan theo
                tram (Nan, o tren) khong doi gi.
                SUA so voi ban truoc: dung CUNG 1 nguon/1 LOAI % voi Tooltip/Popup chi tiet o tren
                (layChiTietCellTheoTram, nguon goc quan_he_day_du - GIU CA cac sector "phu" TRUOC dedup,
                xem WHY day du o layChiTietCellTheoTram) - KHONG con dung t.cells/pct_ho (BanDoCellAnhHuong)
                nhu ban truoc. LY DO: pct_ho trong t.cells la % cua DUY NHAT 1 sector "thang" sau dedup
                xuyen-sector (BE giu sector CO %HO CAO NHAT cho moi cell, cac sector "phu" khac BI LOAI khoi
                gia tri nay - xem domain/services/ho_cell_selector.py dong "Dedup xuyen sector: cell o nhieu
                sector -> 1 lan, GIU sector co % HO CAO NHAT"), KHAC voi dinh nghia % trong Tooltip/Popup
                (moi quan he sector->cell la 1 dong RIENG, khong dedup) - dung t.cells se cho sai lech: 1 cell
                nhan tu 2 sector se CHI hien 1 dong (sector thang) o lop ban do nay nhung 2 dong o Tooltip,
                gay hieu lam la 2 noi "khong khop". Nay DUNG CHUNG layChiTietCellTheoTram nen cell o 2 sector
                se RA DUNG 2 dong o CA 2 noi, nhat quan hoan toan. */}
            {coPhanTramTheoCell && (
              <LayersControl.Overlay name={TEN_LOP_PHAN_TRAM_CELL} checked={layTrangThaiLop(TEN_LOP_PHAN_TRAM_CELL)}>
                <LayerGroup>
                  {banDo.tram_bi_anh_huong.map(
                    (t) =>
                      t.lat !== null &&
                      t.lon !== null &&
                      t.cells.length > 0 && (
                        <CircleMarker
                          key={t.tram_id}
                          center={[t.lat, t.lon]}
                          radius={1}
                          pathOptions={{ opacity: 0, fillOpacity: 0 }}
                        >
                          <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.9}>
                            <div style={{ fontSize: "0.65rem", lineHeight: 1.4 }}>
                              {layChiTietCellTheoTram(
                                t,
                                data.quan_he_day_du ?? [],
                                data.cells_chay_cr,
                                data.cells_bi_anh_huong
                              ).map((c) => (
                                <div key={`${c.sector}-${c.target_lcr}`}>
                                  {`S${c.sector} > cell ${c.cell_name ?? c.target_lcr}: ${formatPctHo(c.pct_trong_sector)}`}
                                </div>
                              ))}
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      )
                  )}
                </LayerGroup>
              </LayersControl.Overlay>
            )}
            {/* SUA (12/10/2026, PHAN LOAI TRAM): THEM marker HINH tai TUNG diem L1 (truoc chi co duong
                Polyline noi cac diem, khong co marker rieng tung tram) - LayerGroup BAT BUOC vi gio co 2
                loai layer con (Polyline + nhieu Marker) can bat/tat CUNG LUC nhu 1 don vi */}
            {coL1 && (
              <LayersControl.Overlay name={TEN_LOP_L1} checked={layTrangThaiLop(TEN_LOP_L1)}>
                <LayerGroup>
                  <Polyline positions={l1Positions} pathOptions={{ color: R012_COLORS.chartCrDay, weight: 3 }} />
                  {banDo.l1.map((d) => renderDiemTramMarker(d, "L1", R012_COLORS.chartCrDay))}
                </LayerGroup>
              </LayersControl.Overlay>
            )}
            {coL2 && (
              <LayersControl.Overlay name={TEN_LOP_L2} checked={layTrangThaiLop(TEN_LOP_L2)}>
                <LayerGroup>
                  <Polyline positions={l2Positions} pathOptions={{ color: R012_COLORS.primaryLight, weight: 3 }} />
                  {banDo.l2.map((d) => renderDiemTramMarker(d, "L2", R012_COLORS.primaryLight))}
                </LayerGroup>
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>

        {thieuTile && <ThieuTileOverlay />}

        {/* SUA (11/10/2026, B1, yeu cau truc tiep user): khung thong tin ten tinh/KV - DOI xuong DUOI nut
            zoom (truoc do dat top:8 de LEN NGAY TREN nut zoom cua Leaflet, cung o goc tren-trai -> bi che).
            Nut zoom mac dinh cua Leaflet: margin-top 10px + 2 nut 26px/nut = ~62px - dat top:80 de chac chan
            khong con de len nhau du lam tron/border nho */}
        {x.ten_tinh && (
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 8,
              background: "rgba(255,255,255,0.92)",
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: R012_COLORS.primaryDark,
              zIndex: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            {x.ten_tinh}
            {x.khu_vuc ? ` (${x.khu_vuc})` : ""}
          </div>
        )}

        <Legend
          coXUocLuong={coViTriUocLuongRieng}
          coTongDaiRieng={hienThiTongDaiRieng}
          coViTriUocLuongCell={coViTriUocLuongCell}
          coDuongBao={coDuongBao}
          coNan={coNan}
          coL1={coL1}
          coL2={coL2}
        />
      </div>

      <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <Button onClick={handleXemToanVungAnhHuong}>Xem toan vung anh huong</Button>
        {dangTaiTramCungTinh && (
          <span style={{ color: "#8c8c8c", fontSize: "0.85rem" }}>Dang tai tram cung tinh...</span>
        )}
        {/* loi tai tram cung tinh KHONG chan ban do chinh (X/tram bi anh huong/L1/L2 van hien dung) - chi
            thieu LOP NGU CANH, khong phai loi nghiem trong can dung toan bo tinh nang lai */}
        {loiTaiTramCungTinh && (
          <span style={{ color: "#8c8c8c", fontSize: "0.85rem" }}>
            Khong tai duoc danh sach tram cung tinh (lop ngu canh xam).
          </span>
        )}
        {/* ghi chu THEM (10/10/2026) - LAP LAI ben ngoai Popup (khong phai ai cung bam vao X) khi CRAN nhung
            khong uoc luong duoc tam, de NOC thay NGAY ca khi chua tuong tac voi marker nao */}
        {x.tam_la_tong_dai && (
          <span style={{ color: R012_COLORS.dangerRed, fontSize: "0.85rem" }}>
            Khong uoc luong duoc vi tri anten cua tram CRAN nay - dang hien thi tam vi tri tong dai.
          </span>
        )}
      </div>
    </div>
  );
};

export default PreviewMapHo;
