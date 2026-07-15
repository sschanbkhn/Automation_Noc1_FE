import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { Empty, Spin, Alert, Tag } from "antd";
import { getSessionDetail } from "../../services/R012Service";
import { SessionDetailResponse } from "../../types";

// component nay TU GOI API RIENG (nhan sessionId, khong phu thuoc component cha truyen san du lieu) -
// de tai su dung duoc CA trong CrResultsByDirection.tsx (Zone C, sau khi CR xong) VA trong
// LichSuCR/EvaluationDetail.tsx (Tab 2) ma khong phai viet lai logic fetch/chart o 2 noi
interface QoeQosChartsProps {
  sessionId: number | null;
}

// cac moc ngay hien tren truc X, tinh TUONG DOI so voi ngay CR (executed_at). offset 0 (ngay CR) CHI dung de
// danh dau vi tri tren truc - da xac nhan tu source that BE (application/evaluate_cr_use_case.py, muc 12/13
// trong docstring): before window ket thuc T-1, after window bat dau T+1, T+0 LUON LUON khong co snapshot nao
// duoc luu (khong co nguon du lieu nao fetch dung ngay T+0 ma khong can 1 lan goi CTS/SOC rieng, BE co tinh
// bo qua) - FE tu suy dien "ngay CR" tu field executed_at, khong can BE danh dau rieng tung diem
const CHART_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7];

interface ChartPoint {
  offset: number;
  label: string;
  value: number | null;
}

// ghep 10 moc offset co dinh voi snapshot THAT theo dung NGAY LICH tinh tu executed_at (UTC, dung theo
// BUSINESS_RULES.md "Timestamp: UTC") - ngay nao KHONG co snapshot khop (ke ca T+0 luon luon nhu vay, hoac
// bat ky ngay nao CTS/SOC khong tra du lieu) thi de value=null, KHONG dung 0 hay noi suy - de Recharts
// (connectNulls=false) tu ve khoang trong tai đúng ngay đó, tranh hieu lam la co du lieu lien tuc
function buildChartData(executedAt: string, snapshots: { snapshot_date: string; score: number }[]): ChartPoint[] {
  const crDate = new Date(executedAt);
  return CHART_OFFSETS.map((offset) => {
    const d = new Date(crDate);
    d.setUTCDate(d.getUTCDate() + offset);
    const dateStr = d.toISOString().slice(0, 10);
    const matched = snapshots.find((s) => s.snapshot_date.slice(0, 10) === dateStr);
    return {
      offset,
      label: offset === 0 ? "Ngay CR" : offset < 0 ? `T${offset}` : `T+${offset}`,
      value: matched ? matched.score : null,
    };
  });
}

// badge PASS/FAIL/INSUFFICIENT_DATA dung DUNG 3 gia tri that co the co trong qoe_result/qos_result
// (string | null theo SessionDetailResponse) - khong hien gi khi con null (chua EVALUATED), tranh bao sai
const ResultBadge: React.FC<{ result: string | null }> = ({ result }) => {
  if (result === "PASS") {
    return <Tag color="green">PASS</Tag>;
  }
  if (result === "FAIL") {
    return <Tag color="red">FAIL</Tag>;
  }
  if (result === "INSUFFICIENT_DATA") {
    return <Tag color="default">INSUFFICIENT_DATA</Tag>;
  }
  return null;
};

const QoeQosCharts: React.FC<QoeQosChartsProps> = ({ sessionId }) => {
  // dung CHUNG queryKey voi CrResultsByDirection.tsx/QosSparkline.tsx - TanStack Query tu dung chung cache
  // cho cung 1 session_id, KHONG goi API lap lai du nhieu component doc lap cung mo 1 session
  const { data, isLoading, isError } = useQuery<SessionDetailResponse>({
    queryKey: ["r012", "session-detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as number),
    enabled: sessionId !== null,
  });

  if (sessionId === null) {
    return <Empty description="Chua co session nao de hien danh gia" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  if (isLoading) {
    return <Spin tip="Dang tai du lieu danh gia..." />;
  }

  if (isError || !data) {
    return <Alert type="error" message="Khong tai duoc du lieu danh gia" />;
  }

  if (!data.executed_at) {
    // theo UI_DESIGN.md muc 20.2: status DONE/RUNNING nhung chua co executed_at (CR chua thuc thi xong)
    // -> hien thong bao cho doi, KHONG ve chart rong vo nghia (khong co moc ngay CR de tinh offset)
    return <Empty description="Cho CR thuc thi xong moi co the ve chart danh gia" />;
  }

  const qoeData = buildChartData(
    data.executed_at,
    data.qoe_snapshots.map((s) => ({ snapshot_date: s.snapshot_date, score: s.qoe_score }))
  );
  const qosData = buildChartData(
    data.executed_at,
    data.qos_snapshots.map((s) => ({ snapshot_date: s.snapshot_date, score: s.qos_score }))
  );

  const hasAnyQoeData = qoeData.some((p) => p.value !== null);
  const hasAnyQosData = qosData.some((p) => p.value !== null);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <strong>QoE (nguon: SOC)</strong>
          <ResultBadge result={data.qoe_result} />
        </div>
        {hasAnyQoeData ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={qoeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              {/* domain auto scale theo du lieu that, KHONG co dinh 0-5 - UI_DESIGN.md muc 18 ghi ro ly do:
                  co dinh 0-5 se lam duong qua phang, kho thay trend tang/giam */}
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} />
              <Tooltip formatter={(value: number) => [`${value} diem QoE`, ""]} />
              {/* danh dau vi tri ngay CR bang mau amber, dung theo UI_DESIGN.md - du T+0 khong bao gio co
                  diem du lieu that (xem comment CHART_OFFSETS o tren) */}
              <ReferenceLine
                x="Ngay CR"
                stroke="#f59e0b"
                label={{ value: "Ngay CR", fill: "#f59e0b", position: "top" }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" connectNulls={false} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Chua co du lieu QoE" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <strong>QoS (nguon: CTS)</strong>
          <ResultBadge result={data.qos_result} />
        </div>
        {hasAnyQosData ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={qosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} />
              <Tooltip formatter={(value: number) => [`${value} diem QoS`, ""]} />
              <ReferenceLine
                x="Ngay CR"
                stroke="#f59e0b"
                label={{ value: "Ngay CR", fill: "#f59e0b", position: "top" }}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" connectNulls={false} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Chua co du lieu QoS" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </div>
  );
};

export default QoeQosCharts;
