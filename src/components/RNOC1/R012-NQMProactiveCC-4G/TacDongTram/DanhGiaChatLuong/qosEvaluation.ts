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


export type DayGroup = "before" | "cr_day" | "after";

export interface QosEvalChartPoint {
  dateKey: string; // "DD/MM/YYYY" GMT+7 - dung de gop du lieu that, khong hien truc tiep
  label: string; // "DD/MM" hien tren truc X (rieng ngay CR co them hau to "(CR)")
  qos: number | null; // null nghia la CHUA co du lieu ngay do - GIU LAI de cot do hien RONG
  group: DayGroup;
}

// ket luan DUY NHAT (khong con tach 2 tieu chi): PASS="DAT", FAIL="KHONG DAT", INSUFFICIENT="Chua du du lieu"
// KHONG CON truong "conclusion" (05092026). Ket luan DAT/KHONG DAT gio CHI do BE quyet dinh va tra ve
// qua /qos-cells, /qoe-cells. File nay chi con lam VIEC TINH THUAN TUY (trung binh, chenh lech, gom 15
// ngay theo nhom) - khong con hang so nghiep vu nao.
//
// VI SAO BO: FE tung tu tinh ket luan bang ban sao nguong, va ban sao do da TROI KHOI BE 3 LAN. Lan cuoi
// (BE doi 0.2 -> 0.5 va them san 3.0) se lam chart hien "DAT" ngay canh bang hien "KHONG DAT" cho CUNG
// mot cell, trong CUNG mot modal. Bo han cho FE tu ket luan la cach duy nhat khong bao gio troi lai.
export interface QosEvalResult {
  // avgBefore/avgAfter tinh tu so ngay THUC TE co data - day la PHEP TINH, khong phai luat nghiep vu,
  // nen giu lai o FE duoc. null CHI khi hoan toan 0 ngay co data.
  avgBefore: number | null;
  avgAfter: number | null;
  diff: number | null; // avgBefore - avgAfter, null neu avgBefore hoac avgAfter la null
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

  return { avgBefore, avgAfter, diff, chartData };
}
