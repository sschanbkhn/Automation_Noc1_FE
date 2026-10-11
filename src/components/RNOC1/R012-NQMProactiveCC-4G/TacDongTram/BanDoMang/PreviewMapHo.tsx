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
import React, { useMemo, useRef, useState } from "react";
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
import { PreviewCrResponse, BanDoCellAnhHuong, BanDoDuongBaoDiem, AffectedCellItem } from "../../types";
import { R012_COLORS } from "../../theme";
import { useStationsMap } from "../../hooks/useStationsMap";
import { layDanhSachNhanXCo, formatPctHo } from "../../helpers/hoLabels";
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

// marker do CHAC CHAN cho X (tram goc bi tat, vi tri la CHINH toa do RIMS/khong phai CRAN hoac CRAN nhung
// khong uoc luong duoc) - TAI SU DUNG buildDotIcon export tu mapCommon.tsx (KHONG dinh nghia ban sao), to
// hon tramGocIcon cu (18px, NetworkMap.tsx) 1 chut vi ban do nay co THEM nhieu lop markers khac chong len nhau
const xIconDacDinh = buildDotIcon(R012_COLORS.dangerRed, 22);

// marker X net dut (SUA 10/10/2026, yeu cau truc tiep user) - khi X la CRAN VA uoc luong duoc "tam" (trung
// binh vi tri cac cell), vi tri nay la UOC LUONG (khong phai toa do RIMS that) - vien net dut bao hieu do
// tin cay khac voi marker dac dinh binh thuong, dong bo voi style "net dut" da dung cho CircleMarker vi tri
// uoc luong tung cell ben duoi (VongNetDutSwatch/legend)
const buildDashedDotIcon = (color: string, sizePx: number) =>
  L.divIcon({
    className: "",
    html: `<div style="background:#ffffff;width:${sizePx}px;height:${sizePx}px;border-radius:50%;border:3px dashed ${color};box-shadow:0 0 4px rgba(0,0,0,0.6);"></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
  });
const xIconUocLuong = buildDashedDotIcon(R012_COLORS.dangerRed, 22);

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
function layNhanLayerTramBiAnhHuong(layer: string | null): string {
  if (!layer) {
    return "-";
  }
  return layer === "KHONG_XAC_DINH" ? "Khong xac dinh (CRAN)" : layer;
}

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

  return (
    <div>
      {/* SUA (11/10/2026, B2, yeu cau truc tiep user): icon mac dinh cua LayersControl (anh layers.png/
          layers-2x.png cua leaflet.css) hien ra O TRANG - duong dan anh qua CSS url() cua thu vien node_modules
          KHONG duoc webpack resolve dung trong production (khac marker-icon.png/marker-icon-2x.png o
          NetworkMap.tsx: 2 anh do duoc import TRUC TIEP qua JS nen KHONG phu thuoc CSS url() resolution).
          THAY vi do webpack asset-pipeline cho 1 file CSS cua thu vien ngoai (rui ro, kho kiem chung lai
          bang mat), DUNG PHUONG AN DON GIAN HON da duoc chinh user chap thuan: thay the hoan toan background-
          image bang nut CHU "Lop" qua CSS thuan (scope rieng duoi class r012-preview-map-ho de KHONG anh
          huong ban do khac trong module neu sau nay co them LayersControl o cho khac) */}
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
          content: "Lop";
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
          key={`preview-ho-${data.tram_goc.tram_id}`}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} eventHandlers={eventHandlers} />

          {/* SUA (11/10/2026, B8+B9, yeu cau truc tiep user): moi tram cung tinh - gio GOM 2 CircleMarker
              chong 1 vi tri: (1) vong BAT CHUOT lon hon (8px, trong suot) mang Tooltip (hover)/Popup (click
              - ten/ma tram/vendor/KV), (2) cham VE THAT nho hon (4px, tim nhat #a78bfa, vien dam #7c3aed,
              non-interactive) chi de HIEN THI. Tach lam 2 lop vi can VUNG BAT CHUOT lon hon nhieu so voi
              KICH THUOC HIEN THI (4-5px qua nho de de trung chuot o nhieu muc zoom), nhung KHONG muon ve 1
              cham to 8px (se qua noi bat, lan at tram bi anh huong) - ca 2 lop deu la CircleMarker (Path) nen
              VAN duoc Leaflet render qua Canvas (preferCanvas tren MapContainer), KHONG anh huong hieu nang */}
          {tramCungTinh?.map(
            (t) =>
              t.lat !== null &&
              t.lon !== null && (
                <React.Fragment key={t.tram_id}>
                  <CircleMarker
                    center={[t.lat, t.lon]}
                    radius={BAN_KINH_BAT_CHUOT_TRAM_CUNG_TINH}
                    pathOptions={{ opacity: 0, fillOpacity: 0, weight: 0 }}
                  >
                    <Tooltip>{t.ten}</Tooltip>
                    <Popup>
                      <div>
                        <strong>{t.ten}</strong>
                      </div>
                      <div>Ma tram: {t.tram_id}</div>
                      <div>Vendor: {t.vendor}</div>
                      {/* KV suy tu x.khu_vuc (KHONG phai field rieng tu /stations/map - BE chi tra 6 cot co
                          dinh, xem StationMapPoint trong types/index.ts) - HOP LE vi query ma_tinh=x.ma_tinh
                          nen MOI tram trong tramCungTinh CHAC CHAN cung tinh, tuc CUNG khu vuc voi X */}
                      {x.khu_vuc && <div>Khu vuc: {x.khu_vuc}</div>}
                    </Popup>
                  </CircleMarker>
                  <CircleMarker
                    center={[t.lat, t.lon]}
                    radius={BAN_KINH_TRAM_CUNG_TINH}
                    interactive={false}
                    pathOptions={{
                      color: MAU_TRAM_CUNG_TINH_VIEN,
                      fillColor: MAU_TRAM_CUNG_TINH_NEN,
                      fillOpacity: 0.85,
                      weight: 1.5,
                    }}
                  />
                </React.Fragment>
              )
          )}

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
              trong t.cells ngay duoi), liet ke gop tai Popup cua X (cellKhongXacDinhViTri o tren) */}
          {banDo.tram_bi_anh_huong.map(
            (t) =>
              t.lat !== null &&
              t.lon !== null && (
                <CircleMarker
                  key={t.tram_id}
                  center={[t.lat, t.lon]}
                  radius={10}
                  pathOptions={{
                    color: R012_COLORS.primaryDark,
                    fillColor: R012_COLORS.primary,
                    fillOpacity: tinhFillOpacity(t.tong_pct_ho, maxTongPctHo),
                    weight: 2,
                  }}
                >
                  {/* SUA (11/10/2026, B10, yeu cau truc tiep user) - Layer gio lay TU DU LIEU BE THAT
                      (data.cells_bi_anh_huong, xem layLayerCuaTramTuBE) thay vi tu suy tu l1/l2. Khoang cach
                      km VAN tu FE tinh (BE chua co field nay, xem WHY day du o tinhKhoangCachKm) */}
                  <Tooltip>{`${t.ten ?? t.tram_id} - ${layNhanLayerTramBiAnhHuong(layLayerCuaTramTuBE(t.tram_id, data.cells_bi_anh_huong))}, ${tinhKhoangCachKm(tamLat, tamLon, t.lat, t.lon).toFixed(1)} km - tong ${formatPctHo(t.tong_pct_ho)} HO`}</Tooltip>
                  <Popup>
                    <div>
                      <strong>{t.ten ?? t.tram_id}</strong>
                    </div>
                    <div>Ma tram: {t.tram_id}</div>
                    <div>Layer: {layNhanLayerTramBiAnhHuong(layLayerCuaTramTuBE(t.tram_id, data.cells_bi_anh_huong))}</div>
                    <div>Khoang cach: {tinhKhoangCachKm(tamLat, tamLon, t.lat, t.lon).toFixed(1)} km</div>
                    <div>Tong % HO: {formatPctHo(t.tong_pct_ho)}</div>
                    <ul style={{ paddingLeft: "1rem", margin: "4px 0 0" }}>
                      {t.cells
                        .filter((c) => !c.khong_xac_dinh_vi_tri)
                        .map((c) => (
                          <li key={`${c.target_enb}-${c.target_lcr}`}>
                            {c.cell_name ?? `enb ${c.target_enb} / lcr ${c.target_lcr}`}: {formatPctHo(c.pct_ho)}
                          </li>
                        ))}
                    </ul>
                  </Popup>
                </CircleMarker>
              )
          )}

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
              sau cung nam tren cung khi trung vi tri) */}
          <Marker position={[tamLat, tamLon]} icon={coViTriUocLuongRieng ? xIconUocLuong : xIconDacDinh}>
            {coViTriUocLuongRieng && <Tooltip>Vi tri uoc luong tu HO</Tooltip>}
            <Popup>
              <div>
                <strong>{data.tram_goc.tram_name ?? data.tram_goc.tram_id} (X - tram tat)</strong>
              </div>
              <div>Ma tram: {data.tram_goc.tram_id}</div>
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
          <LayersControl position="topright">
            {/* SUA (10/10/2026): "Duong bao" gio ve DUNG mang "polygon" BE tra (da sap theo goc quanh X,
                KHONG tu tinh lai) - CHI khi BE co tra polygon (>= 3 dinh, xem BanDoDuongBao trong
                types/index.ts). x_tren_vien=true (X la 1 dinh cua polygon nay) KHONG can xu ly gi rieng -
                ve DUNG mang nay la tu nhien ra hinh quat, giong yeu cau "van ve binh thuong" */}
            {coDuongBao && (
              <LayersControl.Overlay name="Duong bao vung anh huong" checked>
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
              <LayersControl.Overlay name="Nan (ty le %HO tung tram)" checked>
                <LayerGroup>
                  <NanLayer tam={[tamLat, tamLon]} diem={danhSachDinhDuongBao} />
                </LayerGroup>
              </LayersControl.Overlay>
            )}
            {coL1 && (
              <LayersControl.Overlay name="Vong L1" checked={false}>
                <Polyline positions={l1Positions} pathOptions={{ color: R012_COLORS.chartCrDay, weight: 3 }} />
              </LayersControl.Overlay>
            )}
            {coL2 && (
              <LayersControl.Overlay name="Vong L2" checked={false}>
                <Polyline positions={l2Positions} pathOptions={{ color: R012_COLORS.primaryLight, weight: 3 }} />
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
