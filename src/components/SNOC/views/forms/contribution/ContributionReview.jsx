import React, { useEffect, useMemo } from "react";
import { Card, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import DraftsTable from "./DraftsTable";
import { fetchMyDrafts } from "../../../redux/contribution/contributionSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

export default function ContributionReview() {
  const dispatch = useDispatch();
  const { drafts, loading } = useSelector((s) => s.contribution);

  const claims = getJwtClaims();
  const isAdmin = claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  const isSuperUser = claims?.is_superuser === true;

  useEffect(() => {
    dispatch(fetchMyDrafts());
  }, [dispatch]);

  const pending = useMemo(
    () => drafts.filter((d) => d.status === "submitted").sort((a, b) => b.id - a.id),
    [drafts]
  );
  const awaitingDeploy = useMemo(
    () => drafts.filter((d) => d.status === "approved").sort((a, b) => b.id - a.id),
    [drafts]
  );

  return (
    <>
      <TopNavbarHealth />
      <div className="p-3">
        <h5 className="mb-3">✅ Duyệt đóng góp</h5>
        <p className="text-muted small">
          Danh sách hàm phân tích (AI hoặc tự viết) đang chờ admin duyệt, và đã duyệt chờ super admin deploy.
        </p>

        {!isAdmin && (
          <div className="alert alert-info mb-3">
            Bạn chỉ xem được trạng thái — cần quyền admin/super admin để Approve/Reject/Deploy.
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <Card className="mb-3">
              <Card.Header>🕓 Chờ duyệt ({pending.length})</Card.Header>
              <Card.Body>
                <DraftsTable
                  drafts={pending}
                  isAdmin={isAdmin}
                  isSuperUser={isSuperUser}
                  emptyText="Không có draft nào đang chờ duyệt."
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>🚀 Đã duyệt — chờ deploy ({awaitingDeploy.length})</Card.Header>
              <Card.Body>
                <DraftsTable
                  drafts={awaitingDeploy}
                  isAdmin={isAdmin}
                  isSuperUser={isSuperUser}
                  emptyText="Không có draft nào chờ deploy."
                />
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
