import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Descriptions, Divider, Spin, Tag } from "antd";
import { getSessionDetail } from "../services/R012Service";
import { SessionDetailResponse } from "../types";
// tai su dung LAI QoeQosCharts tu Phan B (TacDongTram/DanhGiaChatLuong), KHONG viet lai logic chart -
// component do da tu goi API rieng theo sessionId, dung chung duoc o ca Tab1 (sau CR) va Tab2 (lich su) nay
import QoeQosCharts from "../TacDongTram/DanhGiaChatLuong/QoeQosCharts";
// tai su dung LAI CellParamsByHuong (da tach tu CrResultsByDirection.tsx) - hien danh sach cell da tac dong
// theo huong (giong Tab1 sau CR), o day la XEM LAI session da DONE nen chi truyen thang cell_params tinh,
// khong can sessionId/status SSE gi ca
import CellParamsByHuong from "../TacDongTram/KetQuaCR/CellParamsByHuong";

interface EvaluationDetailProps {
  sessionId: number | null;
}

// token mau xanh duong DUNG LAI nguyen tu Designer/R012Header.tsx (chinh file do da ghi ro lay tu
// R005Header.tsx - module RNOC1 dang hoat dong on dinh), KHONG bia mau moi, de dong bo giao dien toan module
const HEADER_GRADIENT = "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)";
const ACCENT_BLUE = "#1e40af";
const ACCENT_BLUE_LIGHT = "#3b82f6";
const DIVIDER_BLUE = "#dbeafe";

// mau badge trang thai: DONE/EVALUATED dung xanh duong de dong bo voi theme chung cua modal.
// FAILED CO Y GIU MAU DO (khong doi thanh xanh) vi day la trang thai loi can NOC nhan biet ngay bang mat -
// neu doi thanh xanh se mat tin hieu canh bao, phan tac dung voi muc dich cua mau badge trang thai
const STATUS_TAG_COLOR: Record<string, string> = {
  DONE: "blue",
  EVALUATED: "blue",
  FAILED: "red",
  RUNNING: "processing",
  EVAL_PENDING: "warning",
  EVALUATING: "processing",
};

// tieu de section dung chung accent trai mau xanh duong, de phan tach ro 3 khoi noi dung theo yeu cau redesign
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4
    style={{
      borderLeft: `4px solid ${ACCENT_BLUE_LIGHT}`,
      paddingLeft: "10px",
      margin: "0 0 12px 0",
      color: ACCENT_BLUE,
    }}
  >
    {children}
  </h4>
);

const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ sessionId }) => {
  // tu goi API rieng theo sessionId (khong nhan du lieu san tu SessionHistoryList) - giu component doc lap,
  // dung chung queryKey voi cac noi khac de TanStack Query tu dung chung cache cho cung 1 session
  const { data, isLoading, isError } = useQuery<SessionDetailResponse>({
    queryKey: ["r012", "session-detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as number),
    enabled: sessionId !== null,
  });

  if (sessionId === null) {
    return null; // Modal cha (SessionHistoryList) chi mo khi co sessionId, truong hop nay khong xay ra tren thuc te
  }

  if (isLoading) {
    return <Spin tip="Dang tai chi tiet session..." />;
  }

  if (isError || !data) {
    return <Alert type="error" message="Khong tai duoc chi tiet session" />;
  }

  return (
    <Card
      title={<span style={{ color: "#fff", fontWeight: 600 }}>Chi tiet session CR</span>}
      bordered
      // header Card dong bo mau xanh duong voi R012Header - dung "styles" (antd v5) thay vi headStyle/bodyStyle
      // vi 2 prop do da deprecated tu antd 5.25, dung ban cu se ra warning luc build
      styles={{
        header: {
          background: HEADER_GRADIENT,
          borderRadius: "8px 8px 0 0",
          border: "none",
        },
        body: { padding: "20px 24px" },
      }}
    >
      {/* 1. Thong tin tram - giu nguyen noi dung, gon spacing, dat dau tien theo dung thu tu doc tu tren xuong */}
      <SectionTitle>1. Thong tin tram</SectionTitle>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Ma tram">{data.tram_id}</Descriptions.Item>
        <Descriptions.Item label="Ten tram">{data.tram_name ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Hanh dong">{data.action}</Descriptions.Item>
        {/* badge mau thay cho text thuong, dung DUNG gia tri status that tu BE (khong bia them gia tri) */}
        <Descriptions.Item label="Trang thai">
          <Tag color={STATUS_TAG_COLOR[data.status] ?? "default"}>{data.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ke hoach">{data.plan_name ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Thoi gian thuc thi">
          {data.executed_at ? new Date(data.executed_at).toLocaleString("vi-VN") : "-"}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ borderColor: DIVIDER_BLUE }} />

      {/* 2. Ket qua CR theo huong (CellParamsByHuong) - TRUOC chart danh gia, dung theo thu tu doc: ket qua CR
          truoc, danh gia chat luong sau. Chi hien loai tham so (rsboost/qrxlevmin) nao THAT SU co du lieu,
          KHONG ep hien ca 2 cot neu 1 trong 2 rong - day co the la dac diem du lieu that cua tram (da xac
          nhan qua session that: co tram chi co rsboost, khong co qrxlevmin nao, khong phai loi) */}
      <SectionTitle>2. Ket qua CR theo huong</SectionTitle>
      <CellParamsByHuong cellParams={data.cell_params} />

      <Divider style={{ borderColor: DIVIDER_BLUE }} />

      {/* 3. Danh gia chat luong (QoeQosCharts) - cuoi cung, tai su dung LAI component Phan B, component tu
          goi lai API session detail (dung chung cache voi query o tren vi cung queryKey, KHONG goi API lan 2) */}
      <SectionTitle>3. Danh gia chat luong</SectionTitle>
      <QoeQosCharts sessionId={sessionId} />
    </Card>
  );
};

export default EvaluationDetail;
