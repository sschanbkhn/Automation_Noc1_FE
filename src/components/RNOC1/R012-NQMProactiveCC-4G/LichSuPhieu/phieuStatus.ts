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

  // 3 trang thai "job KHONG xuat phieu cho cell nay" - 3 MAU KHAC nhau vi viec can lam khac han nhau:
  // - vang (warning): bi loai do vuot tran phieu/session, cell van CON CO HOI o luot sau khi cac cell tren
  //   no xong -> chi can theo doi, hoac xuat tay neu gap
  KHONG_XUAT_VUOT_GIOI_HAN: "warning",
  // - do (error): da thu du so lan cho phep van FAILED, job NGUNG thu tu dong -> day la viec CHET, phai co
  //   nguoi vao sua nguyen nhan goc, dung mau do de no noi bat ngang FAILED
  KHONG_XUAT_HET_LUOT_THU: "error",

  // XAM (default) - job khong xuat duoc vi THIEU SO LIEU DO tu CTS/CEM, khong phai vi he thong hong va
  // cung khong phai vi cell dat. CO Y khong dung do/vang: o day khong co viec gi de nguoi truc di sua
  // (du lieu do thieu la chuyen ben ngoai module nay), to mau canh bao chi lam loang nhung dong that su
  // can xu ly. Cung dong nhat voi cach 2 bang danh gia QoS/QoE to mau ket luan INSUFFICIENT - cung mot
  // chuyen "may khong ket luan duoc" thi cung mot mau
  KHONG_XUAT_THIEU_DU_LIEU: "default",
};

// Nhan tieng Viet NGAN cho 3 trang thai KHONG_XUAT_* - CHI 3 gia tri nay co nhan rieng, khong dich SUCCESS/FAILED/
// PENDING: 3 cai do da ngan va la tu NOC doc quen hang ngay, dich sang tieng Viet chi lam la mat. Con
// "KHONG_XUAT_VUOT_GIOI_HAN"/"KHONG_XUAT_HET_LUOT_THU" dai gap 3 lan, de nguyen se lam Tag tran ca o va
// day cot Trang thai rong ra. Noi nao hien trang thai thi dung PHIEU_STATUS_LABELS[x] ?? x - gia tri la
// (BE them trang thai moi ma FE chua biet) van hien duoc nguyen van thay vi rong.
export const PHIEU_STATUS_LABELS: Record<string, string> = {
  KHONG_XUAT_VUOT_GIOI_HAN: "Vuot gioi han",
  KHONG_XUAT_HET_LUOT_THU: "Het luot thu",
  KHONG_XUAT_THIEU_DU_LIEU: "Khong du du lieu",
};

// ==== NGUON KHONG DAT (cot cr_phieu.nguon_khong_dat, BE commit 8f54b09) ====
// Nhan NGAN cho cot "Nguon" trong bang phieu. Giu dung cach viet hoa quen thuoc cua 2 chi so ("QoS"/"QoE",
// khong phai "QOS"/"QOE" nhu gia tri tho trong DB) - do la cach chung duoc goi o moi noi khac trong module
// (Segmented QoS/QoE, ten bang danh gia), viet khac di se lam nguoi doc phai tu doi chieu xem co phai 1 thu
export const NGUON_KHONG_DAT_LABELS: Record<string, string> = {
  QOS: "QoS",
  QOE: "QoE",
  CA_HAI: "Ca hai",
};

// options cho Select loc theo nguon. value "" = KHONG gui param nguon len BE, tuc la lay TAT CA
export const NGUON_FILTER_OPTIONS = [
  { value: "", label: "Tat ca" },
  { value: "QOS", label: NGUON_KHONG_DAT_LABELS.QOS },
  { value: "QOE", label: NGUON_KHONG_DAT_LABELS.QOE },
  { value: "CA_HAI", label: NGUON_KHONG_DAT_LABELS.CA_HAI },
];

// options cho Select loc trang thai (tab rieng "Lich su phieu")
export const PHIEU_STATUS_FILTER_OPTIONS = [
  // value "" = KHONG gui param trang_thai len BE. Truoc day label la "Tat ca (tru DRY_RUN)" vi BE an ngam
  // cac ban ghi DRY_RUN; DRY_RUN da bi bo han khoi hop dong BE nen gio "Tat ca" dung nghia la TAT CA
  { value: "", label: "Tat ca" },
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "FAILED", label: "FAILED" },
  { value: "PENDING", label: "PENDING" },
  // 3 muc KHONG_XUAT_* dung CHUNG nhan tieng Viet voi Tag trong bang (PHIEU_STATUS_LABELS) - neu Select ghi 1 kieu
  // ma Tag ghi 1 kieu thi NOC se khong noi duoc muc loc nao ra dong nao
  { value: "KHONG_XUAT_VUOT_GIOI_HAN", label: PHIEU_STATUS_LABELS.KHONG_XUAT_VUOT_GIOI_HAN },
  { value: "KHONG_XUAT_HET_LUOT_THU", label: PHIEU_STATUS_LABELS.KHONG_XUAT_HET_LUOT_THU },
  { value: "KHONG_XUAT_THIEU_DU_LIEU", label: PHIEU_STATUS_LABELS.KHONG_XUAT_THIEU_DU_LIEU },
];
