// Cot "Tien trinh" / "Phieu" / "Con lai" cua bang Lich su CR (them 16082026) + bo loc theo buoc.
//
// TAI SAO tach file rieng thay vi viet thang trong SessionHistoryList.tsx: 3 cot nay deu la cach DIEN GIAI
// 6 truong moi cua BE (so_cell_anh_huong/so_phieu_da_xuat/so_cell_cho_xuat_tay/ngay_du_kien_xuat_phieu/
// con_bao_nhieu_ngay/buoc_hien_tai) chu khong phai hien thang gia tri - phan dien giai nay dai hon toan bo
// phan khai bao cot con lai cong lai. Giu chung trong SessionHistoryList se lam file do phinh gap ruoi va
// tron 2 muc do: "bang co nhung cot nao" voi "moi cot dien giai du lieu ra sao". Dat rieng theo dung khuon
// da co san trong module (phieuStatus.ts / jobRunStatus.ts).
import React from "react";
import { Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { SessionListItem } from "../types";
import { R012_COLORS } from "../theme";

// ==== TIEN TRINH 4 BUOC ====
// Vong doi day du cua 1 session CR keo dai NHIEU NGAY va di qua 4 buoc:
//   1 = chay CR        (tac dong tham so tram, xong trong vai phut)
//   2 = cho thu thap KPI (cho du so ngay de CTS tra ve KPI sau CR - day la buoc CHIEM GAN HET thoi gian)
//   3 = danh gia        (so sanh KPI truoc/sau CR)
//   4 = xuat phieu      (sinh phieu SaveCellClm cho cac cell KHONG DAT)
//
// BUOC 3 KHONG BAO GIO XUAT HIEN TREN BANG - va day la chu dich, khong phai thieu sot:
// job xuat phieu tu dong lam LIEN MACH ca "doc KPI -> danh gia -> xuat phieu" trong CUNG 1 luot chay
// (vai giay), nen khong session nao dung lai o buoc 3 du chi de 1 lan tai trang bat duoc. BE cung tra 422
// cho ?buoc=3 thay vi tra danh sach rong (xem BuocTienTrinh trong types/index.ts). Vi vay bang hien LIEN
// buoc 2 sang buoc 4, KHONG chua 1 o buoc 3 luon xam vinh vien - o do se lam nguoi dung tuong tien trinh
// dang bi ket o mot buoc khong bao gio qua duoc.
const CAC_BUOC: { buoc: number; nhan: string; moTa: string }[] = [
  { buoc: 1, nhan: "1 CR", moTa: "Buoc 1: chay CR (tac dong tham so tram)" },
  { buoc: 2, nhan: "2 KPI", moTa: "Buoc 2: cho thu thap KPI sau CR" },
  { buoc: 4, nhan: "4 Phieu", moTa: "Buoc 4: xuat phieu cho cac cell khong dat (buoc 3 - danh gia - chay lien trong cung luot job nen khong hien)" },
];

// Cot "Tien trinh": 3 the [1 CR] [2 KPI] [4 Phieu], mau the cho biet buoc nao xong / dang o dau / chua toi.
// KHONG dung Steps cua antd du dung nghia hon: Steps chiem chieu ngang rat lon (moi buoc 1 icon tron +
// nhan + duong noi), nhet vao 1 o cua bang 8 cot se day cac cot con lai vo. 3 the Tag nho vua dung 1 o.
export const TienTrinhCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const buocHienTai = session.buoc_hien_tai ?? 1;
  // session FAILED dung o buoc 1 = CR chay hong, KHONG phai "dang chay buoc 1" - phai hien do de phan biet
  // voi session that su dang chay, neu khong ca hai deu hien xanh giong het nhau
  const loiOBuoc1 = session.status === "FAILED" && buocHienTai <= 1;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
      {CAC_BUOC.map(({ buoc, nhan, moTa }) => {
        // buoc DA QUA -> success; buoc DANG O -> processing (nhap nhay, nhin ra ngay dong nao con dang chay);
        // buoc CHUA TOI -> default (xam)
        let color = "default";
        if (buoc < buocHienTai) {
          color = "success";
        } else if (buoc === buocHienTai) {
          color = loiOBuoc1 ? "error" : "processing";
        }

        // rieng the cua buoc DANG DUNG o buoc 2 kem luon so ngay con phai cho - do la thong tin nguoi truc
        // can nhat khi thay session "dang cho KPI": cho den bao gio. Cac buoc khac khong co gi de dem nguoc
        const soNgay = session.con_bao_nhieu_ngay;
        const kemSoNgay =
          buoc === 2 && buoc === buocHienTai && typeof soNgay === "number" && soNgay > 0
            ? ` (cho ${soNgay}ng)`
            : "";

        return (
          <Tooltip key={buoc} title={moTa}>
            <Tag color={color} style={{ marginInlineEnd: 0 }}>
              {nhan}
              {kemSoNgay}
            </Tag>
          </Tooltip>
        );
      })}
    </div>
  );
};

// Cot "Phieu": da xuat / tong so cell bi anh huong, kem canh bao so cell job KHONG tu xuat duoc.
// Hien dang phan so (khong phai 2 cot rieng) vi 2 con so nay chi co nghia khi doc cung nhau: "2" phieu la
// nhieu hay it phu thuoc hoan toan vao tong so cell cua session.
export const PhieuCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const daXuat = session.so_phieu_da_xuat ?? 0;
  const tongCell = session.so_cell_anh_huong ?? 0;
  const choXuatTay = session.so_cell_cho_xuat_tay ?? 0;

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
      <span>
        {daXuat}/{tongCell}
      </span>
      {/* Cell "cho xuat tay" = job tu dong da BO CUOC voi cell nay (vuot gioi han 10 cell/session hoac da
          thu du so lan cho phep van FAILED) - se KHONG BAO GIO tu xuat o cac luot job sau. Neu khong danh
          dau ra day thi khong ai biet phai vao lam tay, cell do nam lai vinh vien */}
      {choXuatTay > 0 && (
        <Tooltip title="Job tu dong da ngung thu nhung cell nay (vuot gioi han hoac het luot thu) - phai vao xuat phieu bang tay">
          <Tag color="warning" style={{ marginInlineEnd: 0 }}>
            {choXuatTay} cho xuat tay
          </Tag>
        </Tooltip>
      )}
    </div>
  );
};

// Cot "Con lai": dem nguoc toi ngay du kien xuat phieu.
//   > 0  -> "con N ngay"
//   = 0  -> "hom nay"      (den han DUNG hom nay - phai de y, job chay 8h sang se xu ly)
//   < 0  -> "QUA HAN N ngay" mau do (da tre - dau hieu job khong chay hoac session bi ket)
//   null -> "-"            (chua co moc ngay, thuong la session CR con dang chay/da hong)
export const ConLaiCell: React.FC<{ session: SessionListItem }> = ({ session }) => {
  const soNgay = session.con_bao_nhieu_ngay;
  if (typeof soNgay !== "number") {
    return <span>-</span>;
  }

  // ngay du kien la chuoi "YYYY-MM-DD" (BE khai bao format date, KHONG phai date-time) nen dung dayjs()
  // thuong - KHONG dung formatDateTime cua module (ham do ep .utc().tz(+7), xem comment trong types/index.ts)
  const ngayDuKien = session.ngay_du_kien_xuat_phieu
    ? dayjs(session.ngay_du_kien_xuat_phieu).format("DD/MM/YYYY")
    : null;
  const tooltip = ngayDuKien ? `Ngay du kien xuat phieu: ${ngayDuKien}` : "Chua co ngay du kien xuat phieu";

  let noiDung: React.ReactNode = `con ${soNgay} ngay`;
  if (soNgay === 0) {
    noiDung = "hom nay";
  } else if (soNgay < 0) {
    // Math.abs: BE tra so am (-5) nhung cau chu doc la "QUA HAN 5 ngay", khong phai "QUA HAN -5 ngay".
    // To dam + mau do dung token dangerRed chung cua module (khong bia hex moi tai day)
    noiDung = (
      <span style={{ color: R012_COLORS.dangerRed, fontWeight: 700 }}>QUA HAN {Math.abs(soNgay)} ngay</span>
    );
  }

  return <Tooltip title={tooltip}>{noiDung}</Tooltip>;
};

// ==== BO LOC "TIEN TRINH" ====
// 1 Select DUY NHAT dieu khien CA HAI param cua BE (?buoc= va ?qua_han=) thay vi 2 o loc rieng: voi nguoi
// truc thi "dang chay / cho KPI / da xong / qua han" la 4 cau tra loi cho CUNG 1 cau hoi "session nay dang
// o dau", chon cai nay tuc la khong chon cai kia. Tach thanh 2 o se cho phep dat to hop vo nghia (vd buoc=4
// + qua_han=true) ma FE lai phai tu di chan lai.
export const TIEN_TRINH_TAT_CA = "";
export const TIEN_TRINH_QUA_HAN = "qua_han";

export const TIEN_TRINH_FILTER_OPTIONS = [
  { value: TIEN_TRINH_TAT_CA, label: "Tat ca" },
  { value: "1", label: "Dang chay/loi" }, // buoc=1: CR dang chay HOAC da FAILED (chua qua duoc buoc 1)
  { value: "2", label: "Cho KPI" }, // buoc=2: dang doi du ngay de co KPI sau CR
  { value: "4", label: "Da xong" }, // buoc=4: da toi buoc xuat phieu
  { value: TIEN_TRINH_QUA_HAN, label: "QUA HAN" }, // qua_han=true: con_bao_nhieu_ngay < 0, bat ke dang o buoc nao
];

// Doi 1 gia tri cua Select thanh dung 2 param BE nhan. Tra ve undefined (khong phai false/0) cho param
// khong dung den - axios tu bo key undefined khoi query string, nen "Tat ca" se goi /sessions sach tron
// khong kem param thua nao
export const layParamTienTrinh = (
  giaTri: string
): { buoc?: 1 | 2 | 4; qua_han?: boolean } => {
  if (giaTri === TIEN_TRINH_QUA_HAN) {
    return { qua_han: true };
  }
  if (giaTri === "1" || giaTri === "2" || giaTri === "4") {
    return { buoc: Number(giaTri) as 1 | 2 | 4 };
  }
  return {}; // "Tat ca"
};
