import React, { useMemo, useState } from "react";
import { Select, Spin, Alert, Empty } from "antd";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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

// SUA (Viec 1, 22072026, xac nhan voi user): preview la XEM TRUOC KHI CR chay - "ngay CR" (gia dinh = hom
// nay) va cac ngay SAU deu CHUA CO du lieu that (CR chua xay ra), ve them cac cot do chi ra cot rong vo
// nghia. BO 8 ngay (2 truoc+CR+5 sau) + 3 mau, THAY BANG DUNG 7 NGAY TRUOC hom nay - cho NOC thay ro xu
// huong QoS HIEN TAI cua cell truoc khi quyet dinh trigger CR
const QOS_DISPLAY_DAYS = 7;

interface CellQosHistoryChartProps {
  previewData: PreviewCrResponse;
}

interface CellOption {
  cell_name: string;
  tram_id: string; // ma tram cha - hien kem trong dropdown de NOC phan biet khi trung ten cell (hiem nhung co the)
}

interface QosChartPoint {
  dateKey: string; // "DD/MM/YYYY" theo GMT+7 - dung de gop du lieu that vao dung ngay, khong hien truc tiep
  label: string; // "DD/MM" hien tren truc X
  qos: number | null; // null nghia la CHUA co du lieu ngay do (CTS thieu ngay) - GIU LAI diem null de cot do
  // hien RONG, khong bo qua ngay (giu truc X du 7 ngay lien tiep)
}

// window [hom nay-7, hom nay-1] (Viec 1) - "hom nay" la ngay du kien CR (preview, CHUA trigger that), nen
// CHI lay 7 ngay TRUOC do, KHONG lay den "hom nay" (ngay CR gia dinh chua co du lieu, lay vao se ra cot rong
// vo nghia dung nhu ly do doi cua Viec 1)
function resolveQosWindow(): { from: string; to: string } {
  const todayGmt7 = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
  return {
    from: todayGmt7.subtract(QOS_DISPLAY_DAYS, "day").format("YYYY-MM-DD"),
    to: todayGmt7.subtract(1, "day").format("YYYY-MM-DD"),
  };
}

// gop 7 ngay TRUOC hom nay voi du lieu QoS that tra ve tu BE (qua from/to, KHONG con dung "days" neo vao
// "hom qua" nhu ban cu - 2 cach nay thuc ra cho CUNG 1 window nhung dung from/to de RO RANG y do "7 ngay
// truoc ngay du kien CR", khop dung ten bien/comment voi Viec 1)
function buildQosChartData(points: QosHistoryPoint[]): QosChartPoint[] {
  // gop du lieu that theo khoa ngay "DD/MM/YYYY" GMT+7 - lay 10 ky tu dau cua formatDateTime (dang
  // "DD/MM/YYYY HH:mm:ss") de dung CHUNG 1 nguon convert UTC->GMT+7 voi phan sinh truc ngay ben duoi
  const byDateKey = new Map<string, number>();
  points.forEach((p) => {
    byDateKey.set(formatDateTime(p.time).slice(0, 10), p.qos);
  });

  const todayGmt7 = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
  const result: QosChartPoint[] = [];
  // offset -7..-1 (7 ngay truoc hom nay, KHONG bao gom hom nay - xem resolveQosWindow)
  for (let offset = QOS_DISPLAY_DAYS; offset >= 1; offset -= 1) {
    const d = todayGmt7.subtract(offset, "day");
    const dateKey = d.format("DD/MM/YYYY");
    result.push({
      dateKey,
      label: d.format("DD/MM"),
      qos: byDateKey.has(dateKey) ? (byDateKey.get(dateKey) as number) : null,
    });
  }
  return result;
}

// chart QoS 7 ngay GAN NHAT (truoc ngay du kien trigger CR) cho 1 cell bi anh huong trong preview - Viec 1.
// Component nay CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API preview),
// chi tu goi rieng API lich su QoS (qua useQosHistory) khi NOC chon 1 cell tu dropdown
const CellQosHistoryChart: React.FC<CellQosHistoryChartProps> = ({ previewData }) => {
  // dropdown lay THANG tu cells_bi_anh_huong (TOAN BO cell bi anh huong trong preview - xem types/index.ts).
  // Dung Set loc trung theo cell_name phong truong hop trung ten
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

  // window tinh 1 LAN moi lan render (khong doi theo cell dang chon) - dung {from,to} (Gap 1 BE) thay vi
  // {days} de neo DUNG "hom nay-7 -> hom nay-1", KHONG phu thuoc dinh nghia "days neo vao hom qua" cua BE
  const { from, to } = useMemo(() => resolveQosWindow(), []);

  const { data, isLoading, isError, error } = useQosHistory(selectedCell, { from, to });

  const chartData = useMemo(() => (data ? buildQosChartData(data.data) : []), [data]);

  const hasAnyData = chartData.some((p) => p.qos !== null);

  return (
    <div>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>Chart QoS 7 ngay gan nhat</h4>

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
          description={`Chua co du lieu QoS cho ${selectedCell} trong 7 ngay gan day`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {selectedCell !== null && !isLoading && !isError && hasAnyData && (
        <ResponsiveContainer width="100%" height={280}>
          {/* Viec 3: ve dep hon - barCategoryGap chua khoang cach vua phai giua cac cot (khong dinh nhau),
              grid nhe mau xam nhat (tableBorder) thay vi mau xam mac dinh cua Recharts qua dam */}
          <BarChart data={chartData} barCategoryGap="24%">
            <CartesianGrid strokeDasharray="3 3" stroke={R012_COLORS.tableBorder} vertical={false} />
            {/* tickLine/axisLine tat (false) cho truc gon, chi giu label - nhin bot roi hon truc mac dinh cua Recharts */}
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: R012_COLORS.tableBorder }} />
            {/* domain co dinh [0,5] theo dung thang diem QoS (yeu cau nghiep vu) */}
            <YAxis domain={[0, 5]} allowDecimals tickLine={false} axisLine={{ stroke: R012_COLORS.tableBorder }} />
            <Tooltip
              formatter={(value: number | null) => [value === null ? "Chua co du lieu" : `${value} diem`, "QoS"]}
              // cursor: highlight nhe khi hover (mac dinh Recharts la xam dam qua tuong phan) - dung lai
              // primaryPale (rat nhat) de hover khong lan at mau cot that
              cursor={{ fill: R012_COLORS.primaryPale }}
            />
            {/* Ngay chua co du lieu (qos=null) -> Recharts KHONG ve shape cho cot do (cot rong), khong can
                xu ly gi them ngoai viec giu gia tri null trong du lieu.
                Viec 1: chi con 1 mau THONG NHAT (khong con nhom truoc/CR/sau) - dung chartPreview (xanh
                duong trung binh trong thang do dam cua theme.ts, xem ly do chon token trong theme.ts).
                radius: bo goc TREN cot cho mem mai hon cot vuong mac dinh cua Recharts (Viec 3) */}
            <Bar dataKey="qos" fill={R012_COLORS.chartPreview} radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CellQosHistoryChart;
