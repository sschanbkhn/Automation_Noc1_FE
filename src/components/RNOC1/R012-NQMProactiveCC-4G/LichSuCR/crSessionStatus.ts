// Mau Tag theo trang thai CR (cr_session.status) - DUNG CHUNG cho ca bang danh sach (SessionHistoryList.tsx)
// lan badge trong man hinh chi tiet (EvaluationDetail.tsx). Gop ve 1 noi (27092026): truoc day 2 ban map
// rieng o 2 file, ca hai deu THIEU 3 trang thai moi cua BE (PARTIAL_SUCCESS/KHONG_DU_DU_LIEU/PENDING) va
// se lai LECH nhau moi khi mot ben duoc sua ma ben kia quen theo - xem docs/audit/FE_AUDIT.md muc E2.
//
// 9 gia tri KHOP DUNG domain/entities/cr_session.py::CrStatus ben BE: PENDING/RUNNING/DONE/FAILED/
// EVALUATING/EVALUATED/EVAL_PENDING/KHONG_DU_DU_LIEU/PARTIAL_SUCCESS.
//
// list/badge la 2 mau KHAC NHAU CO CHU DICH cho DONE/FAILED/EVALUATED (giu nguyen y dinh cu cua ca 2 file
// nguon, KHONG doi khi gop):
//   - "list"  : mau Tag trong BANG danh sach - dung ten mau ngu nghia antd chuan (success/error)
//   - "badge" : mau badge trong man hinh CHI TIET 1 session - DONE/EVALUATED CO Y dung XANH DUONG de dong
//     bo voi theme chung cua modal; FAILED CO Y GIU MAU DO (khong doi thanh xanh) vi day la trang thai
//     loi can NOC nhan biet ngay bang mat - doi thanh xanh se mat tin hieu canh bao, phan tac dung
// 6 trang thai con lai (RUNNING/EVALUATING/EVAL_PENDING + 3 trang thai MOI them 27092026) dung CHUNG 1 mau
// cho ca 2 ngu canh - khong co ly do nghiep vu nao doi hoi phai tach rieng.
export const CR_STATUS_COLOR: Record<string, { list: string; badge: string }> = {
  RUNNING: { list: "processing", badge: "processing" },
  DONE: { list: "success", badge: "blue" },
  FAILED: { list: "error", badge: "red" },
  EVAL_PENDING: { list: "warning", badge: "warning" },
  EVALUATED: { list: "success", badge: "blue" },
  EVALUATING: { list: "processing", badge: "processing" },
  // 3 trang thai THEM (27092026) - truoc day roi vao fallback "default" (xam), khong phan biet duoc voi
  // "trang thai la BE chua tung thay" (ca hai deu ve xam nhu nhau) - xem docs/audit/FE_AUDIT.md muc E2
  PARTIAL_SUCCESS: { list: "orange", badge: "orange" },
  KHONG_DU_DU_LIEU: { list: "purple", badge: "purple" },
  PENDING: { list: "blue", badge: "blue" },
};
