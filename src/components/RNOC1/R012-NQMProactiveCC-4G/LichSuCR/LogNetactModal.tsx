// Nut "Xem log NetAct" + Modal hien noi dung log, dat trong modal chi tiet session.
//
// === TAI SAO CAN ===
// Khi CR bao PARTIAL_SUCCESS/FAILED, cau hoi dau tien luon la "NetAct tra ve gi". Truoc day phai SSH vao
// server doc file tay, trong khi file da nam san tren dia cua BE. BE ghi duong dan vao
// cr_session.duong_dan_log va mo endpoint GET /sessions/{id}/log-netact tra text tho.
//
// === VI SAO NUT LUON HIEN, KHONG AN THEO duong_dan_log ===
// Dac ta yeu cau "chi hien khi session co duong_dan_log". KHONG lam duoc: BE co cot do trong DB nhung
// KHONG lo ra trong SessionDetailResponse (da doi chieu api/schemas/session_schemas.py cua commit
// 7982ed7 - schema chi co 17 truong, khong co duong_dan_log). FE khong co cach nao biet truoc.
// Cach xu ly: luon hien nut, va khi BE tra 404 thi bao "Khong tim thay file log tren server" - nguoi
// dung van hieu chuyen gi xay ra, chi ton 1 lan bam. Khi BE bo sung truong do vao response thi doi lai
// thanh an nut, sua o dung 1 cho (dieu kien render nut ben duoi).
import React, { useState } from "react";
import { Alert, Button, Modal, Spin } from "antd";
import { getLogNetact } from "../services/R012Service";

interface LogNetactModalProps {
  sessionId: number;
}

const LogNetactModal: React.FC<LogNetactModalProps> = ({ sessionId }) => {
  const [moModal, setMoModal] = useState<boolean>(false);
  const [dangTai, setDangTai] = useState<boolean>(false);
  const [noiDung, setNoiDung] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  // KHONG dung useQuery: log chi doc dung 1 lan khi nguoi dung bam, khong can cache/refetch/invalidate.
  // Boc useQuery vao day chi them mot vong doi phai quan ly ma khong duoc gi
  const moVaTai = async () => {
    setMoModal(true);
    setDangTai(true);
    setNoiDung(null);
    setLoi(null);
    try {
      const text = await getLogNetact(sessionId);
      setNoiDung(text);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        // 404 gom 3 tinh huong ben BE: session khong co duong_dan_log (chay truoc dot nay), file da bi
        // don dep, hoac session khong ton tai. Voi nguoi dung ca 3 deu la "khong co log de xem" nen
        // gop 1 cau - chi tiet ky thuat da nam trong detail cua BE, hien kem ben duoi
        setLoi(
          error?.response?.data?.detail
            ? `Khong tim thay file log tren server (${error.response.data.detail})`
            : "Khong tim thay file log tren server"
        );
      } else {
        setLoi(error?.response?.data?.detail || "Khong doc duoc log NetAct");
      }
    } finally {
      setDangTai(false);
    }
  };

  return (
    <>
      <Button size="small" onClick={moVaTai}>
        Xem log NetAct
      </Button>

      <Modal
        title={`Log NetAct - session #${sessionId}`}
        open={moModal}
        onCancel={() => setMoModal(false)}
        footer={null}
        // rong hon Modal chi tiet session (800px): log la text nhieu cot co dinh, bop hep se lam moi dong
        // bi cuon ngang lien tuc
        width={1000}
      >
        {dangTai && <Spin tip="Dang doc log tu server..." />}

        {loi && <Alert type="warning" showIcon message={loi} />}

        {noiDung !== null && !loi && (
          // <pre> giu NGUYEN xuong dong va khoang trang cua log - day la output may sinh, canh cot co y
          // nghia (bang feedback tung DN). Font mono + khong tu ngat dong (whiteSpace: "pre") de cot
          // khong bi le; maxHeight + overflow de log dai khong keo Modal dai vo tan
          <pre
            style={{
              margin: 0,
              maxHeight: "60vh",
              overflow: "auto",
              whiteSpace: "pre",
              fontFamily: "Consolas, 'Courier New', monospace",
              fontSize: "0.8rem",
              lineHeight: 1.5,
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {noiDung}
          </pre>
        )}

        {noiDung === "" && !loi && !dangTai && (
          // File co that nhung rong - KHAC voi 404 (khong co file). Noi ro de nguoi dung khong tuong
          // man hinh hong
          <Alert type="info" showIcon message="File log ton tai nhung khong co noi dung" />
        )}
      </Modal>
    </>
  );
};

export default LogNetactModal;
