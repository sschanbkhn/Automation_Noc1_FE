// dinh nghia type cho cac endpoint that cua BE R012
// lay dung tu OpenAPI schema doc truc tiep tai GET http://127.0.0.1:8000/openapi.json
// khong bia field, giu nguyen ten field snake_case dung nhu BE tra ve

// dung cho GET /api/v1/stations - query param khi goi danh sach tram
export interface StationsQueryParams {
  q?: string; // tu khoa tim kiem tram, optional theo schema
  status?: string; // loc theo trang thai tram, optional theo schema
  page?: number; // trang hien tai, mac dinh 1 theo schema
  size?: number; // so ban ghi moi trang, mac dinh 50, toi da 200 theo schema
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
  cell_params: CellParamDetailItem[]; // danh sach tham so cell, mac dinh mang rong theo schema
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

// dung cho POST /api/v1/cr/preview - 1 cell bi anh huong trong danh sach cells cua 1 tram lan can (hoac
// chinh tram goc, xem PreviewTramItem). Lay dung tu OpenAPI schema PreviewCellItem, KHONG doan field -
// luu y ten field rsboost_cu/rsboost_moi/qrxlevmin_cu/qrxlevmin_moi KHAC voi CellParamDetailItem
// (rsboost_before_cr/rsboost_new) vi 2 endpoint /sessions/{id} va /cr/preview dung ten field rieng biet
export interface PreviewCellItem {
  cell_name: string; // ten cell, bat buoc theo schema
  huong_id: string | null; // id huong cua cell, co the null theo schema
  priority: number | null; // do uu tien, co the null theo schema
  action_type: string | null; // loai hanh dong ap dung cho cell, co the null theo schema
  rsboost_cu: number | null; // gia tri rsboost hien tai (truoc CR), co the null theo schema
  rsboost_moi: number | null; // gia tri rsboost du kien sau CR, co the null theo schema
  qrxlevmin_cu: number | null; // gia tri qrxlevmin hien tai (truoc CR), co the null theo schema
  qrxlevmin_moi: number | null; // gia tri qrxlevmin du kien sau CR, co the null theo schema
}

// dung cho POST /api/v1/cr/preview - tram goc (tram bi tac dong CR truc tiep). KHONG co field "cells" rieng
// theo schema PreviewTramGoc that (khac PreviewTramItem ben duoi) - neu can so cell anh huong cua chinh
// tram goc, phai tim tram co cung tram_id trong mang tram_lan_can (BE tra tram goc lap lai o do kem cells)
export interface PreviewTramGoc {
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string | null; // ten tram, co the null theo schema
  longitude: number | null; // kinh do, co the null theo schema - co the null neu tram khong join duoc toa do
  latitude: number | null; // vi do, co the null theo schema
}

// dung cho POST /api/v1/cr/preview - 1 tram lan can bi anh huong, kem danh sach cells cua tram do.
// DA XAC NHAN qua goi that: mang tram_lan_can LUON chua ca chinh tram_goc (kem cells cua tram_goc),
// khong chi cac tram khac xung quanh - FE phai tu loc trung khi ve marker (xem NetworkMap.tsx)
export interface PreviewTramItem {
  tram_id: string; // ma tram, bat buoc theo schema
  tram_name: string | null; // ten tram, co the null theo schema
  longitude: number | null; // kinh do, co the null theo schema - ~0.4% tram khong join duoc toa do (null)
  latitude: number | null; // vi do, co the null theo schema
  cells: PreviewCellItem[]; // danh sach cell bi anh huong cua tram nay, mac dinh mang rong theo schema
}

// dung cho POST /api/v1/cr/preview - response chinh, request body dung chung TriggerCrRequest (tram_id + action)
export interface PreviewCrResponse {
  tram_goc: PreviewTramGoc; // tram bi tac dong CR truc tiep, bat buoc theo schema
  tram_lan_can: PreviewTramItem[]; // danh sach tram bi anh huong (kem ca tram_goc, xem comment PreviewTramItem), bat buoc theo schema
}

// dung cho GET /api/v1/qos/{cell_name} - BE khai bao additionalProperties true, chua co field co dinh trong schema
// giu kieu Record de khong tu bia field khong ton tai trong schema that
export type QosMetrics = Record<string, unknown>;

// dung cho POST /api/v1/jobs/sync-rims - BE khai bao response la object additionalProperties true, chua co field co dinh
export type SyncRimsResponse = Record<string, unknown>;

// dung cho POST /api/v1/jobs/sync-netact - BE khai bao response la object additionalProperties true, chua co field co dinh
export type SyncNetactResponse = Record<string, unknown>;

// dung cho POST /api/v1/jobs/evaluate-cr - BE khai bao response la object additionalProperties true, chua co field co dinh
export type EvaluateCrResponse = Record<string, unknown>;
