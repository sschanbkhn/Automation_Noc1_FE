import React from "react";
import { Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getSessionDetail } from "../../services/R012Service";
import { SessionDetailResponse } from "../../types";
import { CrStreamStatus } from "../../hooks/useSseStream";
// QosSparkline (Widget F33) + QoeQosCharts (Zone E) hien SAU KHI co ket qua CR, theo dung yeu cau ghep
// "vao dung vi tri (sau khi co ket qua CR)" - ca 2 component TU goi API rieng (nhan sessionId/status qua props),
// khong can CrResultsByDirection truyen du lieu cell_params/session detail xuong, tranh phu thuoc component cha
import QosSparkline from "../ChiSoQos/QosSparkline";
import QoeQosCharts from "../DanhGiaChatLuong/QoeQosCharts";
// phan hien thi bang cell_params theo huong tach rieng thanh component dung CHUNG voi EvaluationDetail.tsx
// (LichSuCR - xem lai session da DONE), tranh viet lai cung 1 logic nhom/render o 2 noi
import CellParamsByHuong from "./CellParamsByHuong";

// props nhan sessionId+status TU useSseStream() da goi 1 lan duy nhat o TacDongTram.tsx (khong tu goi useSseStream
// rieng o day) - status dung de biet CHINH XAC luc nao CR da hoan tat, tranh goi API qua som khi con dang chay
interface CrResultsByDirectionProps {
  sessionId: number | null;
  status: CrStreamStatus;
}

const CrResultsByDirection: React.FC<CrResultsByDirectionProps> = ({ sessionId, status }) => {
  // chi goi GET /api/v1/sessions/{session_id} khi status="done" (SSE da bao hoan tat) - dung "enabled" cua
  // TanStack Query de dam bao CHI goi 1 LAN dung luc, khong tu goi lai khi status con la "running"/"idle"/"error"
  const { data, isLoading, isError } = useQuery<SessionDetailResponse>({
    queryKey: ["r012", "session-detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as number),
    enabled: status === "done" && sessionId !== null,
  });

  if (sessionId === null) {
    // chua co session nao dang duoc trigger trong phien lam viec nay
    return <div style={{ color: "#8c8c8c", padding: "1rem" }}>Chua co phien CR nao dang thuc hien</div>;
  }

  if (status === "error") {
    // CR that bai (SSE bao status=failed hoac loi ket noi) - khong goi API lay ket qua vi chua chac co du lieu hoan chinh,
    // huong dan NOC xem SseProgressLog (Buoc 2) de biet buoc nao that bai
    return (
      <Alert
        type="error"
        message="CR that bai hoac mat ket noi"
        description="Xem log tien trinh ben tren de biet chi tiet buoc nao gay loi."
      />
    );
  }

  if (status !== "done" || isLoading || !data) {
    // status "idle"/"running" hoac dang cho API tra ve - hien loading don gian, khong can phuc tap
    return <Spin tip="Dang thuc hien..." />;
  }

  if (isError) {
    return <Alert type="error" message="Khong tai duoc ket qua CR" description="Vui long thu lai." />;
  }

  return (
    <div>
      {/* sessionId chac chan la number (khong null) tai day - da qua guard "if (sessionId === null) return ..."
          o tren, truyen xuong de CellParamsByHuong dat dung ten file export */}
      <CellParamsByHuong cellParams={data.cell_params} sessionId={sessionId} />

      {/* QosSparkline (Widget F33) va QoeQosCharts (Zone E) chi hien SAU KHI co ket qua CR (status="done" -
          diem nay chac chan dung vi return o tren da loc het cac truong hop status khac), dat CUOI CUNG
          sau bang ket qua theo huong, dung vi tri "sau khi co ket qua CR" theo yeu cau */}
      <div style={{ marginTop: "1.5rem" }}>
        <h4>QoS Sparkline 48h (Widget F33)</h4>
        <QosSparkline sessionId={sessionId} status={status} />
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <h4>Danh gia chat luong QoE/QoS (Zone E)</h4>
        <QoeQosCharts sessionId={sessionId} />
      </div>
      {/* SUA (Viec 2, 22072026, xac nhan voi user): BO QosEvaluationSection khoi day - truoc do hien CA
          o day LAN o EvaluationDetail.tsx (Lich su CR) gay TRUNG NOI DUNG. QosEvaluationSection (chart
          15 ngay + bang danh gia DAT/KHONG DAT) CHI giu lai o EvaluationDetail.tsx (xem lai session DONE
          trong Lich su CR) - khu vuc preview/sau-CR ngay tai luc trigger nay CHI can CellQosHistoryChart
          (7 ngay, Viec 1) de NOC xem nhanh xu huong, chua can danh gia DAT/KHONG DAT day du ngay */}
    </div>
  );
};

export default CrResultsByDirection;
