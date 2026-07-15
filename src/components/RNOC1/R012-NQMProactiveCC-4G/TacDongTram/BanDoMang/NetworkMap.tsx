import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// import truc tiep anh marker mac dinh cua Leaflet - Leaflet dung duong dan CSS tuong doi cho anh nay,
// duong dan do se BI VO khi qua webpack bundling, nen phai import anh roi gan lai icon thu cong ben duoi
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css"; // css goc cua Leaflet - bat buoc phai co de ban do/marker hien dung vi tri, khong bi vo layout
import { StationItem } from "../../types";
import SectorBeam from "./SectorBeam";

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

// zoom co dinh muc 15 - du gan de nhin ro khu vuc quanh 1 tram rieng le (duong sa, nha cua xung quanh),
// khong qua gan gay mat ngu canh khu vuc, cung khong qua xa lam mat chi tiet vi tri tram
const SINGLE_STATION_ZOOM = 15;

interface NetworkMapProps {
  station: StationItem | null; // tram dang duoc chon de xem tren ban do, null khi chua chon tram nao
}

const NetworkMap: React.FC<NetworkMapProps> = ({ station }) => {
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
    <MapContainer
      center={center}
      zoom={SINGLE_STATION_ZOOM}
      style={{ height: "400px", width: "100%" }}
      // key thay doi theo tram dang chon - ep react-leaflet remount MapContainer khi doi tram,
      // tranh loi map khong tu recenter dung cach khi chi doi prop center luc component da mount san
      key={station.tram_id}
    >
      {/* tile OpenStreetMap mien phi, khong can API key - nguon: https://www.openstreetmap.org/copyright */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

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
  );
};

export default NetworkMap;
