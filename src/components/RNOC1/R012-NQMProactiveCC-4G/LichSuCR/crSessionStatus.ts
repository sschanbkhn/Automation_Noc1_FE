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
  // THEM 16/10/2026 (yeu cau truc tiep user) - trang thai MOI, tach khoi FAILED (xem WHY day du o
  // domain/entities/cr_session.py::CrStatus.KHONG_CHAY ben BE): loi xay ra TRUOC buoc 13 "SSH: Upload+
  // Import+Provision" (chua tung gui lenh len NetAct, vd thieu du lieu HO/XML loi cau hinh) - "mau VANG",
  // CO CHU DICH KHAC mau do cua FAILED (do = NetAct/mang that su co van de, vang = can sua du
  // lieu/cau hinh truoc khi thu lai, 2 nguyen nhan khac nhau NOC can phan biet duoc bang mat ngay tren bang)
  KHONG_CHAY: { list: "gold", badge: "gold" },
};

// NHAN hien thi rieng cho KHONG_CHAY (THEM 16/10/2026, yeu cau truc tiep user: "nhan 'Khong chay'") - MOI
// trang thai khac VAN hien NGUYEN VAN chuoi enum tho tu BE (vd "DONE"/"FAILED"/"RUNNING"...), giu dung thiet
// ke cu (KHONG dich toan bo 9 trang thai, chi them 1 ngoai le cho trang thai MOI nay theo yeu cau). Dung
// chung cho CA 2 noi hien Tag trang thai (SessionHistoryList.tsx bang danh sach, EvaluationDetail.tsx badge
// chi tiet) qua layNhanTrangThaiCr() ben duoi, tranh 2 noi lech nhau
const CR_STATUS_LABEL: Record<string, string> = {
  KHONG_CHAY: "Khong chay",
};

export function layNhanTrangThaiCr(status: string): string {
  return CR_STATUS_LABEL[status] ?? status;
}
