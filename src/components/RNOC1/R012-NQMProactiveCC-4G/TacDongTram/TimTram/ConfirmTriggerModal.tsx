import React, { useState } from "react";
import { Modal, Descriptions, Segmented, message } from "antd";
import { triggerCr } from "../../services/R012Service";
import { StationItem, TriggerCrRequest } from "../../types";
// token mau xanh duong dung chung toan module - dong bo mau modal nay voi phan con lai (Viec 1/2)
import { R012_COLORS } from "../../theme";

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
  // state luu action dang chon trong nut chon - mac dinh chon action dau tien de form luon co gia tri hop le khi mo modal
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
      // Viec 2 (24072026, xac nhan voi user): tieu de doi mau chu trang de doc duoc tren nen gradient dam
      // (giong cach Card "Chi tiet session CR" trong EvaluationDetail.tsx da lam)
      title={<span style={{ color: "#fff", fontWeight: 600 }}>Xac nhan Trigger CR</span>}
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={submitting}
      okText="Xac nhan"
      cancelText="Huy"
      // nut Xac nhan dung primaryDark (dam hon primary thuong) theo dung yeu cau "nen primary dam" - day la
      // hanh dong QUAN TRONG (trigger CR that len mang luoi that), can noi bat hon cac nut primary thong
      // thuong khac trong module. Nut Huy giu nguyen mac dinh cua antd (button "default", da la "nut phu" tu
      // nhien, khong can chinh them)
      okButtonProps={{ style: { backgroundColor: R012_COLORS.primaryDark, borderColor: R012_COLORS.primaryDark } }}
      // Viec 2: header nen gradient (dung lai headerGradient co san trong theme.ts, giong R012Header.tsx +
      // Card "Chi tiet session CR") thay vi nen trang mac dinh cua antd Modal - modal truoc do "qua trang/
      // nhat" theo phan anh cua nguoi dung. content bo goc + do bong nhe (cardShadow) de dong bo voi Card
      // dung trong EvaluationDetail.tsx, tao cam giac 1 he thong nhat quan giua modal va card
      styles={{
        header: {
          background: R012_COLORS.headerGradient,
          borderRadius: "8px 8px 0 0",
          border: "none",
          padding: "16px 24px",
        },
        content: {
          borderRadius: "8px",
          boxShadow: R012_COLORS.cardShadow,
        },
        body: { paddingTop: "4px" },
      }}
    >
      {/* thong tin tram hien read-only, NOC chi xem lai truoc khi xac nhan, khong cho sua truc tiep o day.
          labelStyle co dinh chieu rong (giong fix o EvaluationDetail.tsx) de spacing deu giua cac hang,
          khong phu thuoc do dai rieng tung gia tri. Viec 2: THEM mau - label nen xanh nhat (tableRowAlt,
          DUNG token nguoi dung chi dinh - mau tham chieu tu thanh filter Lich su CR), gia tri nen trang de
          tao tuong phan nhe giua 2 cot, ro rang hon nen trang dong nhat mac dinh cua antd */}
      <Descriptions
        column={1}
        bordered
        size="small"
        labelStyle={{
          width: 160,
          fontWeight: 600,
          whiteSpace: "nowrap",
          backgroundColor: R012_COLORS.tableRowAlt,
          color: R012_COLORS.primaryDark,
        }}
        contentStyle={{ backgroundColor: "#ffffff" }}
        style={{ marginBottom: "1.25rem" }}
      >
        <Descriptions.Item label="Ma tram">{station.tram_id}</Descriptions.Item>
        <Descriptions.Item label="Ten tram">{station.tram_name}</Descriptions.Item>
        <Descriptions.Item label="Trang thai hien tai">{station.trang_thai}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginBottom: "6px", fontWeight: 600, color: R012_COLORS.primaryDark }}>Chon hanh dong:</div>
      {/* CSS scoped rieng cho Segmented nay - tang do noi bat cua nut DANG CHON: mac dinh antd Segmented chi
          highlight nhe (nen trang + shadow mo), o day to dam han bang mau primary lam nen + chu trang, ro
          rang hon la dang chon action nao truoc khi Xac nhan Trigger CR (hanh dong quan trong, tranh NOC
          nham lan action). Selector 2 lop (.r012-trigger-action-segmented.ant-segmented ...) de TANG DO
          SPECIFICITY hon rule goc antd, THANG cascade thong thuong, KHONG can !important.
          Viec 2: THEM nen "track" (goc Segmented, phan nen duoi cac muc CHUA duoc chon) mau xanh RAT nhat
          (tableRowAlt) thay vi mau xam/trang tron mac dinh cua antd - de cac lua chon con lai (chua chon)
          cung co chut mau dong bo thay vi trong tron, ro rang la 1 khoi UI thuoc module nay.
          .ant-segmented-thumb la phan tu rieng antd dung de VE hieu ung TRUOT (animation) khi doi lua chon -
          neu khong to mau rieng cho no, giua luc dang truot se bi "mat mau" 1 nhip vi thumb mac dinh trong
          suot, gay cam giac giat/chop mau - to CUNG mau primary de muot mat trong luc chuyen dong */}
      <style>{`
        .r012-trigger-action-segmented.ant-segmented {
          background-color: ${R012_COLORS.tableRowAlt};
        }
        .r012-trigger-action-segmented.ant-segmented .ant-segmented-item-selected {
          background-color: ${R012_COLORS.primary};
          color: #ffffff;
          font-weight: 600;
        }
        .r012-trigger-action-segmented.ant-segmented .ant-segmented-thumb {
          background-color: ${R012_COLORS.primary};
        }
      `}</style>
      {/* Segmented (antd) thay Radio.Group cu - dang nut chon ro rang hon, tu dong ho tro "block" chia deu
          3 nut, phu hop yeu cau "nut chon ro rang, nut dang chon noi bat" */}
      <Segmented
        className="r012-trigger-action-segmented"
        options={ACTION_OPTIONS}
        value={action}
        onChange={(value) => setAction(value as TriggerCrRequest["action"])}
        block
      />
    </Modal>
  );
};

export default ConfirmTriggerModal;
