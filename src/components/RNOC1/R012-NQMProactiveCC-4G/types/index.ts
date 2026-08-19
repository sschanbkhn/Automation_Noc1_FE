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
  // === them 16082026: loc theo BUOC trong tien trinh (xem BuocTienTrinh ben duoi) ===
  // DA XAC NHAN qua openapi.json that + goi that tren BE .196:8080: param ten "buoc", kieu IntEnum
  // BuocFilter voi enum [1, 2, 4]. KHONG truyen -> lay tat ca buoc
  buoc?: BuocTienTrinh;
  // Loc rieng "da QUA HAN xuat phieu" (con_bao_nhieu_ngay < 0). BE khai bao boolean default false, nen
  // KHONG gui param nay tuong duong gui false - FE chi gui true khi that su can loc, de query string gon
  qua_han?: boolean;
}

// 3 gia tri hop le cua query param ?buoc= (BE khai bao IntEnum BuocFilter, enum [1, 2, 4]).
// KHONG co 3: buoc 3 (dang danh gia) la trang thai THOANG QUA trong 1 luot job (job doc KPI -> danh gia ->
// xuat phieu trong cung 1 lan chay), khong session nao dung lai o do de nguoi dung kip nhin thay. BE CO Y
// tra 422 cho ?buoc=3 thay vi tra danh sach rong - danh sach rong se bi doc nham thanh "khong con session
// nao dang danh gia" trong khi that ra la "trang thai nay khong bao gio ton tai". Vi vay bo loc o FE cung
// KHONG duoc co muc nao gui buoc=3
export type BuocTienTrinh = 1 | 2 | 4;

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

  // ==== 6 truong THEM 16082026 (BE da san sang, DA XAC NHAN qua openapi.json + goi that GET /sessions
  // tren .196:8080) - phuc vu cot "Tien trinh"/"Phieu"/"Con lai" cua tab Lich su CR ====
  // 4 truong so duoi day BE khai bao co "default" (0 / 1) nen KHONG nam trong mang "required" cua schema,
  // nhung response THAT luon co du (da kiem 33/33 dong). Khai bao la number (khong optional) cho dung hop
  // dong BE; RIENG o cho doc van giu `?? 0` lam duong lui cho response cu con nam trong cache TanStack
  // Query tu truoc khi BE nang cap - cache do khong co 4 truong nay
  so_cell_anh_huong: number; // tong so cell bi anh huong cua session
  so_phieu_da_xuat: number; // so phieu DA xuat thanh cong (mau so la so_cell_anh_huong)
  so_cell_cho_xuat_tay: number; // so cell job tu dong KHONG xuat duoc (vuot gioi han/het luot thu) -> phai lam TAY
  // NGAY LICH dang "YYYY-MM-DD" (BE khai bao format "date", KHONG phai date-time nhu executed_at/created_at)
  // -> TUYET DOI KHONG dua qua helpers/formatDateTime (ham do ep dayjs.utc(...).tz(+7), voi chuoi chi co
  // ngay se thanh 07:00 gio VN cua chinh ngay do - vo nghia). Dung dayjs(v).format("DD/MM/YYYY")
  ngay_du_kien_xuat_phieu: string | null;
  // So ngay con lai den ngay du kien xuat phieu. AM = da QUA HAN bay nhieu ngay, 0 = dung hom nay,
  // null = chua tinh duoc (session chua chay xong CR nen chua co moc ngay)
  con_bao_nhieu_ngay: number | null;
  // Buoc hien tai trong tien trinh 4 buoc: 1=chay CR, 2=cho thu thap KPI, 3=danh gia, 4=xuat phieu.
  // THUC TE BE CHI tra 1|2|4 (xem BuocTienTrinh) - buoc 3 thoang qua trong 1 luot job nen khong bao gio
  // bat gap. De kieu number (khong phai BuocTienTrinh) vi day la du lieu BE tra ve chu khong phai gia tri
  // FE gui len: neu sau nay BE co tra 3 that thi cot Tien trinh van hien duoc thay vi vo kieu
  buoc_hien_tai: number;

  // ==== TY LE DIEN NANG (them theo BE 854689a->d133fe1) ====
  // so_dn_thanh_cong / so_dn_tong - so lenh DN chay thanh cong tren tong so lenh cua session.
  // NULL o session CU (truoc dot nay BE khong ghi 2 cot nay va KHONG backfill) -> cot hien "-".
  // CHUA CO tren BE .196:8080 o thoi diem viet (openapi.json: chuoi "so_dn" xuat hien 0 lan) nen hien tai
  // MOI dong deu undefined -> khai bao optional, cho doc phai chiu duoc CA undefined LAN null
  so_dn_thanh_cong?: number | null;
  so_dn_tong?: number | null;
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

// dung cho GET /api/v1/sessions/{session_id} - 1 dong log tien trinh CR, BE gio DA PERSIST that (22072026,
// xem docs/DEV_LOG.md muc "Persist log tung buoc CR" cua BE) - cr_logs[] KHONG con luon rong nhu truoc.
// DA XAC NHAN lai qua source BE that (api/schemas/session_schemas.py::CrLogItem, KHONG phai doan): field
// CHI co 6 cai duoi day, KHONG co "detail" (cot detail/JSONB co ton tai trong DB cr_log nhung BE CHUA lo ra
// qua API nay - neu can hien detail phai xin BE bo sung schema truoc, KHONG tu bia field o day)
export interface CrLogItem {
  step: number; // buoc thu may, bat buoc theo schema
  step_name: string; // ten buoc, bat buoc theo schema
  status: string; // trang thai cua buoc: "running"|"success"|"failed" (dung string vi BE khong khai bao enum rieng)
  message: string | null; // thong diep chi tiet, co the null theo schema
  pct: number | null; // phan tram tien do, co the null theo schema
  created_at: string | null; // thoi diem ghi log dang ISO date-time (UTC, co hau to Z), co the null theo schema
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

// dung cho DELETE /api/v1/sessions/{session_id} - BE tra ve so dong DA XOA cua tung bang lien quan,
// dang {ten_bang: so_dong} (vd {"cr_cell_param": 12, "cr_log": 17, "cr_phieu": 0}). De Record vi danh sach
// bang co the doi khi BE them bang moi - FE chi duyet key/value de hien, khong phu thuoc ten bang cu the.
// BE CHI cho xoa khi status=FAILED, khac di tra 409 kem message giai thich
export type XoaSessionResponse = Record<string, number>;

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
  // qoe_snapshots/qos_snapshots DA BO (BE 854689a->d133fe1 xoa khoi GET /sessions/{id}). Truoc do FE cung
  // KHONG doc 2 truong nay o dau: component QoeQosCharts da xoa tu 23/07 vi 2 khoi do LUON rong (phu thuoc
  // job evaluate chi chay sau 21 ngay). Da grep lai toan bo src truoc khi bo - khong co cho nao doc.
  // LUU Y: BE tren .196:8080 HIEN VAN CON tra 2 truong nay (chua deploy ban moi) - thua truong trong
  // response so voi type la vo hai, TypeScript khong kiem tra luc chay
}

// dung cho SSE stream GET /api/v1/cr/stream/{session_id} - doc truc tiep tu source code BE that
// (application/trigger_cr_use_case.py ham _emit()/_fail(), va api/routers/sse.py dong 36 cho truong hop timeout)
// VAN KHAC voi CrLogItem o tren du BE gio DA persist cr_log (22072026): CrStreamEvent la SSE LIVE (tam thoi,
// dong tab la mat, co field "done"/"error"/"type"=heartbeat rieng), CrLogItem la doc lai TU DB SAU KHI CR
// xong (ben vung, KHONG co cac field do) - 2 nguon du lieu khac nhau cho 2 muc dich khac nhau (Tab1 live vs
// Tab2 lich su), KHONG dung lan hay thay the nhau duoc
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

// ==== GET /api/v1/qoe/{cell_name}?from=&to= (lich su QoE theo ngay, cho chart 15 ngay) ====
// DA XAC NHAN qua goi that tren BE .196:8080: nhan CA {days} LAN {from,to} y het /qos/{cell_name}, tra ve
// {"cell_name":"...","data":[{"time":"2026-08-07T00:00:00","qoe":5.0},...]}.
// KHAC /qos/{cell_name} DUNG 1 CHO: ten truong diem la "qoe" thay vi "qos". Vi vay dung chung duoc toan bo
// phan tinh toan/ve chart cua QoS (buildQosEvaluation/resolveQosWindow) sau khi doi ten truong - xem
// QosEvaluationChart.tsx::chiSo
export interface QoeHistoryPoint {
  time: string; // thoi diem do QoE (chuoi ISO, luu y BE tra KHONG co hau to Z o endpoint nay)
  qoe: number; // diem QoE thang 1-5
}

export interface QoeHistoryResponse {
  cell_name: string;
  data: QoeHistoryPoint[]; // co the IT hon so ngay yeu cau khi CEM thieu du lieu ngay - chart tu bu ngay trong
}

// dung cho POST /api/v1/phieu (KHOI 4b/5, xuat phieu SaveCellClm cho 1 cell KHONG DAT) - khop CHINH XAC
// api/schemas/phieu_schemas.py::XuatPhieuResponse phia BE (KHOI 4a/5, doc source truc tiep, khong doan)
export interface CtsResponse {
  isError: boolean | null;
  code: string | null;
  message: string | null;
  data: unknown; // hinh dang CHUA XAC NHAN tu BE (TU GIA DINH, xem application/xuat_phieu_use_case.py::_extract_phieu_id)
}

export interface XuatPhieuResponse {
  // SUCCESS/FAILED/DAT_KHONG_XUAT - xem domain/ports/inbound/use_case_ports.py::XuatPhieuResult phia BE
  trang_thai: string;
  phieu_id: string | null;
  // null khi DAT_KHONG_XUAT hoac da xuat truoc do (KHONG goi lai CTS lan nay) - CHI co gia tri khi THAT SU
  // goi CTS trong lan nay (FE dung de phan biet "da xuat truoc" voi "vua xuat xong", ca 2 deu trang_thai=SUCCESS)
  cts_response: CtsResponse | null;
  message: string | null;
}

// ==== GET /api/v1/phieu (lich su phieu da xuat) ====
// dung cho GET /api/v1/phieu - query param loc lich su phieu. TAT CA param deu optional:
// khong truyen session_id -> lay phieu cua MOI session (tab rieng "Lich su phieu"); truyen session_id ->
// chi lay phieu cua 1 session (dung trong chi tiet session CR)
export interface PhieuHistoryQueryParams {
  session_id?: number; // loc theo 1 session CR, optional
  // SUCCESS|FAILED|PENDING|KHONG_XUAT_VUOT_GIOI_HAN|KHONG_XUAT_HET_LUOT_THU.
  // DRY_RUN da bi BO HAN khoi hop dong BE (khong con che do chay thu), keo theo BE khong con an ngam ban
  // ghi nao nua -> KHONG truyen param nay gio dung nghia la lay TAT CA trang thai
  trang_thai?: string;
  // O TIM CHUNG cho cell_name VA phieu_id - BE chay ILIKE %q% tren CA HAI cot (api/routers/phieu.py::q,
  // them 13/08). KHONG can cho nguoi dung chon truoc "tim theo gi": ten cell co chu, phieu_id toan so nen
  // 2 loai gia tri nay khong nham lan duoc voi nhau.
  // LUU Y: KHONG tim duoc theo cr_session_id - BE khong soi q vao cot do. Muon loc theo session phai dung
  // param session_id rieng ben tren
  q?: string;
  // === NGAY LICH GMT+7 dang "YYYY-MM-DD", loc tren created_at - KHONG phai ISO date-time ===
  // BE khai bao kieu `date` va tu quy doi qua api/routers/loc_ngay.py::khoang_ngay_gmt7(): tu_ngay ->
  // dau_ngay_gmt7(), den_ngay -> dau_ngay_gmt7() + 1 NGAY (nua khoang [tu, den+1) nen ngay cuoi duoc tinh
  // TRON VEN, dong tao luc 23:59 van lot).
  // TUYET DOI KHONG dung .toISOString() nhu SessionsQueryParams.from/to: endpoint /sessions nhan `datetime`
  // nen ISO la dung, con o day ISO se lam LECH 1 NGAY (00:00 gio VN cua ngay N doi sang UTC roi cat phan
  // ngay se ra N-1). Dung dayjs(...).format("YYYY-MM-DD").
  // Hai dau mut DOC LAP - gui 1 trong 2 cung duoc ("tu 01/08 den nay", "truoc 01/08")
  tu_ngay?: string; // YYYY-MM-DD (gio VN)
  den_ngay?: string; // YYYY-MM-DD (gio VN), BE tu cong 1 ngay nen ngay nay duoc tinh CA NGAY
  page?: number; // trang hien tai, mac dinh 1
  size?: number; // so ban ghi moi trang, mac dinh 20, TOI DA 200 theo schema (ge=1, le=200)
  // Enum sort_by THAT cua BE (da doc api/routers/phieu.py::_PhieuSortBy, khong con la phong doan):
  // "id"|"cr_session_id"|"cell_name"|"trang_thai"|"created_at". Giu kieu string (khong that chat thanh
  // union) vi FE truyen thang column.id tu TanStack Table xuong; bang chi bat sort cho cac cot nam trong
  // enum nay, cot ngoai enum phai de enableSorting:false keo BE tra 422
  sort_by?: string;
  order?: "asc" | "desc"; // mac dinh "desc" theo schema BE
  // Loc theo NGUON phat hien cell khong dat (them theo BE commit 8f54b09) - xem NguonKhongDat ben duoi.
  // CHUA TRIEN KHAI TREN BE .196:8080 o thoi diem viet: openapi.json cua server do khong co param "nguon"
  // nao, va goi thu ?nguon=RAC (gia tri rac) van tra HTTP 200 -> FastAPI dang BO QUA param nay chu khong
  // validate. Nghia la den khi BE duoc deploy lai, gui param nay KHONG LOI nhung cung KHONG loc gi
  nguon?: NguonKhongDat;
}

// 3 gia tri cot cr_phieu.nguon_khong_dat (BE commit 8f54b09): cell bi phat hien khong dat qua chi so nao.
// CA_HAI = khong dat o CA QoS LAN QoE. Dung union (khong phai string) vi day la gia tri FE GUI LEN o param
// ?nguon= - gui gia tri ngoai 3 cai nay la sai hop dong
export type NguonKhongDat = "QOS" | "QOE" | "CA_HAI";

// dung cho GET /api/v1/phieu - 1 dong lich su phieu
export interface PhieuHistoryItem {
  id: number; // id ban ghi lich su phieu
  cr_session_id: number | null; // session CR da sinh ra phieu nay
  cell_name: string; // cell duoc xuat phieu
  // SUCCESS|FAILED|PENDING|KHONG_XUAT_VUOT_GIOI_HAN|KHONG_XUAT_HET_LUOT_THU (DRY_RUN da bi bo han).
  // De kieu string chu KHONG phai union: cot trong DB la VARCHAR tu do, bang mau/nhan o phieuStatus.ts
  // deu da co fallback nen gia tri la van hien duoc nguyen van thay vi lam vo man hinh
  trang_thai: string;
  phieu_id: string | null; // ma phieu ben TTS, null khi chua xuat duoc (FAILED/PENDING/KHONG_XUAT_*)
  created_at: string | null; // thoi diem tao dang ISO date-time (UTC, format qua helpers/formatDateTime)
  // request_payload/response_body khai bao KIEU RONG (object | string | null) CO CHU DICH: BE co the tra
  // ve object JSON da parse san, cung co the tra ve chuoi JSON tho neu cot trong DB la text - FE tu nhan
  // dien va parse o PhieuDetailModal thay vi ep 1 kieu roi vo khi gap kieu con lai
  request_payload: Record<string, unknown> | string | null; // 28 field gui sang CTS (SaveCellClm)
  response_body: CtsResponse | Record<string, unknown> | string | null; // JSON CTS tra ve
  error_message: string | null; // mo ta loi khi trang_thai=FAILED, null khi khong loi
  // Nguon phat hien cell khong dat: QOS | QOE | CA_HAI (cot cr_phieu.nguon_khong_dat, BE commit 8f54b09).
  // Khai bao OPTIONAL + nullable CO CHU DICH, 2 ly do rieng biet:
  //  1) null - phieu CU xuat truoc dot doi nay khong co gia tri nao (BE khong backfill) -> cot hien "-"
  //  2) undefined - BE tren .196:8080 HIEN CHUA CO truong nay (da doi chieu openapi.json that: schema
  //     PhieuListItem chi co 10 truong, chuoi "nguon" xuat hien 0 lan trong ca file). Cho den khi BE duoc
  //     deploy lai thi MOI dong deu thieu truong nay -> cho doc PHAI chiu duoc undefined, khong duoc coi
  //     la luon co san (dung bai hoc da ghi o so_lan_thu ben duoi)
  nguon_khong_dat?: NguonKhongDat | null;
  // So lan da POST THAT len CTS ma van chua SUCCESS (cot cr_phieu.so_lan_thu ben BE - INTEGER NOT NULL
  // DEFAULT 0, xem models/cr_phieu.py). Job tu dong NGUNG thu cell nay khi cham tran XUAT_PHIEU_MAX_RETRY
  // va danh dau KHONG_XUAT_HET_LUOT_THU. FE dung de canh bao TRUOC KHI nguoi dung bam xuat tay: "da thu n
  // lan that bai" - xuat tay lan nua rat co the cung hong y het, nen doc error_message tim nguyen nhan truoc.
  // LUU Y giai doan chuyen tiep: BE dang bo sung field nay vao GET /phieu, response cu se KHONG co no ->
  // moi cho doc phai chiu duoc undefined (vd `(so_lan_thu ?? 0) > 0`), khong duoc coi la luon co san
  so_lan_thu: number;
}

// dung cho GET /api/v1/phieu - response phan trang. KHAC SessionListResponse ({total, data}): endpoint nay
// tra ve THEM page/size, giu dung nguyen ban de FE khong phai doan lai trang hien tai tu state
export interface PhieuHistoryResponse {
  total: number; // tong so phieu KHOP bo loc (khong phai so dong cua trang hien tai)
  page: number;
  size: number;
  data: PhieuHistoryItem[];
}

// ==== GET /api/v1/sessions/{cr_session_id}/qoe-cells (danh gia QoE theo TUNG CELL) ====
// DA XAC NHAN qua openapi.json that + goi that tren BE .196:8080 (schema QoeCellItem/QoeCellsResponse).
// KHAC HAN voi qoe_snapshots cu (da bo cung BE 854689a): snapshot la diem QoE theo NGAY cua ca session (job evaluate 21
// ngay sinh ra), con day la ket qua danh gia TB truoc/sau CR cua TUNG CELL - tinh truc tiep tu CEM khi goi.
//
// LUU Y NANG: 1 lan goi endpoint nay = BE ban ~14 request sang CEM (moi cell 1 request) nen RAT CHAM -
// cho nao dung phai goi LAZY (chi goi khi nguoi dung that su mo xem), xem QoeCellsTable.tsx
export interface QoeCellItem {
  cell_name: string; // ten cell, bat buoc theo schema
  // 3 truong so duoi day co the null khi CEM khong co du lieu cho cell do - va day la chuyen BINH THUONG
  // voi QoE (CEM thung du lieu), khong phai loi he thong
  avg_before: number | null; // diem QoE trung binh TRUOC CR
  avg_after: number | null; // diem QoE trung binh SAU CR
  delta: number | null; // chenh lech (sau - truoc)
  so_ngay_before: number; // so ngay THAT SU co du lieu trong window truoc CR, bat buoc theo schema
  so_ngay_after: number; // so ngay THAT SU co du lieu trong window sau CR, bat buoc theo schema
  // PASS|FAIL|INSUFFICIENT_DATA. De kieu string (KHONG phai union): BE khai bao la "type": "string" tu do
  // chu khong phai enum, bang mau/nhan o QoeCellsTable da co fallback nen gia tri la van hien duoc
  ket_qua: string;
  diem_thap_nhat_sau: number | null; // diem QoE THAP NHAT trong window sau CR, null khi khong co du lieu
  so_ngay_dat_sau: number; // so ngay DAT nguong trong window sau CR (BE khai bao default 0)
}

export interface QoeCellsResponse {
  cr_session_id: number;
  total: number;
  data: QoeCellItem[];
}

// dung cho POST /api/v1/jobs/sync-rims - BE khai bao response la object additionalProperties true, chua co field co dinh
export type SyncRimsResponse = Record<string, unknown>;

// dung cho POST /api/v1/jobs/sync-netact - BE khai bao response la object additionalProperties true, chua co field co dinh
export type SyncNetactResponse = Record<string, unknown>;

// dung cho POST /api/v1/jobs/evaluate-cr - BE khai bao response la object additionalProperties true, chua co field co dinh
export type EvaluateCrResponse = Record<string, unknown>;

// ==== GET /api/v1/jobs/runs + GET /api/v1/jobs/runs/{id} (lich su chay job) ====
// TAT CA ten field duoi day DOC TRUC TIEP tu source BE api/schemas/job_schemas.py + api/routers/jobs.py
// (JobRunListItem/JobRunDetail/JobRunListResponse), KHONG tu dat ten.

// 3 gia tri BE khai bao bang Literal cho param LOC (api/routers/jobs.py::_JobRunTrangThai) - gui gia tri
// ngoai 3 cai nay se bi Pydantic tra 422 ngay tang validate, nen o FE khai bao union thay vi string
export type JobRunTrangThai = "RUNNING" | "DONE" | "FAILED";

// enum sort_by that cua BE (api/routers/jobs.py::_JobRunSortBy) - HEP hon danh sach cot se hien tren bang:
// cac cot so_* KHONG nam trong enum nay nen bang phai de enableSorting:false cho chung
export type JobRunSortBy = "id" | "job_type" | "started_at" | "finished_at" | "trang_thai";

// dung cho GET /api/v1/jobs/runs - query param loc lich su chay job. TAT CA param deu optional
export interface JobRunQueryParams {
  job_type?: string; // "xuat_phieu_auto" (job duy nhat hien co), BE de ngo cho job khac dung chung bang
  trang_thai?: JobRunTrangThai;
  // === QUAN TRONG: tu_ngay/den_ngay la NGAY LICH GMT+7 dang "YYYY-MM-DD", KHONG phai ISO date-time ===
  // BE khai bao kieu `date` (khong phai datetime) va TU quy doi sang moc UTC: _dau_ngay_gmt7(ngay) cho
  // tu_ngay, va _dau_ngay_gmt7(den_ngay) + 1 NGAY cho den_ngay (nua khoang [tu, den+1) -> ngay cuoi duoc
  // tinh TRON VEN, khong bi cat). Vi vay FE CHI duoc gui dayjs(...).format("YYYY-MM-DD").
  // TUYET DOI KHONG dung .toISOString() nhu SessionsQueryParams.from/to dang lam cho GET /sessions:
  // endpoint do nhan `datetime` nen ISO la dung, con o day ISO se lam lech 1 ngay (00:00 gio VN cua
  // ngay N khi doi sang UTC roi cat phan ngay se ra ngay N-1), tham chi bi 422 vi phan gio khac 00:00.
  tu_ngay?: string; // YYYY-MM-DD (gio VN)
  den_ngay?: string; // YYYY-MM-DD (gio VN), BE tu cong 1 ngay nen ngay nay duoc tinh CA NGAY
  page?: number; // mac dinh 1 theo schema (ge=1)
  size?: number; // mac dinh 20, TOI DA 100 theo schema (le=100 - thap hon /phieu la 200)
  sort_by?: JobRunSortBy;
  order?: "asc" | "desc"; // mac dinh "desc" theo schema BE
}

// dung cho GET /api/v1/jobs/runs - 1 dong danh sach luot chay job. KHONG co chi_tiet (BE co y bo ra khoi
// danh sach vi chi_tiet gom toan bo session x cell cua ca luot chay, 20 dong se keo theo vai tram KB) -
// muon xem chi_tiet phai goi GET /jobs/runs/{id}
export interface JobRunListItem {
  id: number;
  job_type: string; // "xuat_phieu_auto"
  started_at: string; // ISO date-time (UTC), BE khai bao NOT NULL - format qua helpers/formatDateTime
  // null = luot chay CHUA ket thuc (dang RUNNING) HOAC job chet giua chung (xem models/job_run_log.py)
  finished_at: string | null;
  // RUNNING|DONE|FAILED. De kieu string (KHONG phai JobRunTrangThai): Literal cua BE chi rang buoc param
  // LOC dau vao, con cot trong DB la VARCHAR(20) tu do - bang mau o jobRunStatus.ts da co fallback "default"
  trang_thai: string;
  // KHONG con field dry_run: hop dong BE moi da bo hoan toan che do chay thu, cot dry_run cung da bi bo
  // khoi bang job_run_log. Moi luot chay bay gio deu la chay THAT nen khong con gi de phan biet
  so_session_quet: number;
  so_phieu_thanh_cong: number;
  so_phieu_that_bai: number;
  so_cell_vuot_gioi_han: number;
  error_message: string | null;
}

// ---- cac manh nho ben trong chi_tiet (chi co o GET /jobs/runs/{id}) ----
// Hinh dang duoi day doc tu application/xuat_phieu_use_case.py::_xu_ly_mot_session() (dong 730-790) -
// noi THAT SU sinh ra du lieu nay. BE KHONG khoa schema (chi_tiet khai bao `dict | None`) de job khong
// phai doi schema moi lan them 1 truong, nen FE khai bao cac field la OPTIONAL va van giu duong lui
// hien JSON tho khi gap hinh dang la (xem JobRunDetailModal.tsx)
export interface JobRunCellDaXuLy {
  cell_name: string;
  do_te: number; // chenh lech (TB truoc CR - TB sau CR), cang lon cang te -> uu tien xuat phieu truoc
  // SUCCESS|FAILED|DAT_KHONG_XUAT (trang_thai tra ve tu XuatPhieuUseCase.execute, DRY_RUN da bi bo), HOAC chuoi
  // "LOI: <mo ta>" khi goi xuat phieu nem exception (dong 749) - nen KHONG khai bao union cung o day
  ket_qua: string;
  // KHONG co key nay o nhanh loi (dong 749 chi ghi cell_name/do_te/ket_qua) -> phai de optional, khong
  // duoc khai bao `string | null` (se noi doi la key luon ton tai)
  phieu_id?: string | null;
}

export interface JobRunCellVuotGioiHan {
  cell_name: string;
  do_te: number;
}

// 1 phan tu cua chi_tiet.sessions - co DUNG 2 dang:
//  1) dong BINH THUONG: day du tram_id/so_cell_khong_dat/4 nhom cell
//  2) dong LOI (xuat_phieu_use_case.py dong 824): CHI co { cr_session_id, loi } - session do chet giua
//     chung nhung KHONG duoc giet ca luot quet
export interface JobRunChiTietSession {
  cr_session_id: number;
  loi?: string; // chi co o dang (2)
  tram_id?: string;
  so_cell_khong_dat?: number;
  cell_da_xu_ly?: JobRunCellDaXuLy[]; // cell da thuc su goi xuat phieu trong luot nay
  cell_vuot_gioi_han?: JobRunCellVuotGioiHan[]; // cell tu thu 11 tro di - KHONG BAO GIO duoc job tu xuat, phai lam tay
  cell_da_co_phieu?: string[]; // nam trong top 10 nhung da co phieu SUCCESS tu luot truoc -> bo qua
  cell_vuot_so_lan_thu?: string[]; // da thu >= XUAT_PHIEU_MAX_RETRY lan van FAILED -> NGUNG thu tu dong
}

// chi_tiet la JSONB tu do; BE hien luon ghi dung dang {"sessions": [...]} (xuat_phieu_use_case.py dong
// 845/857/865) nhung KHONG co schema ep buoc, nen `sessions` van de optional
export interface JobRunChiTiet {
  sessions?: JobRunChiTietSession[];
}

// dung cho GET /api/v1/jobs/runs/{id} - y het 1 dong danh sach, THEM chi_tiet (BE cung ke thua dung kieu
// nay: class JobRunDetail(JobRunListItem))
export interface JobRunDetail extends JobRunListItem {
  chi_tiet: JobRunChiTiet | null;
}

// dung cho GET /api/v1/jobs/runs - response phan trang {total, page, size, data}, y het PhieuHistoryResponse
export interface JobRunListResponse {
  total: number; // tong so luot chay KHOP bo loc (khong phai so dong cua trang hien tai)
  page: number;
  size: number;
  data: JobRunListItem[];
}
