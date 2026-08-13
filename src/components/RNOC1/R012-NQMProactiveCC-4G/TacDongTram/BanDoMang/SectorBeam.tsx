// CANH BAO QUAN TRONG: day CHI la hinh minh hoa trang tri (3 quat gia dinh quanh tram),
// KHONG PHAI huong song/azimuth thuc te cua tram - vi StationItem (types/index.ts) HIEN KHONG CO
// field azimuth/huong song tu BE. Nguoi doc code sau nay KHONG duoc hieu day la du lieu that.
import React from "react";
import { Polygon } from "react-leaflet";

// toa do tam (vi tri tram) nhan tu NetworkMap, dung chung 1 diem cho ca 3 sector
interface SectorBeamProps {
  center: { lat: number; lng: number };
}

// ban kinh co dinh minh hoa (met) - khong lay tu du lieu that vi khong co field ban kinh phu song trong schema
// tang tu 200 len 320 de sector to hon, de nhin ro tren ban do khi zoom muc thuong dung
const RADIUS_METERS = 320;

// so diem lay mau tren cung 1 cung tron - nhieu diem hon cho duong cong sector muot hon khi ve tren ban do
const ARC_SAMPLE_POINTS = 12;

// ban kinh Trai Dat trung binh (met) - dung cho cong thuc tinh diem theo khoang cach + phuong vi
const EARTH_RADIUS_METERS = 6378137;

// tinh 1 diem lat/lng cach tam 1 khoang distanceMeters theo phuong vi bearingDegrees (0 do = huong Bac)
// dung cong thuc destination point tren mat cau - du chinh xac cho pham vi nho (vai tram met) nhu o day,
// khong can thu vien geo rieng (turf...) chi de ve 1 hinh minh hoa
function destinationPoint(
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingDegrees: number
): [number, number] {
  const bearingRad = (bearingDegrees * Math.PI) / 180; // doi do sang radian de dung ham luong giac
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS; // khoang cach goc (radian) tren mat cau

  const destLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );
  const destLngRad =
    lngRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLatRad)
    );

  return [(destLatRad * 180) / Math.PI, (destLngRad * 180) / Math.PI]; // tra ve [lat, lng] dung thu tu Leaflet dung
}

// dung tam+goc bat dau+goc ket thuc de tao mang diem polygon dang hinh quat (tam -> cung tron -> tam)
function buildSectorPolygon(
  center: { lat: number; lng: number },
  startAngle: number,
  endAngle: number
): [number, number][] {
  const points: [number, number][] = [[center.lat, center.lng]]; // diem dau la tam tram, de tao hinh quat khep kin

  // chia cung tron thanh nhieu doan nho, moi doan 1 diem, cang nhieu diem cung tron cang muot
  for (let i = 0; i <= ARC_SAMPLE_POINTS; i += 1) {
    const angle = startAngle + ((endAngle - startAngle) * i) / ARC_SAMPLE_POINTS;
    points.push(destinationPoint(center.lat, center.lng, RADIUS_METERS, angle));
  }

  points.push([center.lat, center.lng]); // diem cuoi quay lai tam de khep kin hinh quat
  return points;
}

// 3 sector co dinh 0/120/240 do theo yeu cau, moi sector rong 120 do de phu kin du 360 do quanh tram
// mau pastel khac nhau CHI de phan biet 3 sector bang mat, khong mang y nghia ky thuat gi
const SECTORS = [
  { startAngle: 0, endAngle: 120, color: "#FFB3BA" }, // hong pastel
  { startAngle: 120, endAngle: 240, color: "#BAE1FF" }, // xanh duong pastel
  { startAngle: 240, endAngle: 360, color: "#BAFFC9" }, // xanh la pastel
];

const SectorBeam: React.FC<SectorBeamProps> = ({ center }) => {
  return (
    <>
      {SECTORS.map((sector) => (
        <Polygon
          key={`${sector.startAngle}-${sector.endAngle}`}
          positions={buildSectorPolygon(center, sector.startAngle, sector.endAngle)}
          pathOptions={{
            color: sector.color,
            fillColor: sector.color,
            // tang tu 0.35 len 0.55: mau dam hon de nhin ro tren nen map sang, van du mo de thay duong pho ben duoi
            fillOpacity: 0.55,
            weight: 1,
          }}
        />
      ))}
    </>
  );
};

export default SectorBeam;
