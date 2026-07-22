import React, { useMemo, useState } from "react";
import { Select, Spin, Alert, Empty } from "antd";
import { Bar, BarChart, Cell as RechartsCell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useQosHistory } from "../../hooks/useQosHistory";
import { PreviewCrResponse, QosHistoryPoint } from "../../types";
import { R012_COLORS } from "../../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7, khong phu thuoc TZ trinh duyet) - dung DUNG
// helper nay de convert timestamp that tu BE, KHONG tu viet lai logic UTC->GMT+7 lan 2 (xem ly do trong
// file helper: BE tra field khong dong nhat co/khong co hau to "Z")
import { formatDateTime } from "../../helpers/formatDateTime";

// tu extend lai plugin ngay trong file nay (KHONG dua vao side-effect import formatDateTime.ts da extend san)
// de file nay tu chu, khong phu thuoc thu tu import - dayjs.extend goi lai nhieu lan van an toan (idempotent)
dayjs.extend(utc);
dayjs.extend(timezone);

// so ngay GUI LEN BE khi goi GET /qos/{cell_name}?days=N - DA XAC NHAN qua goi that (curl): gia tri 1/3/7
// deu cho KET QUA GIONG HET NHAU tren du lieu test hien co (BE co ve chi loc theo N ngay GAN NHAT tu "now",
// khong lien quan gi den 8 ngay HIEN THI ben duoi) - giu 7 (gia tri da test on dinh) de co du bien do, code
// hien thi tu loc lai theo dung 8 ngay can qua QOS_DISPLAY_OFFSETS, KHONG phu thuoc gia tri nay phai khop chinh xac
const QOS_QUERY_DAYS = 7;

// hien 8 ngay: 2 ngay TRUOC ngay CR (-2,-1) + NGAY CR (0) + 5 ngay SAU (1..5) - dung DUNG so ngay yeu cau
// nghiep vu (Buoc 2b). Day la OFFSET tinh theo ngay lich (KHONG phai so ngay goi BE o tren)
const QOS_DISPLAY_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5];

type DayGroup = "before" | "cr_day" | "after";

const GROUP_COLOR: Record<DayGroup, string> = {
  before: R012_COLORS.chartBeforeCr,
  cr_day: R012_COLORS.chartCrDay,
  after: R012_COLORS.chartAfterCr,
};

const GROUP_LABEL: Record<DayGroup, string> = {
  before: "Truoc CR",
  cr_day: "Ngay CR (du kien)",
  after: "Sau CR",
};

function resolveGroup(offset: number): DayGroup {
  if (offset < 0) return "before";
  if (offset === 0) return "cr_day";
  return "after";
}

interface CellQosHistoryChartProps {
  previewData: PreviewCrResponse;
}

interface CellOption {
  cell_name: string;
  tram_id: string; // ma tram cha - hien kem trong dropdown de NOC phan biet khi trung ten cell (hiem nhung co the)
}

interface QosChartPoint {
  dateKey: string; // "DD/MM/YYYY" theo GMT+7 - dung de gop du lieu that vao dung ngay, khong hien truc tiep
  label: string; // "DD/MM" hien tren truc X (rieng ngay CR co them hau to "(CR)")
  qos: number | null; // null nghia la CHUA co du lieu ngay do (CTS chua co, hoac la ngay TUONG LAI chua toi -
  // xem comment buildQosChartData) - GIU LAI diem null de cot do hien RONG (Buoc 2b), khong bo qua ngay
  group: DayGroup;
}

// GIA DINH QUAN TRONG (Buoc 2b): day la man hinh PREVIEW, tuc XEM TRUOC KHI CR thuc su duoc trigger - CHUA
// he co executed_at/session that nao de lam moc "ngay CR" nhu QoeQosCharts.tsx (component do dung cho session
// DA chay xong). Vi vay o day GIA DINH "ngay CR" = HOM NAY (ngay NOC dang xem preview, cung la ngay du kien
// se bam trigger) - day CHI LA GIA DINH de co truc thoi gian hien thi, KHONG PHAI ngay CR that (co the NOC
// xem preview hom nay nhung vai ngay sau moi thuc su trigger)
function buildQosChartData(points: QosHistoryPoint[]): QosChartPoint[] {
  // gop du lieu that theo khoa ngay "DD/MM/YYYY" GMT+7 - lay 10 ky tu dau cua formatDateTime (dang
  // "DD/MM/YYYY HH:mm:ss") de dung CHUNG 1 nguon convert UTC->GMT+7 voi phan sinh truc ngay ben duoi
  const byDateKey = new Map<string, number>();
  points.forEach((p) => {
    byDateKey.set(formatDateTime(p.time).slice(0, 10), p.qos);
  });

  const todayGmt7 = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");

  return QOS_DISPLAY_OFFSETS.map((offset) => {
    const d = todayGmt7.add(offset, "day");
    const dateKey = d.format("DD/MM/YYYY");
    const group = resolveGroup(offset);
    return {
      dateKey,
      label: group === "cr_day" ? `${d.format("DD/MM")} (CR)` : d.format("DD/MM"),
      // 5 ngay SAU ngay CR la ngay TUONG LAI (chua toi) - CHAC CHAN se khong co du lieu that (BE khong the
      // co QoS cua ngay chua xay ra), nen cac cot nay se LUON rong cho toi khi NOC thuc su quay lai xem sau
      // khi CR da chay - DAY LA HANH VI DUNG, khong phai loi thieu du lieu
      qos: byDateKey.has(dateKey) ? (byDateKey.get(dateKey) as number) : null,
      group,
    };
  });
}

// chart QoS 8 ngay (2 truoc + ngay CR + 5 sau) cho 1 cell bi anh huong trong preview - Buoc 2 (Phan 2).
// Component nay CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API preview),
// chi tu goi rieng API lich su QoS (qua useQosHistory) khi NOC chon 1 cell tu dropdown
const CellQosHistoryChart: React.FC<CellQosHistoryChartProps> = ({ previewData }) => {
  // dropdown lay THANG tu cells_bi_anh_huong (Buoc 2d, DA XAC NHAN mang nay la TOAN BO cell bi anh huong
  // trong preview - xem types/index.ts). Dung Set loc trung theo cell_name phong truong hop trung ten
  const cellOptions: CellOption[] = useMemo(() => {
    const seen = new Set<string>();
    const options: CellOption[] = [];
    previewData.cells_bi_anh_huong.forEach((c) => {
      if (!seen.has(c.cell_name)) {
        seen.add(c.cell_name);
        options.push({ cell_name: c.cell_name, tram_id: c.tram_id });
      }
    });
    return options;
  }, [previewData]);

  // null nghia la chua chon cell nao - dropdown "1 cell/lan" nen chi can 1 state don, khong phai mang
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQosHistory(selectedCell, { days: QOS_QUERY_DAYS });

  const chartData = useMemo(() => (data ? buildQosChartData(data.data) : []), [data]);

  const hasAnyData = chartData.some((p) => p.qos !== null);

  return (
    <div>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>Chart QoS 8 ngay (2 truoc CR + ngay CR + 5 sau CR)</h4>

      {/* Buoc 2c: them label ro rang cho dropdown (truoc day chi co placeholder, chua co label rieng) */}
      <label htmlFor="r012-qos-cell-select" style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>
        Chon cell de xem QoS:
      </label>
      <Select
        id="r012-qos-cell-select"
        placeholder="Chon 1 cell de xem QoS lich su"
        style={{ width: 340, marginBottom: "1rem" }}
        value={selectedCell ?? undefined}
        onChange={(value: string) => setSelectedCell(value)}
        options={cellOptions.map((o) => ({
          value: o.cell_name,
          label: `${o.cell_name} (tram ${o.tram_id})`,
        }))}
        showSearch
        optionFilterProp="label"
      />

      {selectedCell === null && (
        <Empty description="Chon 1 cell o tren de xem chart QoS" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {selectedCell !== null && isLoading && <Spin tip={`Dang tai QoS cua ${selectedCell}...`} />}

      {selectedCell !== null && isError && (
        <Alert
          type="error"
          message="Khong tai duoc QoS"
          description={(error as Error)?.message || "Loi khong xac dinh"}
        />
      )}

      {selectedCell !== null && !isLoading && !isError && !hasAnyData && (
        <Empty
          description={`Chua co du lieu QoS cho ${selectedCell} trong khoang 8 ngay nay`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {selectedCell !== null && !isLoading && !isError && hasAnyData && (
        <>
          <ResponsiveContainer width="100%" height={280}>
            {/* BarChart (Buoc 2a) thay cho LineChart truoc day - moi cot la 1 ngay doc lap, hop ly hon LineChart
                vi 5/8 cot ben phai la ngay TUONG LAI CHUA CO du lieu (xem comment buildQosChartData), noi lien
                cac diem rieng le bang duong Line se de gay hieu lam la co xu huong lien tuc */}
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              {/* domain co dinh [0,5] theo dung thang diem QoS (yeu cau nghiep vu) */}
              <YAxis domain={[0, 5]} allowDecimals />
              <Tooltip
                formatter={(value: number | null) => [value === null ? "Chua co du lieu" : `${value} diem`, "QoS"]}
              />
              {/* Ngay chua co du lieu (qos=null) -> Recharts KHONG ve shape cho cot do (Buoc 2b "cot rong"),
                  khong can xu ly gi them ngoai viec giu gia tri null trong du lieu */}
              <Bar dataKey="qos">
                {chartData.map((entry) => (
                  <RechartsCell key={entry.dateKey} fill={GROUP_COLOR[entry.group]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* chu thich mau thu cong (Recharts Legend mac dinh chi hien theo dataKey, khong phan biet duoc
              mau rieng tung <Cell>) - dung DUNG 3 mau token trong theme.ts, giai thich ro cho NOC 3 nhom ngay */}
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.85rem" }}>
            {(Object.keys(GROUP_LABEL) as DayGroup[]).map((group) => (
              <div key={group} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    borderRadius: "2px",
                    backgroundColor: GROUP_COLOR[group],
                  }}
                />
                {GROUP_LABEL[group]}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CellQosHistoryChart;
