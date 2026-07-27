// logic tinh toan THUAN (khong JSX) dung CHUNG boi QosEvaluationChart.tsx (1 cell dang chon) va
// QosEvaluationTable.tsx (toan bo affected_cells) - ca 2 noi deu can CUNG 1 cach gop 15 ngay quanh ngay CR
// + tinh 2 tieu chi danh gia RIENG BIET (Viec 4), tach rieng de KHONG viet lai 2 lan
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

// SUA (Viec 4, 22072026, xac nhan voi user): thay quy tac danh gia CU (1 tieu chi diff<0.2) bang 2 TIEU
// CHI DOC LAP - moi tieu chi tra loi 1 cau hoi KHAC NHAU, KHONG gop chung thanh 1 ket luan duy nhat nua:
// - TIEU CHI 1 (Ket luan DAT/KHONG DAT): dua tren SO NGAY QoS KEM trong 7 ngay SAU CR - tra loi cau hoi
//   "chat luong SAU CR co on dinh khong", KHONG so sanh voi truoc CR
// - TIEU CHI 2 (Can xu ly): dua tren CHENH LECH trung binh truoc/sau - tra loi cau hoi "CR co lam QoS tut
//   nhieu so voi truoc khong", KHONG lien quan so ngay kem lien tuc

// QoS <= nguong nay coi la 1 ngay "chat luong kem" (thang diem QoS 1-5, xem YAxis domain o cac chart)
export const QOS_BAD_DAY_THRESHOLD = 3;
// >= 4/7 ngay kem trong 7 ngay SAU CR (qua nua) -> suy giam ro ret -> KHONG DAT (Tieu chi 1)
export const QOS_BAD_DAYS_FAIL_THRESHOLD = 4;
// chenh lech (TB truoc - TB sau) > nguong nay -> QoS tut nhieu so voi truoc CR -> CAN XU LY (Tieu chi 2).
// LUU Y: KHONG lay tri tuyet doi - QoS sau CR CAO HON truoc (cai thien, diem am) luon <= nguong -> KHONG can xu ly
export const QOS_DIFF_ACTION_THRESHOLD = 0.2;

export type DayGroup = "before" | "cr_day" | "after";

export interface QosEvalChartPoint {
  dateKey: string; // "DD/MM/YYYY" GMT+7 - dung de gop du lieu that, khong hien truc tiep
  label: string; // "DD/MM" hien tren truc X (rieng ngay CR co them hau to "(CR)")
  qos: number | null; // null nghia la CHUA co du lieu ngay do - GIU LAI de cot do hien RONG
  group: DayGroup;
}

// TIEU CHI 1 - ket luan chat luong SAU CR: PASS="DAT", FAIL="KHONG DAT", INSUFFICIENT="Chua du du lieu"
export type QosConclusion = "PASS" | "FAIL" | "INSUFFICIENT";
// TIEU CHI 2 - co can can thiep them khong: YES="Can xu ly", NO="Khong can xu ly", INSUFFICIENT="Chua du du lieu"
export type QosActionNeeded = "YES" | "NO" | "INSUFFICIENT";

export interface QosEvalResult {
  // FIX (Viec 3): avgBefore CHI phu thuoc du lieu 7 ngay TRUOC CR (da la qua khu, luon san sang) - null CHI
  // khi CTS hoan toan KHONG co diem nao trong 7 ngay do, KHONG con phu thuoc gi vao du lieu SAU CR nua
  avgBefore: number | null;
  avgAfter: number | null; // null neu INSUFFICIENT rieng cho Tieu chi 2 (chua du 7 ngay sau CR troi qua/co du lieu)
  diff: number | null; // avgBefore - avgAfter, null neu INSUFFICIENT rieng cho Tieu chi 2
  badDaysAfter: number | null; // so ngay QoS<=3 trong 7 ngay SAU CR, null neu INSUFFICIENT rieng cho Tieu chi 1
  conclusion: QosConclusion; // TIEU CHI 1 - DOC LAP voi actionNeeded
  actionNeeded: QosActionNeeded; // TIEU CHI 2 - DOC LAP voi conclusion
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

// gop 15 ngay (-7..+7 quanh ngay CR) voi du lieu QoS that tra ve tu BE, roi tinh 2 tieu chi DOC LAP (Viec 4)
// - dung CHUNG cho chart 1 cell (QosEvaluationChart) va bang toan bo cell (QosEvaluationTable)
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

  // FIX (Viec 3 Buoc 0/1, 23072026 - dieu tra tu session that #553 tram 112721): TB truoc TRUOC DAY bi ep
  // phai cho CA du lieu SAU CR moi tinh (hasEnoughDataForAction doi ca beforeValues VA afterValues, xem
  // git blame ban cu), nen 1 CR VUA chay xong (chua qua 7 ngay) LUON hien "-" cho TB truoc DU CTS DA CO DU
  // DATA 7 ngay truoc that (da verify goi that /qos/{cell}?from=2026-07-15&to=2026-07-21 tra ve 4 diem that
  // cho cell cua session #553). TB truoc la du lieu HOAN TOAN QUA KHU (tinh tu executed_at tro ve truoc),
  // KHONG phu thuoc gi vao viec 7 ngay SAU da troi qua hay chua - phai tach tinh RIENG, hien NGAY khi co
  // >=1 ngay du lieu truoc, khong cho tieu chi nao khac
  const avgBefore = beforeValues.length > 0 ? beforeValues.reduce((sum, v) => sum + v, 0) / beforeValues.length : null;

  // dieu kien rieng cho phan con lai (Tieu chi 1 + avgAfter/diff cua Tieu chi 2): cua so 7 ngay SAU CR
  // phai da troi qua HOAN TOAN theo lich - neu con ngay tuong lai chua toi thi KHONG THE co du lieu that
  // cho cac ngay do, ket luan som se sai. Khac voi avgBefore o tren, day CHI ap dung cho phan lien quan sau CR
  const todayGmt7 = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
  const windowFullyElapsed = todayGmt7.diff(crDateGmt7.add(7, "day"), "day") >= 0;

  // TIEU CHI 1 (Ket luan DAT/KHONG DAT) - CHI phu thuoc du lieu SAU CR, KHONG lien quan du lieu TRUOC CR
  // (hoan toan doc lap voi Tieu chi 2 ben duoi, dung theo yeu cau "RIENG BIET")
  const hasEnoughDataForConclusion = windowFullyElapsed && afterValues.length > 0;
  let conclusion: QosConclusion = "INSUFFICIENT";
  let badDaysAfter: number | null = null;
  if (hasEnoughDataForConclusion) {
    badDaysAfter = afterValues.filter((v) => v <= QOS_BAD_DAY_THRESHOLD).length;
    // >=4/7 ngay QoS kem (<=3 diem) trong 7 ngay sau CR = suy giam ro ret -> KHONG DAT
    conclusion = badDaysAfter >= QOS_BAD_DAYS_FAIL_THRESHOLD ? "FAIL" : "PASS";
  }

  // TIEU CHI 2 (Can xu ly) - avgAfter/diff/actionNeeded van can CA avgBefore (da tinh o tren) VA 7 ngay sau
  // da troi qua het + co du lieu that, GIU RIENG voi Tieu chi 1 nhu truoc, nhung KHONG con lam tre avgBefore
  const hasEnoughDataForAction = windowFullyElapsed && avgBefore !== null && afterValues.length > 0;
  let actionNeeded: QosActionNeeded = "INSUFFICIENT";
  let avgAfter: number | null = null;
  let diff: number | null = null;
  if (hasEnoughDataForAction) {
    avgAfter = afterValues.reduce((sum, v) => sum + v, 0) / afterValues.length;
    diff = (avgBefore as number) - avgAfter;
    // chenh lech > 0.2 = QoS tut nhieu so voi truoc CR -> can can thiep them
    actionNeeded = diff > QOS_DIFF_ACTION_THRESHOLD ? "YES" : "NO";
  }

  return { avgBefore, avgAfter, diff, badDaysAfter, conclusion, actionNeeded, chartData };
}

// 1 dong ket qua danh gia cho 1 cell - dung cho bang toan bo affected_cells (QosEvaluationTable)
export interface CellEvalRow {
  cell_name: string;
  tram_id: string | null;
  avgBefore: number | null;
  avgAfter: number | null;
  diff: number | null;
  badDaysAfter: number | null;
  conclusion: QosConclusion;
  actionNeeded: QosActionNeeded;
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
            badDaysAfter: evalResult.badDaysAfter,
            conclusion: evalResult.conclusion,
            actionNeeded: evalResult.actionNeeded,
          };
        } catch {
          // 1 cell loi (vd CDS/CTS timeout rieng cell do) KHONG duoc lam hong ca danh sach - danh dau
          // "Chua du du lieu" (INSUFFICIENT) ca 2 tieu chi, thay vi de Promise.all() reject va mat toan bo
          // ket qua da co
          return {
            cell_name: cell.cell_name,
            tram_id: cell.tram_id,
            avgBefore: null,
            avgAfter: null,
            diff: null,
            badDaysAfter: null,
            conclusion: "INSUFFICIENT",
            actionNeeded: "INSUFFICIENT",
          };
        }
      })
    );
    rows.push(...batchRows);
    onProgress(rows.length, cells.length);
  }
  return rows;
}
