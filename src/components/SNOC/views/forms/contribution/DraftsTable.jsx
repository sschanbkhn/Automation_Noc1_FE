import React, { useState } from "react";
import { Badge, Button, Pagination, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { approveDraft, rejectDraft, deployDraft, deleteDraft } from "../../../redux/contribution/contributionSlice";
import ContributionDetailModal from "./ContributionDetailModal";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";

const PAGE_SIZE = 10;

export const STATUS_VARIANT = {
  draft: "secondary",
  submitted: "info",
  approved: "primary",
  rejected: "danger",
  deployed: "success",
};

export default function DraftsTable({ drafts, isAdmin, isSuperUser, onResume, emptyText = "Chưa có draft nào." }) {
  const dispatch = useDispatch();
  const { approving, deploying, deleting } = useSelector((s) => s.contribution);
  const [page, setPage] = useState(1);
  const [detailDraft, setDetailDraft] = useState(null);
  const currentUsername = getJwtClaims()?.username;

  const totalPages = Math.max(1, Math.ceil(drafts.length / PAGE_SIZE));
  const pageItems = drafts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReject = (draft) => {
    const reason = window.prompt("Lý do reject (tuỳ chọn):", "") || "";
    dispatch(rejectDraft({ draftId: draft.id, reason }));
  };

  const handleDelete = (draft) => {
    const warn = draft.status === "deployed"
      ? " Draft đã deploy — các lệnh SSH tự động thêm từ draft này sẽ bị vô hiệu hoá."
      : "";
    if (!window.confirm(`Xoá draft #${draft.id} (${draft.fn_name})?${warn}`)) return;
    dispatch(deleteDraft(draft.id));
  };

  if (drafts.length === 0) {
    return <div className="text-muted p-3">{emptyText}</div>;
  }

  return (
    <>
      <Table size="sm" hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Platform</th>
            <th>Hàm</th>
            <th>Command</th>
            <th>Lệnh thiết bị</th>
            <th>Trạng thái</th>
            <th>Nguồn</th>
            <th>Người tạo</th>
            <th>Tạo lúc</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.platform}</td>
              <td><code>{d.fn_name}</code></td>
              <td><code>{d.command_pattern}</code></td>
              <td><code className="small">{d.device_command || "—"}</code></td>
              <td><Badge bg={STATUS_VARIANT[d.status] || "secondary"}>{d.status}</Badge></td>
              <td>
                <Badge bg={d.source === "manual" ? "dark" : "info"}>
                  {d.source === "manual" ? "Thủ công" : "AI"}
                </Badge>
              </td>
              <td className="text-muted small">{d.creator_username || "—"}</td>
              <td className="text-muted small">
                {d.created_at ? new Date(d.created_at).toLocaleString("vi-VN") : "—"}
              </td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline-secondary" onClick={() => setDetailDraft(d)}>
                    🔍 Xem chi tiết
                  </Button>
                  {d.status === "draft" && onResume && (
                    <Button size="sm" variant="outline-primary" onClick={() => onResume(d.id)}>
                      Tiếp tục
                    </Button>
                  )}
                  {isAdmin && d.status === "submitted" && (
                    <>
                      <Button
                        size="sm" variant="outline-success" disabled={approving}
                        onClick={() => dispatch(approveDraft(d.id))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm" variant="outline-danger" disabled={approving}
                        onClick={() => handleReject(d)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {isSuperUser && d.status === "approved" && (
                    <Button
                      size="sm" variant="success" disabled={deploying}
                      onClick={() => dispatch(deployDraft(d.id))}
                    >
                      {deploying ? <Spinner size="sm" animation="border" /> : "🚀 Deploy"}
                    </Button>
                  )}
                  {(d.status === "deployed"
                    ? isAdmin
                    : (isAdmin || d.creator_username === currentUsername)) && (
                    <Button
                      size="sm" variant="outline-danger" disabled={deleting}
                      onClick={() => handleDelete(d)}
                    >
                      🗑️ Xoá
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center py-2">
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
          </Pagination>
        </div>
      )}

      <ContributionDetailModal
        draft={detailDraft}
        show={!!detailDraft}
        onClose={() => setDetailDraft(null)}
        isAdmin={isAdmin}
        isSuperUser={isSuperUser}
      />
    </>
  );
}
