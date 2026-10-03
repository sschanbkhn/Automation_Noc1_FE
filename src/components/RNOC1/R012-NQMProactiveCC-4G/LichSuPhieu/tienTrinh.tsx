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

// Cam/amber cho ty le DN chay duoc MOT PHAN. Dung lai dung token chartCrDay da co trong theme (khong bia
// hex moi): do la mau cam DUY NHAT dang dung trong module, va vai tro o day giong het - danh dau 1 gia tri
// can de y giua cac gia tri binh thuong. KHONG dung do: chay duoc mot phan chua chac la loi
const CAM_MOT_PHAN = R012_COLORS.chartCrDay;

// Cot "Tien trinh": CHI con thanh tien do (co so %). Chu trang thai da TACH sang cot rieng ben canh -
// truoc day 2 thu nam chung 1 o lam o do rong gap doi cac cot khac, va khi bang co them cot (STT, DN...)
// thi chinh o nay la cho bop cac cot con lai.
// showInfo={true}: hien % ngay tren thanh
export const TienTrinhBar: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const { phanTram, mau } = tinhTrangThaiTienTrinh(session);

  return (
    <Progress
      // lam tron: chang "Cho KPI" tinh ra so thap phan (vd 49.5) - hien "49.5%" vua dai vua gia chinh xac,
      // trong khi do chinh xac that chi den tung NGAY
      percent={Math.round(phanTram)}
      strokeWidth={DO_DAY_THANH_PX}
      showInfo
      strokeColor={mau}
      style={{ minWidth: "130px", marginBottom: 0 }}
    />
  );
};

// Cot "Trang thai": ten chang, to CUNG MAU voi thanh tien do ben canh de doc 1 dong la thay 2 o thuoc ve
// nhau (mau la thu duy nhat noi 2 cot nay lai sau khi tach)
export const TrangThaiTienTrinhText: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const { mau, nhan } = tinhTrangThaiTienTrinh(session);
  return <span style={{ color: mau, whiteSpace: "nowrap", fontWeight: 600 }}>{nhan}</span>;
};

// Cot "Cell": ty le CELL provision thanh cong tren tong so cell cua session
// (so_cell_thanh_cong/so_cell_tong).
//
// TRUOC DAY cot nay ten "DN" va doc so_dn_*: dem theo DN (tram) chu khong theo cell. Sai don vi do -
// 1 managedObject trong XML NetAct la 1 CELL, MRBTS chi la noi cell cam vao, nen "3/4 tram" khong cho
// biet bao nhieu cell that su doi duoc tham so. BE da doi han sang dem cell (commit 7982ed7).
//
//  - thieu so lieu (null hoac undefined) -> "-"  (session cu BE khong backfill, VA hien tai la MOI dong
//    vi BE .196 chua deploy - xem comment o types/index.ts)
//  - khong chay het (thanh cong < tong) -> to CAM de noi bat: day la session lam duoc mot phan, de bi luot
//    qua nhat vi no khong hien ra la loi o bat ky cot nao khac
export const CellProvisionCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const thanhCong = session.so_cell_thanh_cong;
  const tong = session.so_cell_tong;

  if (typeof thanhCong !== "number" || typeof tong !== "number") {
    return <span style={{ color: "#bfbfbf" }}>-</span>;
  }

  // 2 duong nhan biet "chay duoc mot phan", giu ca hai vi chung bu cho nhau:
  //  - status PARTIAL_SUCCESS: nhan BE dat (chua thay gia tri nay tren BE hien tai - openapi.json khong co
  //    chuoi PARTIAL_SUCCESS nao, nen nhanh nay hien chua bao gio chay)
  //  - thanhCong < tong: suy TRUC TIEP tu so lieu, dung duoc ngay ca khi BE khong dat nhan rieng
  const motPhan = session.status === "PARTIAL_SUCCESS" || (tong > 0 && thanhCong < tong);

  return (
    <Tooltip title={`So cell provision thanh cong / tong so cell: ${thanhCong}/${tong}`}>
      <span style={motPhan ? { color: CAM_MOT_PHAN, fontWeight: 700 } : undefined}>
        {thanhCong}/{tong}
      </span>
    </Tooltip>
  );
};

// 2 cot thoi gian cua 1 session CR. TACH RIENG (truoc day gop 1 o dang "18/08 11:27 -> 11:28") theo yeu
// cau: doc tung moc rieng de hon khi phai doi chieu voi log/bao cao ben ngoai, va sort/quet mat theo 1 cot
// cung de hon la phai tach chuoi trong dau.
//
// ==== 2 TRUONG NAY LAY TU DAU (khong can BE bo sung gi) ====
//  - created_at  = luc TAO session  -> moc BAT DAU. LUON co (da kiem: 52/52 session deu co gia tri)
//  - executed_at = duoc ghi o BUOC 17 (buoc gan cuoi cua quy trinh CR) -> moc KET THUC. NULL nghia la CR
//    DUNG GIUA CHUNG, chua bao gio toi buoc 17 (da kiem: 24/52 session co executed_at NULL, va CA 24 deu
//    dang status FAILED - khop chinh xac voi y nghia "chet giua chung")
//
// Ca 2 cot dung dinh dang NGAN "DD/MM HH:mm" (khong phai formatDateTime day du den giay): 2 moc chi cach
// nhau vai chuc giay nen phan giay khong giup phan biet gi, ma lai lam moi cot rong them ~40px trong mot
// bang da co 10 cot. Gia tri day du den giay van xem duoc qua Tooltip
const dinhDangNgan = (value: string): string => dayjs.utc(value).tz(MUI_GIO_VN).format("DD/MM HH:mm");
const dinhDangDayDu = (value: string): string =>
  dayjs.utc(value).tz(MUI_GIO_VN).format("DD/MM/YYYY HH:mm:ss");

// Cot "Bat dau" = created_at (luc tao session)
export const BatDauCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  if (!session.created_at) {
    return <span style={{ color: "#bfbfbf" }}>-</span>;
  }
  return (
    <Tooltip title={`Bat dau (tao session): ${dinhDangDayDu(session.created_at)}`}>
      <span style={{ whiteSpace: "nowrap" }}>{dinhDangNgan(session.created_at)}</span>
    </Tooltip>
  );
};

// Cot "Ket thuc" = executed_at (ghi o buoc 17). NULL -> "-" mau do: KHONG phai thieu du lieu ma la CR
// CHUA CHAY XONG - do la thong tin that su can nhin ra, nen to mau thay vi de xam nhu o trong
export const KetThucCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  if (!session.executed_at) {
    return (
      <Tooltip title="CR chua chay xong (chua toi buoc 17 - noi executed_at duoc ghi)">
        <span style={{ color: R012_COLORS.dangerRed }}>-</span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={`Ket thuc (buoc 17): ${dinhDangDayDu(session.executed_at)}`}>
      <span style={{ whiteSpace: "nowrap" }}>{dinhDangNgan(session.executed_at)}</span>
    </Tooltip>
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
