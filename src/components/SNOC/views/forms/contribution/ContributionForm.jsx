import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import { createDraft, fetchPlatformContext, saveManualCode, testCodePreview } from "../../../redux/contribution/contributionSlice";
import SandboxResult from "./SandboxResult";

const SELECT_STYLES = {
  valueContainer: (b) => ({ ...b, maxHeight: "38px", overflowX: "auto", flexWrap: "nowrap" }),
  multiValue:     (b) => ({ ...b, margin: "1px 2px" }),
};

const EMPTY_FORM = {
  platform: "",
  fn_name: "",
  command_pattern: "",
  device_command: "",
  description: "",
  sample_output: "",
};

function PlatformContextPanel({ platform }) {
  const dispatch = useDispatch();
  const { existingCommands, existingFunctions, loading } = useSelector((s) => s.contribution.platformContext);

  useEffect(() => {
    if (platform) dispatch(fetchPlatformContext(platform));
  }, [dispatch, platform]);

  if (!platform) return null;
  if (!loading && existingCommands.length === 0 && existingFunctions.length === 0) return null;

  return (
    <Card className="mb-3 bg-light">
      <Card.Body className="py-2">
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Spinner size="sm" animation="border" /> Đang tải thông tin platform...
          </div>
        ) : (
          <>
            <details className="mb-2">
              <summary className="small text-muted">
                📋 Lệnh đã có sẵn ({existingCommands.length})
              </summary>
              <pre
                className="bg-white p-2 small border rounded mt-1 mb-0"
                style={{ maxHeight: 150, overflow: "auto" }}
              >
                {existingCommands.join("\n")}
              </pre>
            </details>
            <details>
              <summary className="small text-muted">
                🔧 Hàm đang có ({existingFunctions.length})
              </summary>
              <div className="mt-1" style={{ maxHeight: 200, overflow: "auto" }}>
                {existingFunctions.map((fn) => (
                  <div key={fn.fn_name} className="small border-bottom py-1">
                    <Badge bg={fn.origin === "builtin" ? "secondary" : "info"} className="me-1">
                      {fn.origin === "builtin" ? "Built-in" : "Đã đóng góp"}
                    </Badge>
                    <code>{fn.fn_name}</code>{" "}
                    <span className="text-muted">
                      {fn.label || fn.description || ""}
                      {fn.command_patterns?.length ? ` — ${fn.command_patterns.join(", ")}` : ""}
                      {fn.command_pattern ? ` — ${fn.command_pattern}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default function ContributionForm({ onCreated, showCodeField = false }) {
  const dispatch = useDispatch();
  const { platforms, loadingPlatforms } = useSelector((s) => s.platformDevice);
  const { creating, savingManualCode, previewResult, previewRunning } = useSelector((s) => s.contribution);

  const [form, setForm] = useState(EMPTY_FORM);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!platforms || platforms.length === 0) dispatch(fetchPlatforms());
  }, [dispatch, platforms]);

  const platformOptions = useMemo(
    () => (platforms || []).map((p) => ({ value: p.name, label: p.name })),
    [platforms]
  );
  const selectedPlatformOption = useMemo(
    () => platformOptions.find((o) => o.value === form.platform) || null,
    [platformOptions, form.platform]
  );

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canTestCode = code.trim() && form.sample_output.trim() && form.fn_name.trim();
  const handleTestCode = () => {
    if (!canTestCode) return;
    dispatch(testCodePreview({
      code, sample_output: form.sample_output,
      command_pattern: form.command_pattern, fn_name: form.fn_name,
    }));
  };

  const isValid =
    form.platform.trim() &&
    form.fn_name.trim() &&
    form.command_pattern.trim() &&
    form.device_command.trim() &&
    form.description.trim() &&
    form.sample_output.trim() &&
    (!showCodeField || code.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    dispatch(createDraft(form)).then((res) => {
      if (res.meta.requestStatus !== "fulfilled") return;
      const newDraft = res.payload;

      if (showCodeField && code.trim()) {
        dispatch(saveManualCode({ draftId: newDraft.id, code })).then((res2) => {
          setForm(EMPTY_FORM);
          setCode("");
          onCreated?.(res2.meta.requestStatus === "fulfilled" ? res2.payload : newDraft);
        });
      } else {
        setForm(EMPTY_FORM);
        onCreated?.(newDraft);
      }
    });
  };

  return (
    <Form>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>Platform</Form.Label>
        <Col sm={9}>
          <Select
            options={platformOptions}
            value={selectedPlatformOption}
            onChange={(opt) => setForm((f) => ({ ...f, platform: opt?.value || "" }))}
            isClearable
            isLoading={loadingPlatforms}
            styles={SELECT_STYLES}
            placeholder="Chọn platform (vd: hlr, mss, cudb...)"
          />
        </Col>
      </Form.Group>

      <PlatformContextPanel platform={form.platform} />

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>Tên hàm</Form.Label>
        <Col sm={9}>
          <Form.Control
            value={form.fn_name}
            onChange={set("fn_name")}
            placeholder="vd: hlr_analyze_custom_xyz"
          />
          <Form.Text className="text-muted">
            Nên bắt đầu bằng tiền tố platform, vd <code>hlr_analyze_*</code>.
          </Form.Text>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>Command pattern</Form.Label>
        <Col sm={9}>
          <Form.Control
            value={form.command_pattern}
            onChange={set("command_pattern")}
            placeholder="vd: dpwsp"
          />
          <Form.Text className="text-muted">
            Prefix để dispatcher nhận diện — thường là phần đầu của câu lệnh trên thiết bị bên dưới.
            Đối chiếu với "Lệnh đã có sẵn" phía trên để đảm bảo khớp đúng tiền tố của 1 dòng lệnh thật.
          </Form.Text>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>Câu lệnh trên thiết bị</Form.Label>
        <Col sm={9}>
          <Form.Control
            as="textarea"
            rows={2}
            className="font-monospace"
            value={form.device_command}
            onChange={set("device_command")}
            placeholder="vd: dpwsp; hoặc df -h -x tmpfs -x devtmpfs"
          />
          <Form.Text className="text-muted">
            Câu lệnh chính xác gõ qua SSH lên thiết bị để lấy log/output này. Nếu lệnh chưa có
            trong danh sách healthcheck của platform, admin cần thêm vào file{" "}
            <code>healthcheck_&lt;platform&gt;.txt</code> khi deploy để hàm nhận được output thật.
          </Form.Text>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>Mô tả &amp; Tiêu chí đánh giá</Form.Label>
        <Col sm={9}>
          <Form.Control
            as="textarea"
            rows={4}
            value={form.description}
            onChange={set("description")}
            placeholder={
              "VD: Kiểm tra dung lượng ổ đĩa trên các mount point.\n" +
              "ALERT nếu bất kỳ mount point nào có Use% > 90%.\n" +
              "ALERT nếu File Full? khác FALSE, hoặc Percent Full ≥ 80%."
            }
          />
          <Form.Text className="text-muted">
            Nêu rõ 3 ý: (1) hàm này phát hiện điều gì, (2) điều kiện chính xác để trả về{" "}
            <code>ALERT</code> — field/giá trị nào, so sánh gì, (3) ngưỡng cụ thể nếu có (số, %,
            đơn vị).
          </Form.Text>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>Sample output</Form.Label>
        <Col sm={9}>
          <Form.Control
            as="textarea"
            rows={8}
            className="font-monospace"
            value={form.sample_output}
            onChange={set("sample_output")}
            placeholder="Paste nguyên văn output lệnh trên thiết bị..."
          />
        </Col>
      </Form.Group>

      {showCodeField && (
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Hàm phân tích (paste nguyên hàm)</Form.Label>
          <Col sm={9}>
            <Form.Control
              as="textarea"
              rows={14}
              className="font-monospace"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`def ${form.fn_name || "ten_ham"}(output: str, cmd: str, threshold: int = 86, **_) -> list[dict]:\n    ...`}
            />
            <Form.Text className="text-muted d-block">
              Chữ ký hàm khuyến nghị: <code>def {form.fn_name || "ten_ham"}(output: str, cmd: str, threshold: int = 86, **_) -&gt; list[dict]</code>.
              Tham số có tên + giá trị mặc định (kiểu <code>threshold: int = 86</code>) sẽ tự động
              trở thành tham số cấu hình được qua Analysis Params UI sau khi deploy — <code>**_</code>{" "}
              vẫn bắt buộc để tương thích ngược. Trả về list dict có tối thiểu key{" "}
              <code>status</code>/<code>command</code>/<code>note</code>. Không được dùng{" "}
              <code>import</code> — sandbox chặn mọi câu lệnh import (kể cả <code>re</code>, module
              này đã bơm sẵn vào scope).
            </Form.Text>
            <div className="mt-2">
              <Button
                size="sm" variant="outline-primary" disabled={!canTestCode || previewRunning}
                onClick={handleTestCode}
              >
                {previewRunning
                  ? <><Spinner size="sm" animation="border" className="me-1" />Đang test...</>
                  : "🧪 Test code"}
              </Button>
              {!canTestCode && (
                <Form.Text className="text-muted d-block">
                  Cần điền Tên hàm, Sample output và Hàm phân tích để test.
                </Form.Text>
              )}
            </div>
            {previewResult && (
              <div className="mt-2">
                <SandboxResult result={previewResult} />
              </div>
            )}
          </Col>
        </Form.Group>
      )}

      <div className="d-flex justify-content-end">
        <Button variant="primary" disabled={!isValid || creating || savingManualCode} onClick={handleSubmit}>
          {creating || savingManualCode
            ? <><Spinner size="sm" animation="border" className="me-1" />{creating ? "Đang tạo..." : "Đang lưu code..."}</>
            : (showCodeField ? "Tạo & Lưu code →" : "Tạo draft →")}
        </Button>
      </div>
    </Form>
  );
}
