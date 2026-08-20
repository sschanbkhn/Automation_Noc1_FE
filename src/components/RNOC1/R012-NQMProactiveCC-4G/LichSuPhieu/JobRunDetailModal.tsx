import React, { useMemo } from "react";
import { Alert, Collapse, Descriptions, Empty, Modal, Spin, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getJobRunDetail } from "../services/R012Service";
import {
  JobRunCellDaXuLy,
  JobRunCellVuotGioiHan,
  JobRunChiTietSession,
  JobRunDetail,
} from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
import { JOB_RUN_STATUS_COLORS } from "./jobRunStatus";
// mau Tag ket qua xuat phieu tung cell trong chi_tiet - DUNG LAI bang mau cua phieu (SUCCESS/FAILED/...)
// thay vi tu dinh nghia bang thu 3, vi day chinh la gia tri trang_thai do XuatPhieuUseCase tra ve, y het
// cot trang thai cua bang Lich su phieu
import { PHIEU_STATUS_COLORS } from "./phieuStatus";

interface JobRunDetailModalProps {
  // null = Modal dang dong. CHI nhan id (khac PhieuDetailModal nhan nguyen dong): dong danh sach cua
  // GET /jobs/runs KHONG chua chi_tiet - BE co y tach ra endpoint rieng vi chi_tiet gom toan bo
  // session x cell cua ca luot chay. Component nay TU goi API theo id, giong EvaluationDetail.tsx
  jobRunId: number | null;
  onClose: () => void;
}

// khung <pre> hien JSON nguyen van - dung cho duong lui khi chi_tiet co hinh dang la (xem ben duoi).
// Giu y het jsonBoxStyle cua PhieuDetailModal de 2 modal trong cung module nhin nhu nhau
const jsonBoxStyle: React.CSSProperties = {
  margin: 0,
  padding: "12px",
  backgroundColor: R012_COLORS.tableRowAlt,
  border: `1px solid ${R012_COLORS.primaryPale}`,
  borderRadius: "6px",
  maxHeight: "320px",
  overflow: "auto",
  fontSize: "12px",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "20px 0 8px",
  fontWeight: 700,
  color: R012_COLORS.primaryDark,
};

const groupTitleStyle: React.CSSProperties = {
  margin: "12px 0 6px",
  fontWeight: 600,
  color: R012_COLORS.primaryDark,
  fontSize: "13px",
};

// do_te la so thuc da lam tron 3 chu so o BE, nhung nhanh ghi loi (xuat_phieu_use_case.py dong 749) ghi
// gia tri CHUA lam tron -> tu lam tron o day de cot so khong bi dai ngoang. Khong co gia tri -> "-"
const formatDoTe = (value: number | undefined): string =>
  typeof value === "number" ? value.toFixed(3) : "-";

// danh sach ten cell thuan (cell_da_co_phieu / cell_vuot_so_lan_thu deu la list[str]) - hien bang Tag cho
// gon, day la nhung nhom thuong chi vai cell
const CellNameTags: React.FC<{ names: string[]; color?: string }> = ({ names, color }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
    {names.map((name) => (
      <Tag key={name} color={color}>
        {name}
      </Tag>
    ))}
  </div>
);

const JobRunDetailModal: React.FC<JobRunDetailModalProps> = ({ jobRunId, onClose }) => {
  const { data, isLoading, isError, error } = useQuery<JobRunDetail>({
    queryKey: ["r012", "job-run-detail", jobRunId],
    queryFn: () => getJobRunDetail(jobRunId as number),
    // Modal dong (jobRunId=null) thi KHONG goi API - queryFn ep kieu `as number` chi an toan nho dieu kien nay
    enabled: jobRunId !== null,
  });

  // chi_tiet la JSONB TU DO ve phia BE (khai bao `dict | None`, co y khong khoa schema de job khong phai
  // doi theo moi lan them truong). Hinh dang THUC TE hien nay la {"sessions": [...]} - da doc truc tiep
  // application/xuat_phieu_use_case.py (dong 770-790 va 845/857). Vi khong co schema ep buoc nen o day
  // KIEM TRA truoc: dung hinh dang quen thuoc -> hien dep theo tung session; hinh dang la -> rot xuong
  // hien JSON nguyen van, KHONG giau mat du lieu
  const sessions: JobRunChiTietSession[] | null = useMemo(() => {
    const raw = data?.chi_tiet?.sessions;
    return Array.isArray(raw) ? raw : null;
  }, [data?.chi_tiet?.sessions]);

  const collapseItems = useMemo(() => {
    if (sessions === null) return [];
    return sessions.map((session, index) => {
      const cellDaXuLy: JobRunCellDaXuLy[] = session.cell_da_xu_ly ?? [];
      const cellVuot: JobRunCellVuotGioiHan[] = session.cell_vuot_gioi_han ?? [];
      const cellDaCoPhieu: string[] = session.cell_da_co_phieu ?? [];
      const cellVuotSoLanThu: string[] = session.cell_vuot_so_lan_thu ?? [];
      const khongCoNhomNao =
        cellDaXuLy.length === 0 &&
        cellVuot.length === 0 &&
        cellDaCoPhieu.length === 0 &&
        cellVuotSoLanThu.length === 0;

      return {
        // cr_session_id la khoa tu nhien; van kem index de phong truong hop 1 session xuat hien 2 lan
        // (khong nen xay ra, nhung key trung se lam React render sai)
        key: `${session.cr_session_id}-${index}`,
        label: (
          <span>
            Session #{session.cr_session_id}
            {session.tram_id ? ` - tram ${session.tram_id}` : ""}
            {typeof session.so_cell_khong_dat === "number"
              ? ` - ${session.so_cell_khong_dat} cell KHONG DAT`
              : ""}
            {/* session bi loi giua chung van duoc ghi vao chi_tiet (chi co cr_session_id + loi) - danh dau
                ngay tren header de khong phai mo tung muc moi biet muc nao hong */}
            {session.loi ? (
              <Tag color="error" style={{ marginLeft: "8px" }}>
                LOI
              </Tag>
            ) : null}
          </span>
        ),
        children: (
          <div>
            {session.loi && (
              <Alert
                type="error"
                showIcon
                message="Session nay bi bo qua"
                // hien NGUYEN VAN chuoi loi tu BE, khong dien giai lai
                description={<span style={{ whiteSpace: "pre-wrap" }}>{session.loi}</span>}
                style={{ marginBottom: "12px" }}
              />
            )}

            {cellDaXuLy.length > 0 && (
              <>
                <div style={groupTitleStyle}>Cell da xu ly ({cellDaXuLy.length})</div>
                <div className="r012-table-scroll">
<table className="r012-table r012-jobrun-detail-table">
                  <thead>
                    <tr>
                      <th>Cell</th>
                      <th>Do te</th>
                      <th>Ket qua</th>
                      <th>Ma phieu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cellDaXuLy.map((cell) => (
                      <tr key={cell.cell_name}>
                        <td>{cell.cell_name}</td>
                        <td>{formatDoTe(cell.do_te)}</td>
                        <td>
                          {/* ket_qua co the la trang thai chuan (SUCCESS/FAILED/DAT_KHONG_XUAT)
                              HOAC chuoi "LOI: <mo ta>" khi goi xuat phieu nem exception -> bang mau khong
                              khop thi ve "default", va hien nguyen van chuoi de doc duoc ly do */}
                          <Tag color={PHIEU_STATUS_COLORS[cell.ket_qua] ?? "default"}>{cell.ket_qua}</Tag>
                        </td>
                        <td>{cell.phieu_id ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </>
            )}

            {cellVuot.length > 0 && (
              <>
                <div style={groupTitleStyle}>
                  Cell vuot gioi han ({cellVuot.length}) - KHONG duoc xuat tu dong, phai lam tay
                </div>
                <div className="r012-table-scroll">
<table className="r012-table r012-jobrun-detail-table">
                  <thead>
                    <tr>
                      <th>Cell</th>
                      <th>Do te</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cellVuot.map((cell) => (
                      <tr key={cell.cell_name}>
                        <td>{cell.cell_name}</td>
                        <td>{formatDoTe(cell.do_te)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </>
            )}

            {cellDaCoPhieu.length > 0 && (
              <>
                <div style={groupTitleStyle}>
                  Cell da co phieu tu luot truoc ({cellDaCoPhieu.length}) - bo qua, day la ly do luot nay
                  xuat it hon tran
                </div>
                <CellNameTags names={cellDaCoPhieu} />
              </>
            )}

            {cellVuotSoLanThu.length > 0 && (
              <>
                <div style={groupTitleStyle}>
                  Cell het luot thu ({cellVuotSoLanThu.length}) - da that bai nhieu lan, NGUNG thu tu dong
                </div>
                {/* to do (warning) de tach han voi nhom "da co phieu" o tren: 2 nhom deu la "bi loai khoi
                    top" nhung nhom nay la viec CON TON can nguoi xu ly, nhom kia thi da xong roi */}
                <CellNameTags names={cellVuotSoLanThu} color="warning" />
              </>
            )}

            {!session.loi && khongCoNhomNao && (
              <Empty description="Session nay khong co cell nao duoc ghi lai" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        ),
      };
    });
  }, [sessions]);

  return (
    <Modal
      title={`Chi tiet luot chay job #${jobRunId ?? ""}`}
      open={jobRunId !== null}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* CSS scoped rieng cho cac bang nho ben trong Modal (class r012-jobrun-detail-table). KHONG dung lai
          class .r012-collapse cua EvaluationDetail.tsx: rule do duoc khai bao BEN TRONG component do nen
          chi ton tai khi component do dang mount - Modal nay mo doc lap se khong co style. Vi vay tu khai
          bao class rieng .r012-jobrun-collapse, van dung DUNG token tu theme.ts nen nhin van dong bo */}
      <style>{`
        .r012-jobrun-detail-table { border-collapse: collapse; margin-bottom: 8px; }
        .r012-jobrun-detail-table thead th {
          text-align: left;
          padding: 6px 8px;
          background-color: ${R012_COLORS.primaryPale};
          color: ${R012_COLORS.primaryDark};
          font-weight: 700;
          font-size: 12px;
          border-bottom: 1px solid ${R012_COLORS.primaryLight};
        }
        .r012-jobrun-detail-table tbody td {
          padding: 6px 8px;
          font-size: 12px;
          border-bottom: 1px solid ${R012_COLORS.tableBorder};
        }
        .r012-jobrun-collapse.ant-collapse .ant-collapse-header {
          background-color: ${R012_COLORS.tableRowAlt};
        }
        .r012-jobrun-collapse.ant-collapse .ant-collapse-header .ant-collapse-header-text {
          color: ${R012_COLORS.primaryDark};
          font-weight: 700;
        }
        .r012-jobrun-collapse.ant-collapse .ant-collapse-expand-icon { color: ${R012_COLORS.primary}; }
        .r012-jobrun-collapse.ant-collapse,
        .r012-jobrun-collapse.ant-collapse .ant-collapse-item {
          border-color: ${R012_COLORS.primaryLight};
        }
      `}</style>

      {isLoading && <Spin tip="Dang tai chi tiet luot chay..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc chi tiet luot chay"
          description={(error as Error)?.message || "Loi khong xac dinh"}
        />
      )}

      {!isLoading && !isError && data && (
        <div>
          {/* 1. Cac con so tong ket cua luot chay - lay THANG tu response, khong tinh toan lai gi */}
          <Descriptions
            column={2}
            bordered
            size="small"
            labelStyle={{ width: 130, whiteSpace: "nowrap", fontWeight: 600 }}
            contentStyle={{ wordBreak: "normal" }}
          >
            <Descriptions.Item label="Loai job">{data.job_type}</Descriptions.Item>
            <Descriptions.Item label="Trang thai">
              <Tag color={JOB_RUN_STATUS_COLORS[data.trang_thai] ?? "default"}>{data.trang_thai}</Tag>
            </Descriptions.Item>
            {/* DA BO muc "Che do" (Thu/That) - BE bo hoan toan che do chay thu, khong con field dry_run */}
            <Descriptions.Item label="Session quet">{data.so_session_quet}</Descriptions.Item>
            <Descriptions.Item label="Bat dau">{formatDateTime(data.started_at)}</Descriptions.Item>
            {/* finished_at null = luot chay chua ket thuc (dang RUNNING) hoac job chet giua chung -
                formatDateTime da tra "-" cho gia tri null */}
            <Descriptions.Item label="Ket thuc">{formatDateTime(data.finished_at)}</Descriptions.Item>
            <Descriptions.Item label="Phieu OK">{data.so_phieu_thanh_cong}</Descriptions.Item>
            <Descriptions.Item label="Phieu loi">{data.so_phieu_that_bai}</Descriptions.Item>
            <Descriptions.Item label="Cell vuot" span={2}>
              {data.so_cell_vuot_gioi_han}
            </Descriptions.Item>
          </Descriptions>

          {/* 2. Loi TOAN CUC (neu co) dat ngay sau cac con so, TRUOC chi_tiet: voi 1 luot FAILED day la thu
              can doc dau tien, khong nen bat cuon qua danh sach session moi thay */}
          {data.error_message && (
            <Alert
              type="error"
              showIcon
              message="Loi lam dung luot chay"
              description={<span style={{ whiteSpace: "pre-wrap" }}>{data.error_message}</span>}
              style={{ marginTop: "16px" }}
            />
          )}

          {/* 3. chi_tiet - danh sach session da quet, moi session 1 muc Collapse */}
          <div style={sectionTitleStyle}>Chi tiet theo session</div>
          {data.chi_tiet === null || data.chi_tiet === undefined ? (
            <Empty description="Luot chay nay khong ghi chi tiet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : sessions === null ? (
            // duong lui: chi_tiet co du lieu nhung KHONG theo dang {"sessions": [...]} quen thuoc (BE khong
            // khoa schema nen ve sau co the doi) - hien nguyen van JSON, tha xau ma con doc duoc con hon
            // nuot mat du lieu
            <>
              <Alert
                type="warning"
                showIcon
                message="chi_tiet khong theo dang quen thuoc - hien nguyen van JSON"
                style={{ marginBottom: "8px" }}
              />
              <pre style={jsonBoxStyle}>{JSON.stringify(data.chi_tiet, null, 2)}</pre>
            </>
          ) : sessions.length === 0 ? (
            <Empty description="Luot chay nay khong quet session nao" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            // mac dinh DONG het cac muc (khong truyen defaultActiveKey): 1 luot chay co the quet vai chuc
            // session, mo san tat ca se lam Modal dai vo tan
            <Collapse className="r012-jobrun-collapse" items={collapseItems} />
          )}
        </div>
      )}
    </Modal>
  );
};

export default JobRunDetailModal;
