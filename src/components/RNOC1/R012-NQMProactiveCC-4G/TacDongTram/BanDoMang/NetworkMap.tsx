import React from "react";
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
// tach marker trung toa do (nhieu tram treo cung 1 cot, cell chi khac huong anten) - xem ly do day du
// trong chinh file do, ke ca ly do KHONG chon cach tang maxZoom
import { tachMarkerChongNhau, suyHuongTuTenCell } from "./tachMarkerChongNhau";
// ban do rieng cho nhanh HO (BUOC 4c, 10/10/2026, yeu cau truc tiep user) - CHI dung khi previewData.ban_do
// co gia tri (nhanh HO), xem nhanh re trong PreviewMap() ben duoi
import PreviewMapHo from "./PreviewMapHo";
// SUA (11/10/2026, loi runtime sau deploy 9463f85) - hang so/helper tile/icon dung CHUNG voi PreviewMapHo.tsx
// TACH RIENG ra mapCommon.tsx (KHONG con khai bao/export truc tiep o day nua) - xem WHY day du trong chinh
// file do: NetworkMap.tsx truoc day export cac gia tri nay va PreviewMapHo.tsx import nguoc lai, TRONG KHI
// NetworkMap.tsx (file nay) lai import PreviewMapHo.tsx ngay ben tren - tao VONG LAP import giua 2 file, gay
// crash "buildDotIcon is not a function" LUC NAP MODULE (PreviewMapHo.tsx goi buildDotIcon() o cap module,
// truoc khi NetworkMap.tsx kip chay toi dong gan gia tri cho no).
import {
  TILE_URL,
  TILE_MAX_ZOOM,
  TILE_MIN_ZOOM,
  TILE_ATTRIBUTION,
  SINGLE_STATION_ZOOM,
  useTileErrorTracker,
  ThieuTileOverlay,
  buildDotIcon,
} from "./mapCommon";

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
        // chan zoom trong dung khoang bo tile offline co - xem comment o TILE_MIN_ZOOM/TILE_MAX_ZOOM
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
  laTramGoc: boolean; // phan biet marker do (tram bi tat) voi marker xanh (tram lan can) khi ve chung 1 vong lap
  // so hieu huong anten suy tu ten cell cua tram nay - dung chon goc rai khi marker bi trung toa do.
  // null = khong suy duoc (tram khong co cell nao trong cells_bi_anh_huong, hoac ten cell khong theo khuon)
  huongAnten: number | null;
}

// tach rieng component cho che do preview (nhieu marker) - giu NetworkMap chinh o tren gon, de doc theo tung che do
const PreviewMap: React.FC<{ data: PreviewCrResponse }> = ({ data }) => {
  // bo dem tile RIENG cua che do preview - reset khi preview cho 1 tram goc khac (du lieu doi hoan toan).
  // Hook PHAI goi TRUOC moi nhanh return ben duoi (quy tac hook cua React, giong NetworkMap() o tren) -
  // ke ca nhanh BUOC 4c ngay sau day (PreviewMapHo tu co bo dem tile RIENG cua no, bo dem nay KHONG dung
  // toi trong nhanh do, nhung VAN PHAI goi de giu thu tu hook on dinh qua moi lan render)
  const { thieuTile, eventHandlers } = useTileErrorTracker(data.tram_goc.tram_id);

  // BUOC 4c (10/10/2026, yeu cau truc tiep user) - ban do RIENG, PHONG PHU HON cho nhanh HO (X/CRAN/L1/L2/
  // duong bao/legend) khi BE co tra ban_do. "field moi la OPTIONAL" - nhanh CDS (BE cu, ban_do undefined/
  // null) GIU NGUYEN logic marker don gian cu phia duoi, KHONG bi anh huong gi
  if (data.ban_do) {
    return <PreviewMapHo data={data} />;
  }

  // FIX (Phan 1, ban sua theo schema BE moi 22072026): BE da tach rieng tram_bi_anh_huong (mang PHANG,
  // KHONG con lap lai tram_goc ben trong nhu tram_lan_can cu) va cells_bi_anh_huong (mang PHANG rieng,
  // KHONG con nam long trong tung tram nhu PreviewTramItem.cells cu) - so cell anh huong cua tram_goc PHAI
  // tu dem qua cells_bi_anh_huong theo tram_id, DA XAC NHAN qua goi that: cells_bi_anh_huong KHONG chua
  // cell nao thuoc tram_goc (tram_goc khong con "tu anh huong chinh no"), nen so cell cua tram_goc la 0
  const soCellCuaTramGoc = data.cells_bi_anh_huong.filter((c) => c.tram_id === data.tram_goc.tram_id).length;

  // So hieu huong anten dai dien cua 1 tram, suy tu ten cac cell cua chinh tram do (vd 4G-SSN121M43-HNI ->
  // huong 4). Lay so NHO NHAT khi tram co nhieu cell nhieu huong: chi can 1 gia tri ON DINH de chon goc rai
  // - lay min thi cung 1 tram luon ra cung 1 goc du BE tra cells_bi_anh_huong theo thu tu khac nhau, con
  // lay phan tu dau tien thi goc se nhay lung tung moi lan goi lai preview
  const layHuongCuaTram = (tramId: string): number | null => {
    const cacHuong = data.cells_bi_anh_huong
      .filter((c) => c.tram_id === tramId)
      .map((c) => suyHuongTuTenCell(c.cell_name))
      .filter((h): h is number => h !== null);
    return cacHuong.length > 0 ? Math.min(...cacHuong) : null;
  };

  const tramGocValid: ValidCoordTram | null =
    data.tram_goc.longitude !== null && data.tram_goc.latitude !== null
      ? {
          tram_id: data.tram_goc.tram_id,
          tram_name: data.tram_goc.tram_name,
          lat: data.tram_goc.latitude,
          lng: data.tram_goc.longitude,
          soCellAnhHuong: soCellCuaTramGoc,
          laTramGoc: true,
          huongAnten: layHuongCuaTram(data.tram_goc.tram_id),
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
      laTramGoc: false,
      huongAnten: layHuongCuaTram(t.tram_id),
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

  // TACH MARKER TRUNG TOA DO (16082026) - lam NGAY TRUOC khi tinh bounds/ve marker. Tu day tro xuong CHI
  // dung toa do da tach (m.lat/m.lng cua KetQuaTachMarker), khong dung lai toa do goc trong m.item nua:
  // bounds tinh theo toa do da tach thi marker bi day ra ria van chac chan nam trong khung nhin
  const markerDaTach = tachMarkerChongNhau(
    allMarkers,
    (m) => ({ lat: m.lat, lng: m.lng }),
    (m) => m.huongAnten
  );

  const bounds: [number, number][] = markerDaTach.map((m) => [m.lat, m.lng]);

  // tong so marker da phai doi vi tri hien thi - dung cho dong ghi chu duoi ban do. Neu khong noi ra, mot
  // ngay nao do se co nguoi doi chieu toa do tren map voi toa do trong bang va tuong FE hien sai du lieu
  const soMarkerDaTach = markerDaTach.filter((m) => m.daTach).length;

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
          // chan zoom trong dung khoang bo tile offline co. Leaflet tu fit bounds nhung se KHONG phong
          // qua TILE_MAX_ZOOM - truong hop cac tram rat gan nhau, ban do dung lai o do thay vi zoom sau vao
          // vung khong co tile
          minZoom={TILE_MIN_ZOOM}
          maxZoom={TILE_MAX_ZOOM}
          style={{ height: "400px", width: "100%" }}
          // key doi theo tram_goc de ep react-leaflet remount khi NOC xem preview cho 1 tram KHAC, giong cach
          // lam o che do 1 marker phia tren (tranh loi map khong tu fit lai bounds moi luc component da mount san)
          key={`preview-${data.tram_goc.tram_id}`}
        >
          {/* tile OFFLINE tu server noi bo (xem TILE_URL) - khong con goi ra internet */}
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} eventHandlers={eventHandlers} />

          {/* VE CHUNG 1 vong lap cho ca tram goc lan tram lan can (truoc day tach lam 2 khoi): viec tach
              marker trung toa do phai xet TAT CA marker cung mot luc moi biet cai nao trung cai nao - trong
              du lieu that chinh tram goc cung co the trung toa do voi 1 tram lan can. Vai tro tram goc /
              lan can gio phan biet bang co laTramGoc (icon do vs xanh), khong con bang vi tri trong JSX */}
          {markerDaTach.map(({ item, lat, lng, daTach, soTrungToaDo }) => (
            <Marker
              key={item.tram_id}
              position={[lat, lng]}
              icon={item.laTramGoc ? tramGocIcon : tramLanCanIcon}
            >
              <Popup>
                <div>
                  <strong>{item.tram_name ?? item.tram_id}</strong>{" "}
                  {item.laTramGoc ? "(tram goc - bi tat)" : "(tram lan can)"}
                </div>
                <div>Ma tram: {item.tram_id}</div>
                <div>So cell bi anh huong: {item.soCellAnhHuong}</div>
                {/* Noi ro ngay trong popup khi marker nay da bi doi cho: nguoi truc bam vao dung marker
                    dang nghi ngo la thay ly do, khong phai doc dong ghi chu chung o duoi roi tu doan
                    marker nao bi anh huong */}
                {daTach && (
                  <div style={{ marginTop: "4px", color: "#8c8c8c" }}>
                    Vi tri hien thi da tach ra {soTrungToaDo} marker: {soTrungToaDo} tram nay dung CHUNG
                    mot toa do
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {thieuTile && <ThieuTileOverlay />}
      </div>

      {/* ghi chu khi co marker bi doi cho - CAN THIET vi toa do tren ban do luc nay khong con khop 100%
          voi toa do trong bang "Tram bi anh huong" ngay ben duoi. Noi truoc con hon de nguoi dung tu phat
          hien roi mat long tin vao ca 2 cho */}
      {soMarkerDaTach > 0 && (
        <div style={{ marginTop: "8px", color: "#8c8c8c", fontSize: "0.85rem" }}>
          Luu y: {soMarkerDaTach} marker duoc rai quanh vi tri that (trong ban kinh ~40m) vi co nhieu tram
          dung CHUNG mot toa do - neu ve dung toa do that thi chung de len nhau thanh 1 cham duy nhat.
        </div>
      )}

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
