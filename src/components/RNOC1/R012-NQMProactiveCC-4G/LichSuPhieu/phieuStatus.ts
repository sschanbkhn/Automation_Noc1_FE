// Bang mau Tag theo trang thai phieu - DUNG cac gia tri that BE tra ve o GET /api/v1/phieu, khong bia them
// gia tri. Tach ra file rieng vi ca PhieuHistoryTable (cot trang thai), PhieuDetailModal (thong tin phieu)
// va JobRunDetailModal (ket qua tung cell trong chi_tiet) deu can - de moi file tu khai bao thi khi BE them
// trang thai moi se de bi sua 1 noi quen noi kia, hien mau khac nhau cho cung 1 trang thai.
//
// CAP NHAT theo hop dong BE moi: DA BO HAN DRY_RUN (khong con che do chay thu -> khong con trang thai nay),
// va THEM 2 trang thai "khong xuat" ben duoi.
export const PHIEU_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "success", // xanh la - xuat phieu that thanh cong
  FAILED: "error", // do - CTS tu choi / loi khi xuat
  PENDING: "warning", // vang - dang cho xu ly

  // 2 trang thai MOI - deu la "job KHONG xuat phieu cho cell nay", nhung 2 mau KHAC nhau vi viec can lam
  // khac han nhau:
  // - vang (warning): bi loai do vuot tran phieu/session, cell van CON CO HOI o luot sau khi cac cell tren
  //   no xong -> chi can theo doi, hoac xuat tay neu gap
  KHONG_XUAT_VUOT_GIOI_HAN: "warning",
  // - do (error): da thu du so lan cho phep van FAILED, job NGUNG thu tu dong -> day la viec CHET, phai co
  //   nguoi vao sua nguyen nhan goc, dung mau do de no noi bat ngang FAILED
  KHONG_XUAT_HET_LUOT_THU: "error",
};

// Nhan tieng Viet NGAN cho 2 trang thai moi - CHI 2 gia tri nay co nhan rieng, khong dich SUCCESS/FAILED/
// PENDING: 3 cai do da ngan va la tu NOC doc quen hang ngay, dich sang tieng Viet chi lam la mat. Con
// "KHONG_XUAT_VUOT_GIOI_HAN"/"KHONG_XUAT_HET_LUOT_THU" dai gap 3 lan, de nguyen se lam Tag tran ca o va
// day cot Trang thai rong ra. Noi nao hien trang thai thi dung PHIEU_STATUS_LABELS[x] ?? x - gia tri la
// (BE them trang thai moi ma FE chua biet) van hien duoc nguyen van thay vi rong.
export const PHIEU_STATUS_LABELS: Record<string, string> = {
  KHONG_XUAT_VUOT_GIOI_HAN: "Vuot gioi han",
  KHONG_XUAT_HET_LUOT_THU: "Het luot thu",
};

// options cho Select loc trang thai (tab rieng "Lich su phieu")
export const PHIEU_STATUS_FILTER_OPTIONS = [
  // value "" = KHONG gui param trang_thai len BE. Truoc day label la "Tat ca (tru DRY_RUN)" vi BE an ngam
  // cac ban ghi DRY_RUN; DRY_RUN da bi bo han khoi hop dong BE nen gio "Tat ca" dung nghia la TAT CA
  { value: "", label: "Tat ca" },
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "FAILED", label: "FAILED" },
  { value: "PENDING", label: "PENDING" },
  // 2 muc moi dung CHUNG nhan tieng Viet voi Tag trong bang (PHIEU_STATUS_LABELS) - neu Select ghi 1 kieu
  // ma Tag ghi 1 kieu thi NOC se khong noi duoc muc loc nao ra dong nao
  { value: "KHONG_XUAT_VUOT_GIOI_HAN", label: PHIEU_STATUS_LABELS.KHONG_XUAT_VUOT_GIOI_HAN },
  { value: "KHONG_XUAT_HET_LUOT_THU", label: PHIEU_STATUS_LABELS.KHONG_XUAT_HET_LUOT_THU },
];
