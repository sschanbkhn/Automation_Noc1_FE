import React, { useMemo, useState } from "react";
import { Select, Spin, Alert, Empty } from "antd";
import {
  Bar,
  BarChart,
  Cell as RechartsCell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Dayjs } from "dayjs";
import { useChiSoHistory, ChiSoChatLuong } from "../../hooks/useChiSoHistory";
import { useQuery } from "@tanstack/react-query";
import { QoeCellsResponse, QosCellsResponse } from "../../types";
import { SessionAffectedCellItem } from "../../types";
import { R012_COLORS } from "../../theme";
import { DayGroup, buildQosEvaluation, resolveQosWindow } from "./qosEvaluation";

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

interface QosEvaluationChartProps {
  affectedCells: SessionAffectedCellItem[];
  crDateGmt7: Dayjs;
  // Chi so muon xem: "qos" (mac dinh, giu nguyen hanh vi cu cho moi cho dang goi component nay) hoac "qoe".
  // TAI SU DUNG nguyen component thay vi viet 1 chart QoE rieng: 2 chi so dung CHUNG toan bo cach tinh -
  // cung window 15 ngay (crDate-7..crDate+7), cung phan nhom before/cr_day/after, cung nguong ket luan,
  // cung kieu bieu do. Nhan ban ra file thu hai nghia la moi lan sua cach tinh phai nho sua ca 2 noi
  chiSo?: ChiSoChatLuong;
  // de doc nguong tu cache cua bang muc 5 (cung queryKey) - xem comment o cho dung
  sessionId: number;
}

// nhan hien thi theo chi so - chi khac ten goi, moi thu con lai dung chung
const CHI_SO_LABEL: Record<ChiSoChatLuong, string> = { qos: "QoS", qoe: "QoE" };

// chart QoS 15 ngay (7 truoc + ngay CR + 7 sau) + ket luan DAT/KHONG DAT cho 1 cell dang chon - tuong ung
// Buoc 1-3 Phan 3 (Danh gia chat luong, khu vuc SAU CR - khac man hinh preview truoc CR o CellQosHistoryChart.tsx)
const QosEvaluationChart: React.FC<QosEvaluationChartProps> = ({
  affectedCells,
  crDateGmt7,
  chiSo = "qos",
  sessionId,
}) => {
  const nhanChiSo = CHI_SO_LABEL[chiSo];

  // === NGUONG LAY TU BE, KHONG hardcode ===
  // Endpoint chart dang goi (/qos/{cell}?from=&to=) CHI tra chuoi diem theo ngay, KHONG co nguong -
  // nguong chi nam o /qos-cells va /qoe-cells. Doc DUNG CACHE ma bang muc 5 da nap (enabled:false,
  // queryFn nem loi) thay vi tu goi: moi lan goi /qos-cells bat BE goi CTS cho tung cell (~34 request
  // cho 17 cell), goi them 1 lan chi de lay 3 con so la khong dang.
  // He qua: duong san chi ve khi nguoi dung DA mo bang muc 5. Khong co thi chart van dung, chi thieu
  // duong tham chieu - CHAP NHAN duoc, va tot hon HAN cach cu (ve duong theo hang so hardcode 0.2 da
  // troi khoi BE, tuc ve SAI ma van trong nhu dung).
  const { data: cellsData } = useQuery<QosCellsResponse | QoeCellsResponse>({
    queryKey: ["r012", `${chiSo}-cells`, sessionId],
    queryFn: () => Promise.reject(new Error("chi doc cache, khong tu goi")),
    enabled: false,
  });
  const nguong = cellsData?.nguong;
  // null nghia la chua chon cell nao
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // window "YYYY-MM-DD" tinh 1 LAN theo crDateGmt7 (tu executed_at cua session, KHONG doi theo cell dang
  // chon) - truyen xuong useQosHistory qua {from,to} (Gap 1, BE moi ho tro tu 22072026)
  const { from, to } = useMemo(() => resolveQosWindow(crDateGmt7), [crDateGmt7]);

  // hook DUNG CHUNG cho ca 2 chi so - tra ve cung 1 hinh dang du goi /qos hay /qoe, xem useChiSoHistory
  const { data, isLoading, isError, error } = useChiSoHistory(chiSo, selectedCell, { from, to });

  const evaluation = useMemo(
    () => (data ? buildQosEvaluation(crDateGmt7, data.data) : null),
    [data, crDateGmt7]
  );

  const hasAnyChartData = evaluation?.chartData.some((p) => p.qos !== null) ?? false;

  return (
    <div>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>
        Chart {nhanChiSo} 15 ngay quanh ngay CR (7 truoc + ngay CR + 7 sau)
      </h4>

      {/* Buoc 2: them label ro rang cho dropdown (yeu cau rieng, giong CellQosHistoryChart.tsx Phan 2) */}
      <label htmlFor={`r012-${chiSo}-eval-cell-select`} style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>
        Chon cell de xem danh gia {nhanChiSo}:
      </label>
      <Select
        id={`r012-${chiSo}-eval-cell-select`}
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
        <Empty
          description={`Chon 1 cell o tren de xem chart va ket luan ${nhanChiSo}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {selectedCell !== null && isLoading && <Spin tip={`Dang tai ${nhanChiSo} cua ${selectedCell}...`} />}

      {selectedCell !== null && isError && (
        <Alert
          type="error"
          message={`Khong tai duoc ${nhanChiSo}`}
          description={(error as Error)?.message || "Loi khong xac dinh"}
        />
      )}

      {selectedCell !== null && !isLoading && !isError && evaluation && (
        <>
          {!hasAnyChartData ? (
            <Empty
              description={`Chua co du lieu ${nhanChiSo} cho ${selectedCell} trong khoang 15 ngay nay`}
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
                    formatter={(value: number | null) => [value === null ? "Chua co du lieu" : `${value} diem`, nhanChiSo]}
                    cursor={{ fill: R012_COLORS.primaryPale }}
                  />
                  {/* Ngay chua co du lieu (qos=null) -> Recharts KHONG ve shape cho cot do ("cot rong").
                      radius: bo goc TREN cot cho mem mai hon cot vuong mac dinh cua Recharts (Viec 3) */}
                  {/* Duong SAN chat luong - ve o dung nguong.muc_toi_thieu BE tra ve. Day la nguong
                      DUY NHAT ve duoc tren truc nay: truc Y la thang diem 1-5 nen muc_toi_thieu (3.0)
                      la mot muc diem; con delta_toi_da la HIEU giua 2 trung binh, khong phai mot muc
                      diem nen khong ve thanh duong ngang duoc - no hien o khoi so lieu ben duoi.
                      Khong co nguong (chua mo bang muc 5) thi khong ve - KHONG doan mot so nao */}
                  {nguong && (
                    <ReferenceLine
                      y={nguong.muc_toi_thieu}
                      stroke={R012_COLORS.dangerRed}
                      strokeDasharray="4 4"
                      label={{
                        value: `San ${nguong.muc_toi_thieu}`,
                        position: "insideTopRight",
                        fill: R012_COLORS.dangerRed,
                        fontSize: 11,
                      }}
                    />
                  )}
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
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>So lieu trung binh (truoc/sau CR)</div>
            {/* KHONG con o "Ket luan" (05092026). Ket luan DAT/KHONG DAT chi do BE quyet dinh va hien o
                bang muc 5 ngay ben duoi - chart tu ket luan bang ban sao nguong da lam FE lech BE 3 lan,
                va lan cuoi se hien "DAT" ngay canh bang hien "KHONG DAT" cho CUNG mot cell.
                3 con so duoi day GIU LAI vi chung la PHEP TINH thuan tuy (trung binh, hieu), khong dinh
                gi den nguong. */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>TB {nhanChiSo} truoc CR (7 ngay)</div>
                <strong>{evaluation.avgBefore !== null ? evaluation.avgBefore.toFixed(2) : "-"}</strong>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>TB {nhanChiSo} sau CR (7 ngay)</div>
                <strong>{evaluation.avgAfter !== null ? evaluation.avgAfter.toFixed(2) : "-"}</strong>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#595959" }}>
                  Chenh lech (truoc - sau)
                  {/* Hien nguong BE ngay canh con so - de nguoi doc TU doi chieu. KHONG tu ket luan
                      DAT/KHONG DAT o day: ket luan chi do BE quyet dinh va nam o bang muc 5 */}
                  {nguong ? ` - nguong ${nguong.delta_toi_da}` : ""}
                </div>
                <strong>{evaluation.diff !== null ? evaluation.diff.toFixed(2) : "-"}</strong>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QosEvaluationChart;
