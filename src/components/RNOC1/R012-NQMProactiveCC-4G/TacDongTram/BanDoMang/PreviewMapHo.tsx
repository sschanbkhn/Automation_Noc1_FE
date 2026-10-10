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
import { PreviewCrResponse, BanDoCellAnhHuong, BanDoDuongBaoDiem } from "../../types";
import { R012_COLORS } from "../../theme";
import { useStationsMap } from "../../hooks/useStationsMap";
import { layDanhSachNhanXCo, formatPctHo } from "../../helpers/hoLabels";
import {
  TILE_URL,
  TILE_MIN_ZOOM,
  TILE_MAX_ZOOM,
  TILE_ATTRIBUTION,
  SINGLE_STATION_ZOOM,
  useTileErrorTracker,
  ThieuTileOverlay,
  buildDotIcon,
} from "./NetworkMap";

// marker do CHAC CHAN cho X (tram goc bi tat, vi tri la CHINH toa do RIMS/khong phai CRAN hoac CRAN nhung
// khong uoc luong duoc) - TAI SU DUNG buildDotIcon export tu NetworkMap.tsx (KHONG dinh nghia ban sao), to
// hon tramGocIcon cu (18px) 1 chut vi ban do nay co THEM nhieu lop markers khac chong len nhau
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

// mau xam trung tinh cho tram cung tinh (context) - TAI SU DUNG token statusRunning da co san trong
// theme.ts (vai tro goc la "buoc dang chay" cua CrLogTimeline, nhung ban chat la 1 mau xam trung tinh KHONG
// mang y nghia "active" nao - dung lai de tranh bia them 1 mau xam moi khong co trong theme.ts)
const MAU_TRAM_CUNG_TINH = R012_COLORS.statusRunning;
// marker rieng cho vi tri TONG DAI cua X khi X la CRAN (THEM 10/10/2026) - to hon cham tron tram cung tinh
// 1 chut (16px, co vien trang + shadow qua buildDotIcon) de phan biet "day la 1 diem DAC BIET" chu khong
// phai 1 tram thuong trong lop ngu canh
const tongDaiIcon = buildDotIcon(MAU_TRAM_CUNG_TINH, 16);

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

function tinhDoDayNan(pctHo: number, maxPctHo: number): number {
  if (maxPctHo <= 0) {
    return NAN_WEIGHT_MIN;
  }
  const ti_le = Math.min(1, Math.max(0, pctHo / maxPctHo));
  return NAN_WEIGHT_MIN + (NAN_WEIGHT_MAX - NAN_WEIGHT_MIN) * ti_le;
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
      {diemCoTyLe.map((d) => (
        <Polyline
          key={`${d.tram_id}-${d.lat}-${d.lon}`}
          positions={[tam, [d.lat, d.lon]]}
          pathOptions={{ color: R012_COLORS.primaryDark, weight: tinhDoDayNan(d.pct_ho as number, maxPctHo) }}
        >
          {zoom >= ZOOM_HIEN_NHAN_NAN && (
            <Tooltip permanent direction="center" position={[d.lat, d.lon]}>
              {formatPctHo(d.pct_ho)}
            </Tooltip>
          )}
        </Polyline>
      ))}
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

// chu giai mau (B8) - dat co dinh goc duoi-phai ban do, KHONG chan tuong tac map (vi tri rieng voi
// LayersControl o goc tren-phai de khong de len nhau)
const Legend: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 8,
      right: 8,
      background: "rgba(255,255,255,0.92)",
      padding: "8px 10px",
      borderRadius: 4,
      fontSize: "0.75rem",
      lineHeight: 1.7,
      zIndex: 600,
      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      maxWidth: 220,
    }}
  >
    <div>
      <ChamTron mau={MAU_TRAM_CUNG_TINH} /> Tram cung tinh
    </div>
    <div>
      <ChamTron mau={R012_COLORS.dangerRed} /> Tram X (goc, bi tat)
    </div>
    <div>
      <VongNetDut mau={R012_COLORS.dangerRed} /> X - vi tri uoc luong (CRAN)
    </div>
    <div>
      <ChamTron mau={MAU_TRAM_CUNG_TINH} /> Tong dai CRAN (toa do RIMS goc cua X)
    </div>
    <div>
      <VongNetDut mau={R012_COLORS.primary} /> Vi tri uoc luong cell CRAN
    </div>
    <div>
      <ChamTron mau={R012_COLORS.primary} /> Tram bi anh huong (dam = %HO cao)
    </div>
    <div>
      <DuongKe mau={R012_COLORS.primaryDark} /> Nan / duong bao vung anh huong
    </div>
    <div>
      <DuongKe mau={R012_COLORS.chartCrDay} /> Vong L1
    </div>
    <div>
      <DuongKe mau={R012_COLORS.primaryLight} /> Vong L2
    </div>
  </div>
);

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

  return (
    <div>
      <div style={{ position: "relative" }}>
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

          {/* B2: moi tram cung tinh - CircleMarker xam nho, Tooltip ten tram khi re chuot (KHONG dung Popup -
              Popup can click, Tooltip hien ngay khi hover, dung voi yeu cau "khi re chuot") */}
          {tramCungTinh?.map(
            (t) =>
              t.lat !== null &&
              t.lon !== null && (
                <CircleMarker
                  key={t.tram_id}
                  center={[t.lat, t.lon]}
                  radius={3}
                  pathOptions={{
                    color: MAU_TRAM_CUNG_TINH,
                    fillColor: MAU_TRAM_CUNG_TINH,
                    fillOpacity: 0.6,
                    weight: 1,
                  }}
                >
                  <Tooltip>{t.ten}</Tooltip>
                </CircleMarker>
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
                  <Tooltip>{`${t.ten ?? t.tram_id} - tong ${formatPctHo(t.tong_pct_ho)} HO`}</Tooltip>
                  <Popup>
                    <div>
                      <strong>{t.ten ?? t.tram_id}</strong>
                    </div>
                    <div>Ma tram: {t.tram_id}</div>
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
            {duongBaoPolygonPositions.length >= 3 && (
              <LayersControl.Overlay name="Duong bao vung anh huong" checked>
                <Polygon
                  positions={duongBaoPolygonPositions}
                  pathOptions={{ color: R012_COLORS.primaryDark, weight: 2, fillOpacity: 0.08 }}
                />
              </LayersControl.Overlay>
            )}
            {/* THEM (10/10/2026): "Nan" - tia tu TAM den tung dinh (dung CHUNG danh sach dinh voi "Duong
                bao" o tren, ke ca khi duong bao KHONG co polygon - luc do danh sach la "doan"). LayerGroup
                BAT BUOC o day: NanLayer render NHIEU Polyline (1 component composite, khong phai 1 layer
                Leaflet don le), LayersControl.Overlay chi chap nhan DUNG 1 layer con - LayerGroup gom nhieu
                layer thanh 1 don vi bat/tat duoc */}
            {danhSachDinhDuongBao.length > 0 && (
              <LayersControl.Overlay name="Nan (ty le %HO tung tram)" checked>
                <LayerGroup>
                  <NanLayer tam={[tamLat, tamLon]} diem={danhSachDinhDuongBao} />
                </LayerGroup>
              </LayersControl.Overlay>
            )}
            {l1Positions.length >= 2 && (
              <LayersControl.Overlay name="Vong L1" checked={false}>
                <Polyline positions={l1Positions} pathOptions={{ color: R012_COLORS.chartCrDay, weight: 3 }} />
              </LayersControl.Overlay>
            )}
            {l2Positions.length >= 2 && (
              <LayersControl.Overlay name="Vong L2" checked={false}>
                <Polyline positions={l2Positions} pathOptions={{ color: R012_COLORS.primaryLight, weight: 3 }} />
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>

        {thieuTile && <ThieuTileOverlay />}

        {/* B1: khung thong tin co dinh (ten tinh/KV) - goc tren-trai, luon hien (khong can click X) */}
        {x.ten_tinh && (
          <div
            style={{
              position: "absolute",
              top: 8,
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

        <Legend />
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
