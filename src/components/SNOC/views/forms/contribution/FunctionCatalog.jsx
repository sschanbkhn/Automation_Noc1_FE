import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Pagination, Row, Spinner, Table } from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  createDraft, deleteDraft, disableBuiltinFunction, enableBuiltinFunction,
  fetchBuiltinSource, fetchPlatformContext, saveManualCode,
} from "../../../redux/contribution/contributionSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";
import ContributionDetailModal from "./ContributionDetailModal";
import BuiltinFunctionModal from "./BuiltinFunctionModal";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const PAGE_SIZE = 10;

export default function FunctionCatalog() {
  const dispatch = useDispatch();
  const { platforms, loadingPlatforms } = useSelector((s) => s.platformDevice);
  const { platformContext, deleting, togglingBuiltin, builtinSourceLoading } = useSelector((s) => s.contribution);

  const claims = getJwtClaims();
  const isAdmin = claims?.is_superuser || ["super", "admin"].includes(claims?.role);
  const isSuperUser = claims?.is_superuser === true;
  const currentUsername = claims?.username;

  const [platform, setPlatform] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailDraft, setDetailDraft] = useState(null);
  const [builtinDetail, setBuiltinDetail] = useState(null);

  useEffect(() => {
    if (!platforms || platforms.length === 0) dispatch(fetchPlatforms());
  }, [dispatch, platforms]);

  const platformOptions = useMemo(
    () => (platforms || []).map((p) => ({ value: p.name, label: p.name })),
    [platforms]
  );

  const handlePlatformChange = (opt) => {
    setPlatform(opt);
    setSearch("");
    setPage(1);
    if (opt?.value) dispatch(fetchPlatformContext(opt.value));
  };

  const allFunctions = useMemo(() => platformContext.existingFunctions || [], [platformContext.existingFunctions]);
  const filteredFunctions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allFunctions;
    return allFunctions.filter((fn) =>
      fn.fn_name.toLowerCase().includes(q) ||
      (fn.label || "").toLowerCase().includes(q) ||
      (fn.description || "").toLowerCase().includes(q)
    );
  }, [allFunctions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredFunctions.length / PAGE_SIZE));
  const pageItems = filteredFunctions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (fn) => {
    if (!window.confirm(
      `Xoá hàm đã deploy "${fn.fn_name}"? Các lệnh SSH tự động thêm từ hàm này sẽ bị vô hiệu hoá.`
    )) return;
    dispatch(deleteDraft(fn.id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled" && platform?.value) {
        dispatch(fetchPlatformContext(platform.value));
      }
    });
  };

  const handleToggleBuiltin = (fn) => {
    if (fn.is_disabled) {
      dispatch(enableBuiltinFunction({ platform: platform.value, fn_name: fn.fn_name })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") dispatch(fetchPlatformContext(platform.value));
      });
      return;
    }
    if (!window.confirm(
      `Tắt hàm built-in "${fn.fn_name}"? Hàm sẽ ngừng sinh alert trên mọi thiết bị của platform này cho tới khi bật lại.`
    )) return;
    const reason = window.prompt("Lý do tắt (tuỳ chọn):", "") || "";
    dispatch(disableBuiltinFunction({ platform: platform.value, fn_name: fn.fn_name, reason })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") dispatch(fetchPlatformContext(platform.value));
    });
  };

  // "Sửa" 1 hàm built-in = tạo 1 draft override cùng fn_name, prefill code = source thật
  // (qua inspect.getsource ở backend), rồi mở ContributionDetailModal để đi tiếp qua đúng
  // pipeline sandbox/submit/approve/deploy — không sửa trực tiếp file .py nguồn.
  const handleEditBuiltin = (fn) => {
    dispatch(fetchBuiltinSource({ platform: platform.value, fn_name: fn.fn_name })).then((srcRes) => {
      if (srcRes.meta.requestStatus !== "fulfilled") return;
      const source = srcRes.payload.source;
      const unresolved = srcRes.payload.unresolved_dependencies || [];
      if (unresolved.length > 0 && !window.confirm(
        `Hàm này phụ thuộc ${unresolved.join(", ")} định nghĩa ở module khác (thường do Django ORM/DB) ` +
        `— KHÔNG tự động kèm được, code sẽ không pass sandbox nếu không tự bổ sung phần đó. ` +
        `Vẫn muốn tiếp tục sửa (để tự hoàn thiện code trong ô Sửa code)?`
      )) return;
      dispatch(createDraft({
        platform: platform.value,
        fn_name: fn.fn_name,
        command_pattern: (fn.command_patterns && fn.command_patterns[0]) || fn.fn_name,
        description: `Sửa từ hàm built-in "${fn.label || fn.fn_name}" (qua Danh mục hàm phân tích) — deploy sẽ tự tắt hàm built-in gốc.`,
        sample_output: fn.sample_output || "",
      })).then((draftRes) => {
        if (draftRes.meta.requestStatus !== "fulfilled") return;
        dispatch(saveManualCode({ draftId: draftRes.payload.id, code: source })).then((codeRes) => {
          if (codeRes.meta.requestStatus === "fulfilled") setDetailDraft(codeRes.payload);
        });
      });
    });
  };

  return (
    <>
      <TopNavbarHealth />
      <div className="p-3">
        <h5 className="mb-3">📚 Danh mục hàm phân tích theo Platform</h5>
        <p className="text-muted small">
          Tra cứu toàn bộ hàm phân tích đã có (built-in + đóng góp đã deploy) cho từng
          platform — tránh đề xuất trùng lặp trước khi tạo draft mới.
        </p>

        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col sm={5}>
                <Select
                  options={platformOptions}
                  value={platform}
                  onChange={handlePlatformChange}
                  isClearable
                  isLoading={loadingPlatforms}
                  styles={SELECT_STYLES}
                  placeholder="Chọn platform..."
                />
              </Col>
              <Col sm={7}>
                <Form.Control
                  placeholder="Tìm theo tên hàm / mô tả..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  disabled={!platform}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {!platform ? (
          <div className="text-muted p-3">Chọn 1 platform để xem danh sách hàm phân tích.</div>
        ) : platformContext.loading ? (
          <div className="d-flex justify-content-center p-4"><Spinner animation="border" /></div>
        ) : (
          <Card>
            <Card.Header>
              Tổng {filteredFunctions.length} hàm
              {search.trim() && ` (lọc từ ${allFunctions.length})`}
            </Card.Header>
            <Card.Body>
              {filteredFunctions.length === 0 ? (
                <div className="text-muted p-3">Không có hàm nào khớp.</div>
              ) : (
                <>
                  <Table size="sm" hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên hàm</th>
                        <th>Nguồn</th>
                        <th>Mô tả</th>
                        <th>Command pattern(s)</th>
                        <th>Lệnh thiết bị</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((fn, i) => {
                        const isBuiltin = fn.origin === "builtin";
                        const canDelete = !isBuiltin && (
                          fn.status === "deployed" ? isAdmin : (isAdmin || fn.creator_username === currentUsername)
                        );
                        return (
                          <tr key={`${fn.fn_name}-${i}`}>
                            <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td><code>{fn.fn_name}</code></td>
                            <td>
                              <Badge bg={isBuiltin ? "secondary" : "dark"}>
                                {isBuiltin ? "Built-in" : "Đóng góp"}
                              </Badge>
                              {isBuiltin && fn.is_disabled && (
                                <Badge bg="warning" text="dark" className="ms-1">Đã tắt</Badge>
                              )}
                            </td>
                            <td className="small">{fn.label || fn.description || "—"}</td>
                            <td className="small">
                              <code>
                                {(fn.command_patterns && fn.command_patterns.join(", ")) || fn.command_pattern || "—"}
                              </code>
                            </td>
                            <td className="small">
                              {fn.device_command ? <code>{fn.device_command}</code> : "—"}
                            </td>
                            <td>
                              <div className="d-flex gap-1 flex-wrap">
                                <Button
                                  size="sm" variant="outline-secondary"
                                  onClick={() => (isBuiltin ? setBuiltinDetail(fn) : setDetailDraft(fn))}
                                >
                                  🔍 Xem
                                </Button>
                                {canDelete && (
                                  <Button
                                    size="sm" variant="outline-danger" disabled={deleting}
                                    onClick={() => handleDelete(fn)}
                                  >
                                    🗑️ Xoá
                                  </Button>
                                )}
                                {isBuiltin && isAdmin && (
                                  <>
                                    <Button
                                      size="sm" variant="outline-primary" disabled={builtinSourceLoading}
                                      onClick={() => handleEditBuiltin(fn)}
                                    >
                                      ✏️ Sửa
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={fn.is_disabled ? "outline-success" : "outline-danger"}
                                      disabled={togglingBuiltin}
                                      onClick={() => handleToggleBuiltin(fn)}
                                    >
                                      {fn.is_disabled ? "↩️ Khôi phục" : "🗑️ Xoá"}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
                </>
              )}
            </Card.Body>
          </Card>
        )}
      </div>

      <ContributionDetailModal
        draft={detailDraft}
        show={!!detailDraft}
        onClose={() => {
          setDetailDraft(null);
          if (platform?.value) dispatch(fetchPlatformContext(platform.value));
        }}
        isAdmin={isAdmin}
        isSuperUser={isSuperUser}
      />
      <BuiltinFunctionModal
        fn={builtinDetail}
        show={!!builtinDetail}
        onClose={() => setBuiltinDetail(null)}
        platform={platform?.value}
        isAdmin={isAdmin}
      />
    </>
  );
}
