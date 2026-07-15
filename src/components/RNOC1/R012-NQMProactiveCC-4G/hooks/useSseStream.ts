// hook ket noi SSE that toi GET /api/v1/cr/stream/{session_id}, dung EventSource chuan cua trinh duyet
// da xac nhan tai Buoc 0 (doc source that api/routers/sse.py): endpoint nay KHONG co Depends(get_current_user)
// va main.py KHONG co middleware auth toan cuc nao - nen KHONG can header Authorization, EventSource native
// dung duoc binh thuong, khong can hack qua fetch + ReadableStream
import { useEffect, useState } from "react";
import { CrStreamEvent } from "../types";

// trang thai tong cua 1 phien theo doi SSE - rieng biet voi tung log don le, dung de cac component con
// (SseProgressLog/CrResultsByDirection) biet luc nao nen goi API lay ket qua cuoi cung, luc nao con dang cho
export type CrStreamStatus = "idle" | "running" | "done" | "error";

// goi 1 log da nhan duoc, boc them receivedAt vi BE KHONG gui timestamp trong payload SSE
// (khac CrLogItem.created_at lay tu DB) - phai tu ghi lai thoi diem FE nhan duoc de hien "thoi gian" cho NOC
export interface CrStreamLogEntry {
  event: CrStreamEvent; // du lieu goc tu SSE, giu nguyen 100% khong bien doi
  receivedAt: number; // Date.now() luc FE nhan duoc event nay
}

interface UseSseStreamResult {
  logs: CrStreamLogEntry[];
  status: CrStreamStatus;
}

// lay CUNG 1 nguon base URL voi services/r012Request.ts, khong tu hardcode 127.0.0.1:8000 rieng o day -
// tranh 2 noi doc 2 gia tri khac nhau neu sau nay doi R012_API_URL trong .env
const R012_API_BASE_URL = process.env.R012_API_URL || "http://127.0.0.1:8000/api/v1";

export const useSseStream = (sessionId: number | null): UseSseStreamResult => {
  const [logs, setLogs] = useState<CrStreamLogEntry[]>([]);
  const [status, setStatus] = useState<CrStreamStatus>("idle");

  useEffect(() => {
    // reset log/status moi khi sessionId doi (hoac ve null) - tranh giu log cua session cu lan sang session moi
    setLogs([]);

    if (sessionId === null) {
      // chua co session nao dang can theo doi - khong ket noi gi ca, giu nguyen trang thai idle
      setStatus("idle");
      return;
    }

    setStatus("running");

    const eventSource = new EventSource(`${R012_API_BASE_URL}/cr/stream/${sessionId}`);

    eventSource.onmessage = (e) => {
      // BE chi gui "data:", KHONG dat ten "event:" rieng (sse.py dong 38: yield f"data: {json.dumps(event)}\n\n")
      // nen moi event deu roi vao onmessage mac dinh, khong can addEventListener voi ten event rieng
      const event: CrStreamEvent = JSON.parse(e.data);
      setLogs((prev) => [...prev, { event, receivedAt: Date.now() }]);

      if (event.status === "failed" || event.status === "timeout" || event.error) {
        // that bai hoac timeout (sse.py dong 33-37) deu la ket thuc bat thuong - dong ket noi ngay,
        // tranh giu socket mo vo ich sau khi BE da ngung gui them event
        setStatus("error");
        eventSource.close();
      } else if (event.done) {
        // done=true la tin hieu CHINH THUC hoan tat tu BE (buoc 17/18 thanh cong trong trigger_cr_use_case.py)
        setStatus("done");
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      // loi ket noi (mang rot, server dong dot ngot...) - EventSource mac dinh tu dong retry ngam,
      // nhung o day chu dong dong va bao trang thai error de NOC thay ro thay vi cho retry vo han lang le
      setStatus("error");
      eventSource.close();
    };

    // dong ket noi khi unmount HOAC khi sessionId doi (cleanup chay truoc khi effect moi chay lai voi sessionId moi) -
    // tranh ro ri ket noi SSE cu van con mo song song voi ket noi moi
    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return { logs, status };
};

export default useSseStream;
