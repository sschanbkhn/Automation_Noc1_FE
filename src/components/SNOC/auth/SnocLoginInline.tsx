import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { snocLogin, setSnocToken } from "../api/snocApiWithAutoToken";
import Vinaphone from "assets/img/nhacuatoi.png";

const SnocLoginInline: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setErr(null);
    setBusy(true);
    try {
      const data = await snocLogin(email.trim(), password);
      const token = data.token || data.access;
      if (!token) throw new Error(data?.msg || data?.message || "Login failed");
      setSnocToken(token, { persist: true });
      setBusy(false);
      nav("/app/dashboard/origin", { replace: true });
    } catch (ex: any) {
      setBusy(false);
      setErr(
        ex?.response?.data?.msg ||
          ex?.response?.data?.detail ||
          ex?.message ||
          "Đăng nhập thất bại"
      );
    }
  };

  return (
    <section
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - 120px)", padding: "24px 16px" }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          className="card border-0"
          style={{ borderRadius: 14, boxShadow: "0 8px 32px rgba(13,71,161,0.13)" }}
        >
          {/* Brand header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              borderRadius: "14px 14px 0 0",
              padding: "28px 24px 22px",
              textAlign: "center",
            }}
          >
            <img
              src={Vinaphone}
              alt="VNPT Vinaphone"
              style={{ height: 38, marginBottom: 14, filter: "brightness(0) invert(1)" }}
            />
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: 0.5,
              }}
            >
              SNOC Automation
            </div>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 4 }}>
              AU Chuyển mạch
            </div>
          </div>

          {/* Form body */}
          <div className="card-body" style={{ padding: "28px 32px 20px" }}>
            <h6
              className="text-center mb-4"
              style={{ fontWeight: 600, color: "#333" }}
            >
              <span
                style={{
                  borderBottom: "2px solid #1565c0",
                  paddingBottom: 3,
                }}
              >
                Đăng nhập
              </span>{" "}
              hệ thống
            </h6>

            <form onSubmit={submit}>
              {/* Email */}
              <div className="mb-3">
                <label
                  className="form-label"
                  style={{ fontSize: 13, fontWeight: 600, color: "#555" }}
                >
                  Email
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{ background: "#f4f6fb", border: "1px solid #d0d7e2", borderRight: "none" }}
                  >
                    <i className="bi bi-envelope" style={{ color: "#1565c0" }} />
                  </span>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@vnpt.vn"
                    autoFocus
                    disabled={busy}
                    style={{ borderLeft: "none", borderColor: "#d0d7e2" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label
                  className="form-label"
                  style={{ fontSize: 13, fontWeight: 600, color: "#555" }}
                >
                  Mật khẩu
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{ background: "#f4f6fb", border: "1px solid #d0d7e2", borderRight: "none" }}
                  >
                    <i className="bi bi-lock" style={{ color: "#1565c0" }} />
                  </span>
                  <input
                    className="form-control"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={busy}
                    style={{ borderLeft: "none", borderRight: "none", borderColor: "#d0d7e2" }}
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                    style={{
                      background: "#f4f6fb",
                      border: "1px solid #d0d7e2",
                      borderLeft: "none",
                      cursor: "pointer",
                    }}
                  >
                    <i
                      className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}
                      style={{ color: "#888" }}
                    />
                  </button>
                </div>
              </div>

              {/* Error */}
              {err && (
                <div
                  className="alert alert-danger py-2 mb-3"
                  style={{ fontSize: 13, borderRadius: 8 }}
                >
                  <i className="bi bi-exclamation-triangle-fill me-1" />
                  {err}
                </div>
              )}

              {/* Submit */}
              <button
                className="btn w-100 mt-1"
                type="submit"
                disabled={busy || !email.trim() || !password}
                style={{
                  background:
                    busy || !email.trim() || !password
                      ? "#90b8e8"
                      : "linear-gradient(135deg, #1565c0, #0d47a1)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 8,
                  padding: "10px 0",
                  border: "none",
                  transition: "opacity 0.2s",
                }}
              >
                {busy ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div
            className="card-footer text-center border-0"
            style={{
              background: "#f4f6fb",
              borderRadius: "0 0 14px 14px",
              padding: "12px 24px",
            }}
          >
            <small style={{ color: "#999", fontSize: 12 }}>
              <i className="bi bi-shield-lock me-1" />
              Phiên làm việc bảo mật · SNOC Automation
            </small>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SnocLoginInline;
