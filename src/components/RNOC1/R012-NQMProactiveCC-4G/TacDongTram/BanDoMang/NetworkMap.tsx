import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// import truc tiep anh marker mac dinh cua Leaflet - Leaflet dung duong dan CSS tuong doi cho anh nay,
// duong dan do se BI VO khi qua webpack bundling, nen phai import anh roi gan lai icon thu cong ben duoi
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css"; // css goc cua Leaflet - bat buoc phai co de ban do/marker hien dung vi tri, khong bi vo layout
import { StationItem, PreviewCrResponse } from "../../types";
import SectorBeam from "./SectorBeam";
import { R012_COLORS } from "../../theme";

// gan lai icon mac dinh bang anh da import qua webpack, thay vi de Leaflet tu doan duong dan (se sai khi bundle)
// chi can lam 1 lan khi module duoc load, khong can lam lai moi lan render
const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41], // kich thuoc goc cua bo icon mac dinh Leaflet, giu nguyen de khong bi lech diem neo
  iconAnchor: [12, 41], // diem neo o day duoi icon, dung vi tri nay de mui icon tro dung toa do tram
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon; // ap dung cho moi Marker trong file nay, tranh phai truyen icon lap lai o tung Marker

// ==== TILE OFFLINE ====
// Server .196/.197 va may nguoi dung KHONG CO INTERNET (self-host noi bo) nen KHONG dung duoc tile cong
// cong cua OpenStreetMap nua - truoc day URL tro thang ra https://{s}.tile.openstreetmap.org/... lam ban do
// trang tron. Gio doc tu bo tile offline (Viet Nam, zoom 6-13) dat tai /home/auto/osm-tiles tren .197,
// phuc vu qua symlink /home/auto/FE/tiles -> ra duong dan web /tiles/.
//
// BO tham so {s} (subdomain a/b/c): do la ky thuat xoay subdomain de tang so ket noi song song toi CDN cong
// cong. Server noi bo KHONG co cac subdomain do - de nguyen {s} se sinh ra URL sai va hong toan bo tile.
//
// Qua bien moi truong de doi duong dan ma khong phai sua code. LUU Y: dotenv-webpack nhung gia tri nay LUC
// BUILD (khong phai doc luc chay), nen doi bien VAN PHAI build lai - van hon hardcode vi sua 1 dong .env
// de hon va it rui ro hon sua file nguon.
const TILE_URL = process.env.R012_TILE_URL || "/tiles/{z}/{x}/{y}.png";

// Bo tile chi co zoom 6-13. Neu de nguoi dung phong to qua 13, Leaflet se xin nhung tile KHONG TON TAI ->
// o trang lo cho tren nen ban do -> nguoi dung tuong he thong hong. Chan o tang UI (khong cho zoom qua muc)
// tot hon nhieu so voi de no loi roi moi bao.
const TILE_MIN_ZOOM = 6;
const TILE_MAX_ZOOM = 13;

// So tile loi truoc khi ket luan "khong tai duoc ban do nen". KHONG canh bao ngay tu tile dau tien: vai tile
// ria khung nhin thieu la chuyen binh thuong voi bo tile cat theo bien gioi (vd o bien, ngoai bien Viet Nam)
// - bao ngay se la bao dong gia. Vuot 5 tile moi la dau hieu ca lop nen khong ve duoc.
const TILE_ERROR_THRESHOLD = 5;

// Ghi cong OpenStreetMap - BAT BUOC theo giay phep ODbL KE CA khi phuc vu tile offline tu server rieng,
// vi du lieu ban do van la cua OSM
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Theo doi su kien 'tileerror' cua Leaflet de biet lop nen co ve duoc khong.
// resetKey: doi tram / doi du lieu preview -> xoa bo dem, neu khong 1 lan loi cu se treo canh bao mai mai
function useTileErrorTracker(resetKey: string) {
  const [thieuTile, setThieuTile] = useState<boolean>(false);
  // dem bang ref (khong phai state): moi tile loi deu ban su kien, dung state se render lai vai chuc lan
  // vo ich - chi can render lai DUNG 1 lan luc vuot nguong
  const soTileLoiRef = useRef<number>(0);

  useEffect(() => {
    soTileLoiRef.current = 0;
    setThieuTile(false);
  }, [resetKey]);

  const eventHandlers = useMemo(
    () => ({
      tileerror: () => {
        soTileLoiRef.current += 1;
        if (soTileLoiRef.current > TILE_ERROR_THRESHOLD) {
          setThieuTile(true); // goi lai nhieu lan voi cung gia tri true - React tu bo qua, khong render thua
        }
      },
    }),
    []
  );

  return { thieuTile, eventHandlers };
}

// Lop phu bao "khong co anh nen" - dat DE len tren ban do, KHONG che marker/popup.
// Noi ro "marker va vi tri tram van hien dung": khung ban do van dung kich thuoc, marker va popup van ve
// dung toa do - CHI THIEU moi anh nen. Khong co dong nay thi nguoi dung nhin o trang se tuong toan bo tinh
// nang ban do hong va bo khong dung, trong khi thu ho can (vi tri tram) van con nguyen.
const ThieuTileOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.75)",
      textAlign: "center",
      padding: "0 16px",
      // KHONG chan chuot: van keo/zoom/bam marker duoc binh thuong xuyen qua lop phu nay
      pointerEvents: "none",
      // tren tile (z=200..400) nhung DUOI popup cua Leaflet (z=700) de popup marker khong bi che
      zIndex: 500,
    }}
  >
    <div style={{ fontWeight: 700, color: R012_COLORS.dangerRed }}>
      Khong tai duoc ban do nen. Kiem tra tile offline tren server.
    </div>
    <div style={{ fontSize: "0.85rem", color: "#595959", marginTop: "4px" }}>
      Marker va vi tri tram van hien dung.
    </div>
  </div>
);

// zoom mac dinh khi xem 1 tram rieng le. TRUOC DAY la 15 - NGOAI khoang tile offline (6-13) nen mo ra la
// trang ngay lap tuc. Ha ve 13 = muc gan nhat bo tile co, van du chi tiet de dinh vi khu vuc quanh tram
const SINGLE_STATION_ZOOM = TILE_MAX_ZOOM;

// icon dang cham tron mau ve bang L.divIcon (KHONG can them file anh moi) de phan biet tram_goc (do) va
// tram_bi_anh_huong (xanh duong) tren cung 1 ban do preview - marker mac dinh cua Leaflet (defaultIcon o tren)
// chi co 1 mau xanh duong nen khong dung truc tiep duoc cho ca 2 vai tro cung luc
const buildDotIcon = (color: string, sizePx: number) =>
  L.divIcon({
    className: "", // ghi de rong de bo class mac dinh "leaflet-div-icon" (co nen/border vuong trang xau), tu ve toan bo qua html
    html: `<div style="background:${color};width:${sizePx}px;height:${sizePx}px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.6);"></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
  });

const tramGocIcon = buildDotIcon(R012_COLORS.dangerRed, 18); // do, lon hon 1 chut de noi bat la tram chinh bi tat
const tramLanCanIcon = buildDotIcon(R012_COLORS.primary, 14); // xanh duong - dung DUNG token primary chung cua module

interface NetworkMapProps {
  station: StationItem | null; // tram dang duoc chon de xem tren ban do, null khi chua chon tram nao
  // ket qua preview CR (tram_goc + tram_bi_anh_huong) - CO gia tri thi UU TIEN hien che do nhieu marker (preview),
  // BO QUA prop "station" o tren; null/undefined thi quay lai che do 1 marker binh thuong nhu truoc
  previewData?: PreviewCrResponse | null;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ station, previewData }) => {
  // Hook PHAI goi truoc moi nhanh return ben duoi (quy tac hook cua React) - ke ca nhanh tra ve PreviewMap
  // hay nhanh "chua chon tram". Reset bo dem theo tram dang chon: doi tram la coi nhu do lai tu dau
  const { thieuTile, eventHandlers } = useTileErrorTracker(station?.tram_id ?? "");

  // uu tien che do preview khi co du lieu - tach rieng component PreviewMap ben duoi de giu nhanh logic
  // 1-marker (station) o day khong bi roi, de doc theo tung che do rieng biet
  // (PreviewMap tu co bo dem tile rieng cua no - bo dem o tren khong dung toi trong nhanh nay)
  if (previewData) {
    return <PreviewMap data={previewData} />;
  }

  // khong ve map khi chua co tram hoac tram thieu toa do (longitude/latitude co the null theo schema StationItem)
  // - tranh render 1 cai MapContainer rong vo nghia (khong biet center o dau) gay nham lan cho NOC
  const hasValidCoordinates =
    station !== null && station.longitude !== null && station.latitude !== null;

  if (!hasValidCoordinates) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          border: "1px dashed #d9d9d9",
          borderRadius: "4px",
          color: "#8c8c8c",
        }}
      >
        Chon tram de xem tren ban do
      </div>
    );
  }

  // tu day tro di TypeScript van coi longitude/latitude la "number | null" vi khai bao goc trong StationItem,
  // nen phai ep kieu ro rang - da kiem tra khac null o hasValidCoordinates ngay tren nen chac chan la number
  const center: [number, number] = [station.latitude as number, station.longitude as number];
  const centerObj = { lat: station.latitude as number, lng: station.longitude as number };

  return (
    // position:relative de ThieuTileOverlay (position:absolute) neo dung vao khung ban do nay
    <div style={{ position: "relative" }}>
      <MapContainer
        center={center}
        zoom={SINGLE_STATION_ZOOM}
        // chan zoom trong dung khoang bo tile offline co (6-13) - xem comment o TILE_MIN_ZOOM/TILE_MAX_ZOOM
        minZoom={TILE_MIN_ZOOM}
        maxZoom={TILE_MAX_ZOOM}
        style={{ height: "400px", width: "100%" }}
        // key thay doi theo tram dang chon - ep react-leaflet remount MapContainer khi doi tram,
        // tranh loi map khong tu recenter dung cach khi chi doi prop center luc component da mount san
        key={station.tram_id}
      >
        {/* tile OFFLINE tu server noi bo (xem TILE_URL) - khong con goi ra internet */}
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} eventHandlers={eventHandlers} />

        <Marker position={center}>
          {/* popup hien ten tram + ma tram khi NOC click vao marker, giup xac nhan dung tram dang xem tren map */}
          <Popup>
            <div>{station.tram_name}</div>
            <div>Ma tram: {station.tram_id}</div>
          </Popup>
        </Marker>

        {/* sector la hinh minh hoa trang tri, xem canh bao chi tiet trong SectorBeam.tsx - khong phai huong song that */}
        <SectorBeam center={centerObj} />
      </MapContainer>

      {thieuTile && <ThieuTileOverlay />}
    </div>
  );
};

// tram da loc: chi giu tram CO du toa do (longitude/latitude khac null) va da tinh san so cell anh huong,
// dung chung cho ca tram_goc va tung phan tu tram_bi_anh_huong khi ve marker/tinh bounds ben duoi
interface ValidCoordTram {
  tram_id: string;
  tram_name: string | null;
  lat: number;
  lng: number;
  soCellAnhHuong: number;
}

// tach rieng component cho che do preview (nhieu marker) - giu NetworkMap chinh o tren gon, de doc theo tung che do
const PreviewMap: React.FC<{ data: PreviewCrResponse }> = ({ data }) => {
  // bo dem tile RIENG cua che do preview - reset khi preview cho 1 tram goc khac (du lieu doi hoan toan)
  const { thieuTile, eventHandlers } = useTileErrorTracker(data.tram_goc.tram_id);

  // FIX (Phan 1, ban sua theo schema BE moi 22072026): BE da tach rieng tram_bi_anh_huong (mang PHANG,
  // KHONG con lap lai tram_goc ben trong nhu tram_lan_can cu) va cells_bi_anh_huong (mang PHANG rieng,
  // KHONG con nam long trong tung tram nhu PreviewTramItem.cells cu) - so cell anh huong cua tram_goc PHAI
  // tu dem qua cells_bi_anh_huong theo tram_id, DA XAC NHAN qua goi that: cells_bi_anh_huong KHONG chua
  // cell nao thuoc tram_goc (tram_goc khong con "tu anh huong chinh no"), nen so cell cua tram_goc la 0
  const soCellCuaTramGoc = data.cells_bi_anh_huong.filter((c) => c.tram_id === data.tram_goc.tram_id).length;

  const tramGocValid: ValidCoordTram | null =
    data.tram_goc.longitude !== null && data.tram_goc.latitude !== null
      ? {
          tram_id: data.tram_goc.tram_id,
          tram_name: data.tram_goc.tram_name,
          lat: data.tram_goc.latitude,
          lng: data.tram_goc.longitude,
          soCellAnhHuong: soCellCuaTramGoc,
        }
      : null;

  // FIX: dung THANG tram_bi_anh_huong BE tra san (KHONG con phai tu loc trung tram_goc nhu tram_lan_can cu -
  // DA XAC NHAN qua goi that: tram_bi_anh_huong KHONG con lap lai tram_goc). Van GIU nguyen buoc loc tram
  // KHONG co toa do (longitude/latitude null) - EDGE CASE nay van co the xay ra du response mau lan nay du
  // toa do ca 29 tram, KHONG ve marker de tranh crash Leaflet, chi dem lai so luong de ghi chu cho NOC
  let soTramKhongCoToaDo = 0;
  const tramLanCanValid: ValidCoordTram[] = [];
  data.tram_bi_anh_huong.forEach((t) => {
    if (t.longitude === null || t.latitude === null) {
      soTramKhongCoToaDo += 1;
      return;
    }
    tramLanCanValid.push({
      tram_id: t.tram_id,
      tram_name: t.tram_name,
      lat: t.latitude,
      lng: t.longitude,
      soCellAnhHuong: data.cells_bi_anh_huong.filter((c) => c.tram_id === t.tram_id).length,
    });
  });

  const allMarkers = tramGocValid ? [tramGocValid, ...tramLanCanValid] : tramLanCanValid;

  // khong co marker nao du toa do de ve (ca tram_goc lan toan bo tram_lan_can deu thieu toa do) - bao ro cho
  // NOC thay vi render MapContainer voi bounds rong (Leaflet se loi/crash khi fitBounds mang rong)
  if (allMarkers.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          border: "1px dashed #d9d9d9",
          borderRadius: "4px",
          color: "#8c8c8c",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        Khong co tram nao du toa do de hien tren ban do (tat ca tram thieu longitude/latitude)
      </div>
    );
  }

  const bounds: [number, number][] = allMarkers.map((m) => [m.lat, m.lng]);

  return (
    // position:relative de ThieuTileOverlay (position:absolute) neo dung vao khung ban do, KHONG tran ra
    // ca khoi div ngoai (con chua dong ghi chu "tram khong co toa do" ben duoi)
    <div>
      <div style={{ position: "relative" }}>
        <MapContainer
          // dung "bounds" thay "center/zoom" co dinh - MapOptions cua Leaflet coi center/zoom la optional
          // (da kiem tra type MapContainerProps that trong node_modules/react-leaflet), nen chi truyen bounds
          // la du de Leaflet TU fit vua khung nhin quanh het marker, khong can tu tinh center/zoom thu cong
          bounds={bounds}
          boundsOptions={{ padding: [40, 40] }} // chua khoang trong quanh marker ria, tranh marker nam sat vien khung ban do
          // chan zoom trong dung khoang bo tile offline co (6-13). Leaflet tu fit bounds nhung se KHONG
          // phong qua 13 - truong hop cac tram rat gan nhau, ban do dung lai o 13 thay vi zoom sau vao vung
          // khong co tile
          minZoom={TILE_MIN_ZOOM}
          maxZoom={TILE_MAX_ZOOM}
          style={{ height: "400px", width: "100%" }}
          // key doi theo tram_goc de ep react-leaflet remount khi NOC xem preview cho 1 tram KHAC, giong cach
          // lam o che do 1 marker phia tren (tranh loi map khong tu fit lai bounds moi luc component da mount san)
          key={`preview-${data.tram_goc.tram_id}`}
        >
          {/* tile OFFLINE tu server noi bo (xem TILE_URL) - khong con goi ra internet */}
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} eventHandlers={eventHandlers} />

          {tramGocValid && (
            <Marker position={[tramGocValid.lat, tramGocValid.lng]} icon={tramGocIcon}>
              <Popup>
                <div>
                  <strong>{tramGocValid.tram_name ?? tramGocValid.tram_id}</strong> (tram goc - bi tat)
                </div>
                <div>Ma tram: {tramGocValid.tram_id}</div>
                <div>So cell bi anh huong: {tramGocValid.soCellAnhHuong}</div>
              </Popup>
            </Marker>
          )}

          {tramLanCanValid.map((t) => (
            <Marker key={t.tram_id} position={[t.lat, t.lng]} icon={tramLanCanIcon}>
              <Popup>
                <div>
                  <strong>{t.tram_name ?? t.tram_id}</strong> (tram lan can)
                </div>
                <div>Ma tram: {t.tram_id}</div>
                <div>So cell bi anh huong: {t.soCellAnhHuong}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {thieuTile && <ThieuTileOverlay />}
      </div>

      {/* ghi chu so tram khong hien duoc tren map do thieu toa do - de NOC biet con thieu du lieu, khong
          tuong nham la preview chi co bay nhieu do la TOAN BO tram bi anh huong (EDGE CASE theo yeu cau) */}
      {soTramKhongCoToaDo > 0 && (
        <div style={{ marginTop: "8px", color: "#8c8c8c", fontSize: "0.85rem" }}>
          Luu y: {soTramKhongCoToaDo} tram lan can khong co toa do (longitude/latitude null), khong the hien
          tren ban do.
        </div>
      )}
    </div>
  );
};

export default NetworkMap;
