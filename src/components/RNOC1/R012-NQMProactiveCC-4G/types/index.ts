// dinh nghia type cho cac endpoint that cua BE R012
// lay dung tu OpenAPI schema doc truc tiep tai GET http://127.0.0.1:8000/openapi.json
// khong bia field, giu nguyen ten field snake_case dung nhu BE tra ve

// dung cho GET /api/v1/stations - query param khi goi danh sach tram
export interface StationsQueryParams {
  q?: string; // tu khoa tim kiem tram, optional theo schema
  status?: string; // loc theo trang thai tram, optional theo schema
  page?: number; // trang hien tai, mac dinh 1 theo schema
  size?: number; // so ban ghi moi trang, mac dinh 50, toi da 200 theo schema
  // sort_by/order them 22072026 (BE vua bo sung sort server-side) - DA XAC NHAN qua openapi.json that:
  // sort_by CHI nhan enum "tram_id"|"tram_name"|"ma_tinh" (KHONG phai TOAN BO cot dang hien trong bang -
  // ten_quan_ly/ma_csht/trang_thai/cr_status KHONG nam trong enum nay, "ma_tinh" cung KHONG phai field nao
  // dang hien trong StationItem/StationListItem - BE co field rieng khong lo ra o response list). FE CHI
  // duoc bat sort cho 2 cot Ma tram/Ten tram tren bang (xem StationSearchGrid.tsx), cac cot con lai PHAI
  // enableSorting:false vi gui sort_by ngoai enum se bi BE tra 422
  sort_by?: "tram_id" | "tram_name" | "ma_tinh";
  order?: "asc" | "desc"; // mac dinh "desc" theo schema BE - CHI co y nghia khi da truyen sort_by
}

// dung cho GET /api/v1/stations - 1 dong du lieu tram trong response
export interface StationItem {
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string; // ten tram, bat buoc theo schema
  ten_quan_ly: string | null; // ten don vi quan ly, co the null theo schema
  ma_csht: string | null; // ma co so ha tang, co the null theo schema
  longitude: number | null; // kinh do, co the null theo schema
  latitude: number | null; // vi do, co the null theo schema
  trang_thai: string; // trang thai tram, bat buoc theo schema
  cr_status: string | null; // trang thai CR gan nhat cua tram, co the null theo schema
  cr_session_id: number | null; // id session CR gan nhat, co the null theo schema
}

// dung cho GET /api/v1/stations - response tra ve danh sach tram co phan trang
export interface StationListResponse {
  total: number; // tong so tram, bat buoc theo schema
  page: number; // trang hien tai BE tra ve, bat buoc theo schema
  size: number; // so ban ghi moi trang BE tra ve, bat buoc theo schema
  data: StationItem[]; // mang du lieu tram, bat buoc theo schema
}

// dung cho POST /api/v1/cr/trigger - body gui len de kich hoat CR cho 1 tram
export interface TriggerCrRequest {
  tram_id?: string | null; // ma tram, optional theo schema
  tram_name?: string | null; // ten tram, optional theo schema
  action: "shutdown" | "cancel" | "relocate"; // hanh dong CR, bat buoc, dung dung enum trong schema
}

// dung cho POST /api/v1/cr/trigger - response tra ve ngay sau khi kich hoat CR (202 Accepted)
export interface TriggerCrResponse {
  session_id: number; // id session CR vua duoc tao, bat buoc theo schema
  status: string; // trang thai session ngay sau khi trigger, bat buoc theo schema
  message: string; // thong bao tu BE, bat buoc theo schema
}

// dung cho GET /api/v1/sessions - query param khi goi danh sach session CR (dung cho tab Lich su CR)
export interface SessionsQueryParams {
  q?: string; // tu khoa tim kiem session, optional theo schema
  status?: string; // loc theo trang thai session, optional theo schema
  from?: string; // loc tu ngay gio dang ISO date-time, optional theo schema
  to?: string; // loc den ngay gio dang ISO date-time, optional theo schema
  page?: number; // trang hien tai, mac dinh 1 theo schema
  size?: number; // so ban ghi moi trang, mac dinh 20, toi da 200 theo schema
  // sort_by/order them 22072026 (BE vua bo sung sort server-side) - DA XAC NHAN qua openapi.json that:
  // enum gom du "id"|"tram_id"|"tram_name"|"action"|"status"|"executed_at"|"created_at", KHOP DU voi TAT
  // CA cot dang hien trong SessionHistoryList.tsx (tru STT khong phai field that) - khac voi stations,
  // o day KHONG can enableSorting:false cot nao
  sort_by?: "id" | "tram_id" | "tram_name" | "action" | "status" | "executed_at" | "created_at";
  order?: "asc" | "desc"; // mac dinh "desc" theo schema BE - CHI co y nghia khi da truyen sort_by
}

// dung cho GET /api/v1/sessions - 1 dong du lieu session trong danh sach
export interface SessionListItem {
  id: number; // id session, bat buoc theo schema
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string | null; // ten tram, co the null theo schema
  action: string; // hanh dong CR da thuc hien, bat buoc theo schema
  status: string; // trang thai session, bat buoc theo schema
  qoe_result: string | null; // ket qua danh gia QoE, co the null theo schema
  qos_result: string | null; // ket qua danh gia QoS, co the null theo schema
  executed_at: string | null; // thoi diem thuc thi CR dang ISO date-time, co the null theo schema
  evaluated_at: string | null; // thoi diem danh gia dang ISO date-time, co the null theo schema
  created_at: string | null; // thoi diem tao session dang ISO date-time, co the null theo schema
}

// dung cho GET /api/v1/sessions - response tra ve danh sach session kem tong so
export interface SessionListResponse {
  total: number; // tong so session, bat buoc theo schema
  data: SessionListItem[]; // mang du lieu session, bat buoc theo schema
}

// dung cho GET /api/v1/sessions/{session_id} - 1 dong tham so cell trong chi tiet session
export interface CellParamDetailItem {
  cell_name: string; // ten cell, bat buoc theo schema
  huong_id: string | null; // id huong cua cell, co the null theo schema
  priority: number | null; // do uu tien, co the null theo schema
  action_type: string | null; // loai hanh dong ap dung cho cell, co the null theo schema
  rsboost_before_cr: number | null; // gia tri rsboost truoc CR, co the null theo schema
  rsboost_new: number | null; // gia tri rsboost moi sau CR, co the null theo schema
  qrxlevmin_before_cr: number | null; // gia tri qrxlevmin truoc CR, co the null theo schema
  qrxlevmin_new: number | null; // gia tri qrxlevmin moi sau CR, co the null theo schema
}

// dung cho GET /api/v1/sessions/{session_id} - 1 dong log tien trinh CR (dung lam nen tang cho SSE sau nay)
export interface CrLogItem {
  step: number; // buoc thu may, bat buoc theo schema
  step_name: string; // ten buoc, bat buoc theo schema
  status: string; // trang thai cua buoc, bat buoc theo schema
  message: string | null; // thong diep chi tiet, co the null theo schema
  pct: number | null; // phan tram tien do, co the null theo schema
  created_at: string | null; // thoi diem ghi log dang ISO date-time, co the null theo schema
}

// dung cho GET /api/v1/sessions/{session_id} - 1 diem du lieu QoE theo thoi gian
export interface QoeSnapshotItem {
  snapshot_date: string; // ngay chup snapshot, bat buoc theo schema
  qoe_score: number; // diem QoE, bat buoc theo schema
  period: string; // ky do luong (truoc/sau CR...), bat buoc theo schema
}

// dung cho GET /api/v1/sessions/{session_id} - 1 diem du lieu QoS theo thoi gian
export interface QosSnapshotItem {
  snapshot_date: string; // ngay chup snapshot, bat buoc theo schema
  qos_score: number; // diem QoS, bat buoc theo schema
  period: string; // ky do luong (truoc/sau CR...), bat buoc theo schema
}

// dung cho GET /api/v1/sessions/{session_id}, field affected_cells - them 22072026 (Phuong an B, DA DUYET
// boi user, xem application/get_session_detail_use_case.py). La TOAN BO cell BI ANH HUONG cua session
// (KHAC voi cell_params - la cell DA THAT SU CHAY CR, tap con cua affected_cells). DA XAC NHAN qua goi that:
// session CU (truoc 22072026, vd id 195/196/202/203/205) co affected_cells=[] RONG - BE KHONG backfill du
// lieu cu, CHI session MOI trigger tu 22072026 tro di moi co du lieu. Luu y schema nay tram_id CO THE null
// (KHAC voi AffectedCellItem cua preview /cr/preview, o do tram_id la bat buoc) - dat ten rieng SessionAffectedCellItem
// de khong dung nham 2 schema tuy cung ten field nhung do nullable khac nhau
export interface SessionAffectedCellItem {
  cell_name: string; // ten cell, bat buoc theo schema
  tram_id: string | null; // ma tram cha, co the null theo schema
  huong_id: string | null; // id huong cua cell, co the null theo schema
}

// dung cho GET /api/v1/sessions/{session_id} - response chi tiet 1 session CR
export interface SessionDetailResponse {
  id: number; // id session, bat buoc theo schema
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string | null; // ten tram, co the null theo schema
  action: string; // hanh dong CR, bat buoc theo schema
  status: string; // trang thai session, bat buoc theo schema
  plan_name: string | null; // ten ke hoach ap dung, co the null theo schema
  qoe_result: string | null; // ket qua danh gia QoE, co the null theo schema
  qos_result: string | null; // ket qua danh gia QoS, co the null theo schema
  qoe_before: number | null; // diem QoE truoc CR, co the null theo schema
  qoe_after: number | null; // diem QoE sau CR, co the null theo schema
  qos_before: number | null; // diem QoS truoc CR, co the null theo schema
  qos_after: number | null; // diem QoS sau CR, co the null theo schema
  executed_at: string | null; // thoi diem thuc thi dang ISO date-time, co the null theo schema
  evaluated_at: string | null; // thoi diem danh gia dang ISO date-time, co the null theo schema
  cell_params: CellParamDetailItem[]; // danh sach cell DA CHAY CR, mac dinh mang rong theo schema
  affected_cells: SessionAffectedCellItem[]; // TOAN BO cell BI ANH HUONG cua session (Phan 3, Buoc 2) - mac dinh mang rong theo schema
  cr_logs: CrLogItem[]; // danh sach log tien trinh CR, mac dinh mang rong theo schema
  qoe_snapshots: QoeSnapshotItem[]; // danh sach diem QoE theo thoi gian, mac dinh mang rong theo schema
  qos_snapshots: QosSnapshotItem[]; // danh sach diem QoS theo thoi gian, mac dinh mang rong theo schema
}

// dung cho SSE stream GET /api/v1/cr/stream/{session_id} - doc truc tiep tu source code BE that
// (application/trigger_cr_use_case.py ham _emit()/_fail(), va api/routers/sse.py dong 36 cho truong hop timeout)
// MOI KHAC HOAN TOAN voi CrLogItem o tren (CrLogItem la cr_logs tu DB, BE hien LUON tra ve mang rong -
// xem api/routers/sessions.py dong 92: cr_logs=[], vi BE chua co persist cr_log - TODO rieng cua BE)
// BE KHONG dat ten "event:" rieng, chi gui "data: {json}\n\n" nen FE doc bang onmessage mac dinh, khong can event ten rieng
export interface CrStreamEvent {
  step?: number; // buoc thu may (1-18), KHONG co trong truong hop status="timeout" (sse.py dong 36 chi gui {"status": "timeout"})
  step_name?: string; // ten buoc, khong co trong truong hop status="timeout"
  pct?: number; // phan tram tien do, khong co trong truong hop status="timeout"
  status: string; // "running" | "success" | "failed" | "timeout" - dung string vi BE khong khai bao enum rieng cho SSE
  msg?: string; // thong diep chi tiet buoc, khong co trong truong hop status="timeout"
  detail?: Record<string, unknown>; // BE hien luon emit {} rong (TODO cua BE, xem _emit() dong 423 trigger_cr_use_case.py)
  done?: boolean; // true khi CR ket thuc (thanh cong buoc 17/18 hoac that bai qua _fail()), khong co trong truong hop timeout
  error?: string | null; // thong diep loi khi that bai (_fail()), null khi khong loi, khong co trong truong hop timeout
  // DA XAC NHAN tu source that (trigger_cr_use_case.py::_emit_heartbeat_loop dong 511-525): event heartbeat
  // dung field "type"="heartbeat" (KHONG dung "status"), va CHI co "type"+"msg" - khong co status/step/done/error
  type?: string;
}

// dung cho POST /api/v1/cr/preview - tram goc (tram bi tac dong CR truc tiep). Lay dung tu OpenAPI schema
// PreviewTramGoc that (khong doi so voi ban truoc)
export interface PreviewTramGoc {
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string | null; // ten tram, co the null theo schema
  longitude: number | null; // kinh do, co the null theo schema - co the null neu tram khong join duoc toa do
  latitude: number | null; // vi do, co the null theo schema
}

// BE DA DOI SCHEMA response POST /cr/preview (xac nhan lai qua goi that tram_id=110548 ngay 22072026):
// BO tram_lan_can (mang long tram+cells long nhau, tung phai tu loc trung tram_goc/dem cells) - THAY BANG
// 3 mang PHANG rieng biet cells_bi_anh_huong/tram_bi_anh_huong/cells_chay_cr, moi mang co schema OpenAPI
// rieng (AffectedCellItem/AffectedTramItem/CrCellItem) - BE da tu tra dung so lieu tach san, FE KHONG con
// phai tu loc trung tram_goc hay tu dem so cell CR nhu cach lam voi tram_lan_can truoc day

// dung cho POST /api/v1/cr/preview, field cells_bi_anh_huong - 1 cell NAM TRONG vung anh huong (suy hao/
// nhieu do tram_goc tat), KHONG phai la cell se chay CR (xem CrCellItem rieng ben duoi) - vi vay KHONG co
// rsboost/qrxlevmin/priority/action_type, chi co thong tin dinh danh cell. Lay dung tu OpenAPI schema AffectedCellItem
export interface AffectedCellItem {
  cell_name: string; // ten cell, bat buoc theo schema
  huong_id: string | null; // id huong cua cell, co the null theo schema
  tram_id: string; // ma tram cha chua cell nay, bat buoc theo schema
}

// dung cho POST /api/v1/cr/preview, field tram_bi_anh_huong - 1 tram lan can bi anh huong (KHONG kem danh
// sach cells rieng nhu PreviewTramItem cu - so cell cua tram nay phai tu dem qua cells_bi_anh_huong.tram_id
// khop voi tram_id nay). DA XAC NHAN qua goi that: mang nay KHONG con lap lai tram_goc nhu ban cu (BE da tu
// loc), FE KHONG can tu loc trung nua. Lay dung tu OpenAPI schema AffectedTramItem
export interface AffectedTramItem {
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string | null; // ten tram, co the null theo schema
  longitude: number | null; // kinh do, co the null theo schema - EDGE CASE toa do null van co the xay ra (giu xu ly nhu cu)
  latitude: number | null; // vi do, co the null theo schema
}

// dung cho POST /api/v1/cr/preview, field cells_chay_cr - 1 cell THAT SU se duoc dieu chinh tham so
// (rsboost/qrxlevmin) khi trigger CR, la TAP CON cua cells_bi_anh_huong (DA XAC NHAN qua goi that: 12/47
// cell). Cac field rsboost/qrxlevmin/priority/action_type GIU NGUYEN ten nhu PreviewCellItem cu (khong doi).
// Lay dung tu OpenAPI schema CrCellItem
export interface CrCellItem {
  cell_name: string; // ten cell, bat buoc theo schema
  tram_id: string; // ma tram cha chua cell nay, bat buoc theo schema
  huong_id: string | null; // id huong cua cell, co the null theo schema
  priority: number | null; // do uu tien, co the null theo schema
  action_type: string | null; // loai hanh dong ap dung cho cell, co the null theo schema
  rsboost_cu: number | null; // gia tri rsboost hien tai (truoc CR, dB that), co the null theo schema
  rsboost_moi: number | null; // gia tri rsboost du kien sau CR (step chuan), co the null theo schema
  qrxlevmin_cu: number | null; // gia tri qrxlevmin hien tai (truoc CR), co the null theo schema
  qrxlevmin_moi: number | null; // gia tri qrxlevmin du kien sau CR, co the null theo schema
}

// dung cho POST /api/v1/cr/preview - response chinh, request body dung chung TriggerCrRequest (tram_id + action)
export interface PreviewCrResponse {
  tram_goc: PreviewTramGoc; // tram bi tac dong CR truc tiep, bat buoc theo schema
  cells_bi_anh_huong: AffectedCellItem[]; // TOAN BO cell nam trong vung anh huong, bat buoc theo schema
  tram_bi_anh_huong: AffectedTramItem[]; // TOAN BO tram lan can bi anh huong (khong kem tram_goc), bat buoc theo schema
  cells_chay_cr: CrCellItem[]; // cell se THAT SU chay CR (tap con cua cells_bi_anh_huong), bat buoc theo schema
}

// dung cho GET /api/v1/qos/{cell_name} - BE khai bao additionalProperties true, chua co field co dinh trong schema
// giu kieu Record de khong tu bia field khong ton tai trong schema that
export type QosMetrics = Record<string, unknown>;

// dung cho GET /api/v1/qos/{cell_name}?days=N - lich su QoS N ngay gan nhat cua 1 cell, dung rieng cho
// CellQosHistoryChart (Buoc chart QoS, buoc cuoi tinh nang preview). DA XAC NHAN qua goi that (curl):
// {"cell_name":"4G-STY008M43-HNI","data":[{"time":"2026-07-19T00:00:00Z","qos":5}]} - openapi.json KHONG
// khai bao param "days" (chi co "cell_name" trong path, response schema van la additionalProperties:true
// chung chung nhu QosMetrics o tren), nhung goi thu voi ?days=7/3/1 deu tra HTTP 200 (khong loi 422), va
// CA 5 cell da thu deu CHI co DUNG 1 diem du yeu cau bao nhieu ngay - xac nhan CTS thieu du lieu ngay la
// tinh trang THAT, KHONG phai loi FE, nen chart PHAI tu ve du truc 7 ngay va de trong ngay khong co du lieu
export interface QosHistoryPoint {
  time: string; // thoi diem do QoS dang ISO date-time UTC, bat buoc theo response that
  qos: number; // diem QoS thang 1-5, bat buoc theo response that
}

export interface QosHistoryResponse {
  cell_name: string; // ten cell, bat buoc theo response that
  data: QosHistoryPoint[]; // danh sach diem QoS thuc te co trong N ngay yeu cau - co the ÍT hon so ngay
  // yeu cau (DA XAC NHAN qua goi that: CTS thieu du lieu ngay), FE tu bu them cac ngay thieu = null khi ve chart
}

// dung cho GET /api/v1/qos/{cell_name} - query param, CAP NHAT 22072026 (Gap 1, DA XAC NHAN qua source
// api/routers/qos.py + goi that): BE gio nhan THEM "from"/"to" (dang date "YYYY-MM-DD") BEN CANH "days" cu.
// PHAI truyen CA HAI from+to cung luc (BE tra 422 neu chi truyen 1 trong 2) - dung khi can neo QoS vao 1
// khoang ngay CU THE trong qua khu (vd 15 ngay quanh 1 ngay CR da qua, Phan 3 Buoc 1), vi "days" LUON neo
// window vao "hom qua" tinh tu luc goi API (khong lam duoc voi ngay CR trong qua khu). Toi da 60 ngay cho
// khoang from/to (BE tu chan, xem _MAX_FROM_TO_WINDOW_DAYS). KHONG truyen from/to -> giu nguyen hanh vi
// "days" cu (dung cho CellQosHistoryChart preview, Phan 2)
export interface QosHistoryQueryParams {
  days?: number; // mac dinh 7 theo schema BE - CHI dung khi KHONG truyen from/to
  from?: string; // "YYYY-MM-DD" - PHAI di kem "to"
  to?: string; // "YYYY-MM-DD" - PHAI di kem "from"
}

// dung cho POST /api/v1/jobs/sync-rims - BE khai bao response la object additionalProperties true, chua co field co dinh
export type SyncRimsResponse = Record<string, unknown>;

// dung cho POST /api/v1/jobs/sync-netact - BE khai bao response la object additionalProperties true, chua co field co dinh
export type SyncNetactResponse = Record<string, unknown>;

// dung cho POST /api/v1/jobs/evaluate-cr - BE khai bao response la object additionalProperties true, chua co field co dinh
export type EvaluateCrResponse = Record<string, unknown>;
