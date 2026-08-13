// hook ket noi SSE that toi GET /api/v1/cr/stream/{session_id}, dung EventSource chuan cua trinh duyet
// da xac nhan tai Buoc 0 (doc source that api/routers/sse.py): endpoint nay KHONG co Depends(get_current_user)
// va main.py KHONG co middleware auth toan cuc nao - nen KHONG can header Authorization, EventSource native
// dung duoc binh thuong, khong can hack qua fetch + ReadableStream
import { useEffect, useRef, useState } from "react";
import { CrStreamEvent } from "../types";

// trang thai tong cua 1 phien theo doi SSE - rieng biet voi tung log don le, dung de cac component con
// (SseProgressLog/CrResultsByDirection) biet luc nao nen goi API lay ket qua cuoi cung, luc nao con dang cho
// KHONG them trang thai "reconnecting" rieng - trong luc thu ket noi lai van giu "running" vi CR that su
// van dang chay o BE (chi mat ket noi tam thoi), tranh phai sua lai toan bo noi dang check status hien co
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

// so lan thu reconnect lien tiep toi da truoc khi coi ket noi/CR la chet that
const MAX_RECONNECT_ATTEMPTS = 3;
// khoang cach giua cac lan reconnect - cho BE kip on dinh lai truoc khi FE thu lai, tranh spam ket noi
const RECONNECT_DELAY_MS = 2000;

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

    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    // dem SO LAN RECONNECT LIEN TIEP CHUA THANH CONG - chi tang khi 1 lan connect that bai (onerror hoac
    // status timeout), chi reset ve 0 khi onopen bao ket noi MOI da thiet lap thanh cong - KHONG reset chi
    // vi nhan duoc 1 message bat ky, vi ban than message "timeout" cung la ly do trigger reconnect, neu
    // reset ngay tai do thi dem se khong bao gio tang duoc qua 1
    let reconnectAttempts = 0;
    // co gan de cac callback cua EventSource dang bi thay the/dong (do cleanup hoac da ket thuc han)
    // khong con tac dong len state nua - tranh setState "tre" tren 1 stream da khong con la stream hien hanh
    let stopped = false;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    // mat ket noi (onerror hoac BE bao status="timeout") KHONG dong nghia CR that bai - BE co buffer/replay
    // theo session_id (da sua o BE) nen reconnect lai se nhan tiep duoc cac event da bo lo, khong mat tien
    // trinh. Chi khi da thu HET MAX_RECONNECT_ATTEMPTS lan LIEN TIEP khong ket noi lai duoc moi coi la
    // ket noi/CR chet that va bao loi cho NOC
    const scheduleReconnect = () => {
      if (stopped) return;

      eventSource?.close();

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        stopped = true;
        setStatus("error");
        return;
      }

      reconnectAttempts += 1;
      clearReconnectTimer();
      reconnectTimer = setTimeout(() => {
        if (!stopped) connect();
      }, RECONNECT_DELAY_MS);
    };

    const connect = () => {
      eventSource = new EventSource(`${R012_API_BASE_URL}/cr/stream/${sessionId}`);

      eventSource.onopen = () => {
        // ket noi MOI da thiet lap thanh cong - reset dem reconnect de lan mat ket noi ke tiep (neu co)
        // duoc tinh lai tu dau, khong bi cong don voi cac lan da qua khu troi ket noi
        reconnectAttempts = 0;
      };

      eventSource.onmessage = (e) => {
        // BE chi gui "data:", KHONG dat ten "event:" rieng (sse.py dong 38: yield f"data: {json.dumps(event)}\n\n")
        // nen moi event deu roi vao onmessage mac dinh, khong can addEventListener voi ten event rieng
        const event: CrStreamEvent = JSON.parse(e.data);

        // heartbeat chi de giu ket noi khong bi idle-gap timeout (sse.py) trong luc cho buoc tiep theo,
        // KHONG phai 1 buoc tien trinh that cua CR - bo qua hoan toan, khong day vao danh sach log hien thi
        // de tranh spam UI cho NOC. DA XAC NHAN tu source that (trigger_cr_use_case.py::_emit_heartbeat_loop
        // dong 511-525): BE CHI gui {"type": "heartbeat", "msg": ...}, KHONG co field "status" - nen chi can
        // kiem tra "type", khong can kiem tra them "status" nua
        if (event.type === "heartbeat") {
          return;
        }

        setLogs((prev) => [...prev, { event, receivedAt: Date.now() }]);

        if (event.status === "failed" || event.error) {
          // that bai thuc su tu BE (_fail()) - day la loi CHINH THUC cua CR, khong phai mat ket noi tam
          // thoi, nen dung han ngay, khong reconnect nua
          stopped = true;
          setStatus("error");
          eventSource?.close();
        } else if (event.status === "timeout") {
          // BE bao hang doi qua idle-gap (sse.py _IDLE_GAP_TIMEOUT_SECONDS = 90s, giam tu 120s sau khi co
          // heartbeat 30s) khong co event moi - COI NHU mat ket noi tam thoi
          // (CR co the van dang chay o BE), thu reconnect thay vi dong han nhu truoc
          scheduleReconnect();
        } else if (event.done) {
          // done=true la tin hieu CHINH THUC hoan tat tu BE (buoc 17/18 thanh cong trong trigger_cr_use_case.py)
          stopped = true;
          setStatus("done");
          eventSource?.close();
        }
      };

      eventSource.onerror = () => {
        if (stopped) return;
        // loi ket noi (mang rot, server dong dot ngot...) - THU reconnect thay vi dong han + bao loi ngay,
        // vi CR van co the dang chay binh thuong o BE, chi la socket bi rot tam thoi
        scheduleReconnect();
      };
    };

    connect();

    // dong ket noi (va huy timer reconnect dang cho, neu co) khi unmount HOAC khi sessionId doi (cleanup
    // chay truoc khi effect moi chay lai voi sessionId moi) - tranh ro ri ket noi/timer cu con song song
    // voi ket noi moi
    return () => {
      stopped = true;
      clearReconnectTimer();
      eventSource?.close();
    };
  }, [sessionId]);

  return { logs, status };
};

export default useSseStream;
