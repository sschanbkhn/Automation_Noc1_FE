// import instance axios rieng cua R012 da duoc cau hinh san (base url tro toi FastAPI, interceptor gan Authorization va xu ly 401)
// duong dan tuong doi da kiem tra dung vi tri file thuc te: services/R012Service.ts -> src/services/r012Request.ts la 4 cap thu muc
import r012Request from '../../../../services/r012Request';
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
  SyncRimsResponse,
  SyncNetactResponse,
  EvaluateCrResponse,
  JobRunQueryParams,
  JobRunListResponse,
  JobRunDetail,
  QoeCellsResponse,
  QoeHistoryResponse,
  XoaSessionResponse,
  XuatPhieuAutoRequest,
  XemTruocXuatPhieuResponse,
  ChayXuatPhieuAutoResponse,
} from '../types';

// ham goi GET /api/v1/stations - lay danh sach tram co phan trang
// chi goi API va tra ve dung raw response theo type StationListResponse, khong tinh toan/format them
export const getStations = async (params?: StationsQueryParams): Promise<StationListResponse> => {
  try {
    // r012Request da co interceptor tra ve response.data, nen ket qua o day chinh la body JSON that
    // endpoint nay khong goi CDS (chi doc du lieu tram da dong bo san) nen giu timeout ngan hon
    // 30s thay vi dung mac dinh 60s cua ca instance (mac dinh danh cho cac endpoint co goi CDS)
    const data: any = await r012Request.get('/stations', { params, timeout: 30000 });
    return data as StationListResponse;
  } catch (error) {
    // loi da duoc interceptor cua r012Request hien Notification, o day ném lai de hook goi ham nay tu quyet dinh xu ly tiep
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
    const data: any = await r012Request.get('/phieu', { params, timeout: 30000 });
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
