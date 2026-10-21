import React, { useMemo } from "react";
import { Alert, Button, Collapse, Descriptions, Empty, Modal, Tag, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { PhieuHistoryItem } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
// mau Tag trang thai phieu - khai bao 1 lan o phieuStatus.ts roi import lai vao day, tranh 2 file tu
// dinh nghia 2 bang mau roi lech nhau khi sau nay them trang thai moi
import {
  PHIEU_STATUS_COLORS,
  PHIEU_STATUS_LABELS,
  MAU_THEO_NHOM_TRANG_THAI,
  MAU_NHOM_PENDING,
  NHAN_NHOM_TRANG_THAI,
  NHAN_NHOM_PENDING,
  LY_DO_KHONG_XUAT,
} from "./phieuStatus";

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

// NHAN tieng Viet cho 13 field DE HIEU y nghia trong request_payload (THEM 20/10/2026, yeu cau truc tiep
// user muc 4) - CHI 13 field nay co nhan rieng, dich TU DANH SACH nguoi dung giao (KHONG tu doan y nghia cac
// field con lai). Thu tu khai bao = thu tu hien thi (yeu cau truc tiep user liet ke theo 1 thu tu co chu
// dich: Nam/Thang -> Cell/Tram -> QoS/QoE -> Phuong an -> Noi dung -> Vendor/Dia ly)
const NHAN_FIELD_PAYLOAD: Record<string, string> = {
  Nam: "Nam",
  Thang: "Thang",
  TenCell: "Ten cell",
  SiteName: "Tram cua cell",
  Qos: "QoS gui CTS (min 7 ngay sau)",
  Qoe: "QoE gui CTS (min 7 ngay sau)",
  SoChiTieuVP: "So chi tieu khong dat",
  PhuongAnXuLyDuKien: "Phuong an xu ly (1 He thong / 2 Hien truong)",
  NoiDung: "Noi dung",
  Vendor: "Vendor",
  ProvinceCode: "Ma tinh",
  BuildingCode: "Ma CSHT",
  BuildingName: "Don vi quan ly",
};

// 4 trang thai "job CO Y khong xuat" - request_payload cua nhom nay CHI la 1 marker noi bo (KHONG phai
// payload SaveCellClm that gui CTS, vi chua tung goi CTS lan nao) - yeu cau truc tiep user: "payload chi la
// marker -> hien thong bao ... an bang payload"
const laPhieuKhongXuat = (trangThai: string): boolean => trangThai.startsWith("KHONG_XUAT_");

const PhieuDetailModal: React.FC<PhieuDetailModalProps> = ({ phieu, onClose }) => {
  // useMemo dat TRUOC moi return som de khong vi pham Rules of Hooks (thu tu hook phai on dinh moi render);
  // phieu=null luc Modal dong nen 2 gia tri nay chi la null, khong ton chi phi
  const payloadObj = useMemo(() => toObject(phieu?.request_payload), [phieu?.request_payload]);
  const responseObj = useMemo(() => toObject(phieu?.response_body), [phieu?.response_body]);

  // request_payload la bang key-value cua ~28 field SaveCellClm - KHONG hardcode danh sach 28 ten field o FE:
  // duyet thang Object.entries de bat ky field nao BE them/bot sau nay deu tu hien, khong phai sua FE theo
  const payloadEntries = useMemo(() => (payloadObj ? Object.entries(payloadObj) : []), [payloadObj]);

  // tach 2 nhom (THEM 20/10/2026, yeu cau truc tiep user muc 4): "truong chinh" (13 field co nhan de hieu,
  // hien THEO DUNG THU TU nguoi dung giao - KHONG theo thu tu tho cua payload) va "truong co dinh" (cac key
  // con lai, chua ro y nghia, GIU TEN GOC - khong tu dat nhan, thu gon mac dinh de khong choan cho)
  const truongChinh = useMemo(
    () =>
      Object.keys(NHAN_FIELD_PAYLOAD)
        .filter((key) => payloadObj && key in payloadObj)
        .map((key) => [key, (payloadObj as Record<string, unknown>)[key]] as [string, unknown]),
    [payloadObj]
  );
  const truongConDinh = useMemo(() => payloadEntries.filter(([key]) => !(key in NHAN_FIELD_PAYLOAD)), [payloadEntries]);

  // response_body cua CTS co dang {isError, code, message, data} - tach 4 field dau ra Descriptions cho de
  // doc, chi de rieng "data" duoi dang JSON tho. Kiem tra bang "in" tren tung field thay vi ep kieu, vi
  // response_body co the la loi gateway khong theo dang CTS (luc do rot xuong nhanh hien nguyen JSON)
  const isCtsShape = useMemo(
    () => !!responseObj && ("isError" in responseObj || "code" in responseObj || "message" in responseObj),
    [responseObj]
  );

  const handleSaoChepJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payloadObj, null, 2));
      message.success("Da sao chep JSON vao clipboard");
    } catch {
      // trinh duyet chan quyen clipboard (vd khong phai HTTPS/localhost, hoac nguoi dung tu choi quyen)
      message.error("Khong sao chep duoc (trinh duyet chan quyen clipboard)");
    }
  };

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
          {/* 1. Thong tin chung cua phieu - lay THANG tu dong du lieu, khong tinh toan lai gi. THEM "Phuong
              an" + "Nhom trang thai" canh "Trang thai" (yeu cau truc tiep user muc 4) */}
          <Descriptions
            column={2}
            bordered
            size="small"
            labelStyle={{ width: 130, whiteSpace: "nowrap", fontWeight: 600 }}
            contentStyle={{ wordBreak: "normal" }}
          >
            <Descriptions.Item label="Cell">{phieu.cell_name}</Descriptions.Item>
            <Descriptions.Item label="Trang thai">
              {/* dung CHUNG nhan voi cot Trang thai cua bang (PHIEU_STATUS_LABELS) - modal nay mo ra tu dung
                  dong do, 2 noi ghi 2 kieu se lam nguoi doc tuong la 2 trang thai khac nhau */}
              <Tag color={PHIEU_STATUS_COLORS[phieu.trang_thai] ?? "default"}>
                {PHIEU_STATUS_LABELS[phieu.trang_thai] ?? phieu.trang_thai}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ma phieu">{phieu.phieu_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Session CR">{phieu.cr_session_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Phuong an">{phieu.phuong_an ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Nhom trang thai">
              {phieu.nhom_trang_thai ? (
                <Tag color={MAU_THEO_NHOM_TRANG_THAI[phieu.nhom_trang_thai] ?? MAU_NHOM_PENDING}>
                  {NHAN_NHOM_TRANG_THAI[phieu.nhom_trang_thai] ?? phieu.nhom_trang_thai}
                </Tag>
              ) : (
                <Tag color={MAU_NHOM_PENDING}>{NHAN_NHOM_PENDING}</Tag>
              )}
            </Descriptions.Item>
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

          {/* 3. request_payload - SUA 20/10/2026 (yeu cau truc tiep user muc 4): 4 trang thai KHONG_XUAT_*
              CHUA TUNG goi CTS nen request_payload chi la 1 marker noi bo, KHONG phai 28 field SaveCellClm
              that - an bang payload, hien 1 thong bao ro ly do thay vi bay 1 bang gan nhu vo nghia */}
          <div style={{ ...sectionTitleStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Du lieu gui CTS (request_payload)</span>
            {!laPhieuKhongXuat(phieu.trang_thai) && payloadEntries.length > 0 && (
              <Button size="small" icon={<CopyOutlined />} onClick={handleSaoChepJson}>
                Sao chep JSON
              </Button>
            )}
          </div>
          {laPhieuKhongXuat(phieu.trang_thai) ? (
            <Alert
              type="info"
              showIcon
              message={`Phieu khong gui CTS (${LY_DO_KHONG_XUAT[phieu.trang_thai] ?? "job chu dong bo qua, xem trang thai"})`}
            />
          ) : payloadEntries.length > 0 ? (
            <>
              <Descriptions
                column={2}
                bordered
                size="small"
                labelStyle={{ width: 200, whiteSpace: "nowrap", fontWeight: 600 }}
                // ten field CTS kieu "SaveCellClmRequest" khong co khoang trang -> phai cho ngat GIUA tu,
                // neu khong se day cot gia tri hep lai (bai hoc tu EvaluationDetail.tsx: cot bi ep hep se
                // lam gia tri ngan bi ngat vun)
                contentStyle={{ wordBreak: "break-word" }}
              >
                {truongChinh.map(([key, value]) => (
                  <Descriptions.Item
                    key={key}
                    label={
                      <div>
                        <div>{NHAN_FIELD_PAYLOAD[key]}</div>
                        {/* ten goc NHO ben duoi nhan de hieu (yeu cau truc tiep user: "hien nhan de doc + ten
                            goc nho ben duoi") - doi chieu nhanh voi CTS khi can, khong phai doan nguoc tu
                            nhan tieng Viet */}
                        <div style={{ fontSize: "0.7rem", fontWeight: 400, color: "#8c8c8c" }}>{key}</div>
                      </div>
                    }
                  >
                    {formatFieldValue(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
              {truongConDinh.length > 0 && (
                <Collapse ghost style={{ marginTop: "8px" }}>
                  {/* "Truong co dinh" - cac key con lai CHUA RO y nghia (yeu cau truc tiep user: "giu ten
                      goc, KHONG tu dat nhan") - thu gon MAC DINH de khong choan cho nhung van xem duoc khi
                      can doi chieu CTS, khac 13 truong chinh o tren la thu NOC can doc ngay */}
                  <Collapse.Panel header={`Truong co dinh (${truongConDinh.length})`} key="fixed">
                    <Descriptions column={2} bordered size="small" labelStyle={{ width: 180, whiteSpace: "nowrap", fontWeight: 600 }}>
                      {truongConDinh.map(([key, value]) => (
                        <Descriptions.Item key={key} label={key}>
                          {formatFieldValue(value)}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </Collapse.Panel>
                </Collapse>
              )}
            </>
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
