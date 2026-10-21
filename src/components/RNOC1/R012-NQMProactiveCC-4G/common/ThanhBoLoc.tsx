// Vo boc 1 HANG bo loc dung CHUNG cho 4 man cua module (Dashboard/Lich su CR/Tien trinh/Lich su phieu) -
// THEM 20/10/2026, yeu cau truc tiep user muc 0: "Tao 1 component dung chung ThanhBoLoc de 4 man cung 1
// kieu". CHI lo phan BO CUC (flex/gap/canh giua/bo goc) - KHONG ep mau nen/vien: moi man tu quyet dinh mau
// rieng qua style (vd Dashboard/DashboardFilters.tsx dung MAU.nen.xanh cua bo mau vnpt,
// SessionHistoryList.tsx/PhieuHistoryTable.tsx dung R012_COLORS.tableRowAlt).
//
// SUA LAI 21/10/2026 LAN 5 (yeu cau truc tiep user: "o phai CO GIAN theo khung, khong co dinh. Mo sidebar ->
// khung hep -> o/cum nut rot xuong hang") - LAN 4 (truoc do) da sua dung 1 nua: bo @media VIEWPORT, cho
// flex-wrap:wrap theo BE RONG CHUNG CHUA that - NHUNG moi control van dung flex:'0 0 Xpx' CO DINH (KHONG co
// lai duoc), nen CHI CAN khung hep bot 1 chut (mo sidebar) la DA kich hoat wrap toan hang, du cac control
// hoan toan co the co lai (vd Select tu 180 xuong 150px) de VAN VUA 1 hang ma khong can wrap gi ca.
//
// SUA LAN NAY: moi control dung flex "1 1 basis" (CO CO CO GIAN, xem oRongCoGian ben duoi) thay vi "0 0
// Xpx" co dinh - khung hep thi TAT CA control cung co lai dan (toi gioi han minWidth rieng), khung rong thi
// gian ra lai (toi gioi han maxWidth) - CHI khi khung hep hon TONG min-width cua moi control (ke ca cum nut)
// THAT SU khong con cach nao khac nua moi can wrap xuong hang moi.
//
// VAN DE KY THUAT can giai quyet: CSS flex-wrap tu nhien quyet dinh "co du cho tren 1 hang hay khong" dua
// tren "hypothetical main size" (xap xi flex-basis, KHONG phai gia tri SAU KHI co lai) cua tung item - nghia
// la NEU chi dung thuan CSS (flex-wrap:wrap + flex-shrink tren tung item), trinh duyet CO THE wrap SOM hon
// mong muon (ngay khi TONG BASIS vuot khung, du TONG MIN-WIDTH van con du cho) - KHONG dam bao dung "chi wrap
// khi khung < tong minWidth" nhu yeu cau. Vi vay dung ResizeObserver DO THAT chinh khung nay (yeu cau truc
// tiep user, KHONG dung @media viewport): tam thoi ep nowrap de do xem cac control co lai het muc (scrollWidth)
// co vua trong be rong hien co (clientWidth) hay khong - vua thi O LAI nowrap (cho flex-shrink tu nhien lo
// het phan con lai), khong vua (that su thieu cho ke ca da co het muc) moi chuyen sang wrap.
import React, { useLayoutEffect, useRef, useState } from "react";

// BANG basis/min CHUAN dung CHUNG (yeu cau truc tiep user muc 2) - 4 LOAI control, GIONG NHAU o CA 4 man
// (khong con rieng tung man 1 con so nhu cac ban truoc - gop lai cho don gian, de nho, de doi 1 cho duy
// nhat). maxWidth = basis + 80 (yeu cau truc tiep user) - tinh truc tiep trong oRongCoGian(), khong luu rieng.
export const BO_LOC_RONG = {
  // "du hien 20/07/2026 -> 20/10/2026" (yeu cau truc tiep user)
  rangePicker: { basis: 260, min: 220 },
  // "placeholder dai -> ellipsis, khong sao" (yeu cau truc tiep user - chap nhan cat placeholder bang "..."
  // khi co lai toi min, KHAC voi "cat CHU DA GO" la loi that can tranh)
  timKiem: { basis: 260, min: 180 },
  // Select co tien to chu ("Trang thai: Tat ca", "Nguon: Tat ca", "Tien trinh: Tat ca")
  selectCoTienTo: { basis: 190, min: 160 },
  // Select thuong, khong tien to (Khu vuc, Tinh, Vendor, Phuong an)
  select: { basis: 180, min: 130 },
};

// style BE RONG CO GIAN cho 1 control TRONG ThanhBoLoc (SUA 21/10/2026 lan 5, THAY the oRongCoDinh cu - yeu
// cau truc tiep user muc 1/2/3: "flex:'1 1 basis', minWidth, maxWidth = basis+80 (co lai khi hep, gian khi
// rong)") - khac han ban truoc (flex:'0 0 Xpx' CO DINH tuyet doi, chinh la nguyen nhan gay wrap qua som khi
// khung hep bot)
export function oRongCoGian(kichThuoc: { basis: number; min: number }): React.CSSProperties {
  return {
    flex: `1 1 ${kichThuoc.basis}px`,
    minWidth: `${kichThuoc.min}px`,
    maxWidth: `${kichThuoc.basis + 80}px`,
  };
}

interface ThanhBoLocProps {
  children: React.ReactNode;
}

const ThanhBoLoc: React.FC<ThanhBoLocProps & React.HTMLAttributes<HTMLDivElement>> = ({ children, style, className, ...rest }) => {
  const elRef = useRef<HTMLDivElement>(null);
  // false = nowrap (mac dinh lac quan, cho flex-shrink tu lo); true = wrap (CHI khi do THAT thay khong vua)
  const [canWrap, setCanWrap] = useState(false);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) {
      return;
    }
    const doVaQuyetDinh = () => {
      // ep tam ve nowrap de DO scrollWidth THAT cua hang khi moi control da co lai het muc (toi min-width
      // rieng cua no) - day la "tong be rong toi thieu that su can" ma CSS flex-shrink se tu dat duoc neu
      // duoc phep (KHONG lien quan "hypothetical main size" dua tren basis ma trinh duyet dung de QUYET
      // DINH wrap, xem WHY day du o dau file)
      const flexWrapGoc = el.style.flexWrap;
      el.style.flexWrap = "nowrap";
      // +1 bu sai so lam tron subpixel (zoom 125%/150% co the lam clientWidth/scrollWidth lech <1px)
      const vuaDuocKhiCoLaiHetMuc = el.scrollWidth <= el.clientWidth + 1;
      el.style.flexWrap = flexWrapGoc; // tra ve gia tri dang ap dung - React se ghi de o lan render ke tiep
      setCanWrap((truoc) => (truoc === !vuaDuocKhiCoLaiHetMuc ? truoc : !vuaDuocKhiCoLaiHetMuc));
    };

    doVaQuyetDinh();
    // ResizeObserver tren CHINH khung nay (yeu cau truc tiep user, KHONG dung @media viewport) - tu dong do
    // lai moi khi be rong THAT cua khung doi (mo/dong sidebar, resize cua so, doi zoom trinh duyet...), bat
    // ke nguyen nhan gi lam no doi kich thuoc
    const ro = new ResizeObserver(doVaQuyetDinh);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={elRef}
      className={className}
      style={{
        display: "flex",
        flexWrap: canWrap ? "wrap" : "nowrap",
        alignItems: "center",
        gap: "12px", // = ca rowGap va columnGap (CSS "gap" shorthand dat ca 2 chieu cung luc)
        width: "100%", // yeu cau truc tiep user - lap day DUNG be rong cha de do dung vung chua THAT
        overflow: "visible",
        padding: "12px",
        marginBottom: "1rem",
        borderRadius: "8px",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ThanhBoLoc;

// CUM NUT - boc "Xoa loc" + nut hanh dong chinh ("Xuat ...") trong 1 div RIENG thay vi de 2 nut la 2
// flex-item doc lap cua ThanhBoLoc: neu de roi, khi hang thieu cho flex-wrap co the day MOT minh 1 nut
// xuong hang moi (tach doi voi nut kia) - boc chung 1 cum dam bao CA HAI nut LUON di cung nhau: hoac ca cum
// o cuoi hang hien tai, hoac ca cum cung xuong hang moi, khong bao gio tach roi nhau giua chung. flex:'0 0
// auto' (khong co lai/gian - 2 nut chi vai chu ngan, khong can co gian nhu cac o loc)
export const CumNut: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", gap: "12px", marginLeft: "auto", flex: "0 0 auto" }}>{children}</div>
);
