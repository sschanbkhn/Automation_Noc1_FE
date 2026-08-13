import React from "react";
import { Empty, Tag, Timeline } from "antd";
import type { TimelineItemProps } from "antd";
import { CrLogItem } from "../types";
import { formatDateTime } from "../helpers/formatDateTime";
import { R012_COLORS } from "../theme";

// Log tac dong (22072026, xac nhan voi user) - BE gio da persist tung buoc CR vao cr_log (truoc day
// cr_logs[] LUON rong vi BE chua co repo, xem docs/DEV_LOG.md muc "Persist log tung buoc CR"). Component
// nay CHI nhan mang cr_logs da co san tu EvaluationDetail (khong tu goi API rieng) - giu don gian, tai su
// dung du lieu da fetch chung 1 lan cho ca session.
//
// Chon Timeline (khong phai bang co sort): cr_logs von la 1 CHUOI buoc tuan tu co y nghia (buoc 1 -> 18),
// BE da tra dung thu tu thoi gian (created_at tang dan, xem CrLogRepo.get_by_cr_session_id() ben BE) - sort
// theo cot khac (vd status) se PHA vo mach truyen tien trinh, khong co ich cho muc dich "xem lai CR chay
// nhu the nao". Timeline dung dot mau + duong noi doc de the hien dung ban chat "1 luong tuan tu", con bang
// phu hop hon cho du lieu ROI RAC can loc/sap xep tuy y (vd danh sach cell) - khong dung o day.
interface CrLogTimelineProps {
  crLogs: CrLogItem[];
}

// Mau dot Timeline theo trang thai - dung token R012_COLORS (theme.ts), KHONG hardcode hex rieng o day.
const STATUS_DOT_COLOR: Record<string, string> = {
  running: R012_COLORS.statusRunning,
  success: R012_COLORS.statusSuccess,
  failed: R012_COLORS.dangerRed,
};

// Mau Tag trang thai - dung ten mau ngu nghia co san cua antd (khong phai hex) vi Tag nhan ten mau
// ("success"/"error"/"default"), khac Timeline dot nhan hex truc tiep - 2 API khac nhau cua cung 1 thu vien.
const STATUS_TAG_COLOR: Record<string, string> = {
  running: "default",
  success: "success",
  failed: "error",
};

// Ngay BE bat dau persist cr_log THAT (xac nhan tu docs/DEV_LOG.md BE, muc "Persist log tung buoc CR" -
// 22072026) - dung de bao ro LY DO session cu khong co log, thay vi khung rong kho hieu (BUOC 2).
const CR_LOG_PERSIST_START_DATE = "22/07/2026";

const CrLogTimeline: React.FC<CrLogTimelineProps> = ({ crLogs }) => {
  if (crLogs.length === 0) {
    // Session tao TRUOC 22072026 (hoac loi ghi log khong lam fail CR, xem BE _log_step()) se co cr_logs
    // rong tu nhien - PHAI noi ro ly do thay vi de khung Timeline rong (nguoi dung de hieu nham la loi tai).
    return (
      <Empty
        description={`Session nay chua co log (chi session chay tu ${CR_LOG_PERSIST_START_DATE} tro di moi co)`}
      />
    );
  }

  const items: TimelineItemProps[] = crLogs.map((log, index) => ({
    key: `${log.step}-${index}`,
    color: STATUS_DOT_COLOR[log.status] ?? STATUS_DOT_COLOR.running,
    children: (
      <div>
        <span style={{ fontWeight: 600 }}>
          Buoc {log.step} - {log.step_name}
        </span>{" "}
        <Tag color={STATUS_TAG_COLOR[log.status] ?? "default"}>{log.status}</Tag>
        {log.pct !== null && <span style={{ color: "#8c8c8c", fontSize: "0.85rem" }}> ({log.pct}%)</span>}
        <div style={{ color: "#595959", fontSize: "0.8rem" }}>{formatDateTime(log.created_at)}</div>
        {/* message co the null (vd loi ha tang bat ngo khong kem thong diep ro) - chi render khi co */}
        {log.message && <div style={{ marginTop: "2px" }}>{log.message}</div>}
      </div>
    ),
  }));

  return <Timeline items={items} />;
};

export default CrLogTimeline;
