import React, { useEffect, useState } from "react";
import { Alert, Badge, Modal, Spinner, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { fetchBuiltinSource } from "../../../redux/contribution/contributionSlice";

export default function BuiltinFunctionModal({ fn, show, onClose, platform, isAdmin }) {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(false);
  const [unresolved, setUnresolved] = useState(null); // null = chưa check, [] = OK, [...] = có tên thiếu

  useEffect(() => {
    // Endpoint kiểm tra là admin-only (BuiltinFunctionSourceView) — user thường vẫn mở được
    // "Xem" (không gate) nhưng bỏ qua bước check này để tránh bắn lỗi 403 không cần thiết.
    if (!show || !fn || !platform || !isAdmin) {
      setUnresolved(null);
      return;
    }
    setChecking(true);
    dispatch(fetchBuiltinSource({ platform, fn_name: fn.fn_name })).then((res) => {
      setChecking(false);
      if (res.meta.requestStatus === "fulfilled") {
        setUnresolved(res.payload.unresolved_dependencies || []);
      }
    });
  }, [show, fn, platform, isAdmin, dispatch]);

  if (!fn) return null;

  const params = fn.params && typeof fn.params === "object" ? Object.entries(fn.params) : [];

  return (
    <Modal show={show} onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <code>{fn.fn_name}</code> <Badge bg="secondary">Built-in</Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {checking && (
          <div className="text-muted small mb-3">
            <Spinner size="sm" animation="border" className="me-1" />
            Đang kiểm tra khả năng sửa qua UI...
          </div>
        )}
        {!checking && unresolved && unresolved.length > 0 && (
          <Alert variant="warning" className="small py-2">
            ⚠️ <strong>Không thể sửa hoàn chỉnh hàm này qua nút "Sửa"</strong> — code phụ thuộc
            {" "}{unresolved.map((n) => <code key={n} className="mx-1">{n}</code>)}
            định nghĩa ở module khác (thường do dùng Django ORM/DB hoặc import riêng), không
            thể tự động kèm vào sandbox. Nếu cần sửa hàm này, phải sửa trực tiếp trong mã
            nguồn (git) theo quy trình thông thường, không qua UI.
          </Alert>
        )}
        {!checking && unresolved && unresolved.length === 0 && (
          <Alert variant="success" className="small py-2">
            ✅ Hàm này có thể sửa hoàn chỉnh qua nút "Sửa" — mọi phụ thuộc đều tự động kèm được.
          </Alert>
        )}

        <div className="mb-3 small">
          <div><strong>Label:</strong> {fn.label || "—"}</div>
          <div>
            <strong>Command pattern(s):</strong>{" "}
            <code>{(fn.command_patterns && fn.command_patterns.join(", ")) || "—"}</code>
          </div>
        </div>

        <div className="mb-3">
          <div className="fw-bold small mb-1">Criteria (điều kiện trigger alert)</div>
          <div className="small">{fn.criteria || <span className="text-muted">— không có —</span>}</div>
        </div>

        <div className="mb-3">
          <div className="fw-bold small mb-1">Sample output</div>
          <pre className="bg-light p-2 small border rounded" style={{ maxHeight: 220, overflow: "auto" }}>
            {fn.sample_output || "—"}
          </pre>
        </div>

        {params.length > 0 && (
          <div>
            <div className="fw-bold small mb-1">Params</div>
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Kiểu</th>
                  <th>Mặc định</th>
                  <th>Nhãn</th>
                  <th>Đơn vị / Min-Max</th>
                </tr>
              </thead>
              <tbody>
                {params.map(([name, p]) => (
                  <tr key={name}>
                    <td><code>{name}</code></td>
                    <td className="small">{p?.type || "—"}</td>
                    <td className="small">{p?.default !== undefined ? String(p.default) : "—"}</td>
                    <td className="small">{p?.label || "—"}</td>
                    <td className="small">
                      {p?.unit || ""}
                      {(p?.min_val !== null && p?.min_val !== undefined) || (p?.max_val !== null && p?.max_val !== undefined)
                        ? ` (${p?.min_val ?? "—"} – ${p?.max_val ?? "—"})`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
