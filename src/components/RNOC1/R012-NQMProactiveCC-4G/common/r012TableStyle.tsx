// CONG THUC BO CUC DUNG CHUNG cho MOI bang trong module R012.
//
// ==== VAN DE DA QUAY LAI 3 LAN ====
// Truoc file nay, 12 bang cua module chia thanh 2 nhom va CA HAI nhom deu sai, chi sai nguoc chieu nhau:
//   - Nhom A (7 bang): "width: 100%", khong nowrap -> bang bi ep co vua container, cot nhieu thi trinh
//     duyet NGAT gia tri dai xuong 2 dong ("4G-HMI197M-HNI", "4G-SSN014M11-HNI").
//   - Nhom B (5 bang): nowrap + bo "width: 100%" (ban va cua lan sua truoc) -> khong ngat dong nua, nhung
//     bang co lai theo noi dung nen bang IT COT bi THUA mot khoang trang lon ben phai.
// Sua rieng le tung bang la ly do van de quay lai lan thu 3: lan 1 sua PhieuHistoryTable, lan 2 sot
// TienTrinhTable, lan 3 den luot SessionHistoryList thua cho.
//
// ==== CACH GIU CA HAI ====
//   width: 100%            -> khi IT cot, tong be rong tu nhien < container: luat nay thang, bang dien day
//   min-width: max-content -> khi NHIEU cot, noi dung rong hon container: luat nay thang, bang giu do rong
//                             that va cuon ngang trong khung boc ngoai thay vi bop cot lai
//   nowrap tren td/th      -> khong o nao duoc ngat dong, bat ke con lai bao nhieu cho
//   overflow-x tren wrapper-> phan vuot ra cuon RIENG trong khung bang, khong lam vo layout tab/Modal
// 2 luat width khong danh nhau: chung la min/max cua cung 1 gia tri, trinh duyet luon lay max(min-width,
// width) nen ket qua dung o CA HAI dau.
import React from "react";
import { Tooltip } from "antd";

// Dat nowrap o td/th (KHONG phai o <table>): mot so o co noi dung tu xuong dong CO Y (vd khoi nhieu dong
// trong Modal chi tiet) - de o cap table thi thuoc tinh do se thua ke xuong moi thu ben trong ke ca cac
// phan tu khong phai o bang
export const R012_TABLE_LAYOUT_CSS = `
  .r012-table { width: 100%; min-width: max-content; }
  .r012-table td, .r012-table th { white-space: nowrap; }
  .r012-table-scroll { overflow-x: auto; }
`;

// Nhung 1 LAN DUY NHAT o goc module (R012Tabs) thay vi lap lai <style> trong 12 file: 12 the <style> giong
// het nhau trong DOM la rac, va quan trong hon - de sua 1 cho quen 11 cho, dung cach da lam van de nay
// quay lai 3 lan
export const R012TableStyle: React.FC = () => <style>{R012_TABLE_LAYOUT_CSS}</style>;

// DUONG LUI cho cot co noi dung dai bat thuong (Ten tram, Cell): nowrap khong ngat dong nua, nhung mot
// gia tri dai bat thuong se keo TOAN BO bang rong ra va day cac cot khac ra ngoai vung nhin. Cat bang
// ellipsis o mot do rong hop ly, gia tri day du van doc duoc qua Tooltip nen khong mat thong tin.
// KHONG dat maxWidth qua chat: ten cell/tram dung khuon (~16-20 ky tu) phai hien DU, ellipsis chi duoc
// nhay khi that su bat thuong
export const OneLineCell: React.FC<{ value: string | null | undefined; maxWidth?: number }> = ({
  value,
  maxWidth = 220,
}) => {
  if (!value) {
    return <span>-</span>;
  }
  return (
    <Tooltip title={value}>
      <span
        style={{
          display: "inline-block",
          maxWidth: `${maxWidth}px`,
          overflow: "hidden",
          textOverflow: "ellipsis",
          // verticalAlign: inline-block mac dinh neo theo baseline lam o cao them vai px so voi o thuong,
          // gay lech chieu cao dong giua cot co/khong co component nay
          verticalAlign: "bottom",
        }}
      >
        {value}
      </span>
    </Tooltip>
  );
};
