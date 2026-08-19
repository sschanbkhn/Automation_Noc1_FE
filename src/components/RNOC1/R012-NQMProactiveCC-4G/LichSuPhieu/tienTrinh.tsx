// Cach DIEN GIAI 6 truong tien trinh cua BE (so_cell_anh_huong / so_phieu_da_xuat / so_cell_cho_xuat_tay /
// ngay_du_kien_xuat_phieu / con_bao_nhieu_ngay / buoc_hien_tai) thanh 3 cot cua muc "Tien trinh" trong tab
// Lich su phieu, + bo loc theo buoc.
//
// Tach file rieng khoi TienTrinhTable.tsx (chi con phan khai bao bang) vi rieng phan dien giai nay - nhat
// la quy tac ve thanh tien do - dai hon toan bo phan khai bao cot cong lai, va la cho de phai quay lai sua
// nhat khi nghiep vu doi. Dat theo dung khuon da co san trong thu muc (phieuStatus.ts / jobRunStatus.ts).
import React from "react";
import { Progress, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SessionListItem } from "../types";
import { R012_COLORS } from "../theme";

dayjs.extend(utc);
dayjs.extend(timezone);

const MUI_GIO_VN = "Asia/Ho_Chi_Minh";

// ==== TIEN TRINH CHI CO 3 BUOC TREN THANH, KHONG PHAI 4 ====
// Vong doi day du ben BE la 4 buoc: 1 chay CR -> 2 cho thu thap KPI -> 3 danh gia -> 4 xuat phieu.
// Nhung buoc 3 (danh gia) KHONG BAO GIO duoc ve ra: job xuat phieu lam lien mach "doc KPI -> danh gia ->
// xuat phieu" trong CUNG 1 luot chay vai giay, khong session nao dung lai o buoc 3 du chi de 1 lan tai
// trang bat duoc (BE cung tra 422 cho ?buoc=3 chu khong tra danh sach rong). Ve 4 doan ma 1 doan khong bao
// gio thay se gay thac mac "sao no khong bao gio toi buoc 3" - trong khi that ra khong co gi hong ca.
// Vi vay thanh chia 3 chang: 33% xong CR -> 66% xong cho KPI -> 100% xong xuat phieu.
const PHAN_TRAM_XONG_BUOC_1 = 33;
const PHAN_TRAM_XONG_BUOC_2 = 66;
const PHAN_TRAM_XONG_HET = 100;

// status rieng BE dat khi khong the danh gia vi thieu du lieu do (DA XAC NHAN co that qua goi /sessions:
// 1 session dang mang status nay, o buoc 4)
const STATUS_KHONG_DU_DU_LIEU = "KHONG_DU_DU_LIEU";

export interface TrangThaiTienTrinh {
  phanTram: number;
  mau: string;
  nhan: string;
}

// So ngay DA TROI ke tu luc chay CR, va TONG so ngay phai cho - CA HAI deu suy tu du lieu BE tra ve,
// KHONG hardcode 8 ngay:
//   tongSoNgay  = ngay_du_kien_xuat_phieu - ngay chay CR (executed_at)
//   soNgayDaTroi = tongSoNgay - con_bao_nhieu_ngay
// Hardcode 8 se sai ngay lap tuc neu BE doi cau hinh so ngay cho KPI, va sai am tham (thanh tien do chay
// lech) chu khong bao loi - kieu loi rat lau moi co nguoi phat hien.
// Tra null khi thieu bat ky manh nao (session chua chay xong CR thi chua co executed_at/ngay du kien) -
// luc do thanh tien do se dung o moc dau chang thay vi ve bua 1 ty le sai
export const tinhTienDoChoKpi = (
  session: SessionListItem
): { soNgayDaTroi: number; tongSoNgay: number } | null => {
  const { executed_at: executedAt, ngay_du_kien_xuat_phieu: ngayDuKien, con_bao_nhieu_ngay: conLai } = session;
  if (!executedAt || !ngayDuKien || typeof conLai !== "number") {
    return null;
  }

  // executed_at la ISO date-time UTC -> ep ve GMT+7 roi cat ve DAU NGAY moi tru duoc voi ngay_du_kien
  // (von la ngay lich "YYYY-MM-DD"). Khong ep mui gio thi CR chay sau 17h VN se bi tinh sang ngay hom
  // truoc theo UTC va lam lech ca thanh tien do 1 ngay
  const ngayChayCr = dayjs.utc(executedAt).tz(MUI_GIO_VN).startOf("day");
  const tongSoNgay = dayjs(ngayDuKien).startOf("day").diff(ngayChayCr, "day");
  if (tongSoNgay <= 0) {
    return null; // du lieu la (ngay du kien khong sau ngay CR) - khong ve ty le tu so am
  }

  return { soNgayDaTroi: tongSoNgay - conLai, tongSoNgay };
};

// Quy tac ve thanh tien do. Thu tu xet QUAN TRONG: cac nhanh theo STATUS phai dung TRUOC nhanh theo buoc,
// vi 1 session co the vua o buoc 4 vua mang status KHONG_DU_DU_LIEU - luc do phai bao "khong du du lieu"
// chu khong phai "da xong"
export const tinhTrangThaiTienTrinh = (session: SessionListItem): TrangThaiTienTrinh => {
  const buoc = session.buoc_hien_tai ?? 1;
  const conLai = session.con_bao_nhieu_ngay;

  // Da chay het quy trinh nhung KHONG danh gia duoc vi thieu du lieu do. Mau XAM (khong phai do): day
  // KHONG phai loi he thong - CEM/CTS thung du lieu la chuyen thuong gap, khong co gi de di sua
  if (session.status === STATUS_KHONG_DU_DU_LIEU) {
    return { phanTram: PHAN_TRAM_XONG_HET, mau: R012_COLORS.statusRunning, nhan: "Khong du du lieu" };
  }

  // CR hong ngay tu buoc 1 - dung han o day, khong bao gio di tiep duoc
  if (session.status === "FAILED") {
    return { phanTram: PHAN_TRAM_XONG_BUOC_1, mau: R012_COLORS.dangerRed, nhan: "CR loi" };
  }

  if (session.status === "RUNNING") {
    return { phanTram: PHAN_TRAM_XONG_BUOC_1, mau: R012_COLORS.primary, nhan: "Dang chay CR" };
  }

  // Toi buoc 4 = da qua chang xuat phieu. So phieu thuc te hien o cot "Phieu" ben canh (0 phieu van la
  // ket qua HOP LE: danh gia thay moi cell deu dat thi khong phai xuat gi ca)
  if (buoc >= 4) {
    return { phanTram: PHAN_TRAM_XONG_HET, mau: R012_COLORS.statusSuccess, nhan: "Da xong" };
  }

  if (buoc === 2) {
    // Qua han: dung o moc 66% (da xong cho KPI nhung chua xuat duoc phieu) va to DO. Voi phuong an quet
    // dung 1 ngay, session qua han la da bi job bo lai phia sau - phai co nguoi vao xu ly tay
    if (typeof conLai === "number" && conLai < 0) {
      // Nhan KHONG kem so ngay: cot "Con lai" ngay ben canh da hien "qua han N ngay" roi (xem ConLaiCell).
      // De ca hai cho cung in con so la lap lai y nguyen trong 1 dong, va lam o Tien trinh rong ra vo ich
      // trong khi thanh tien do gio to hon can cho
      return { phanTram: PHAN_TRAM_XONG_BUOC_2, mau: R012_COLORS.dangerRed, nhan: "QUA HAN" };
    }

    // Dang cho KPI: thanh CHAY DAN THEO NGAY trong chang 33% -> 66% thay vi dung im suot ca ky cho.
    // Nhin thanh la uoc luong duoc con bao lau, khong phai doi mat sang doc cot "Con lai" moi biet -
    // ca ky cho keo dai nhieu ngay nen mot thanh dung im trong ca ky trong y het nhu bi treo
    const tienDo = tinhTienDoChoKpi(session);
    const tyLe = tienDo ? Math.min(Math.max(tienDo.soNgayDaTroi / tienDo.tongSoNgay, 0), 1) : 0;
    // Nhan KHONG kem so ngay con lai (truoc day la "Cho KPI (con 4 ngay)"): cot "Con lai" ngay ben canh da
    // hien dung con so do. Ban than VI TRI cua thanh tien do da noi len "con bao lau" o dang truc quan -
    // do la muc dich cua viec cho thanh chay theo ngay - nen con so trong nhan chi la lap lai lan thu ba.
    // Rieng moc "den han hom nay" thi GIU: 0 ngay la moc dang de y nhat, va nhin thanh khong the doan ra
    // hom nay hay mai
    const nhan = conLai === 0 ? "Cho KPI (hom nay)" : "Cho KPI";
    return {
      phanTram: PHAN_TRAM_XONG_BUOC_1 + tyLe * (PHAN_TRAM_XONG_BUOC_2 - PHAN_TRAM_XONG_BUOC_1),
      mau: R012_COLORS.primary,
      nhan,
    };
  }

  // Duong lui cho to hop chua tung gap (vd buoc 1 nhung status khong phai FAILED/RUNNING): ve o moc dau
  // chang va hien NGUYEN VAN status BE tra ve, de nguoi doc con biet duong ma bao - tot hon la hien 1 nhan
  // doan bua hoac de trong
  return { phanTram: PHAN_TRAM_XONG_BUOC_1, mau: R012_COLORS.primary, nhan: session.status };
};

// Do day cua thanh tien do (px). Ban dau dung size="small" (thanh 6px) - qua manh, o mot bang nhieu dong
// thi day la thu can nhin ra ngay tu xa chu khong phai phai nhin ky. 14px du day de doc duoc mau lien tu
// dau bang den cuoi bang ma van vua 1 dong cao binh thuong
const DO_DAY_THANH_PX = 14;

// Cot "Tien trinh": thanh tien do (co so %) + ten chang ben canh.
// showInfo={true}: hien % ngay tren thanh. Rieng con so % thi khong du (66% khong noi len dang o chang nao),
// nen VAN giu ten chang ben canh - nhung ten chang gio KHONG con kem so ngay, xem comment o
// tinhTrangThaiTienTrinh: con so ngay da co cot "Con lai" lo, de o ca 2 cho la lap lai trong cung 1 dong
export const TienTrinhProgress: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const { phanTram, mau, nhan } = tinhTrangThaiTienTrinh(session);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "220px" }}>
      <Progress
        // lam tron: chang "Cho KPI" tinh ra so thap phan (vd 49.5) - hien "49.5%" tren thanh vua dai vua
        // gia chinh xac, trong khi do chinh xac that chi den tung NGAY
        percent={Math.round(phanTram)}
        strokeWidth={DO_DAY_THANH_PX}
        showInfo
        strokeColor={mau}
        style={{ flex: "1 1 120px", marginBottom: 0 }}
      />
      {/* whiteSpace nowrap: nhan ngan (1-3 tu) nhung neu de no ngat dong thi chieu cao tung dong cua bang
          se nhay khong deu giua cac session */}
      <span style={{ color: mau, whiteSpace: "nowrap", fontSize: "0.85rem", fontWeight: 600 }}>{nhan}</span>
    </div>
  );
};

// Cot "Phieu": da xuat / tong so cell bi anh huong, kem canh bao so cell job KHONG tu xuat duoc.
// Hien dang phan so (khong tach 2 cot) vi 2 con so nay chi co nghia khi doc cung nhau: "2" phieu la nhieu
// hay it phu thuoc hoan toan vao tong so cell cua session
export const PhieuCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const daXuat = session.so_phieu_da_xuat ?? 0;
  const tongCell = session.so_cell_anh_huong ?? 0;
  const choXuatTay = session.so_cell_cho_xuat_tay ?? 0;

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
      <span>
        {daXuat}/{tongCell}
      </span>
      {/* Cell "cho xuat tay" = job tu dong da BO CUOC voi cell nay (vuot gioi han cell/session hoac da thu
          du so lan cho phep van FAILED) - se KHONG BAO GIO tu xuat o cac luot job sau. Khong danh dau ra
          day thi khong ai biet ma vao lam tay, cell do nam lai vinh vien */}
      {choXuatTay > 0 && (
        <Tooltip title="Job tu dong da ngung thu nhung cell nay (vuot gioi han hoac het luot thu) - phai vao xuat phieu bang tay">
          <Tag color="orange" style={{ marginInlineEnd: 0 }}>
            {choXuatTay} cho xuat tay
          </Tag>
        </Tooltip>
      )}
    </div>
  );
};

// Cot "Con lai": dem nguoc toi ngay du kien xuat phieu.
//   buoc 4 -> "-"  (da xu ly xong, xem ly do ben duoi)
//   > 0    -> "con N ngay"
//   = 0    -> "hom nay"
//   < 0    -> "qua han N ngay" mau do
//   null   -> "-"  (chua co moc ngay: session con dang chay CR hoac CR da hong)
export const ConLaiCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const soNgay = session.con_bao_nhieu_ngay;

  // Session DA XU LY XONG (buoc 4) thi KHONG dem nguoc nua, du BE van tra ve con_bao_nhieu_ngay.
  // Ly do: BE tinh con_bao_nhieu_ngay = ngay_du_kien_xuat_phieu - hom nay, BAT KE session da xong hay
  // chua. Voi session da xong thi con so do VO NGHIA - no tra loi cau hoi "con bao lau nua moi toi luot
  // xu ly", ma luot do da qua roi. Hau qua neu cu hien: session buoc 4 se do "qua han 6 ngay" ngay canh
  // thanh tien do xanh la "Da xong" - hai o cua CUNG MOT DONG noi nguoc nhau, nguoi doc khong biet tin o
  // nao. Cai da xong thi khong con han nao de qua nua.
  if ((session.buoc_hien_tai ?? 1) >= 4) {
    return <Tooltip title="Da xu ly xong - khong con dem nguoc">-</Tooltip>;
  }

  if (typeof soNgay !== "number") {
    return <span>-</span>;
  }

  // ngay du kien la chuoi "YYYY-MM-DD" (BE khai bao format date, KHONG phai date-time) nen dung dayjs()
  // thuong - KHONG dung formatDateTime cua module (ham do ep .utc().tz(+7), xem comment o types/index.ts)
  const ngayDuKien = session.ngay_du_kien_xuat_phieu
    ? dayjs(session.ngay_du_kien_xuat_phieu).format("DD/MM/YYYY")
    : null;
  const tooltip = ngayDuKien ? `Ngay du kien xuat phieu: ${ngayDuKien}` : "Chua co ngay du kien xuat phieu";

  let noiDung: React.ReactNode = `con ${soNgay} ngay`;
  if (soNgay === 0) {
    noiDung = "hom nay";
  } else if (soNgay < 0) {
    // Math.abs: BE tra so am (-5) nhung cau chu doc la "qua han 5 ngay", khong phai "qua han -5 ngay"
    noiDung = <span style={{ color: R012_COLORS.dangerRed, fontWeight: 700 }}>qua han {Math.abs(soNgay)} ngay</span>;
  }

  return <Tooltip title={tooltip}>{noiDung}</Tooltip>;
};

// ==== BO LOC ====
// 1 Select DUY NHAT dieu khien CA HAI param cua BE (?buoc= va ?qua_han=) thay vi 2 o loc rieng: voi nguoi
// truc thi "dang chay / cho KPI / da xong / qua han" la 4 cau tra loi cho CUNG 1 cau hoi "session nay dang
// o dau", chon cai nay tuc la khong chon cai kia. Tach 2 o se cho phep dat to hop vo nghia (vd buoc=4 +
// qua_han=true) ma FE lai phai tu di chan lai
export const TIEN_TRINH_TAT_CA = "";
export const TIEN_TRINH_QUA_HAN = "qua_han";

export const TIEN_TRINH_FILTER_OPTIONS = [
  { value: TIEN_TRINH_TAT_CA, label: "Tat ca" },
  { value: "1", label: "Dang chay/loi" }, // buoc=1: CR dang chay HOAC da FAILED (chua qua duoc buoc 1)
  { value: "2", label: "Cho KPI" }, // buoc=2: dang doi du ngay de co KPI sau CR
  { value: "4", label: "Da xong" }, // buoc=4: da toi chang xuat phieu
  { value: TIEN_TRINH_QUA_HAN, label: "QUA HAN" }, // qua_han=true: con_bao_nhieu_ngay < 0, bat ke dang o buoc nao
];

// Doi 1 gia tri cua Select thanh dung 2 param BE nhan. Tra ve undefined (khong phai false/0) cho param
// khong dung den - axios tu bo key undefined khoi query string nen "Tat ca" se goi /sessions sach tron,
// khong kem param thua nao
export const layParamTienTrinh = (giaTri: string): { buoc?: 1 | 2 | 4; qua_han?: boolean } => {
  if (giaTri === TIEN_TRINH_QUA_HAN) {
    return { qua_han: true };
  }
  if (giaTri === "1" || giaTri === "2" || giaTri === "4") {
    return { buoc: Number(giaTri) as 1 | 2 | 4 };
  }
  return {}; // "Tat ca"
};
