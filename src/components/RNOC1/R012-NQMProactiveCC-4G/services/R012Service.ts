// import instance axios rieng cua R012 da duoc cau hinh san (base url tro toi FastAPI, interceptor gan Authorization va xu ly 401)
// duong dan tuong doi da kiem tra dung vi tri file thuc te: services/R012Service.ts -> src/services/r012Request.ts la 4 cap thu muc
import r012Request from '../../../../services/r012Request';
// axios + Cookie DUNG RIENG cho xuatHauKiemExcel() ben duoi (THEM 18/10/2026) - KHONG dung r012Request vi
// interceptor response cua no LUON unwrap response.data (xem services/r012Request.ts dong 28-29), se mat het
// response.headers TRUOC khi ham do kip doc Content-Disposition de lay ten file - xem WHY day du tai noi khai
// bao hauKiemBlobRequest
import axios from 'axios';
import { Cookie } from 'helpers/cookie';
import {
  StationsQueryParams,
  StationListResponse,
  TriggerCrRequest,
  TriggerCrResponse,
  SessionsQueryParams,
  SessionListResponse,
  SessionDetailResponse,
  PreviewCrResponse,
  QosMetrics,
  QosHistoryResponse,
  QosHistoryQueryParams,
  XuatPhieuResponse,
  PhieuHistoryQueryParams,
  PhieuHistoryResponse,
  PhieuExcelQueryParams,
  SyncRimsResponse,
  SyncNetactResponse,
  EvaluateCrResponse,
  JobRunQueryParams,
  JobRunListResponse,
  JobRunDetail,
  QoeCellsResponse,
  QosCellsResponse,
  QoeHistoryResponse,
  XoaSessionResponse,
  XuatPhieuAutoRequest,
  XemTruocXuatPhieuResponse,
  ChayXuatPhieuAutoResponse,
  StationsMapResponse,
  StationMapPoint,
  HauKiemExcelParams,
  DashboardQueryParams,
  DashboardTongQuanResponse,
  DashboardBoLocResponse,
  DashboardChiTietParams,
  DashboardChiTietExcelParams,
  DashboardChiTietResponse,
} from '../types';

// axios 0.21.x (ban dang dung, xem package.json) tu serialize 1 param kieu MANG thanh "vendor[]=A&vendor[]=B"
// (xem node_modules/axios/lib/helpers/buildURL.js: "if (utils.isArray(val)) { key = key + '[]'; }"). BE
// GET /stations lai doi dung quy uoc FastAPI chuan "lap lai key THUONG" (?vendor=NOKIA&vendor=HUAWEI,
// api/routers/stations.py::vendor: list[...] = Query(default=None)) - KHONG co "[]", gui "vendor[]=" se bi
// FastAPI hieu la param "vendor[]" khac, khong khop "vendor" -> loc im lang khong co tac dung.
// paramsSerializer RIENG cho DUNG 1 ham nay (KHONG sua services/r012Request.ts dung chung - cac endpoint
// khac trong module khong co param nao kieu mang nen khong can doi gi ca).
// encode() COPY Y HET logic cua axios goc (cung file buildURL.js) de KHONG doi khac gi cach encode cac
// param scalar dang hoat dong dung (vd o tim "q" co the chua dau cach/dau tieng Viet) - DIEM KHAC DUY NHAT
// la nhanh mang: khong noi them "[]" vao key.
const encodeQueryValue = (val: string): string =>
  encodeURIComponent(val)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");

const serializeStationsParams = (params: Record<string, unknown>): string => {
  const parts: string[] = [];
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val === null || val === undefined) {
      return;
    }
    const values = Array.isArray(val) ? val : [val];
    values.forEach((v) => {
      parts.push(`${encodeQueryValue(key)}=${encodeQueryValue(String(v))}`);
    });
  });
  return parts.join("&");
};

// ham goi GET /api/v1/stations - lay danh sach tram co phan trang
// chi goi API va tra ve dung raw response theo type StationListResponse, khong tinh toan/format them
export const getStations = async (params?: StationsQueryParams): Promise<StationListResponse> => {
  try {
    // r012Request da co interceptor tra ve response.data, nen ket qua o day chinh la body JSON that
    // endpoint nay khong goi CDS (chi doc du lieu tram da dong bo san) nen giu timeout ngan hon
    // 30s thay vi dung mac dinh 60s cua ca instance (mac dinh danh cho cac endpoint co goi CDS)
    // paramsSerializer: xem comment serializeStationsParams phia tren - BAT BUOC co de param "vendor"
    // (mang) gui dung dang "vendor=A&vendor=B", khong phai "vendor[]=A&vendor[]=B" mac dinh cua axios
    const data: any = await r012Request.get('/stations', {
      params,
      timeout: 30000,
      paramsSerializer: serializeStationsParams,
    });
    return data as StationListResponse;
  } catch (error) {
    // loi da duoc interceptor cua r012Request hien Notification, o day ném lai de hook goi ham nay tu quyet dinh xu ly tiep
    throw error;
  }
};

// ham goi GET /api/v1/stations/map?ma_tinh=... (BUOC 4c, 10/10/2026, BE chua deploy) - TOAN BO tram co toa
// do cua 1 tinh, dung cho ban do xem truoc CR (context cac tram cung tinh quanh X). response THO cua BE la
// dang GON (columns+rows, xem StationsMapResponse trong types/index.ts) - ZIP lai thanh StationMapPoint[] o
// day (tra cuu qua TEN COT thuc te trong "columns", KHONG gia dinh thu tu co dinh) de cac noi goi khac
// (hook/component) khong phai tu zip lai, giong tinh than cac service khac trong file nay tra ve du lieu da
// dung dang san sang dung, khong bia them field nao ngoai 6 cot BE thuc su tra
export const getStationsMap = async (ma_tinh: string): Promise<StationMapPoint[]> => {
  try {
    const data: any = await r012Request.get('/stations/map', { params: { ma_tinh } });
    const res = data as StationsMapResponse;
    const idx = (ten: string) => res.columns.indexOf(ten);
    const iTramId = idx('tram_id');
    const iTen = idx('ten');
    const iLat = idx('lat');
    const iLon = idx('lon');
    const iVendor = idx('vendor');
    const iCran = idx('toa_do_dung_chung');
    // THEM (12/10/2026) - cot "loai_tram" (THEM moi ben BE, xem WHY day du o LoaiTram trong types/index.ts -
    // BE hien CO khai bao cot nay trong columns NHUNG CHUA dien gia tri vao tung dong, nen row[iLoaiTram]
    // LUON undefined cho toi khi BE sua). idx() tra -1 neu cot chua ton tai trong columns -> row[-1] cung la
    // undefined (JS), nen 1 dong code nay xu ly dung CA 2 truong hop (cot chua khai bao / cot khai bao nhung
    // row thieu gia tri) ma khong can if/else rieng
    const iLoaiTram = idx('loai_tram');
    return res.rows.map((row) => ({
      tram_id: String(row[iTramId]),
      ten: String(row[iTen]),
      lat: row[iLat] as number | null,
      lon: row[iLon] as number | null,
      vendor: String(row[iVendor]),
      toa_do_dung_chung: Boolean(row[iCran]),
      loai_tram: row[iLoaiTram] as StationMapPoint['loai_tram'],
    }));
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/cr/trigger - kich hoat CR (shutdown/cancel/relocate) cho 1 tram
// chi goi API va tra ve dung raw response theo type TriggerCrResponse
export const triggerCr = async (payload: TriggerCrRequest): Promise<TriggerCrResponse> => {
  try {
    // BE tra 202 NGAY khi trigger (khong block cho SSH chay het, chi mang session_id de FE
    // theo doi tiep qua SSE), khong goi CDS dong bo nen giu timeout ngan hon
    const data: any = await r012Request.post('/cr/trigger', payload, { timeout: 30000 });
    return data as TriggerCrResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/sessions - lay danh sach session CR, dung cho tab Lich su CR
// chi goi API va tra ve dung raw response theo type SessionListResponse
export const getSessions = async (params?: SessionsQueryParams): Promise<SessionListResponse> => {
  try {
    // endpoint nay khong goi CDS (chi doc lich su session da luu trong DB) nen giu timeout ngan hon
    const data: any = await r012Request.get('/sessions', { params, timeout: 30000 });
    return data as SessionListResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/cr/preview - xem truoc anh huong CR (tram_goc + cells_bi_anh_huong + tram_bi_anh_huong
// + cells_chay_cr, xem types/index.ts) TRUOC KHI trigger that, dung chung body TriggerCrRequest voi
// triggerCr o tren (tram_id/tram_name/action)
// chi goi API va tra ve dung raw response theo type PreviewCrResponse
export const getPreview = async (payload: TriggerCrRequest): Promise<PreviewCrResponse> => {
  try {
    // endpoint nang nhat: goi CDS (gw-oneoss cell/neighbors) dong bo de tinh cells_bi_anh_huong.
    // 120s - RIENG cho endpoint nay, KHONG nang mac dinh 60s cua r012Request: CDS van co luc vuot 60s
    // (lan tang truoc 15s->60s da chua du), ma xem truoc la thao tac NOC CHU DONG bam va ngoi cho ket qua
    // nen cho lau con hon bao loi timeout roi phai bam lai tu dau - trong khi cac endpoint doc DB con lai
    // neu cham toi 60s thi that su la co su co, khong duoc keo dai cho chung.
    const data: any = await r012Request.post('/cr/preview', payload, { timeout: 120000 });
    return data as PreviewCrResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/sessions/{session_id} - lay chi tiet 1 session CR (cell_params, affected_cells,
// cr_logs, qoe/qos snapshot). affected_cells them 22072026 - session cu (truoc ngay do) se tra mang rong
// (BE khong backfill, xem comment SessionAffectedCellItem trong types/index.ts)
// chi goi API va tra ve dung raw response theo type SessionDetailResponse
export const getSessionDetail = async (sessionId: number): Promise<SessionDetailResponse> => {
  try {
    const data: any = await r012Request.get(`/sessions/${sessionId}`);
    return data as SessionDetailResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/sessions/{cr_session_id}/qos-cells - danh gia QoS theo TUNG CELL, KET LUAN DO BE
// TINH (xem QosCellItem trong types/index.ts de biet vi sao khong tu tinh o FE nua)
export const getQosCells = async (sessionId: number): Promise<QosCellsResponse> => {
  try {
    // 120s: BE goi CTS DONG BO cho tung cell (17 cell = 34 request truoc+sau). Timeout 30s nhu cac
    // endpoint doc DB se bao timeout OAN trong khi BE van dang chay dung - dung ly do da dat 120s cho
    // /qoe-cells
    const data: any = await r012Request.get(`/sessions/${sessionId}/qos-cells`, { timeout: 120000 });
    return data as QosCellsResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/sessions/{cr_session_id}/qoe-cells - danh gia QoE theo TUNG CELL cua 1 session
// (TB truoc/sau CR, ket luan PASS/FAIL/INSUFFICIENT_DATA, diem thap nhat + so ngay dat sau CR)
export const getQoeCells = async (sessionId: number): Promise<QoeCellsResponse> => {
  try {
    // ENDPOINT NANG NHAT trong nhom doc: BE goi CEM cho TUNG cell (~14 request cho 1 session binh thuong)
    // roi moi tong hop tra ve - KHONG dung timeout 30s nhu cac endpoint doc DB thuan ben canh, se bao
    // timeout oan trong khi BE van dang chay dung. Dat 120s giong /cr/preview (endpoint nang tuong tu, cung
    // goi he thong ngoai dong bo)
    const data: any = await r012Request.get(`/sessions/${sessionId}/qoe-cells`, { timeout: 120000 });
    return data as QoeCellsResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/qos/{cell_name} - lay so lieu QoS cua 1 cell
// BE khai bao schema additionalProperties true nen giu nguyen kieu QosMetrics (Record), khong bia field
export const getQos = async (cellName: string): Promise<QosMetrics> => {
  try {
    // endpoint nay khong goi CDS (doc so lieu QoS da luu trong DB) nen giu timeout ngan hon
    const data: any = await r012Request.get(`/qos/${cellName}`, { timeout: 30000 });
    return data as QosMetrics;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/qos/{cell_name} - lay lich su QoS cua 1 cell, dung CHUNG cho 2 truong hop:
// 1) truyen {days} - window neo vao "hom qua" (dung cho CellQosHistoryChart trong preview, Phan 2)
// 2) truyen {from, to} - window tuong minh theo 1 khoang ngay CU THE trong qua khu (dung cho danh gia
//    chat luong QoS 15 ngay quanh 1 ngay CR da qua, Phan 3 Buoc 1) - CAP NHAT 22072026 (Gap 1, xac nhan
//    qua goi that + source api/routers/qos.py), xem comment day du trong QosHistoryQueryParams (types/index.ts)
export const getQosHistory = async (
  cellName: string,
  params: QosHistoryQueryParams = {}
): Promise<QosHistoryResponse> => {
  try {
    // endpoint nay khong goi CDS (doc lich su QoS da luu trong DB) nen giu timeout ngan hon
    const data: any = await r012Request.get(`/qos/${cellName}`, { params, timeout: 30000 });
    return data as QosHistoryResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/qoe/{cell_name} - lich su QoE theo ngay. DUNG CHUNG khuon params voi getQosHistory
// ({days} hoac {from,to}) - DA XAC NHAN qua goi that: endpoint nay nhan y het cac param do.
// Response KHAC /qos/{cell_name} DUNG 1 CHO: ten truong diem la "qoe" thay vi "qos" (xem QoeHistoryPoint)
export const getQoeHistory = async (
  cellName: string,
  params: QosHistoryQueryParams = {}
): Promise<QoeHistoryResponse> => {
  try {
    // doc du lieu QoE da luu trong DB (khong goi CEM dong bo nhu /qoe-cells) nen giu timeout ngan 30s
    const data: any = await r012Request.get(`/qoe/${cellName}`, { params, timeout: 30000 });
    return data as QoeHistoryResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi DELETE /api/v1/sessions/{session_id} - XOA VINH VIEN 1 session CR va toan bo du lieu lien quan
// (cell param, log, phieu). BE CHI cho xoa khi status=FAILED, khac di tra 409 kem message giai thich ro -
// FE KHONG tu doan ly do, cu hien nguyen van message do (xem SessionHistoryList.tsx).
// Tra ve {ten_bang: so_dong_da_xoa}
export const xoaSession = async (sessionId: number): Promise<XoaSessionResponse> => {
  try {
    const data: any = await r012Request.delete(`/sessions/${sessionId}`, { timeout: 30000 });
    return data as XoaSessionResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi DELETE /api/v1/phieu/{phieu_id} - xoa 1 DONG lich su phieu. BE chi chan trang_thai=SUCCESS
// (phieu da len CTS that thi khong the xoa o day) -> 409; cac trang thai con lai deu xoa duoc de cell quay
// lai trang thai chua xu ly va co the xuat lai
export const xoaPhieu = async (phieuId: number): Promise<unknown> => {
  try {
    const data: any = await r012Request.delete(`/phieu/${phieuId}`, { timeout: 30000 });
    return data;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/phieu - xuat phieu SaveCellClm cho 1 cell (KHOI 4b/5). WRITE API tao phieu THAT tren
// TTS (BE POST that, dry_run=False - xem KHOI 4a/5) - KHONG duoc goi lai tu dong/retry o tang service, cho
// component tu kiem soat (disable nut trong luc goi, xem QosEvaluationTable.tsx::handleXuatPhieu)
export const xuatPhieu = async (sessionId: number, cellName: string): Promise<XuatPhieuResponse> => {
  try {
    const data: any = await r012Request.post('/phieu', { session_id: sessionId, cell_name: cellName });
    return data as XuatPhieuResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/phieu - lay LICH SU phieu da xuat (READ, khac han POST /phieu o tren la WRITE tao phieu that)
// dung CHUNG cho 2 man hinh, khac nhau DUY NHAT o params.session_id:
//  - co session_id -> phieu cua dung 1 session (muc "Lich su phieu" trong chi tiet session CR)
//  - khong co     -> phieu cua MOI session (tab rieng "Lich su phieu")
// axios tu bo cac key co gia tri undefined khoi query string, nen cu truyen ca object params vao la du,
// khong can tu loc undefined truoc khi goi
export const getLichSuPhieu = async (params?: PhieuHistoryQueryParams): Promise<PhieuHistoryResponse> => {
  try {
    // endpoint nay khong goi CDS/CTS (chi doc lich su phieu da luu trong DB) nen giu timeout ngan hon
    //
    // SUA 20/10/2026 (yeu cau truc tiep user, BE commit 43d259e them khu_vuc/ma_tinh/vendor/phuong_an) -
    // THEM paramsSerializer: serializeStationsParams. LOI THAT da tim thay truoc khi sua: ham nay truoc do
    // KHONG co dong nay, nen axios 0.21.x (ban dang dung) TU serialize 4 param MANG moi thanh dang
    // "vendor[]=NOKIA&vendor[]=ERICSSON" (xem comment day du o serializeStationsParams phia tren) - FastAPI
    // khai bao "vendor: list[...] = Query(...)" CHI nhan dang lap lai key THUONG ("vendor=NOKIA&vendor=
    // ERICSSON"), "vendor[]" la 1 TEN PARAM KHAC nen bi am tham BO QUA (khong loi, nhung cung khong loc gi
    // ca) - dung CHINH loi da gap va sua cho /dashboard/tong-quan, /dashboard/chi-tiet truoc day.
    const data: any = await r012Request.get('/phieu', { params, timeout: 30000, paramsSerializer: serializeStationsParams });
    return data as PhieuHistoryResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/jobs/runs - lay danh sach LUOT CHAY job (bang job_run_log), dung cho bang lich su
// chay job trong tab "Lich su phieu". Response KHONG co chi_tiet (BE co y bo ra, xem JobRunListItem trong
// types/index.ts) - muon xem chi_tiet phai goi getJobRunDetail ben duoi
// LUU Y params.tu_ngay/den_ngay: PHAI la "YYYY-MM-DD" (ngay lich GMT+7), KHONG duoc la ISO date-time -
// xem comment day du trong JobRunQueryParams (types/index.ts)
// axios tu bo cac key co gia tri undefined khoi query string nen cu truyen ca object params vao la du
export const getJobRuns = async (params?: JobRunQueryParams): Promise<JobRunListResponse> => {
  try {
    // endpoint nay khong goi CDS/CTS (chi doc bang job_run_log trong DB) nen giu timeout ngan hon
    const data: any = await r012Request.get('/jobs/runs', { params, timeout: 30000 });
    return data as JobRunListResponse;
  } catch (error) {
    // loi da duoc interceptor cua r012Request hien Notification, o day nem lai de hook goi ham nay tu xu ly tiep
    throw error;
  }
};

// ham goi GET /api/v1/jobs/runs/{id} - lay DAY DU 1 luot chay job KE CA chi_tiet (JSONB gom danh sach
// session x cell da xu ly). Tach endpoint rieng thay vi tra kem trong danh sach vi chi_tiet rat lon
export const getJobRunDetail = async (id: number): Promise<JobRunDetail> => {
  try {
    // van la doc DB thuan (khong CDS/CTS) nen giu 30s; BE tra 404 khi khong co id -> interceptor hien
    // Notification va reject, component tu hien Alert loi
    const data: any = await r012Request.get(`/jobs/runs/${id}`, { timeout: 30000 });
    return data as JobRunDetail;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/jobs/xuat-phieu-auto/xem-truoc - DEM THU se xuat bao nhieu phieu cho khoang ngay
// da chon, KHONG ghi gi ra ngoai. Endpoint DONG BO (tra ket qua ngay, khong phai 202 + background).
export const xemTruocXuatPhieuAuto = async (
  body: XuatPhieuAutoRequest
): Promise<XemTruocXuatPhieuResponse> => {
  try {
    // 300s (5 phut) - KHONG dung 30s nhu cac endpoint doc DB: day la endpoint dong bo phai quet TUNG cell
    // cua TUNG session trong khoang ngay (30 ngay x ~48 request/session), vai phut la binh thuong. De 30s
    // se bao timeout OAN trong khi BE van dang chay dung, va nguoi dung se bam lai -> chay lai tu dau
    const data: any = await r012Request.post('/jobs/xuat-phieu-auto/xem-truoc', body, { timeout: 300000 });
    return data as XemTruocXuatPhieuResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/jobs/xuat-phieu-auto - CHAY THAT, xuat phieu len CTS. BE tra 202 NGAY roi chay nen
// (khong block), nen KHONG can timeout dai nhu /xem-truoc. 409 = dang co luot job chay do.
// KHONG duoc goi tu dong/retry o tang service - day la WRITE API tao phieu THAT, cho component tu kiem soat
// (phai xem truoc + xac nhan 2 lan, xem ChayJobModal.tsx)
export const chayXuatPhieuAuto = async (
  body: XuatPhieuAutoRequest
): Promise<ChayXuatPhieuAutoResponse> => {
  try {
    const data: any = await r012Request.post('/jobs/xuat-phieu-auto', body, { timeout: 30000 });
    return data as ChayXuatPhieuAutoResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/jobs/sync-rims - job dong bo du lieu RIMS, tram_id la query param optional theo schema
export const syncRims = async (tramId?: string): Promise<SyncRimsResponse> => {
  try {
    const data: any = await r012Request.post('/jobs/sync-rims', null, { params: { tram_id: tramId } });
    return data as SyncRimsResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/jobs/sync-netact - job dong bo du lieu Netact, file_path la query param bat buoc theo schema
export const syncNetact = async (filePath: string): Promise<SyncNetactResponse> => {
  try {
    const data: any = await r012Request.post('/jobs/sync-netact', null, { params: { file_path: filePath } });
    return data as SyncNetactResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi POST /api/v1/jobs/evaluate-cr - job danh gia ket qua CR, khong co param theo schema
export const evaluateCr = async (): Promise<EvaluateCrResponse> => {
  try {
    const data: any = await r012Request.post('/jobs/evaluate-cr');
    return data as EvaluateCrResponse;
  } catch (error) {
    throw error;
  }
};

// GET /api/v1/cr/stream/{session_id} la SSE (Server-Sent Events), response schema rong vi khong phai JSON thuong
// khong viet ham axios cho endpoint nay vi axios se buffer toan bo response thay vi doc tung event theo dong chay
// endpoint nay se duoc goi bang EventSource truc tiep trong hooks/useSseStream.ts (chua lam trong buoc nay, xem Buoc 5)

// ham goi GET /api/v1/dashboard/bo-loc (THEM 18/10/2026) - danh sach lua chon cho 3 Select cua bo loc (khu
// vuc/tinh/vendor), KHONG nhan tham so nao. Day la nguon DUY NHAT cho mapping tinh -> khu vuc (xem WHY day du
// o DashboardBoLocResponse, types/index.ts)
export const getDashboardBoLoc = async (): Promise<DashboardBoLocResponse> => {
  try {
    // endpoint nay chi doc DISTINCT tu bang tram (khong goi CDS/CTS/CEM) nen giu timeout ngan
    const data: any = await r012Request.get('/dashboard/bo-loc', { timeout: 30000 });
    return data as DashboardBoLocResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/dashboard/tong-quan - tong quan toan module R012 (THEM 18/10/2026, LAM LAI hoan toan
// 18/10/2026 theo schema BE moi commit 124b72b - xem WHY day du o DashboardTongQuanResponse, types/index.ts).
// 3 param mang (khu_vuc/ma_tinh/vendor) can CUNG paramsSerializer voi /stations (serializeStationsParams o
// tren) - FastAPI doi dang lap lai key THUONG ("khu_vuc=KV1&khu_vuc=KV2"), khac dang "khu_vuc[]=" mac dinh
// cua axios 0.21.x
export const getDashboardTongQuan = async (
  params: DashboardQueryParams
): Promise<DashboardTongQuanResponse> => {
  try {
    // endpoint nay chi doc DB (khong goi CDS/CTS/CEM) nen giu timeout ngan hon mac dinh 60s cua ca instance
    const data: any = await r012Request.get('/dashboard/tong-quan', {
      params,
      timeout: 30000,
      paramsSerializer: serializeStationsParams,
    });
    return data as DashboardTongQuanResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/dashboard/chi-tiet (THEM 18/10/2026) - khoan sau tu 1 card/chi so nho ra danh sach cu
// the (session/cell/phieu/can_xu_ly tuy "loai" - xem WHY day du o DashboardChiTietParams, types/index.ts).
// LUU Y: BE endpoint nay KHONG co tham so tim kiem tu do (q) - o tim/sort/phan trang cua Modal chi tiet
// (Dashboard/DashboardChiTietModal.tsx) PHAI xu ly phia FE tren tap da tai (toi da kich_thuoc=500/lan)
export const getDashboardChiTiet = async (
  params: DashboardChiTietParams
): Promise<DashboardChiTietResponse> => {
  try {
    const data: any = await r012Request.get('/dashboard/chi-tiet', {
      params,
      timeout: 30000,
      paramsSerializer: serializeStationsParams,
    });
    return data as DashboardChiTietResponse;
  } catch (error) {
    throw error;
  }
};

// instance axios RIENG CHI phuc vu tai file Excel (taiFileBlob ben duoi) - KHONG dung r012Request (interceptor
// response cua no o services/r012Request.ts LUON unwrap response.data truoc khi tra ve cho noi goi, mat het
// response.headers - can .headers de doc Content-Disposition lay ten file BE dat). KHONG sua r012Request.ts
// (theo yeu cau) - instance nay copy Y HET cau hinh can thiet (baseURL + header Authorization) nhung KHONG
// gan interceptor response nao, giu nguyen AxiosResponse day du. Dat ten CHUNG (khong con rieng "hauKiem")
// vi gio dung cho CA 3 endpoint tai file: /hau-kiem/excel, /dashboard/excel, /dashboard/chi-tiet/excel
const r012BlobRequest = axios.create({
  baseURL: process.env.R012_API_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 60000,
});
r012BlobRequest.interceptors.request.use((config) => {
  config.headers['Authorization'] = 'Bearer ' + Cookie.getCookie('Token');
  return config;
});

// doc ten file tu header Content-Disposition - UU TIEN dang RFC 5987 "filename*=UTF-8''..." (ho tro ten co
// dau tieng Viet, encode phan tram) NEU CO, roi moi roi xuong dang don gian `filename="ten_file.xlsx"` (THEM
// 19/10/2026, yeu cau truc tiep user muc 5: "ho tro ca filename*=UTF-8''..."). 1 Content-Disposition CO THE
// chua CA 2 dang cung luc (vd `attachment; filename="bao_cao.xlsx"; filename*=UTF-8''b%C3%A1o_c%C3%A1o.xlsx`)
// - dang filename* la ten THAT (co dau), dang filename= chi la fallback ASCII cho client cu nen phai thu dang
// filename* TRUOC. null neu header thieu/rong (vd BE khong tra Content-Disposition, hoac trinh duyet khong
// cho JS doc duoc header nay do thieu Access-Control-Expose-Headers tren response CORS - xem bao cao rieng
// gui nguoi dung ve van de nay, KHONG sua duoc o day vi la cau hinh BE) - fallback ten file o noi goi
function layTenFileTuContentDisposition(contentDisposition: string | undefined): string | null {
  if (!contentDisposition) {
    return null;
  }
  const matchRfc5987 = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (matchRfc5987) {
    try {
      return decodeURIComponent(matchRfc5987[1].trim());
    } catch {
      // gia tri encode hong (vd BE ghep sai %) - roi xuong thu dang filename="..." thuong ben duoi
    }
  }
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : null;
}

// ham DUNG CHUNG tai 1 file Excel ve may nguoi dung (THEM 18/10/2026, gop tu 3 ban gan giong het nhau truoc
// do thanh 1 ham duy nhat - tranh sua loi phai sua lap 3 noi). tenFileMacDinh dung khi response thieu/hong
// header Content-Disposition
async function taiFileBlob<T extends object>(url: string, params: T, tenFileMacDinh: string): Promise<void> {
  try {
    const response = await r012BlobRequest.get(url, {
      params,
      responseType: 'blob',
      paramsSerializer: serializeStationsParams,
    });
    const tenFile = layTenFileTuContentDisposition(response.headers['content-disposition']) ?? tenFileMacDinh;
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', tenFile);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: any) {
    // SUA (18/10/2026, yeu cau truc tiep user, "KIEM 1 DIEM") - responseType:'blob' ap dung cho CA response
    // THANH CONG LAN LOI cua CUNG 1 request (axios khong tu phan biet duoc truoc khi nhan response): khi BE
    // tra 4xx/5xx, body that su la JSON {error_code, message, session_id} (api/middleware/error_handler.py)
    // nhung bi "boc" thanh 1 Blob thay vi object da parse san nhu moi loi khac trong module (qua r012Request,
    // KHONG dung responseType:'blob'). Neu KHONG tu doc lai o day, layThongBaoLoi() o noi goi se khong thay
    // duoc error.response.data.message (chi thay 1 object Blob ro khong co field nao) va roi vao thong bao
    // axios chung chung ("Request failed with status code 422") thay vi ly do THAT tu BE.
    // Tu doc blob.text() -> JSON.parse() roi GAN DE error.response.data truoc khi nem lai, de noi goi dung
    // CHUNG duoc layThongBaoLoi nhu moi loi khac, khong can sua gi them o phia goi.
    if (error?.response?.data instanceof Blob) {
      try {
        const text: string = await error.response.data.text();
        error.response.data = JSON.parse(text);
      } catch {
        // blob khong phai JSON hop le (vd loi ha tang/proxy tra HTML) - giu nguyen Blob, layThongBaoLoi se
        // tu fallback ve error.message chung thay vi crash o day
      }
    }
    throw error;
  }
}

// ham goi GET /api/v1/hau-kiem/excel - xuat Excel hau kiem cho 1 session hoac 1 khoang ngay (THEM 18/10/2026,
// xem WHY day du o HauKiemExcelParams, types/index.ts)
export const xuatHauKiemExcel = (params: HauKiemExcelParams): Promise<void> =>
  taiFileBlob('/hau-kiem/excel', params, 'hau_kiem.xlsx');

// ham goi GET /api/v1/dashboard/excel - xuat Excel TOAN BO dashboard tong quan theo bo loc dang chon (THEM
// 18/10/2026)
export const xuatDashboardExcel = (params: DashboardQueryParams): Promise<void> =>
  taiFileBlob('/dashboard/excel', params, 'dashboard.xlsx');

// ham goi GET /api/v1/dashboard/chi-tiet/excel - xuat Excel danh sach chi tiet dang xem trong Modal (THEM
// 18/10/2026) - CUNG bo loc + loc con voi Modal dang hien, KHONG kem trang/kich_thuoc (BE tu xuat HET)
export const xuatDashboardChiTietExcel = (params: DashboardChiTietExcelParams): Promise<void> =>
  taiFileBlob('/dashboard/chi-tiet/excel', params, `dashboard_${params.loai}.xlsx`);

// ham goi GET /api/v1/phieu/excel - xuat Excel lich su phieu theo dung bo loc dang xem o man danh sach (THEM
// 20/10/2026, yeu cau truc tiep user). Ten file MAC DINH mo phong dung quy uoc BE (api/routers/phieu.py:
// "phieu_<tu>_den_<den>_<ts>.xlsx" hoac "phieu_session_<id>_<ts>.xlsx") - CHI dung khi trinh duyet KHONG doc
// duoc Content-Disposition that tu BE (vd thieu Access-Control-Expose-Headers, da xac nhan truc tiep qua
// main.py CORSMiddleware o 1 lan sua truoc - xem WHY day du o taiFileBlob/layTenFileTuContentDisposition)
export const xuatPhieuExcel = (params: PhieuExcelQueryParams): Promise<void> => {
  const tenMacDinh =
    params.tu_ngay && params.den_ngay
      ? `phieu_${params.tu_ngay}_den_${params.den_ngay}.xlsx`
      : `phieu_session_${params.session_id}.xlsx`;
  return taiFileBlob('/phieu/excel', params, tenMacDinh);
};
