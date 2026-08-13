import React, { useMemo, useState } from "react";
import { Select, Spin, Alert, Empty, Tag } from "antd";
import { Bar, BarChart, Cell as RechartsCell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Dayjs } from "dayjs";
import { useQosHistory } from "../../hooks/useQosHistory";
import { SessionAffectedCellItem } from "../../types";
import { R012_COLORS } from "../../theme";
import { DayGroup, QosConclusion, buildQosEvaluation, resolveQosWindow } from "./qosEvaluation";

const GROUP_COLOR: Record<DayGroup, string> = {
  before: R012_COLORS.chartBeforeCr,
  cr_day: R012_COLORS.chartCrDay,
  after: R012_COLORS.chartAfterCr,
};

const GROUP_LABEL: Record<DayGroup, string> = {
  before: "Truoc CR",
  cr_day: "Ngay CR",
  after: "Sau CR",
};

// mau/nhan Tag cho Ket luan (DAT/KHONG DAT/Chua du du lieu) - dung DUNG 3 gia tri co the tra ve tu
// buildQosEvaluation() (type QosConclusion), khong bia them gia tri. SUA (yeu cau truc tiep user, khop
// tieu chi MOI phia BE) - BO "ACTION_DISPLAY" rieng (Tieu chi 2 "Can xu ly" cu), chi con 1 ket luan DUY NHAT.
const CONCLUSION_DISPLAY: Record<QosConclusion, { label: string; color: string }> = {
  PASS: { label: "DAT", color: "green" },
  FAIL: { label: "KHONG DAT", color: "red" },
  INSUFFICIENT: { label: "Chua du du lieu", color: "default" },
};

interface QosEvaluationChartProps {
  affectedCells: SessionAffectedCellItem[];
  crDateGmt7: Dayjs;
}

// chart QoS 15 ngay (7 truoc + ngay CR + 7 sau) + ket luan DAT/KHONG DAT cho 1 cell dang chon - tuong ung
// Buoc 1-3 Phan 3 (Danh gia chat luong, khu vuc SAU CR - khac man hinh preview truoc CR o CellQosHistoryChart.tsx)
const QosEvaluationChart: React.FC<QosEvaluationChartProps> = ({ affectedCells, crDateGmt7 }) => {
  // null nghia la chua chon cell nao
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // window "YYYY-MM-DD" tinh 1 LAN theo crDateGmt7 (tu executed_at cua session, KHONG doi theo cell dang
  // chon) - truyen xuong useQosHistory qua {from,to} (Gap 1, BE moi ho tro tu 22072026)
  const { from, to } = useMemo(() => resolveQosWindow(crDateGmt7), [crDateGmt7]);

  const { data, isLoading, isError, error } = useQosHistory(selectedCell, { from, to });

  const evaluation = useMemo(
    () => (data ? buildQosEvaluation(crDateGmt7, data.data) : null),
    [data, crDateGmt7]
  );

  const hasAnyChartData = evaluation?.chartData.some((p) => p.qos !== null) ?? false;

  return (
    <div>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>Chart QoS 15 ngay quanh ngay CR (7 truoc + ngay CR + 7 sau)</h4>

      {/* Buoc 2: them label ro rang cho dropdown (yeu cau rieng, giong CellQosHistoryChart.tsx Phan 2) */}
      <label htmlFor="r012-qos-eval-cell-select" style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>
        Chon cell de xem danh gia QoS:
      </label>
      <Select
        id="r012-qos-eval-cell-select"
        placeholder="Chon 1 cell bi anh huong"
        style={{ width: 340, marginBottom: "1rem" }}
        value={selectedCell ?? undefined}
        onChange={(value: string) => setSelectedCell(value)}
        // Buoc 2: lay tu affected_cells (TOAN BO cell bi anh huong cua session), KHONG phai cell_params
        // (chi la tap con cell DA CHAY CR) - xem comment SessionAffectedCellItem trong types/index.ts
        options={affectedCells.map((c) => ({
          value: c.cell_name,
          label: c.tram_id ? `${c.cell_name} (tram ${c.tram_id})` : c.cell_name,
        }))}
        showSearch
        optionFilterProp="label"
      />

      {selectedCell === null && (
        <Empty description="Chon 1 cell o tren de xem chart va ket luan QoS" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {selectedCell !== null && isLoading && <Spin tip={`Dang tai QoS cua ${selectedCell}...`} />}

      {selectedCell !== null && isError && (
        <Alert
          type="error"
          message="Khong tai duoc QoS"
          description={(error as Error)?.message || "Loi khong xac dinh"}
        />
      )}

      {selectedCell !== null && !isLoading && !isError && evaluation && (
        <>
          {!hasAnyChartData ? (
            <Empty
              description={`Chua co du lieu QoS cho ${selectedCell} trong khoang 15 ngay nay`}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                {/* Viec 3: ve dep hon - barCategoryGap chua khoang cach vua phai giua 15 cot (khong dinh
                    nhau), grid nhe + truc gon (tickLine/axisLine tat), cursor hover nhe khi ru chuot */}
                <BarChart data={evaluation.chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={R012_COLORS.tableBorder} vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: R012_COLORS.tableBorder }} />
                  <YAxis domain={[0, 5]} allowDecimals tickLine={false} axisLine={{ stroke: R012_COLORS.tableBorder }} />
                  <Tooltip
                    formatter={(value: number | null) => [value === null ? "Chua co du lieu" : `${value} diem`, "QoS"]}
                    cursor={{ fill: R012_COLORS.primaryPale }}
                  />
                  {/* Ngay chua co du lieu (qos=null) -> Recharts KHONG ve shape cho cot do ("cot rong").
                      radius: bo goc TREN cot cho mem mai hon cot vuong mac dinh cua Recharts (Viec 3) */}
                  <Bar dataKey="qos" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {evaluation.chartData.map((entry) => (
                      <RechartsCell key={entry.dateKey} fill={GROUP_COLOR[entry.group]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* chu thich mau thu cong (Recharts Legend mac dinh khong phan biet duoc mau rieng tung <Cell>) -
                  co 3 nhom mau nen giu legend theo dung yeu cau Viec 3 */}
              <div style={{ display: "flex", gap: "16px", marginTop: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                {(Object.keys(GROUP_LABEL) as DayGroup[]).map((group) => (
                  <div key={group} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "3px",
                        backgroundColor: GROUP_COLOR[group],
                      }}
                    />
                    {GROUP_LABEL[group]}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SUA (yeu cau truc tiep user, khop tieu chi MOI phia BE) - GOP 2 khoi "Tieu chi 1"/"Tieu chi 2"
              cu thanh 1 khoi DUY NHAT: chenh lech TB truoc/sau GIO CHINH LA Ket luan, khong con tach rieng. */}
          <div
            style={{
              padding: "12px",
              backgroundColor: R012_COLORS.tableRowAlt,
              border: `1px solid ${R012_COLORS.primaryPale}`,
              borderRadius: "8px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>Ket qua danh gia (chenh lech TB truoc/sau CR)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>TB QoS truoc CR (7 ngay)</div>
                <strong>{evaluation.avgBefore !== null ? evaluation.avgBefore.toFixed(2) : "-"}</strong>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>TB QoS sau CR (7 ngay)</div>
                <strong>{evaluation.avgAfter !== null ? evaluation.avgAfter.toFixed(2) : "-"}</strong>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>Chenh lech (truoc - sau)</div>
                <strong>{evaluation.diff !== null ? evaluation.diff.toFixed(2) : "-"}</strong>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>Ket luan</div>
                <Tag color={CONCLUSION_DISPLAY[evaluation.conclusion].color} style={{ fontSize: "0.9rem" }}>
                  {CONCLUSION_DISPLAY[evaluation.conclusion].label}
                </Tag>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QosEvaluationChart;
