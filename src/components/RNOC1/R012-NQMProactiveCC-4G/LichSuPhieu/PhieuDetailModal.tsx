import React, { useMemo } from "react";
import { Alert, Descriptions, Empty, Modal, Tag } from "antd";
import { PhieuHistoryItem } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
// mau Tag trang thai phieu - khai bao 1 lan o PhieuHistoryTable roi import lai vao day, tranh 2 file tu
// dinh nghia 2 bang mau roi lech nhau khi sau nay them trang thai moi
import { PHIEU_STATUS_COLORS } from "./phieuStatus";

interface PhieuDetailModalProps {
  // null = Modal dang dong. Nhan NGUYEN dong du lieu tu bang thay vi goi lai API theo id: GET /phieu da tra
  // ve DU ca request_payload/response_body/error_message trong tung dong danh sach, goi them 1 endpoint
  // chi-tiet nua la thua (va BE cung chua co endpoint /phieu/{id})
  phieu: PhieuHistoryItem | null;
  onClose: () => void;
}

// BE co the tra request_payload/response_body duoi 2 dang: object JSON da parse, hoac CHUOI JSON tho (khi
// cot trong DB la text). Ham nay quy ve 1 dang duy nhat de phia render khong phai xu ly 2 nhanh:
//  - object -> giu nguyen
//  - chuoi parse duoc -> tra object da parse
//  - chuoi KHONG parse duoc (vd HTML loi tu gateway) -> tra { raw: <chuoi goc> } de van hien duoc nguyen van,
//    KHONG nuot mat noi dung (day thuong chinh la thong tin can nhat khi debug 1 phieu FAILED)
const toObject = (value: unknown): Record<string, unknown> | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    const text = value.trim();
    if (text === "") return null;
    try {
      const parsed = JSON.parse(text);
      // JSON.parse("123") tra ve number - chi coi la object khi that su la object, con lai giu dang raw
      return parsed !== null && typeof parsed === "object" ? (parsed as Record<string, unknown>) : { raw: text };
    } catch {
      return { raw: text };
    }
  }
  return { raw: String(value) };
};

// gia tri 1 field trong request_payload co the la chuoi/so/bool/null hoac object long nhau - ep ve chuoi
// hien thi duoc, KHONG hien "[object Object]" (vo nghia voi NOC khi doi chieu voi CTS)
const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  if (value === "") return "-"; // chuoi rong hien "-" cho de nhin, van phan biet duoc voi gia tri that
  return String(value);
};

// khung <pre> hien JSON nguyen van - dung chung cho response_body va cac gia tri long nhau
const jsonBoxStyle: React.CSSProperties = {
  margin: 0,
  padding: "12px",
  backgroundColor: R012_COLORS.tableRowAlt,
  border: `1px solid ${R012_COLORS.primaryPale}`,
  borderRadius: "6px",
  // JSON CTS co the rat dai (data long nhau) -> gioi han chieu cao + cho cuon, tranh Modal dai vo tan
  maxHeight: "320px",
  overflow: "auto",
  fontSize: "12px",
  lineHeight: 1.5,
  // giu xuong dong cua JSON.stringify(,,2) nhung VAN cho ngat dong dai, tranh tran ngang ra ngoai Modal
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "20px 0 8px",
  fontWeight: 700,
  color: R012_COLORS.primaryDark,
};

const PhieuDetailModal: React.FC<PhieuDetailModalProps> = ({ phieu, onClose }) => {
  // useMemo dat TRUOC moi return som de khong vi pham Rules of Hooks (thu tu hook phai on dinh moi render);
  // phieu=null luc Modal dong nen 2 gia tri nay chi la null, khong ton chi phi
  const payloadObj = useMemo(() => toObject(phieu?.request_payload), [phieu?.request_payload]);
  const responseObj = useMemo(() => toObject(phieu?.response_body), [phieu?.response_body]);

  // request_payload la bang key-value cua ~28 field SaveCellClm - KHONG hardcode danh sach 28 ten field o FE:
  // duyet thang Object.entries de bat ky field nao BE them/bot sau nay deu tu hien, khong phai sua FE theo
  const payloadEntries = useMemo(() => (payloadObj ? Object.entries(payloadObj) : []), [payloadObj]);

  // response_body cua CTS co dang {isError, code, message, data} - tach 4 field dau ra Descriptions cho de
  // doc, chi de rieng "data" duoi dang JSON tho. Kiem tra bang "in" tren tung field thay vi ep kieu, vi
  // response_body co the la loi gateway khong theo dang CTS (luc do rot xuong nhanh hien nguyen JSON)
  const isCtsShape = useMemo(
    () => !!responseObj && ("isError" in responseObj || "code" in responseObj || "message" in responseObj),
    [responseObj]
  );

  return (
    <Modal
      title={`Chi tiet phieu #${phieu?.id ?? ""}`}
      open={phieu !== null}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      {phieu !== null && (
        <div>
          {/* 1. Thong tin chung cua phieu - lay THANG tu dong du lieu, khong tinh toan lai gi */}
          <Descriptions
            column={2}
            bordered
            size="small"
            labelStyle={{ width: 130, whiteSpace: "nowrap", fontWeight: 600 }}
            contentStyle={{ wordBreak: "normal" }}
          >
            <Descriptions.Item label="Cell">{phieu.cell_name}</Descriptions.Item>
            <Descriptions.Item label="Trang thai">
              <Tag color={PHIEU_STATUS_COLORS[phieu.trang_thai] ?? "default"}>{phieu.trang_thai}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ma phieu">{phieu.phieu_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Session CR">{phieu.cr_session_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Thoi diem" span={2}>
              {formatDateTime(phieu.created_at)}
            </Descriptions.Item>
          </Descriptions>

          {/* 2. Loi (neu co) dat NGAY sau thong tin chung, TRUOC ca payload/response: voi 1 phieu FAILED thi
              day la thu NOC can doc dau tien, khong nen bat ho cuon qua bang 28 field moi thay */}
          {phieu.error_message && (
            <Alert
              type="error"
              showIcon
              message="Loi xuat phieu"
              // hien NGUYEN VAN error_message tu BE, KHONG dien giai lai - do la cach NOC biet chinh xac
              // field/nguyen nhan nao lam CTS tu choi phieu
              description={<span style={{ whiteSpace: "pre-wrap" }}>{phieu.error_message}</span>}
              style={{ marginTop: "16px" }}
            />
          )}

          {/* 3. request_payload - bang key-value cac field gui sang CTS */}
          <div style={sectionTitleStyle}>Du lieu gui CTS (request_payload)</div>
          {payloadEntries.length > 0 ? (
            <Descriptions
              column={2}
              bordered
              size="small"
              labelStyle={{ width: 180, whiteSpace: "nowrap", fontWeight: 600 }}
              // ten field CTS kieu "SaveCellClmRequest" khong co khoang trang -> phai cho ngat GIUA tu,
              // neu khong se day cot gia tri hep lai (bai hoc tu EvaluationDetail.tsx: cot bi ep hep se
              // lam gia tri ngan bi ngat vun)
              contentStyle={{ wordBreak: "break-word" }}
            >
              {payloadEntries.map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {formatFieldValue(value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <Empty description="Khong co du lieu request_payload" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}

          {/* 4. response_body - JSON CTS tra ve */}
          <div style={sectionTitleStyle}>Phan hoi CTS (response_body)</div>
          {responseObj ? (
            <>
              {isCtsShape && (
                <Descriptions
                  column={2}
                  bordered
                  size="small"
                  labelStyle={{ width: 130, whiteSpace: "nowrap", fontWeight: 600 }}
                  style={{ marginBottom: "12px" }}
                >
                  <Descriptions.Item label="isError">
                    {/* isError la boolean -> to mau do khi true de nhin phat ra ngay, con lai hien nguyen gia tri */}
                    <span style={{ color: responseObj.isError === true ? R012_COLORS.dangerRed : undefined }}>
                      {formatFieldValue(responseObj.isError)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="code">{formatFieldValue(responseObj.code)}</Descriptions.Item>
                  <Descriptions.Item label="message" span={2}>
                    {formatFieldValue(responseObj.message)}
                  </Descriptions.Item>
                </Descriptions>
              )}
              {/* voi dang CTS thi chi hien rieng "data" (3 field tren da tach ra Descriptions o tren, hien
                  lai la trung); voi dang la thi hien NGUYEN ca object de khong giau mat thong tin nao */}
              <pre style={jsonBoxStyle}>
                {JSON.stringify(isCtsShape ? responseObj.data ?? null : responseObj, null, 2)}
              </pre>
            </>
          ) : (
            <Empty description="Khong co phan hoi CTS" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      )}
    </Modal>
  );
};

export default PhieuDetailModal;
