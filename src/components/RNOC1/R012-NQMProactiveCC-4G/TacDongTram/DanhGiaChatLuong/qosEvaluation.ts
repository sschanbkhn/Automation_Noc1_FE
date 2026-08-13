// logic tinh toan THUAN (khong JSX) dung CHUNG boi QosEvaluationChart.tsx (1 cell dang chon) va
// QosEvaluationTable.tsx (toan bo affected_cells) - ca 2 noi deu can CUNG 1 cach gop 15 ngay quanh ngay CR
// + tinh 1 TIEU CHI DANH GIA DUY NHAT (khop BE), tach rieng de KHONG viet lai 2 lan
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

// SUA (yeu cau truc tiep user, BE da doi HOAN TOAN tieu chi danh gia - xem
// application/xuat_phieu_use_case.py + domain/services/evaluation_service.py phia BE) - BO 2 TIEU CHI DOC
// LAP truoc day (Viec 4, 22072026: dem ngay QoS kem cho "Ket luan" + chenh lech rieng cho "Can xu ly"),
// GOP LAI thanh 1 TIEU CHI DUY NHAT khop dung BE: chenh lech TB QoS 7 ngay truoc/sau CR. "Can xu ly" KHONG
// con ton tai rieng - chenh lech GIO CHINH LA "Ket luan".

// chenh lech (TB truoc - TB sau) <= nguong nay -> DAT, > nguong -> KHONG DAT. Khop
// EvaluationService._XUAT_PHIEU_QOS_THRESHOLD_DELTA=-0.2 phia BE (avg_after-avg_before>=-0.2 tuong duong
// TB truoc-TB sau<=0.2 - cung 1 dieu kien, chi doi dau de doc tu nhien hon ("chenh lech" duong = giam).
export const QOS_DIFF_CONCLUSION_THRESHOLD = 0.2;
// so ngay CO DATA toi thieu MOI PHIA (truoc VA sau CR, DOC LAP) de du tin cay ket luan - khop
// MIN_DAYS_REQUIRED=5 phia BE (domain/services/evaluation_service.py). Thieu 1 trong 2 phia -> INSUFFICIENT,
// KHONG con dua vao "windowFullyElapsed" (da bo - so ngay thuc te <5 tu nhien da bao gom truong hop cua so
// chua troi qua het, khong can co rieng nua).
export const QOS_MIN_DAYS_REQUIRED = 5;

export type DayGroup = "before" | "cr_day" | "after";

export interface QosEvalChartPoint {
  dateKey: string; // "DD/MM/YYYY" GMT+7 - dung de gop du lieu that, khong hien truc tiep
  label: string; // "DD/MM" hien tren truc X (rieng ngay CR co them hau to "(CR)")
  qos: number | null; // null nghia la CHUA co du lieu ngay do - GIU LAI de cot do hien RONG
  group: DayGroup;
}

// ket luan DUY NHAT (khong con tach 2 tieu chi): PASS="DAT", FAIL="KHONG DAT", INSUFFICIENT="Chua du du lieu"
export type QosConclusion = "PASS" | "FAIL" | "INSUFFICIENT";

export interface QosEvalResult {
  // avgBefore/avgAfter LUON duoc tinh tu so ngay THUC TE co data (kem ca khi < QOS_MIN_DAYS_REQUIRED) -
  // khop cach BE lam (EvaluationService.evaluate(): "avg tinh TRUOC, roi moi check nguong" de van co gia
  // tri tham khao ke ca khi INSUFFICIENT). null CHI khi hoan toan 0 ngay co data.
  avgBefore: number | null;
  avgAfter: number | null;
  diff: number | null; // avgBefore - avgAfter, null neu avgBefore hoac avgAfter la null
  conclusion: QosConclusion; // DAT/KHONG DAT theo diff, hoac INSUFFICIENT neu thieu du lieu 1 trong 2 phia
  chartData: QosEvalChartPoint[];
}

// tinh "ngay CR" theo GMT+7 tu executed_at (ISO string BE tra ve, co the co hoac khong co hau to "Z" -
// xem ly do trong formatDateTime.ts) - dung dayjs.utc().tz() DUNG 1 cach nhat quan, KHONG tu doan gio theo
// TZ trinh duyet
export function resolveCrDateGmt7(executedAt: string): Dayjs {
  return dayjs.utc(executedAt).tz("Asia/Ho_Chi_Minh").startOf("day");
}

// window [from,to] dang "YYYY-MM-DD" de goi GET /qos/{cell}?from=&to= - dung DUNG 7 ngay truoc + ngay CR +
// 7 ngay sau (chart 15 ngay giu nguyen theo Viec 4, CHI doi phan tinh ket qua ben duoi)
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

// gop 15 ngay (-7..+7 quanh ngay CR) voi du lieu QoS that tra ve tu BE, roi tinh 1 tieu chi danh gia DUY
// NHAT (khop BE) - dung CHUNG cho chart 1 cell (QosEvaluationChart) va bang toan bo cell (QosEvaluationTable)
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

  // avg tinh TRUOC theo so ngay THUC TE co data (KHONG chia co dinh 7) - khop cong thuc BE
  // (BUSINESS_RULES.md SS8.2/domain/services/evaluation_service.py), roi moi check nguong ben duoi. Null
  // CHI khi hoan toan 0 ngay co data - van hien duoc cho NOC tham khao ke ca khi conclusion=INSUFFICIENT.
  const avgBefore = beforeValues.length > 0 ? beforeValues.reduce((sum, v) => sum + v, 0) / beforeValues.length : null;
  const avgAfter = afterValues.length > 0 ? afterValues.reduce((sum, v) => sum + v, 0) / afterValues.length : null;
  const diff = avgBefore !== null && avgAfter !== null ? avgBefore - avgAfter : null;

  // TU GIA DINH khop dung BE (application/xuat_phieu_use_case.py comment TU GIA DINH tuong tu) - "chua du
  // du lieu" nghia la CHUA DU >=5/7 NGAY moi phia, KHONG phai doi hoi CHINH XAC ca 7/7 (CTS thuong xuyen
  // thieu vai ngay, "missing day la binh thuong" - xem API_CONTRACTS.md SS2 phia BE). Kiem tra DOC LAP tren
  // so ngay THUC TE (beforeValues.length/afterValues.length), KHONG con "windowFullyElapsed" rieng nhu ban
  // cu - cua so chua troi qua het tu nhien se cho so ngay thuc te <5 (CTS khong the co du lieu ngay tuong
  // lai), nen 1 dieu kien nay la DU, don gian hoa dung huong "no over-engineering".
  const conclusion: QosConclusion =
    beforeValues.length >= QOS_MIN_DAYS_REQUIRED && afterValues.length >= QOS_MIN_DAYS_REQUIRED
      ? (diff as number) <= QOS_DIFF_CONCLUSION_THRESHOLD
        ? "PASS"
        : "FAIL"
      : "INSUFFICIENT";

  return { avgBefore, avgAfter, diff, conclusion, chartData };
}

// 1 dong ket qua danh gia cho 1 cell - dung cho bang toan bo affected_cells (QosEvaluationTable)
export interface CellEvalRow {
  cell_name: string;
  tram_id: string | null;
  avgBefore: number | null;
  avgAfter: number | null;
  diff: number | null;
  conclusion: QosConclusion;
}

// gioi han 5 request DONG THOI/lan - tranh ban het 47 request len BE/CTS gateway cung 1 luc gay qua tai
// hoac bi CDS/CTS chan (rate limit), ma van nhanh hon goi tuan tu tung cell 1 (47 lan doi noi tiep)
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
            conclusion: evalResult.conclusion,
          };
        } catch {
          // 1 cell loi (vd CDS/CTS timeout rieng cell do) KHONG duoc lam hong ca danh sach - danh dau
          // "Chua du du lieu" (INSUFFICIENT), thay vi de Promise.all() reject va mat toan bo ket qua da co
          return {
            cell_name: cell.cell_name,
            tram_id: cell.tram_id,
            avgBefore: null,
            avgAfter: null,
            diff: null,
            conclusion: "INSUFFICIENT",
          };
        }
      })
    );
    rows.push(...batchRows);
    onProgress(rows.length, cells.length);
  }
  return rows;
}
