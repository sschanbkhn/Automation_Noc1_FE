// logic tinh toan THUAN (khong JSX) dung CHUNG boi QosEvaluationChart.tsx (1 cell dang chon) va
// QosEvaluationTable.tsx (toan bo affected_cells) - ca 2 noi deu can CUNG 1 cach gop 15 ngay quanh ngay CR
// + tinh trung binh truoc/sau + ket luan DAT/KHONG DAT, tach rieng de KHONG viet lai 2 lan
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { QosHistoryPoint, SessionAffectedCellItem } from "../../types";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - dung DUNG helper nay de convert timestamp
// that tu BE, KHONG tu viet lai logic UTC->GMT+7 lan 2 (xem ly do trong file helper)
import { formatDateTime } from "../../helpers/formatDateTime";
import { getQosHistory } from "../../services/R012Service";

dayjs.extend(utc);
dayjs.extend(timezone);

// nguong PASS/FAIL theo dung yeu cau nghiep vu Phan 3 Buoc 3: (TB truoc - TB sau) < 0.2 -> DAT.
// LUU Y: KHONG lay tri tuyet doi - neu QoS sau CR CAO HON truoc (cai thien), diem am se luon < 0.2 -> DAT,
// dung y muon (chi FAIL khi QoS giam THAT SU qua nguong, khong phai khi tang)
export const QOS_EVAL_THRESHOLD = 0.2;

export type DayGroup = "before" | "cr_day" | "after";

export interface QosEvalChartPoint {
  dateKey: string; // "DD/MM/YYYY" GMT+7 - dung de gop du lieu that, khong hien truc tiep
  label: string; // "DD/MM" hien tren truc X (rieng ngay CR co them hau to "(CR)")
  qos: number | null; // null nghia la CHUA co du lieu ngay do - GIU LAI de cot do hien RONG (Buoc 1)
  group: DayGroup;
}

export type QosEvalVerdict = "PASS" | "FAIL" | "INSUFFICIENT";

export interface QosEvalResult {
  avgBefore: number | null;
  avgAfter: number | null;
  diff: number | null; // avgBefore - avgAfter, null neu INSUFFICIENT
  verdict: QosEvalVerdict;
  chartData: QosEvalChartPoint[];
}

// tinh "ngay CR" theo GMT+7 tu executed_at (ISO string BE tra ve, co the co hoac khong co hau to "Z" -
// xem ly do trong formatDateTime.ts) - dung dayjs.utc().tz() DUNG 1 cach nhat quan, KHONG tu doan gio theo
// TZ trinh duyet
export function resolveCrDateGmt7(executedAt: string): Dayjs {
  return dayjs.utc(executedAt).tz("Asia/Ho_Chi_Minh").startOf("day");
}

// window [from,to] dang "YYYY-MM-DD" de goi GET /qos/{cell}?from=&to= - dung DUNG 7 ngay truoc + ngay CR +
// 7 ngay sau theo yeu cau Buoc 1 (BE moi ho tro from/to tu 22072026, xem comment QosHistoryQueryParams)
export function resolveQosWindow(crDateGmt7: Dayjs): { from: string; to: string } {
  return {
    from: crDateGmt7.subtract(7, "day").format("YYYY-MM-DD"),
    to: crDateGmt7.add(7, "day").format("YYYY-MM-DD"),
  };
}

function resolveGroup(offset: number): DayGroup {
  if (offset < 0) return "before";
  if (offset === 0) return "cr_day";
  return "after";
}

// gop 15 ngay (-7..+7 quanh ngay CR) voi du lieu QoS that tra ve tu BE, roi tinh trung binh truoc/sau +
// ket luan DAT/KHONG DAT - dung CHUNG cho chart 1 cell (Buoc 1-3) va bang toan bo cell (Buoc 4)
export function buildQosEvaluation(crDateGmt7: Dayjs, points: QosHistoryPoint[]): QosEvalResult {
  // gop du lieu that theo khoa ngay "DD/MM/YYYY" GMT+7 - lay 10 ky tu dau cua formatDateTime (dang
  // "DD/MM/YYYY HH:mm:ss") de dung CHUNG 1 nguon convert UTC->GMT+7 voi phan sinh truc ngay ben duoi
  const byDateKey = new Map<string, number>();
  points.forEach((p) => {
    byDateKey.set(formatDateTime(p.time).slice(0, 10), p.qos);
  });

  const chartData: QosEvalChartPoint[] = [];
  for (let offset = -7; offset <= 7; offset += 1) {
    const d = crDateGmt7.add(offset, "day");
    const dateKey = d.format("DD/MM/YYYY");
    const group = resolveGroup(offset);
    chartData.push({
      dateKey,
      label: group === "cr_day" ? `${d.format("DD/MM")} (CR)` : d.format("DD/MM"),
      qos: byDateKey.has(dateKey) ? (byDateKey.get(dateKey) as number) : null,
      group,
    });
  }

  const beforeValues = chartData
    .filter((p) => p.group === "before" && p.qos !== null)
    .map((p) => p.qos as number);
  const afterValues = chartData.filter((p) => p.group === "after" && p.qos !== null).map((p) => p.qos as number);

  // CHI ket luan DUOC khi ca 2 dieu kien: (1) cua so 7 ngay SAU CR da troi qua HOAN TOAN theo lich (neu
  // con ngay tuong lai chua toi thi KHONG THE co du lieu that cho cac ngay do, ket luan som se sai), VA
  // (2) co it nhat 1 ngay du lieu THAT o CA 2 phia truoc/sau (CTS co the thieu ngay - da xac nhan nhieu
  // lan qua goi that o Phan 2). Thieu 1 trong 2 -> "Chua du du lieu", KHONG ket luan DAT/KHONG DAT (Buoc 3)
  const todayGmt7 = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
  const windowFullyElapsed = todayGmt7.diff(crDateGmt7.add(7, "day"), "day") >= 0;
  const hasEnoughData = windowFullyElapsed && beforeValues.length > 0 && afterValues.length > 0;

  if (!hasEnoughData) {
    return { avgBefore: null, avgAfter: null, diff: null, verdict: "INSUFFICIENT", chartData };
  }

  const avgBefore = beforeValues.reduce((sum, v) => sum + v, 0) / beforeValues.length;
  const avgAfter = afterValues.reduce((sum, v) => sum + v, 0) / afterValues.length;
  const diff = avgBefore - avgAfter;

  return {
    avgBefore,
    avgAfter,
    diff,
    verdict: diff < QOS_EVAL_THRESHOLD ? "PASS" : "FAIL",
    chartData,
  };
}

// 1 dong ket qua danh gia cho 1 cell - dung cho bang toan bo affected_cells (Buoc 4)
export interface CellEvalRow {
  cell_name: string;
  tram_id: string | null;
  avgBefore: number | null;
  avgAfter: number | null;
  diff: number | null;
  verdict: QosEvalVerdict;
}

// gioi han 5 request DONG THOI/lan (Buoc 4 luu y) - tranh ban het 47 request len BE/CTS gateway cung 1 luc
// gay qua tai hoac bi CDS/CTS chan (rate limit), ma van nhanh hon goi tuan tu tung cell 1 (47 lan doi noi tiep)
const EVAL_CONCURRENCY = 5;

// tinh danh gia QoS cho TOAN BO affected_cells cua 1 session - goi /qos/{cell}?from=&to= THEO TUNG NHOM
// EVAL_CONCURRENCY cell 1 luc (Promise.all trong 1 nhom, cac nhom chay TUAN TU), goi onProgress sau MOI
// nhom de UI hien tien do "da xong X/47" thay vi doi den khi xong het moi thay ket qua
export async function evaluateAllAffectedCells(
  cells: SessionAffectedCellItem[],
  crDateGmt7: Dayjs,
  window: { from: string; to: string },
  onProgress: (done: number, total: number) => void
): Promise<CellEvalRow[]> {
  const rows: CellEvalRow[] = [];
  for (let i = 0; i < cells.length; i += EVAL_CONCURRENCY) {
    const batch = cells.slice(i, i + EVAL_CONCURRENCY);
    // eslint-disable-next-line no-await-in-loop -- CO Y doi tuan tu giua cac nhom (Promise.all trong nhom,
    // nhung nhom voi nhom phai noi tiep) de gioi han dung so luong request dong thoi toi da, khong the
    // Promise.all() TOAN BO 47 cell cung luc (se pha vo chinh muc dich gioi han concurrency)
    const batchRows = await Promise.all(
      batch.map(async (cell): Promise<CellEvalRow> => {
        try {
          const history = await getQosHistory(cell.cell_name, window);
          const evalResult = buildQosEvaluation(crDateGmt7, history.data);
          return {
            cell_name: cell.cell_name,
            tram_id: cell.tram_id,
            avgBefore: evalResult.avgBefore,
            avgAfter: evalResult.avgAfter,
            diff: evalResult.diff,
            verdict: evalResult.verdict,
          };
        } catch {
          // 1 cell loi (vd CDS/CTS timeout rieng cell do) KHONG duoc lam hong ca danh sach - danh dau
          // "Chua du du lieu" (INSUFFICIENT) thay vi de Promise.all() reject va mat toan bo ket qua da co
          return {
            cell_name: cell.cell_name,
            tram_id: cell.tram_id,
            avgBefore: null,
            avgAfter: null,
            diff: null,
            verdict: "INSUFFICIENT",
          };
        }
      })
    );
    rows.push(...batchRows);
    onProgress(rows.length, cells.length);
  }
  return rows;
}
