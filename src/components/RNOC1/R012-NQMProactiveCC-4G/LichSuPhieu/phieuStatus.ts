// Bang mau Tag theo trang thai phieu - DUNG 4 gia tri that BE tra ve o GET /api/v1/phieu (SUCCESS|FAILED|
// PENDING|DRY_RUN), khong bia them gia tri. Tach ra file rieng vi ca PhieuHistoryTable (cot trang thai) va
// PhieuDetailModal (thong tin phieu) deu can - de moi file tu khai bao thi khi BE them trang thai moi se
// de bi sua 1 noi quen noi kia, hien mau khac nhau cho cung 1 trang thai
export const PHIEU_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "success", // xanh la - xuat phieu that thanh cong
  FAILED: "error", // do - CTS tu choi / loi khi xuat
  PENDING: "warning", // vang - dang cho xu ly
  // xam (default): DRY_RUN la chay THU, KHONG tao phieu that tren TTS - co y dung mau trung tinh de KHONG
  // gay cam giac "da xong" nhu mau xanh cua SUCCESS
  DRY_RUN: "default",
};

// options cho Select loc trang thai (tab rieng "Lich su phieu")
export const PHIEU_STATUS_FILTER_OPTIONS = [
  // value "" = KHONG gui param trang_thai len BE. Luu y mac dinh cua BE la AN cac ban ghi DRY_RUN, nen day
  // KHONG phai "toan bo ban ghi trong DB" - ghi ro trong label de NOC khong hieu nham la thieu du lieu
  { value: "", label: "Tat ca (tru DRY_RUN)" },
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "FAILED", label: "FAILED" },
  { value: "PENDING", label: "PENDING" },
  { value: "DRY_RUN", label: "DRY_RUN" },
];
