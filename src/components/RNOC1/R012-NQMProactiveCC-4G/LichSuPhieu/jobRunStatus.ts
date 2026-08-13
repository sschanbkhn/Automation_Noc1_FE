// Bang mau Tag theo trang thai LUOT CHAY JOB - DUNG 3 gia tri that BE tra ve o GET /api/v1/jobs/runs
// (RUNNING|DONE|FAILED, xem models/job_run_log.py::trang_thai + Literal _JobRunTrangThai o api/routers/
// jobs.py), khong bia them gia tri.
// Tach file rieng theo dung khuon phieuStatus.ts vi ca JobRunTable (cot trang thai) va JobRunDetailModal
// (thong tin luot chay) deu can - de moi file tu khai bao thi khi BE them trang thai moi se de bi sua 1
// noi quen noi kia, hien mau khac nhau cho cung 1 trang thai.
//
// CHU Y: KHONG co gia tri "DRY_RUN" o day. Hop dong BE moi da bo hoan toan che do chay thu (ca trang thai
// DRY_RUN cua phieu lan cot dry_run cua job_run_log) - moi luot chay deu la chay THAT.
export const JOB_RUN_STATUS_COLORS: Record<string, string> = {
  // xanh duong nhap nhay - luot chay CHUA ket thuc. Dung "processing" (khong phai "default") de nhin ra
  // ngay dong nao dang chay, giong cach SessionHistoryList.tsx danh dau session RUNNING
  RUNNING: "processing",
  DONE: "success", // xanh la - luot chay ket thuc binh thuong
  FAILED: "error", // do - loi TOAN CUC lam dung ca luot chay (error_message co mo ta)
};

// options cho Select loc trang thai. value "" = KHONG gui param trang_thai len BE, tuc la lay TAT CA
export const JOB_RUN_STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tat ca" },
  { value: "RUNNING", label: "RUNNING" },
  { value: "DONE", label: "DONE" },
  { value: "FAILED", label: "FAILED" },
];
