import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Empty, Spin, Alert } from "antd";
import { getSessionDetail } from "../../services/R012Service";
import { SessionDetailResponse } from "../../types";
import { resolveCrDateGmt7 } from "./qosEvaluation";
import QosEvaluationChart from "./QosEvaluationChart";
import QosEvaluationTable from "./QosEvaluationTable";

interface QosEvaluationSectionProps {
  sessionId: number | null;
}

// component GOC cua Phan 3 (Danh gia chat luong QoS - khu vuc SAU CR, khac man hinh preview truoc CR).
// Tu goi API rieng (nhan sessionId, giong QoeQosCharts.tsx/QosSparkline.tsx) - dung CHUNG queryKey voi cac
// component do de TanStack Query tu dung chung cache, khong goi API session detail lap lai nhieu lan.
// Chi tinh crDateGmt7 (tu executed_at) 1 LAN roi truyen xuong ca QosEvaluationChart (Buoc 1-3) va
// QosEvaluationTable (Buoc 4) - tranh 2 file con tu tinh lai cung 1 gia tri
const QosEvaluationSection: React.FC<QosEvaluationSectionProps> = ({ sessionId }) => {
  const { data, isLoading, isError } = useQuery<SessionDetailResponse>({
    queryKey: ["r012", "session-detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as number),
    enabled: sessionId !== null,
  });

  // crDateGmt7 CHI tinh duoc khi da co data.executed_at - useMemo dat TRUOC cac return som ben duoi de
  // khong vi pham Rules of Hooks (thu tu hook phai on dinh giua cac lan render)
  const crDateGmt7 = useMemo(() => (data?.executed_at ? resolveCrDateGmt7(data.executed_at) : null), [
    data?.executed_at,
  ]);

  if (sessionId === null) {
    return <Empty description="Chua co session nao de danh gia chat luong" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  if (isLoading) {
    return <Spin tip="Dang tai du lieu session..." />;
  }

  if (isError || !data) {
    return <Alert type="error" message="Khong tai duoc du lieu session" />;
  }

  if (!data.executed_at || crDateGmt7 === null) {
    // giong pattern QoeQosCharts.tsx - CR chua thuc thi xong (status DONE/RUNNING nhung chua co executed_at)
    // thi chua co moc ngay CR de tinh window 15 ngay, khong the danh gia
    return <Empty description="Cho CR thuc thi xong moi co the danh gia chat luong QoS" />;
  }

  return (
    <div>
      <QosEvaluationChart affectedCells={data.affected_cells} crDateGmt7={crDateGmt7} />
      <QosEvaluationTable sessionId={data.id} affectedCells={data.affected_cells} crDateGmt7={crDateGmt7} />
    </div>
  );
};

export default QosEvaluationSection;
