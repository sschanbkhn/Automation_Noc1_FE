import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Badge, Button, Card, Col, Form, Modal, Pagination, Row, Spinner, Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { runExportSync, runImportSync } from "../../../redux/Healthcheck/configSyncSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import {
  createRequestSortFunction, filterData, getClassNamesFor, sortData,
} from "../../../utils/tableUtils";

const CONFIRM_WORD = "GHI ĐÈ";
const PAGE_SIZE = 20;

const ReportTable = ({ rows, columns, emptyLabel }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const requestSort = createRequestSortFunction(setSortConfig, sortConfig);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterData(rows, searchTerm, []), [rows, searchTerm]);
  const sorted = useMemo(
    () => (sortConfig.key ? sortData(filtered, sortConfig.key, sortConfig.direction) : filtered),
    [filtered, sortConfig]
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [searchTerm, sortConfig]);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="mb-3">
      <Form.Control
        size="sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm..."
        className="mb-2"
        style={{ maxWidth: 320 }}
      />
      <Table responsive size="sm" bordered className="small mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                role="button"
                onClick={() => requestSort(c.key)}
                className={getClassNamesFor(sortConfig, c.key)}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-2">
                {emptyLabel || "Không tìm thấy dòng nào khớp tìm kiếm"}
              </td>
            </tr>
          ) : (
            paged.map((row, i) => (
              <tr key={row.platform || `${row.group}-${row.subsystem}` || i}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : (row[c.key] || "—")}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {totalPages > 1 && (
        <Pagination size="sm" className="justify-content-center mt-2 mb-0">
          <Pagination.Prev onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
        </Pagination>
      )}
    </div>
  );
};

const CodeBlock = ({ title, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-bold small">{title}</span>
        <Button size="sm" variant="outline-secondary" onClick={handleCopy}>
          {copied ? "Đã copy!" : "Copy"}
        </Button>
      </div>
      <pre className="bg-light border rounded p-2 small" style={{ maxHeight: 260, overflow: "auto" }}>
        {code}
      </pre>
    </div>
  );
};

const ConfigSync = () => {
  const dispatch = useDispatch();
  const { importReport, importPreviewed, exportResult, running } = useSelector((s) => s.configSync);

  const isSuperUser = useMemo(() => {
    const claims = getJwtClaims();
    return Boolean(claims?.is_superuser || claims?.role === "super");
  }, []);

  const [showApplyImport, setShowApplyImport] = useState(false);
  const [showApplyExport, setShowApplyExport] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handlePreviewImport = () => dispatch(runImportSync({ apply: false }));
  const handleApplyImport = async () => {
    await dispatch(runImportSync({ apply: true }));
    setShowApplyImport(false);
  };

  const handlePreviewExport = () => dispatch(runExportSync({ applyInplace: false }));
  const handleApplyExport = async () => {
    await dispatch(runExportSync({ applyInplace: true }));
    setShowApplyExport(false);
    setConfirmText("");
  };

  if (!isSuperUser) {
    return (
      <>
        <TopNavbarHealth />
        <Alert variant="warning" className="mt-3">
          Chỉ Super Admin mới có thể dùng chức năng Đồng bộ File ⇄ DB.
        </Alert>
      </>
    );
  }

  return (
    <>
      <TopNavbarHealth />

      <Alert variant="warning" className="mt-3">
        <strong>Dùng rất hiếm — chỉ khi cần khắc phục sự cố hoặc chuyển server/DB.</strong> Import
        ghi vào DB production (an toàn, không ghi đè dữ liệu đã có). Export "Ghi đè trực tiếp" sẽ
        sửa file Python đang được celery/uvicorn dùng — sau khi ghi bắt buộc phải tự SSH vào server
        chạy <code>sudo systemctl restart celery.service uvicorn.service</code> để áp dụng.
      </Alert>

      {/* ── Import: file tĩnh → DB ────────────────────────────────────── */}
      <Row className="mb-3">
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5" className="mb-0">Import: File tĩnh → DB</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">
                Đọc PLATFORM_CONFIG/GROUP_SCHEMA_PERMISSIONS tĩnh, tạo PlatformTaskMapping/
                PlatformGroup/Subsystem/GroupSchemaPermission cho những platform/group{" "}
                <strong>chưa có row DB</strong> (không bao giờ ghi đè cái đã có).
              </p>
              <div className="d-flex gap-2 mb-3">
                <Button variant="outline-primary" onClick={handlePreviewImport} disabled={running}>
                  {running ? <Spinner size="sm" animation="border" /> : "Xem trước (dry-run)"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowApplyImport(true)}
                  disabled={running || !importPreviewed}
                  title={!importPreviewed ? "Bấm 'Xem trước' trước khi áp dụng" : ""}
                >
                  Áp dụng vào DB
                </Button>
              </div>

              {importReport && (
                <>
                  <div className="d-flex gap-2 mb-2 flex-wrap">
                    <Badge bg="info" text="dark">{importReport.taxonomy_created?.length || 0} group/subsystem sẽ tạo mới</Badge>
                    <Badge bg="secondary">{importReport.taxonomy_skipped_existing?.length || 0} group/subsystem đã có</Badge>
                    <Badge bg="success">{importReport.created?.length || 0} platform mapping sẽ tạo mới</Badge>
                    <Badge bg="secondary">{importReport.skipped_existing?.length || 0} mapping đã có (bỏ qua)</Badge>
                    <Badge bg="warning" text="dark">
                      {importReport.skipped_no_platform?.length || 0} thiếu Platform DB
                    </Badge>
                    <Badge bg="danger">{importReport.skipped_no_profile?.length || 0} thiếu profile_key</Badge>
                  </div>

                  {importReport.taxonomy_created?.length > 0 && (
                    <>
                      <div className="fw-bold small mb-1">Group/Subsystem sẽ tạo mới (catalog)</div>
                      <ReportTable
                        rows={importReport.taxonomy_created}
                        columns={[
                          { key: "group", label: "Group" },
                          { key: "subsystem", label: "Subsystem" },
                        ]}
                      />
                    </>
                  )}

                  {importReport.created?.length > 0 && (
                    <>
                      <div className="fw-bold small mb-1">Platform mapping sẽ tạo mới</div>
                      <ReportTable
                        rows={importReport.created}
                        columns={[
                          { key: "platform", label: "Platform" },
                          { key: "profile_key", label: "Profile", render: (row) => <code>{row.profile_key}</code> },
                          { key: "group", label: "Group" },
                          { key: "subsystem", label: "Subsystem" },
                        ]}
                      />
                    </>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Export: DB → file tĩnh ─────────────────────────────────────── */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5" className="mb-0">Export: DB → File tĩnh</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">
                Sinh lại nội dung PLATFORM_CONFIG/PLATFORM_GROUPS/GROUP_SCHEMA_PERMISSIONS từ trạng
                thái DB hiện tại (đã gồm mọi thay đổi qua UI) — dùng để "đóng băng" lại thành file
                Python, phòng khi DB lỗi hoặc chuyển project sang server/DB khác.
              </p>
              <div className="d-flex gap-2 mb-3">
                <Button variant="outline-primary" onClick={handlePreviewExport} disabled={running}>
                  {running ? <Spinner size="sm" animation="border" /> : "Sinh nội dung (preview)"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowApplyExport(true)}
                  disabled={running || !exportResult}
                  title={!exportResult ? "Bấm 'Sinh nội dung' trước" : ""}
                >
                  Ghi đè trực tiếp vào file (+ backup)
                </Button>
              </div>

              {exportResult && (
                <>
                  {exportResult.unresolved_profiles?.length > 0 && (
                    <Alert variant="warning" className="small">
                      Bỏ qua {exportResult.unresolved_profiles.length} platform không suy được
                      profile_key: {exportResult.unresolved_profiles.join(", ")}
                    </Alert>
                  )}
                  {exportResult.applied && (
                    <Alert variant="success" className="small">
                      Đã ghi đè + backup tại: {exportResult.backup_paths?.join(", ")}. Nhớ SSH restart
                      service để áp dụng.
                    </Alert>
                  )}
                  <CodeBlock title="PLATFORM_CONFIG" code={exportResult.platform_config_snippet} />
                  <CodeBlock title="PLATFORM_GROUPS" code={exportResult.platform_groups_snippet} />
                  <CodeBlock title="GROUP_SCHEMA_PERMISSIONS" code={exportResult.group_schema_permissions_snippet} />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Confirm apply import ─────────────────────────────────────── */}
      <Modal show={showApplyImport} onHide={() => setShowApplyImport(false)} size="sm">
        <Modal.Header closeButton><Modal.Title>Xác nhận Import</Modal.Title></Modal.Header>
        <Modal.Body>
          Ghi {importReport?.taxonomy_created?.length || 0} PlatformGroup/Subsystem +{" "}
          {importReport?.created?.length || 0} PlatformTaskMapping +{" "}
          {importReport?.group_schema_created?.length || 0} GroupSchemaPermission mới vào DB production?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyImport(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleApplyImport} disabled={running}>
            {running ? <Spinner size="sm" animation="border" /> : "Áp dụng"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Confirm apply export (in-place) ─────────────────────────── */}
      <Modal show={showApplyExport} onHide={() => { setShowApplyExport(false); setConfirmText(""); }}>
        <Modal.Header closeButton><Modal.Title>⚠️ Xác nhận ghi đè file production</Modal.Title></Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="small mb-3">
            Thao tác này ghi đè trực tiếp <code>healthcheck_platform_config.py</code> và{" "}
            <code>platform_config.py</code> trên server (có backup tự động trước khi ghi). Sau khi
            ghi, phải tự SSH restart <code>celery.service</code>/<code>uvicorn.service</code> mới áp
            dụng — nếu không restart, file mới chưa có hiệu lực.
          </Alert>
          <Form.Group>
            <Form.Label>
              Gõ đúng <strong>{CONFIRM_WORD}</strong> để xác nhận:
            </Form.Label>
            <Form.Control value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowApplyExport(false); setConfirmText(""); }}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleApplyExport}
            disabled={running || confirmText.trim() !== CONFIRM_WORD}
          >
            {running ? <Spinner size="sm" animation="border" /> : "Ghi đè"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ConfigSync;
