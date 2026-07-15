import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Descriptions, Spin } from "antd";
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
    <div>
      {/* thong tin co ban cua session - dung DUNG field that tu SessionDetailResponse, khong bia them field */}
      <Descriptions column={2} bordered size="small" style={{ marginBottom: "1.5rem" }}>
        <Descriptions.Item label="Ma tram">{data.tram_id}</Descriptions.Item>
        <Descriptions.Item label="Ten tram">{data.tram_name ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Hanh dong">{data.action}</Descriptions.Item>
        <Descriptions.Item label="Trang thai">{data.status}</Descriptions.Item>
        <Descriptions.Item label="Ke hoach">{data.plan_name ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Thoi gian thuc thi">
          {data.executed_at ? new Date(data.executed_at).toLocaleString("vi-VN") : "-"}
        </Descriptions.Item>
      </Descriptions>

      {/* danh sach cell da tac dong theo huong, DAT TRUOC chart danh gia - doc tu tren xuong: ket qua CR
          truoc, danh gia chat luong sau. Chi hien loai tham so (rsboost/qrxlevmin) nao THAT SU co du lieu,
          KHONG ep hien ca 2 cot neu 1 trong 2 rong - day co the la dac diem du lieu that cua tram (da xac
          nhan qua session that: co tram chi co rsboost, khong co qrxlevmin nao, khong phai loi) */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4>Ket qua CR theo huong</h4>
        <CellParamsByHuong cellParams={data.cell_params} />
      </div>

      {/* tai su dung QoeQosCharts (Phan B) - component tu goi lai API session detail (dung chung cache
          voi query o tren vi cung queryKey, KHONG goi API lan thu 2) roi tu ve chart tu du lieu do */}
      <QoeQosCharts sessionId={sessionId} />
    </div>
  );
};

export default EvaluationDetail;
