import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { snocLogin, onSnocAuthChange, isSnocAuthed } from "./snocApi";

export default function SnocLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (isSnocAuthed()) {
      const to = (loc.state && loc.state.from && loc.state.from.pathname) || "/snoc/dashboard";
      nav(to, { replace: true });
    }
    const off = onSnocAuthChange((ok) => {
      if (ok) {
        const to = (loc.state && loc.state.from && loc.state.from.pathname) || "/snoc/dashboard";
        nav(to, { replace: true });
      }
    });
    return off;
  }, []); // eslint-disable-line

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await snocLogin(email.trim(), password);
      // Điều hướng sẽ diễn ra trong onSnocAuthChange
    } catch (ex) {
      const msg =
        ex?.response?.data?.detail ||
        ex?.response?.data?.msg ||
        ex?.message ||
        "Đăng nhập thất bại";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 64 }}>
      <h3 className="mb-3">SNOC — Đăng nhập</h3>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mật khẩu</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <button className="btn btn-primary w-100" disabled={busy}>
          {busy ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p className="text-muted mt-3" style={{ fontSize: 12 }}>
        Access in-memory · Refresh HttpOnly cookie · CSRF protected
      </p>
    </div>
  );
}
