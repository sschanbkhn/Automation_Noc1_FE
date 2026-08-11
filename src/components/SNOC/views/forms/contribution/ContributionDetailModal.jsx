import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import SandboxResult from "./SandboxResult";
import { STATUS_VARIANT } from "./DraftsTable";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import {
  approveDraft, deployDraft, fetchAuditLog, rejectDraft, runSandbox, saveManualCode,
} from "../../../redux/contribution/contributionSlice";

export default function ContributionDetailModal({ draft, show, onClose, isAdmin, isSuperUser }) {
  const dispatch = useDispatch();
  const {
    approving, deploying, sandboxRunning, auditLoading, savingManualCode,
    auditByDraftId, sandboxResultByDraftId,
  } = useSelector((s) => s.contribution);

  const auditLogs = draft ? auditByDraftId[draft.id] || [] : [];
  const sandboxResult = draft ? sandboxResultByDraftId[draft.id] : null;
  const currentUsername = getJwtClaims()?.username;

  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState("");

  useEffect(() => {
    if (show && draft) dispatch(fetchAuditLog(draft.id));
  }, [show, draft?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Đóng modal (hoặc đổi sang draft khác) thì luôn thoát chế độ sửa — tránh giữ
  // form sửa dở dang của draft cũ khi mở draft mới.
  useEffect(() => {
    setEditing(false);
  }, [show, draft?.id]);

  if (!draft) return null;

  const canEdit = draft.status === "deployed"
    ? isAdmin
    : (isAdmin || draft.creator_username === currentUsername);

  const handleStartEdit = () => {
    setEditCode(draft.generated_code || "");
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editCode.trim()) return;
    dispatch(saveManualCode({ draftId: draft.id, code: editCode })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setEditing(false);
        onClose();
      }
    });
  };

  const handleReject = () => {
    const reason = window.prompt("Lý do reject (tuỳ chọn):", "") || "";
    dispatch(rejectDraft({ draftId: draft.id, reason })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") onClose();
    });
  };

  const handleApprove = () => {
    dispatch(approveDraft(draft.id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") onClose();
    });
  };

  const handleDeploy = () => {
    dispatch(deployDraft(draft.id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") onClose();
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          #{draft.id} — {draft.platform} / <code>{draft.fn_name}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
          <Badge bg={STATUS_VARIANT[draft.status] || "secondary"}>{draft.status}</Badge>
          <Badge bg={draft.source === "manual" ? "dark" : "info"}>
            {draft.source === "manual" ? "✍️ Thủ công" : "🤖 AI"}
          </Badge>
          <span className="text-muted small">
            Người tạo <strong>{draft.creator_username || "—"}</strong> ·{" "}
            Tạo lúc {draft.created_at ? new Date(draft.created_at).toLocaleString("vi-VN") : "—"} ·{" "}
            Cập nhật {draft.updated_at ? new Date(draft.updated_at).toLocaleString("vi-VN") : "—"}
          </span>
        </div>

        <div className="mb-3 small">
          <div><strong>Command pattern:</strong> <code>{draft.command_pattern}</code></div>
          {draft.device_command && (
            <div><strong>Lệnh thiết bị:</strong> <code>{draft.device_command}</code></div>
          )}
        </div>

        <div className="mb-3">
          <div className="fw-bold small mb-1">Mô tả</div>
          <div className="small">{draft.description || <span className="text-muted">— không có —</span>}</div>
        </div>

        <div className="mb-3">
          <div className="fw-bold small mb-1">Sample output (paste từ thiết bị)</div>
          <pre className="bg-light p-2 small border rounded" style={{ maxHeight: 220, overflow: "auto" }}>
            {draft.sample_output || "—"}
          </pre>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <div className="fw-bold small">Code</div>
            {!editing && canEdit && (
              <Button size="sm" variant="outline-secondary" onClick={handleStartEdit}>
                ✏️ Sửa code
              </Button>
            )}
          </div>

          {editing ? (
            <>
              {draft.status === "deployed" && (
                <Alert variant="warning" className="small py-2">
                  Hàm này đang <strong>deployed</strong> (chạy thật) — lưu code mới sẽ đưa draft về
                  trạng thái <strong>draft</strong>, phải chạy lại Sandbox → Submit → Approve →
                  Deploy thì code mới mới thật sự thay thế code đang chạy.
                </Alert>
              )}
              <Form.Control
                as="textarea"
                rows={14}
                className="font-monospace small"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
              <div className="d-flex gap-2 mt-2">
                <Button
                  size="sm" variant="primary" disabled={savingManualCode || !editCode.trim()}
                  onClick={handleSaveEdit}
                >
                  {savingManualCode
                    ? <><Spinner size="sm" animation="border" className="me-1" />Đang lưu...</>
                    : "💾 Lưu"}
                </Button>
                <Button size="sm" variant="outline-secondary" onClick={() => setEditing(false)}>
                  Huỷ
                </Button>
              </div>
            </>
          ) : (
            <pre className="bg-light p-2 small border rounded" style={{ maxHeight: 320, overflow: "auto" }}>
              {draft.generated_code || "— chưa có code —"}
            </pre>
          )}
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-1">
            <div className="fw-bold small">Sandbox</div>
            <Button
              size="sm" variant="outline-secondary" disabled={sandboxRunning}
              onClick={() => dispatch(runSandbox(draft.id))}
            >
              {sandboxRunning
                ? <><Spinner size="sm" animation="border" className="me-1" />Đang chạy...</>
                : "🧪 Chạy sandbox"}
            </Button>
          </div>
          {sandboxResult
            ? <SandboxResult result={sandboxResult} />
            : <div className="text-muted small">Chưa chạy sandbox trong phiên này — bấm "Chạy sandbox" để kiểm tra code trước khi duyệt.</div>}
        </div>

        <div>
          <div className="fw-bold small mb-1">Lịch sử</div>
          {auditLoading ? (
            <Spinner size="sm" animation="border" />
          ) : auditLogs.length === 0 ? (
            <div className="text-muted small">Chưa có lịch sử thao tác.</div>
          ) : (
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người thực hiện</th>
                  <th>Hành động</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-muted small">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td>{log.actor_username || "—"}</td>
                    <td>{log.action}</td>
                    <td className="small">{log.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isAdmin && draft.status === "submitted" && (
          <>
            <Button variant="outline-danger" disabled={approving} onClick={handleReject}>
              Reject
            </Button>
            <Button variant="outline-success" disabled={approving} onClick={handleApprove}>
              Approve
            </Button>
          </>
        )}
        {isSuperUser && draft.status === "approved" && (
          <Button variant="success" disabled={deploying} onClick={handleDeploy}>
            {deploying ? <Spinner size="sm" animation="border" /> : "🚀 Deploy"}
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}
