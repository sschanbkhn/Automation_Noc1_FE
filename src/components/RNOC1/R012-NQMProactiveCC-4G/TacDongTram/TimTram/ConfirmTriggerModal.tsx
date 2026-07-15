import React, { useState } from "react";
import { Modal, Descriptions, Radio, message } from "antd";
import { triggerCr } from "../../services/R012Service";
import { StationItem, TriggerCrRequest } from "../../types";

// props nhan tu TacDongTram.tsx: open/onClose de dieu khien hien/an modal, station la tram dang duoc chon o Zone A
// TacDongTram.tsx la noi giu state chung nay vi ca StationSearchGrid va ConfirmTriggerModal deu can biet den no
interface ConfirmTriggerModalProps {
  open: boolean;
  station: StationItem | null;
  onClose: () => void;
  // goi khi trigger CR thanh cong, truyen session_id ra ngoai cho TacDongTram.tsx set vao activeCrSessionId
  // de noi sang KetQuaCR (SseProgressLog/CrResultsByDirection) theo doi realtime qua SSE
  onTriggerSuccess: (sessionId: number) => void;
}

// lay dung 3 gia tri enum that tu type TriggerCrRequest trong types/index.ts, khong tu bia them ten action khac
const ACTION_OPTIONS: { label: string; value: TriggerCrRequest["action"] }[] = [
  { label: "Shutdown", value: "shutdown" },
  { label: "Cancel", value: "cancel" },
  { label: "Relocate", value: "relocate" },
];

const ConfirmTriggerModal: React.FC<ConfirmTriggerModalProps> = ({ open, station, onClose, onTriggerSuccess }) => {
  // state luu action dang chon trong radio group - mac dinh chon action dau tien de form luon co gia tri hop le khi mo modal
  const [action, setAction] = useState<TriggerCrRequest["action"]>("shutdown");

  // state loading rieng cho nut Xac nhan, tranh NOC bam nhieu lan lien tuc gay trigger CR trung lap
  const [submitting, setSubmitting] = useState<boolean>(false);

  // khong co station thi khong render noi dung modal, tranh loi truy cap field tren null
  if (!station) {
    return null;
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // goi dung ham co san trong R012Service, khong tu viet lai logic goi API o day
      const response = await triggerCr({
        tram_id: station.tram_id,
        tram_name: station.tram_name,
        action,
      });

      // bao session_id ra ngoai cho TacDongTram.tsx, thay the console.log truoc day - de TacDongTram.tsx
      // set vao activeCrSessionId va noi sang KetQuaCR (SseProgressLog/CrResultsByDirection) theo doi SSE realtime
      onTriggerSuccess(response.session_id);

      message.success(response.message || "Da kich hoat CR thanh cong");
      onClose();
    } catch (error) {
      // loi trigger that bai phai hien ro cho NOC biet, khong duoc de UI im lang hoac crash
      message.error((error as Error)?.message || "Trigger CR that bai, vui long thu lai");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Xac nhan Trigger CR"
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={submitting}
      okText="Xac nhan"
      cancelText="Huy"
    >
      {/* thong tin tram hien read-only, NOC chi xem lai truoc khi xac nhan, khong cho sua truc tiep o day */}
      <Descriptions column={1} bordered size="small" style={{ marginBottom: "1rem" }}>
        <Descriptions.Item label="Ma tram">{station.tram_id}</Descriptions.Item>
        <Descriptions.Item label="Ten tram">{station.tram_name}</Descriptions.Item>
        <Descriptions.Item label="Trang thai hien tai">{station.trang_thai}</Descriptions.Item>
      </Descriptions>

      {/* radio group cho action - dung dung 3 gia tri enum that, khong them tuy chon ngoai schema */}
      <Radio.Group
        options={ACTION_OPTIONS}
        value={action}
        onChange={(e) => setAction(e.target.value)}
        optionType="button"
      />
    </Modal>
  );
};

export default ConfirmTriggerModal;
