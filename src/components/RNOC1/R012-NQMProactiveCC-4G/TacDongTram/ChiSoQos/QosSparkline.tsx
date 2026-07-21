import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { Empty, Spin, Alert } from "antd";
import { getQos, getSessionDetail } from "../../services/R012Service";
import { CellParamDetailItem, SessionDetailResponse } from "../../types";
import { CrStreamStatus } from "../../hooks/useSseStream";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7, khong phu thuoc TZ trinh duyet) - xem ly do
// trong file helper
import { formatDateTime } from "../../helpers/formatDateTime";

// GIA DINH TU CHON - GHI RO O DAY: UI_DESIGN.md muc 10 "WIDGET F33" mo ta widget nay "trigger load: khi
// user select tram" va lay "cells lan can cua tram dang select". Da kiem tra TOAN BO BE (main.py chi co 6
// router: stations/cr/sse/sessions/qos/jobs) - KHONG co endpoint nao liet ke danh sach cell lan can cua 1 tram
// TRUOC KHI trigger CR (logic goi CDS lay neighbor nam trong TriggerCrUseCase, chay server-side luc trigger,
// KHONG duoc expose rieng cho FE goi truoc). Vi vay KHONG THE trigger widget nay ngay luc chon tram nhu tai
// lieu mo ta. GIAI PHAP: lay cell_name that TU cell_params cua session detail (SAU KHI CR done) - van GIU
// dung quy tac "toi da 6 cell, uu tien priority 1-2 truoc" cua tai lieu vi cell_params co san field priority
interface QosSparklineProps {
  sessionId: number | null;
  status: CrStreamStatus;
}

const MAX_CELLS = 6; // gioi han "toi da 6 cell" dung theo UI_DESIGN.md muc 10

const QosSparkline: React.FC<QosSparklineProps> = ({ sessionId, status }) => {
  // dung CHUNG queryKey voi CrResultsByDirection.tsx - TanStack Query tu dung chung cache cho cung 1
  // session_id, KHONG goi API 2 lan du 2 component doc lap goi useQuery rieng (giu component tai su dung duoc)
  const { data } = useQuery<SessionDetailResponse>({
    queryKey: ["r012", "session-detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as number),
    enabled: status === "done" && sessionId !== null,
  });

  if (sessionId === null || status !== "done" || !data) {
    // dung dung mo ta Empty state tu UI_DESIGN.md muc 20.2 "Widget F33 - chua chon tram"
    return <Empty description="Chon tram de xem QoS 48h" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  // sap xep theo priority tang dan (1 truoc 2...), cell khong co priority (null) xep cuoi cung,
  // roi cat lay toi da 6 cell dau tien - dung DUNG quy tac tai lieu da mo ta o tren
  const topCells: CellParamDetailItem[] = [...data.cell_params]
    .sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity))
    .slice(0, MAX_CELLS);

  if (topCells.length === 0) {
    return <Empty description="Khong co cell nao de hien QoS" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div>
      {topCells.map((cell) => (
        <SingleCellSparkline key={cell.cell_name} cellName={cell.cell_name} />
      ))}
    </div>
  );
};

// tach rieng component con cho MOI cell - moi cell tu goi API + tu quan ly loading/error rieng cua no,
// tranh 1 cell loi keo theo hong hien thi ca 6 sparkline con lai
const SingleCellSparkline: React.FC<{ cellName: string }> = ({ cellName }) => {
  // GET /api/v1/qos/{cell_name} - da goi thu API THAT qua curl (khong doan): response la
  // { cell_name: string, data: [{ time: string(ISO), qos: number }] } - field ten "time"/"qos",
  // HOAN TOAN KHAC voi "snapshot_date"/"qoe_score" cua SessionDetailResponse (2 API dung ten field rieng biet)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["r012", "qos", cellName],
    queryFn: () => getQos(cellName),
    staleTime: 5 * 60 * 1000, // 5 phut - dung theo UI_DESIGN.md muc 10 "Stale time: 5 phut"
  });

  if (isLoading) {
    return (
      <div style={{ height: "60px", display: "flex", alignItems: "center", padding: "0 8px" }}>
        <Spin size="small" /> <span style={{ marginLeft: "8px" }}>{cellName}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ height: "60px", padding: "0 8px" }}>
        <Alert type="warning" message={`${cellName}: khong tai duoc QoS`} banner />
      </div>
    );
  }

  // type QosMetrics (types/index.ts) la Record<string, unknown> vi OpenAPI khai bao additionalProperties: true
  // (chua sua hop dong o BE) - o day ep kieu lai theo cau truc THAT da xac nhan qua curl de ve chart,
  // khong sua type goc trong types/index.ts vi do la phan anh dung schema OpenAPI hien tai
  const qosResponse = data as unknown as { cell_name: string; data: { time: string; qos: number }[] } | undefined;
  const points = qosResponse?.data ?? [];

  if (points.length === 0) {
    return (
      <div style={{ height: "60px", padding: "0 8px", color: "#8c8c8c" }}>{cellName}: chua co du lieu QoS</div>
    );
  }

  return (
    <div style={{ height: "60px", marginBottom: "4px" }}>
      <div style={{ fontSize: "0.75rem", color: "#595959" }}>{cellName}</div>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={points}>
          {/* sparkline style dung theo UI_DESIGN.md muc 10: khong truc, khong luoi, chi 1 duong */}
          <Tooltip
            formatter={(value: number) => [`${value} diem`, "QoS"]}
            labelFormatter={(label: string) => formatDateTime(label)}
          />
          <Line type="monotone" dataKey="qos" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QosSparkline;
