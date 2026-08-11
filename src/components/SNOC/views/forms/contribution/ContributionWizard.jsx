import React, { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Form, ProgressBar, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ContributionForm from "./ContributionForm";
import SandboxResult from "./SandboxResult";
import { saveManualCode, runSandbox, submitDraft } from "../../../redux/contribution/contributionSlice";

const STEPS = ["Thông tin", "Nhập code", "Sandbox", "Submit"];

// Suy ra step bắt đầu từ trạng thái draft thật (cho phép resume draft dở dang).
function inferStep(draft, sandboxResult) {
  if (!draft) return 1;
  if (!draft.generated_code) return 2;
  if (!sandboxResult || !sandboxResult.passed) return 3;
  return 4;
}

// Luồng thủ công — không có nhánh AI-generate (xem Phase AI trong plan, làm sau).
export default function ContributionWizard({ initialDraftId = null, onDone }) {
  const dispatch = useDispatch();
  const { drafts, savingManualCode, sandboxRunning, submitting, sandboxResultByDraftId } =
    useSelector((s) => s.contribution);

  const [draftId, setDraftId] = useState(initialDraftId);
  const draft = useMemo(() => drafts.find((d) => d.id === draftId) || null, [drafts, draftId]);
  const sandboxResult = draftId ? sandboxResultByDraftId[draftId] : null;

  const [step, setStep] = useState(1);
  const [manualCode, setManualCode] = useState("");
  const [editingManual, setEditingManual] = useState(true);

  useEffect(() => {
    if (draft) setStep(inferStep(draft, sandboxResult));
  }, [draft?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreated = (newDraft) => {
    setDraftId(newDraft.id);
    if (newDraft.generated_code) {
      // Code đã paste + lưu ngay ở Bước 1 — vào thẳng Sandbox.
      setEditingManual(false);
      setStep(3);
    } else {
      setEditingManual(true);
      setStep(2);
    }
  };

  const handleSaveManualCode = () => {
    if (!manualCode.trim()) return;
    dispatch(saveManualCode({ draftId, code: manualCode })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") setEditingManual(false);
    });
  };
  const handleSandbox = () => dispatch(runSandbox(draftId));
  const handleSubmit = () => {
    dispatch(submitDraft(draftId)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setDraftId(null);
        setStep(1);
        onDone?.();
      }
    });
  };

  const reset = () => {
    setDraftId(null);
    setStep(1);
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Bước {step}/4 — {STEPS[step - 1]}</strong>
          {draftId && (
            <Button size="sm" variant="outline-secondary" onClick={reset}>
              ✕ Huỷ, tạo draft khác
            </Button>
          )}
        </div>
        <ProgressBar now={(step / STEPS.length) * 100} className="mb-4" />

        {step === 1 && (
          <ContributionForm onCreated={handleCreated} showCodeField />
        )}

        {step === 2 && draft && (
          <div>
            <div className="mb-2 text-muted small">
              Platform <Badge bg="secondary">{draft.platform}</Badge>{" "}
              Hàm <code>{draft.fn_name}</code>{" "}
              Command <code>{draft.command_pattern}</code>
              {draft.device_command && (
                <>
                  {" "}Lệnh thiết bị <code>{draft.device_command}</code>
                </>
              )}
            </div>

            {editingManual && (
              <div>
                <Form.Control
                  as="textarea"
                  rows={14}
                  className="font-monospace"
                  value={manualCode || draft.generated_code || ""}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={`def ${draft.fn_name}(output: str, cmd: str, threshold: int = 86, **_) -> list[dict]:\n    ...`}
                />
                <Form.Text className="text-muted d-block mb-2">
                  Chữ ký hàm bắt buộc: <code>def {draft.fn_name}(output: str, cmd: str, **_) -&gt; list[dict]</code>.
                  Trả về list dict có tối thiểu key <code>status</code>/<code>command</code>/<code>note</code>.
                  Không được dùng <code>import</code> — sandbox chặn mọi câu lệnh import (kể cả <code>re</code>,
                  module này đã bơm sẵn vào scope). Tham số có tên + giá trị mặc định (vd{" "}
                  <code>threshold: int = 86</code>) sẽ tự động cấu hình được qua Analysis Params sau khi deploy.
                </Form.Text>
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={handleSaveManualCode} disabled={savingManualCode || !manualCode.trim()}>
                    {savingManualCode
                      ? <><Spinner size="sm" animation="border" className="me-1" />Đang lưu...</>
                      : "💾 Lưu code"}
                  </Button>
                  {draft.generated_code && (
                    <Button variant="outline-secondary" onClick={() => setEditingManual(false)}>Huỷ</Button>
                  )}
                </div>
              </div>
            )}

            {draft.generated_code && !editingManual && (
              <>
                <div className="d-flex align-items-center gap-2 mt-3">
                  <Badge bg="dark">✍️ Thủ công</Badge>
                  <Button
                    size="sm" variant="outline-secondary"
                    onClick={() => { setManualCode(draft.generated_code); setEditingManual(true); }}
                  >
                    ✏️ Sửa lại code
                  </Button>
                </div>
                <pre className="bg-light p-2 small border rounded mt-2" style={{ maxHeight: 320, overflow: "auto" }}>
                  {draft.generated_code}
                </pre>
                <div className="d-flex justify-content-end">
                  <Button variant="primary" onClick={() => setStep(3)}>Tiếp tục →</Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && draft && (
          <div>
            <Button variant="primary" onClick={handleSandbox} disabled={sandboxRunning}>
              {sandboxRunning
                ? <><Spinner size="sm" animation="border" className="me-1" />Đang chạy sandbox...</>
                : "🧪 Chạy Sandbox"}
            </Button>
            <div className="mt-3">
              <SandboxResult result={sandboxResult} />
            </div>
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => setStep(2)}>← Quay lại</Button>
              {sandboxResult?.passed && (
                <Button variant="primary" onClick={() => setStep(4)}>Tiếp tục →</Button>
              )}
            </div>
          </div>
        )}

        {step === 4 && draft && (
          <div>
            <Alert variant="info">
              Draft sẽ được gửi cho admin duyệt (approve) rồi super admin deploy —
              sau khi deploy, hàm sẽ chạy thật trong dispatcher production, không cần restart.
            </Alert>
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => setStep(3)}>← Quay lại</Button>
              <Button variant="success" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><Spinner size="sm" animation="border" className="me-1" />Đang gửi...</>
                  : "📤 Submit để admin review"}
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
