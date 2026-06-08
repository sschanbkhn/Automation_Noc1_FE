import React, { useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Col, Form,
  InputGroup, Row, Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifChannelConfig,
  saveNotifChannelConfig,
  testNotifChannel,
} from "../../../redux/Healthcheck/notifChannelConfigSlice";
import { getJwtClaims } from "../../../api/snocApiWithAutoToken";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// ── helpers ───────────────────────────────────────────────────────────────────

const EyeIcon = ({ show }) => (show ? "🙈" : "👁");

function PasswordInput({ value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <InputGroup>
      <Form.Control
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
      >
        <EyeIcon show={show} />
      </Button>
    </InputGroup>
  );
}

function TestRow({ label, placeholder, bodyKey, channel, disabled }) {
  const dispatch = useDispatch();
  const { testing } = useSelector((s) => s.notifChannelConfig);
  const [target, setTarget] = useState("");

  const handleTest = () => {
    if (!target.trim()) return;
    dispatch(testNotifChannel({ channel, target: target.trim() }));
  };

  return (
    <div className="d-flex gap-2 align-items-center mt-2">
      <span className="text-muted small" style={{ minWidth: 56 }}>Test:</span>
      <Form.Control
        size="sm"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || testing}
        style={{ maxWidth: 220 }}
      />
      <Button
        size="sm"
        variant="outline-info"
        onClick={handleTest}
        disabled={disabled || testing || !target.trim()}
      >
        {testing ? <Spinner size="sm" animation="border" /> : `Gửi test ${label}`}
      </Button>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function NotifChannelConfig() {
  const dispatch = useDispatch();
  const { config, loading, saving } = useSelector((s) => s.notifChannelConfig);

  const isSuperUser = useMemo(() => {
    const claims = getJwtClaims();
    return claims?.is_superuser === true;
  }, []);

  const [form, setForm] = useState({
    telegram_bot_token:  "",
    sms_gateway_url:     "",
    sms_gateway_key:     "",
    email_host:          "",
    email_port:          587,
    email_use_tls:       true,
    email_host_user:     "",
    email_host_password: "",
    default_from_email:  "",
  });

  useEffect(() => {
    dispatch(fetchNotifChannelConfig());
  }, [dispatch]);

  useEffect(() => {
    if (!config) return;
    setForm({
      telegram_bot_token:  config.telegram_bot_token  || "",
      sms_gateway_url:     config.sms_gateway_url     || "",
      sms_gateway_key:     config.sms_gateway_key     || "",
      email_host:          config.email_host           || "",
      email_port:          config.email_port           ?? 587,
      email_use_tls:       config.email_use_tls        ?? true,
      email_host_user:     config.email_host_user      || "",
      email_host_password: config.email_host_password  || "",
      default_from_email:  config.default_from_email   || "",
    });
  }, [config]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = () => {
    dispatch(saveNotifChannelConfig(form));
  };

  const lastUpdated = useMemo(() => {
    if (!config?.updated_at) return null;
    return new Date(config.updated_at).toLocaleString("vi-VN");
  }, [config?.updated_at]);

  if (loading && !config) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <TopNavbarHealth />
      <div className="p-3">
      <h5 className="mb-3">⚙️ Cấu hình kênh thông báo</h5>

      {!isSuperUser && (
        <div className="alert alert-warning mb-3">
          Chỉ Super Admin mới có thể chỉnh sửa cấu hình này.
        </div>
      )}

      {/* ── Telegram ─────────────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Header>
          <strong>📢 Telegram Bot</strong>
        </Card.Header>
        <Card.Body>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>Bot Token</Form.Label>
            <Col sm={9}>
              <PasswordInput
                value={form.telegram_bot_token}
                onChange={set("telegram_bot_token")}
                placeholder="1234567890:ABCdef..."
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <TestRow
            label="Telegram"
            placeholder="Chat ID (vd: -100123456)"
            channel="telegram"
            disabled={!isSuperUser}
          />
        </Card.Body>
      </Card>

      {/* ── SMS ──────────────────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Header>
          <strong>📱 SMS Gateway</strong>
        </Card.Header>
        <Card.Body>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>Gateway URL</Form.Label>
            <Col sm={9}>
              <Form.Control
                value={form.sms_gateway_url}
                onChange={set("sms_gateway_url")}
                placeholder="https://sms-gateway.example.com/send"
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>API Key</Form.Label>
            <Col sm={9}>
              <PasswordInput
                value={form.sms_gateway_key}
                onChange={set("sms_gateway_key")}
                placeholder="API key..."
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <TestRow
            label="SMS"
            placeholder="Số điện thoại (vd: 0901234567)"
            channel="sms"
            disabled={!isSuperUser}
          />
        </Card.Body>
      </Card>

      {/* ── Email ────────────────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Header>
          <strong>📧 Email (SMTP)</strong>
        </Card.Header>
        <Card.Body>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>SMTP Host</Form.Label>
            <Col sm={6}>
              <Form.Control
                value={form.email_host}
                onChange={set("email_host")}
                placeholder="smtp.gmail.com"
                disabled={!isSuperUser}
              />
            </Col>
            <Col sm={2}>
              <Form.Control
                type="number"
                value={form.email_port}
                onChange={set("email_port")}
                placeholder="587"
                disabled={!isSuperUser}
              />
            </Col>
            <Col sm={1} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="tls-switch"
                label="TLS"
                checked={form.email_use_tls}
                onChange={set("email_use_tls")}
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>Username</Form.Label>
            <Col sm={9}>
              <Form.Control
                value={form.email_host_user}
                onChange={set("email_host_user")}
                placeholder="noc@example.com"
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>Password</Form.Label>
            <Col sm={9}>
              <PasswordInput
                value={form.email_host_password}
                onChange={set("email_host_password")}
                placeholder="App password..."
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-2 align-items-center">
            <Form.Label column sm={3}>From Email</Form.Label>
            <Col sm={9}>
              <Form.Control
                value={form.default_from_email}
                onChange={set("default_from_email")}
                placeholder="noc@example.com"
                disabled={!isSuperUser}
              />
            </Col>
          </Form.Group>
          <TestRow
            label="Email"
            placeholder="Địa chỉ email nhận test"
            channel="email"
            disabled={!isSuperUser}
          />
        </Card.Body>
      </Card>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between">
        <div className="text-muted small">
          {lastUpdated && (
            <>
              Cập nhật lần cuối: <strong>{lastUpdated}</strong>
              {config?.updated_by_username && (
                <> bởi <strong>{config.updated_by_username}</strong></>
              )}
            </>
          )}
        </div>
        {isSuperUser && (
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner size="sm" animation="border" className="me-1" />Đang lưu...</> : "💾 Lưu cấu hình"}
          </Button>
        )}
      </div>
    </div>
    </>
  );
}
