import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Collapse, Descriptions, Empty, Spin, Tag } from "antd";
import type { CollapseProps } from "antd";
import { getSessionDetail } from "../services/R012Service";
import { SessionDetailResponse } from "../types";
// XOA QoeQosCharts (Viec 2, 23072026 xac nhan voi user): 2 khoi "QoE (nguon: SOC)"/"QoS (nguon: CTS)" LUON
// rong vi phu thuoc qoe_snapshot/qos_snapshot - job evaluate_cr_use_case CHI chay sau khi session du 21
// ngay (EVALUATION_DAYS), nen component nay chiem cho vo ich trong toan bo thoi gian truoc do. Da co chart
// 15 ngay (QosEvaluationChart) + bang danh gia (QosEvaluationTable) thay the day du hon, tinh truc tiep tu
// /qos/{cell}?from=&to=, KHONG phu thuoc job 21 ngay
// Phan 3 - danh gia QoS THAT dua tren /qos/{cell}?from=&to= + affected_cells. Viec 6 (22072026, xac nhan voi
// user): goi THANG 2 component con QosEvaluationChart/QosEvaluationTable (thay vi qua wrapper
// QosEvaluationSection nhu truoc) de moi cai nam RIENG 1 muc Collapse ("Danh gia chat luong" / "Bang danh
// gia chi tiet") - can tu tinh crDateGmt7 o day (giong QosEvaluationSection da lam) vi 2 component con deu
// can gia tri nay qua props. QosEvaluationSection.tsx cu da XOA (het noi nao dung sau khi doi cach nay)
import QosEvaluationChart from "../TacDongTram/DanhGiaChatLuong/QosEvaluationChart";
import QosEvaluationTable from "../TacDongTram/DanhGiaChatLuong/QosEvaluationTable";
import { resolveCrDateGmt7 } from "../TacDongTram/DanhGiaChatLuong/qosEvaluation";
// tai su dung LAI CellParamsByHuong (da tach tu CrResultsByDirection.tsx) - hien danh sach cell da tac dong
// theo huong (giong Tab1 sau CR), o day la XEM LAI session da DONE nen chi truyen thang cell_params tinh,
// khong can sessionId/status SSE gi ca
import CellParamsByHuong from "../TacDongTram/KetQuaCR/CellParamsByHuong";
// Log tac dong (22072026, xac nhan voi user) - BE gio da persist cr_log, xem chi tiet ly do chon Timeline
// trong comment dau file CrLogTimeline.tsx
import CrLogTimeline from "./CrLogTimeline";
// token mau xanh duong dung CHUNG toan module - da trich tu R012Header.tsx sang theme.ts, KHONG con
// dinh nghia hex rieng trong file nay nua, xem chi tiet tung token trong theme.ts
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";

interface EvaluationDetailProps {
  sessionId: number | null;
}

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

const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ sessionId }) => {
  // tu goi API rieng theo sessionId (khong nhan du lieu san tu SessionHistoryList) - giu component doc lap,
  // dung chung queryKey voi cac noi khac de TanStack Query tu dung chung cache cho cung 1 session
  const { data, isLoading, isError } = useQuery<SessionDetailResponse>({
    queryKey: ["r012", "session-detail", sessionId],
    queryFn: () => getSessionDetail(sessionId as number),
    enabled: sessionId !== null,
  });

  // crDateGmt7 CHI tinh duoc khi da co data.executed_at - dat TRUOC cac return som ben duoi de khong vi
  // pham Rules of Hooks (thu tu hook phai on dinh giua cac lan render). Dung CHUNG cho ca 2 muc Collapse
  // "Danh gia chat luong" (QosEvaluationChart) va "Bang danh gia chi tiet" (QosEvaluationTable)
  const crDateGmt7 = useMemo(() => (data?.executed_at ? resolveCrDateGmt7(data.executed_at) : null), [
    data?.executed_at,
  ]);

  if (sessionId === null) {
    return null; // Modal cha (SessionHistoryList) chi mo khi co sessionId, truong hop nay khong xay ra tren thuc te
  }

  if (isLoading) {
    return <Spin tip="Dang tai chi tiet session..." />;
  }

  if (isError || !data) {
    return <Alert type="error" message="Khong tai duoc chi tiet session" />;
  }

  // Viec 6: gom cac khoi noi dung thanh Collapse (antd Collapse ban moi dung prop "items", KHONG con dung
  // <Collapse.Panel> children nhu ban cu da deprecated) - mac dinh CHI mo muc dau tien ("Thong tin tram"),
  // cac muc con lai thu gon, giup trang khong qua dai/phai cuon nhieu nhu truoc.
  // 22072026 (xac nhan voi user): them muc "Log tac dong" ngay SAU "Thong tin tram" (truoc "Ket qua CR theo
  // huong") - danh so lai 2->5 cho cac muc con lai, GIU NGUYEN thu tu tuong doi cu giua chung.
  const collapseItems: CollapseProps["items"] = [
    {
      key: "thong-tin-tram",
      label: "1. Thong tin tram",
      children: (
        // FIX (Viec 1, 23072026 - phat hien tu anh chup that): ban truoc "Ke hoach" nam CHUNG 1 hang voi
        // "Thoi gian thuc thi" (Descriptions column=2 tu ghep item 5+6 vao 1 hang) - ten plan THAT co the
        // dai toi 43 ky tu (vd "R012_NQMProactiveCC_112721_20260722_134431"), chiem het nua trai cua hang,
        // ep cot phai ("Thoi gian thuc thi") con qua hep -> trinh duyet phai NGAT gia tri NGAN o cot do
        // thanh nhieu dong roi rac ("22/07/2" / "026" / "20:44:31") du contentStyle da co "wordBreak:
        // break-word" (chinh thuoc tinh nay gay ngat giua tu khi cot bi ep hep, KHONG phai do gia tri do
        // tu no dai). Ellipsis+Tooltip da thu truoc do CUNG KHONG an toan: Descriptions dung table-layout
        // auto, <td> tu gian theo NOI DUNG con ellipsis chi hoat dong khi phan tu co chieu rong CO DINH -
        // "maxWidth:100%" tren 1 td auto-rong la vo nghia (100% cua 1 gia tri auto).
        // SUA TAN GOC: dat "Ke hoach" o HANG RIENG voi span={2} (chiem tron ca hang, KHONG con ghep chung
        // voi field nao khac) - luc nay content co du be rong ngang toan bo modal, 43 ky tu thua suc nam
        // gon 1 dong, KHONG can ellipsis/Tooltip nua. Doi cho "Thoi gian danh gia" (evaluated_at - co san
        // trong SessionDetailResponse nhung truoc day CHUA hien o dau) ghep cung hang voi "Thoi gian thuc
        // thi" cho DU CAP, tranh 1 hang le chi co 1 o
        <Descriptions
          column={2}
          bordered
          labelStyle={{ width: 140, whiteSpace: "nowrap", fontWeight: 600 }}
          // wordBreak "normal" (KHONG phai "break-word" nhu ban cu) - cac gia tri o day (ma tram/ten tram/
          // hanh dong/ngay gio) DEU ngan, khong bao gio can ngat giua tu; rieng "Ke hoach" (co the dai) da
          // duoc tach rieng span={2} o duoi, tu xu ly wrap rieng khong dung chung contentStyle nay
          contentStyle={{ wordBreak: "normal" }}
        >
          <Descriptions.Item label="Ma tram">{data.tram_id}</Descriptions.Item>
          <Descriptions.Item label="Ten tram">{data.tram_name ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Hanh dong">{data.action}</Descriptions.Item>
          {/* badge mau thay cho text thuong, dung DUNG gia tri status that tu BE (khong bia them gia tri) */}
          <Descriptions.Item label="Trang thai">
            <Tag color={STATUS_TAG_COLOR[data.status] ?? "default"}>{data.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thoi gian thuc thi">{formatDateTime(data.executed_at)}</Descriptions.Item>
          <Descriptions.Item label="Thoi gian danh gia">{formatDateTime(data.evaluated_at)}</Descriptions.Item>
          {/* span={2}: chiem tron 1 hang rieng (xem ly do day du o comment dau khoi Descriptions) - hien
              NGUYEN VEN ten plan, cho phep xuong dong TU NHIEN (chi ngat o khoang trang/dau "_" that su
              can thiet) neu van dai hon 1 hang, khong can rut gon */}
          <Descriptions.Item label="Ke hoach" span={2}>
            <span style={{ overflowWrap: "break-word" }}>{data.plan_name ?? "-"}</span>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "log-tac-dong",
      label: "2. Log tac dong",
      // CrLogTimeline tu xu ly truong hop rong (session cu chua co log) - khong can guard o day
      children: <CrLogTimeline crLogs={data.cr_logs} />,
    },
    {
      key: "ket-qua-cr",
      // Ket qua CR theo huong (CellParamsByHuong) - Chi hien loai tham so (rsboost/qrxlevmin) nao THAT SU
      // co du lieu, KHONG ep hien ca 2 cot neu 1 trong 2 rong - day co the la dac diem du lieu that cua
      // tram (da xac nhan qua session that: co tram chi co rsboost, khong co qrxlevmin nao, khong phai loi)
      label: "3. Ket qua CR theo huong",
      // sessionId chac chan la number (khong null) tai day - da qua guard "if (sessionId === null) return null"
      // o dau ham, truyen xuong de CellParamsByHuong dat dung ten file export
      children: <CellParamsByHuong cellParams={data.cell_params} sessionId={sessionId} />,
    },
    {
      key: "danh-gia-chat-luong",
      label: "4. Danh gia chat luong",
      // QoeQosCharts da XOA (Viec 2) - xem ly do o comment import dau file. CellQosHistoryChart (7 ngay)
      // cung KHONG dat o day (task truoc) - trung noi dung voi chart 15 ngay QosEvaluationChart ben duoi,
      // chart 7 ngay CHI giu o khu vuc preview (TacDongTram.tsx)
      children:
        crDateGmt7 !== null ? (
          <QosEvaluationChart affectedCells={data.affected_cells} crDateGmt7={crDateGmt7} />
        ) : (
          // CR chua thuc thi xong (status DONE/RUNNING nhung chua co executed_at) thi chua co moc ngay CR
          // de tinh window 15 ngay, khong the danh gia
          <Empty description="Cho CR thuc thi xong moi co the danh gia chat luong QoS" />
        ),
    },
    {
      key: "bang-danh-gia-chi-tiet",
      label: "5. Bang danh gia chi tiet",
      children:
        crDateGmt7 !== null ? (
          <QosEvaluationTable sessionId={data.id} affectedCells={data.affected_cells} crDateGmt7={crDateGmt7} />
        ) : (
          <Empty description="Cho CR thuc thi xong moi co the tinh bang danh gia chi tiet" />
        ),
    },
  ];

  return (
    <Card
      title={<span style={{ color: "#fff", fontWeight: 600 }}>Chi tiet session CR</span>}
      bordered
      // boxShadow mem dat o root Card (khong phai styles.body) de bao quanh toan bo khoi Card - gia tri
      // cardShadow hoc tu khao sat R003, xem ly do chon trong theme.ts
      style={{ boxShadow: R012_COLORS.cardShadow, borderRadius: "8px" }}
      // header Card dong bo mau xanh duong voi R012Header - dung "styles" (antd v5) thay vi headStyle/bodyStyle
      // vi 2 prop do da deprecated tu antd 5.25, dung ban cu se ra warning luc build
      styles={{
        header: {
          background: R012_COLORS.headerGradient,
          borderRadius: "8px 8px 0 0",
          border: "none",
        },
        body: { padding: "20px 24px" },
      }}
    >
      <Collapse defaultActiveKey={["thong-tin-tram"]} items={collapseItems} />
    </Card>
  );
};

export default EvaluationDetail;
