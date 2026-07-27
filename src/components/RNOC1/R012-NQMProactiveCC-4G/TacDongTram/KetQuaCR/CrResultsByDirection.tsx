import React from "react";
import { Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getSessionDetail } from "../../services/R012Service";
import { SessionDetailResponse } from "../../types";
import { CrStreamStatus } from "../../hooks/useSseStream";
// XOA QosSparkline (Widget F33, Viec 1, 22072026 xac nhan voi user): CTS chi ho tro granularity NGAY, 48h
// chi ra toi da 2 diem -> duong thang vo nghia, khong the sua cho dung duoc. Da co CellQosHistoryChart
// (7 ngay, preview) va QosEvaluationChart (15 ngay, danh gia) day du hon thay the.
// XOA QoeQosCharts (23072026, xac nhan voi user - day la noi CUOI CUNG con dung component nay, da bo khoi
// EvaluationDetail.tsx tu truoc): khoi "QoE (nguon: SOC)"/"QoS (nguon: CTS)" phu thuoc qoe_snapshot/
// qos_snapshot, ma job evaluate_cr_use_case CHI chay khi session du 21 ngay (EVALUATION_DAYS) - nen LUON
// rong ngay khi CR vua chay xong (o day, Zone C), chiem cho vo ich. Da co CellQosHistoryChart (7 ngay) va
// QosEvaluationChart (15 ngay, tinh truc tiep tu /qos/{cell}?from=&to=, KHONG phu thuoc job 21 ngay) thay the
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
      {/* QoeQosCharts (Zone E) da XOA - xem ly do o comment import dau file. QosSparkline (Widget F33)
          cung da XOA truoc do. QosEvaluationSection/QosEvaluationChart+Table KHONG dat o day (giu chi o
          EvaluationDetail.tsx) - tranh trung noi dung giua khu vuc Tac dong tram va Lich su CR */}
    </div>
  );
};

export default CrResultsByDirection;
