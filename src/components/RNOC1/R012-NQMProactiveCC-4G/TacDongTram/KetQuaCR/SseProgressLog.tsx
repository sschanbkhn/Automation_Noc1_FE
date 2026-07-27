import React, { useEffect, useRef } from "react";
import { CrStreamLogEntry, CrStreamStatus } from "../../hooks/useSseStream";

// props nhan TU useSseStream() da goi 1 lan duy nhat o TacDongTram.tsx - component nay KHONG tu goi useSseStream
// rieng, tranh mo 2 ket noi SSE trung lap toi cung 1 session_id (xem comment o TacDongTram.tsx)
interface SseProgressLogProps {
  logs: CrStreamLogEntry[];
  status: CrStreamStatus;
}

const SseProgressLog: React.FC<SseProgressLogProps> = ({ logs, status }) => {
  // ref tro toi dong log cuoi cung - dung scrollIntoView de tu dong cuon xuong khi co event moi,
  // khong bat NOC phai tu keo chuot xem tien do moi nhat
  const lastLogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // cuon xuong MOI KHI so luong log thay doi (co event SSE moi nhan duoc)
    lastLogRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs.length]);

  // status "idle" nghia la chua co session_id nao duoc trigger trong phien lam viec nay (chua bam Trigger CR lan nao)
  if (status === "idle") {
    return <div style={{ color: "#8c8c8c", padding: "1rem" }}>Chua co phien CR nao dang thuc hien</div>;
  }

  return (
    <div
      style={{
        height: "300px",
        overflowY: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
        padding: "0.75rem",
        fontFamily: "monospace",
        fontSize: "0.85rem",
        backgroundColor: "#0f172a",
      }}
    >
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        // mau khac nhau theo status cua tung buoc, giup NOC nhan biet ngay buoc nao loi/dang chay/thanh cong
        const statusColor =
          log.event.status === "failed" || log.event.status === "timeout"
            ? "#f87171"
            : log.event.status === "running"
            ? "#facc15"
            : "#4ade80";

        return (
          // gan ref vao dong CUOI CUNG (index === logs.length - 1) de scrollIntoView luon nham dung dong moi nhat
          <div key={index} ref={isLast ? lastLogRef : undefined} style={{ marginBottom: "4px", color: "#e2e8f0" }}>
            {/* receivedAt la thoi diem FE nhan duoc, KHONG phai timestamp tu BE (BE khong gui timestamp trong SSE payload) */}
            <span style={{ color: "#64748b" }}>[{new Date(log.receivedAt).toLocaleTimeString()}]</span>{" "}
            {log.event.step !== undefined && (
              <span>
                Buoc {log.event.step} - {log.event.step_name}:{" "}
              </span>
            )}
            <span style={{ color: statusColor }}>{log.event.msg ?? log.event.status}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SseProgressLog;
