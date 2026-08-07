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
  SyncRimsResponse,
  SyncNetactResponse,
  EvaluateCrResponse,
} from '../types';

// ham goi GET /api/v1/stations - lay danh sach tram co phan trang
// chi goi API va tra ve dung raw response theo type StationListResponse, khong tinh toan/format them
export const getStations = async (params?: StationsQueryParams): Promise<StationListResponse> => {
  try {
    // r012Request da co interceptor tra ve response.data, nen ket qua o day chinh la body JSON that
    const data: any = await r012Request.get('/stations', { params });
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
    const data: any = await r012Request.post('/cr/trigger', payload);
    return data as TriggerCrResponse;
  } catch (error) {
    throw error;
  }
};

// ham goi GET /api/v1/sessions - lay danh sach session CR, dung cho tab Lich su CR
// chi goi API va tra ve dung raw response theo type SessionListResponse
export const getSessions = async (params?: SessionsQueryParams): Promise<SessionListResponse> => {
  try {
    const data: any = await r012Request.get('/sessions', { params });
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
    const data: any = await r012Request.post('/cr/preview', payload);
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

// ham goi GET /api/v1/qos/{cell_name} - lay so lieu QoS cua 1 cell
// BE khai bao schema additionalProperties true nen giu nguyen kieu QosMetrics (Record), khong bia field
export const getQos = async (cellName: string): Promise<QosMetrics> => {
  try {
    const data: any = await r012Request.get(`/qos/${cellName}`);
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
    const data: any = await r012Request.get(`/qos/${cellName}`, { params });
    return data as QosHistoryResponse;
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
