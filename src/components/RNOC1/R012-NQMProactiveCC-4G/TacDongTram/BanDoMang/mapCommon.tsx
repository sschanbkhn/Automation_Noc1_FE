// SUA (11/10/2026, loi runtime sau deploy 9463f85) - TACH RIENG hang so/helper dung CHUNG cho ca
// NetworkMap.tsx VA PreviewMapHo.tsx ra 1 module LA (khong import nguoc lai file nao khac trong thu muc
// nay) - TRUOC DAY cac gia tri nay nam trong NetworkMap.tsx va duoc PreviewMapHo.tsx import nguoc lai, TRONG
// KHI NetworkMap.tsx lai import PreviewMapHo.tsx (de dung lam nhanh re render) -> VONG LAP import giua 2
// file. ES module/webpack van cho phep import vong trong nhieu truong hop, NHUNG neu 1 ben GOI NGAY gia tri
// import o CAP MODULE (vd "const xIcon = buildDotIcon(...)" nam NGOAI component, chay luc nap module) THI SE
// LOI: luc PreviewMapHo.tsx dang duoc nap (vi NetworkMap.tsx import no truoc ca khi chinh NetworkMap.tsx
// chay xong than no), buildDotIcon tu NetworkMap.tsx VAN CHUA duoc gan gia tri (NetworkMap.tsx con dang ket
// qua o giua doan import cua chinh no) -> goi "buildDotIcon(...)" luc nay goi phai "undefined(...)" -> crash
// NGAY LUC NAP MODULE ("pD is not a function", pD la ten da bi minify cua buildDotIcon) - lam hong CA
// BUNDLE CHUNG vi day la code chay luc import, khong phai luc render component (lam PreviewMapHo khong
// crash o cho).
//
// FIX DUNG: tach han cac gia tri dung chung ra file nay (KHONG import NetworkMap.tsx/PreviewMapHo.tsx va
// cung KHONG bi 2 file do import nguoc lai no theo kieu vong) - ca 2 file kia CHI import TU day (1 chieu),
// khong con vong lap nao de xay ra loi tren.
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { R012_COLORS } from "../../theme";

// ==== TILE OFFLINE ====
// Server .196/.197 va may nguoi dung KHONG CO INTERNET (self-host noi bo) nen KHONG dung duoc tile cong
// cong cua OpenStreetMap nua - truoc day URL tro thang ra https://{s}.tile.openstreetmap.org/... lam ban do
// trang tron. Gio doc tu bo tile offline (Viet Nam) dat tai /home/auto/osm-tiles tren .197,
// phuc vu qua symlink /home/auto/FE/tiles -> ra duong dan web /tiles/.
//
// BO tham so {s} (subdomain a/b/c): do la ky thuat xoay subdomain de tang so ket noi song song toi CDN cong
// cong. Server noi bo KHONG co cac subdomain do - de nguyen {s} se sinh ra URL sai va hong toan bo tile.
//
// Qua bien moi truong de doi duong dan ma khong phai sua code. LUU Y: dotenv-webpack nhung gia tri nay LUC
// BUILD (khong phai doc luc chay), nen doi bien VAN PHAI build lai - van hon hardcode vi sua 1 dong .env
// de hon va it rui ro hon sua file nguon.
export const TILE_URL = process.env.R012_TILE_URL || "/tiles/{z}/{x}/{y}.png";

// Bo tile co gioi han zoom. Neu de nguoi dung phong to qua muc co tile, Leaflet se xin tile KHONG TON TAI ->
// o trang lo cho tren nen ban do -> nguoi dung tuong he thong hong. Chan o tang UI (khong cho zoom qua muc)
// tot hon nhieu so voi de no loi roi moi bao.
export const TILE_MIN_ZOOM = 6;
// 15 (nang tu 13, 02102026). LUU Y rieng cho NHANH NAY: nhanh thembv-rnoc-all-uc-dev-env chua merge buoc
// nang 13->14 ma master da lam truoc do (04092026) - gia tri doc duoc truoc khi sua la 13, KHONG phai 14
// nhu gia dinh ban dau cua yeu cau. Nang THANG len 15 (khong dung o buoc trung gian 14) de khop dung so
// cuoi cung duoc yeu cau. Giai xung dot MERGE master (03102026): GIU 15 cua nhanh dev nay (quyet dinh
// truc tiep cua user khi merge), KHONG lay lai 14 cua master.
//
// Chua xac nhan duoc bo tile tren .197 da co du z14/z15 hay chua (ngoai pham vi sua lan nay, chi sua code
// FE). Neu server CHUA co du tile cho 2 muc zoom moi, ThieuTileOverlay (useTileErrorTracker ben duoi) van
// tu canh bao "Khong tai duoc ban do nen" sau 5 tile loi - giong CHINH co che master da dua vao khi nang
// 13->14 luc con chua kip copy tile len .197. Neu sau nay xac nhan tile da du, co the xoa ghi chu nay.
export const TILE_MAX_ZOOM = 15;

// So tile loi truoc khi ket luan "khong tai duoc ban do nen". KHONG canh bao ngay tu tile dau tien: vai tile
// ria khung nhin thieu la chuyen binh thuong voi bo tile cat theo bien gioi (vd o bien, ngoai bien Viet Nam)
// - bao ngay se la bao dong gia. Vuot 5 tile moi la dau hieu ca lop nen khong ve duoc.
export const TILE_ERROR_THRESHOLD = 5;

// Ghi cong OpenStreetMap - BAT BUOC theo giay phep ODbL KE CA khi phuc vu tile offline tu server rieng,
// vi du lieu ban do van la cua OSM
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Theo doi su kien 'tileerror' cua Leaflet de biet lop nen co ve duoc khong.
// resetKey: doi tram / doi du lieu preview -> xoa bo dem, neu khong 1 lan loi cu se treo canh bao mai mai
export function useTileErrorTracker(resetKey: string) {
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
export const ThieuTileOverlay: React.FC = () => (
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

// zoom mac dinh khi xem 1 tram rieng le. GAN LAI = TILE_MAX_ZOOM (03102026, yeu cau truc tiep user) -
// truoc do tung tach rieng = 13 (hardcode, 04092026) vi TILE_MAX_ZOOM da nang len 14 nhung tile z14 CHUA
// duoc copy len .197, so trung se mo ban do ngay o muc chua co tile. Nay gan lai theo TILE_MAX_ZOOM (15):
// ThieuTileOverlay (xem useTileErrorTracker ben duoi) van la luoi an toan neu server thieu tile - hien
// canh bao thay vi man hinh trang cam nin.
export const SINGLE_STATION_ZOOM = TILE_MAX_ZOOM;

// icon dang cham tron mau ve bang L.divIcon (KHONG can them file anh moi) de phan biet tram_goc (do) va
// tram_bi_anh_huong (xanh duong) tren cung 1 ban do preview - marker mac dinh cua Leaflet chi co 1 mau xanh
// duong nen khong dung truc tiep duoc cho ca 2 vai tro cung luc
export const buildDotIcon = (color: string, sizePx: number) =>
  L.divIcon({
    className: "", // ghi de rong de bo class mac dinh "leaflet-div-icon" (co nen/border vuong trang xau), tu ve toan bo qua html
    html: `<div style="background:${color};width:${sizePx}px;height:${sizePx}px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.6);"></div>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
  });
