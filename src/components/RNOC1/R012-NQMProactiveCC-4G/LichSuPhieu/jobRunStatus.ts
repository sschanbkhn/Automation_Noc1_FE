// Bang mau Tag theo trang thai LUOT CHAY JOB - DUNG 3 gia tri that BE tra ve o GET /api/v1/jobs/runs
// (RUNNING|DONE|FAILED, xem models/job_run_log.py::trang_thai + Literal _JobRunTrangThai o api/routers/
// jobs.py), khong bia them gia tri.
// Tach file rieng theo dung khuon phieuStatus.ts vi ca JobRunTable (cot trang thai) va JobRunDetailModal
// (thong tin luot chay) deu can - de moi file tu khai bao thi khi BE them trang thai moi se de bi sua 1
// noi quen noi kia, hien mau khac nhau cho cung 1 trang thai.
//
// CHU Y: KHONG co gia tri "DRY_RUN" o day. Hop dong BE moi da bo hoan toan che do chay thu (ca trang thai
// DRY_RUN cua phieu lan cot dry_run cua job_run_log) - moi luot chay deu la chay THAT.
// Nhan tieng Viet cho trang thai job. CHI PARTIAL co nhan rieng - RUNNING/DONE/FAILED la tu NOC doc
// quen hang ngay, dich sang tieng Viet chi lam la mat. Noi nao hien trang thai thi dung
// JOB_RUN_STATUS_LABELS[x] ?? x - gia tri la (BE them trang thai moi) van hien nguyen van thay vi rong.
export const JOB_RUN_STATUS_LABELS: Record<string, string> = {
  PARTIAL: "Mot phan",
};

export const JOB_RUN_STATUS_COLORS: Record<string, string> = {
  // xanh duong nhap nhay - luot chay CHUA ket thuc. Dung "processing" (khong phai "default") de nhin ra
  // ngay dong nao dang chay, giong cach SessionHistoryList.tsx danh dau session RUNNING
  RUNNING: "processing",
  DONE: "success", // xanh la - luot chay ket thuc binh thuong
  FAILED: "error", // do - loi TOAN CUC lam dung ca luot chay (error_message co mo ta)
  // CAM (warning) - luot chay co CA phieu thanh cong LAN phieu that bai (BE 7982ed7).
  //
  // TAI SAO PHAI CO GIA TRI NAY: truoc day luot chay nao khong nem exception deu duoc ghi DONE, ke ca
  // khi 0 phieu thanh cong / 94 phieu that bai (job_run_log 977/978/980/981/1010). DONE nghia la "chay
  // xong khong van de" nen dong canh bao o JobHealthAlert - von doc chinh trang_thai nay - cung im lang
  // theo. Do la ly do 8 NGAY khong ai biet job dang hong.
  // Cam chu khong do: PARTIAL la co viec hong CAN NGUOI XEM, nhung phan lon van chay duoc - khac han
  // FAILED (hong toan bo).
  PARTIAL: "warning",
};

// options cho Select loc trang thai. value "" = KHONG gui param trang_thai len BE, tuc la lay TAT CA
export const JOB_RUN_STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tat ca" },
  { value: "RUNNING", label: "RUNNING" },
  { value: "DONE", label: "DONE" },
  // nhan tieng Viet cho PARTIAL (khac 3 gia tri kia de nguyen ten): "PARTIAL" khong phai tu NOC doc quen
  // hang ngay nhu DONE/FAILED/RUNNING, de nguyen se phai doan nghia
  { value: "PARTIAL", label: "Mot phan" },
  { value: "FAILED", label: "FAILED" },
];
