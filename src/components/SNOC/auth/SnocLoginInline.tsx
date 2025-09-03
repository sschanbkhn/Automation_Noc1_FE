// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser } from '../redux/User/authSlice';

// export default function SnocLoginInline() {
//   const dispatch = useDispatch();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const status = useSelector((s) => s.account?.status);
//   const error = useSelector((s) => s.account?.error);

//   const submit = (e) => {
//     e.preventDefault();
//     dispatch(loginUser({ email, password }));
//   };

//   return (
//     <div className="container" style={{ maxWidth: 420, marginTop: 64 }}>
//       <h4 className="mb-3">SNOC — Đăng nhập</h4>
//       <form onSubmit={submit}>
//         <div className="mb-3">
//           <label className="form-label">Email</label>
//           <input className="form-control" type="email"
//                  value={email} onChange={(e)=>setEmail(e.target.value)}
//                  placeholder="you@example.com" autoFocus />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Mật khẩu</label>
//           <input className="form-control" type="password"
//                  value={password} onChange={(e)=>setPassword(e.target.value)}
//                  placeholder="••••••••" />
//         </div>
//         {error && <div className="alert alert-danger py-2">{String(error)}</div>}
//         <button className="btn btn-primary w-100" disabled={status==='loading'}>
//           {status==='loading' ? 'Đang đăng nhập…' : 'Đăng nhập'}
//         </button>
//       </form>
//       <p className="text-muted mt-3" style={{fontSize:12}}>
//         Token lưu trong Redux + sessionStorage · Interceptor tự gắn header
//       </p>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import { snocLogin, setSnocToken } from "../api/snocApiWithAutoToken";

// export default function SnocLoginInline() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   async function submit(e?: React.FormEvent) {
//     e?.preventDefault();
//     setErr(null);
//     setBusy(true);
//     try {
//       const res = await snocLogin(email.trim(), password);
//       const token = res?.token || res?.access;
//       if (!token) throw new Error(res?.msg || res?.message || "Login failed");

//       // ✅ Lưu token (RAM + sessionStorage) như bạn đang dùng
//       setSnocToken(token, { persist: true });

//       // ✅ Báo cho Gate biết trạng thái đã đổi
//       window.dispatchEvent(new Event("snoc-auth-changed"));
//       // (không cần navigate; Gate sẽ tự re-render ra trang con)
//     } catch (ex: any) {
//       setErr(
//         ex?.response?.data?.detail ||
//         ex?.response?.data?.msg ||
//         ex?.message ||
//         "Đăng nhập thất bại"
//       );
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="container" style={{ maxWidth: 420, marginTop: 64 }}>
//       <h3 className="mb-3">SNOC — Đăng nhập</h3>
//       <form onSubmit={submit}>
//         <div className="mb-3">
//           <label className="form-label">Email</label>
//           <input className="form-control" type="email"
//             value={email} onChange={(e) => setEmail(e.target.value)} autoFocus/>
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Mật khẩu</label>
//           <input className="form-control" type="password"
//             value={password} onChange={(e) => setPassword(e.target.value)} />
//         </div>
//         {err && <div className="alert alert-danger py-2">{err}</div>}
//         <button className="btn btn-primary w-100" disabled={busy}>
//           {busy ? "Đang đăng nhập..." : "Đăng nhập"}
//         </button>
//       </form>
//     </div>
//   );
// }


// src/components/SNOC/auth/SnocLoginInline.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { snocLogin, setSnocToken } from "../api/snocApiWithAutoToken";

const SnocLoginInline: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const data = await snocLogin(email.trim(), password);
      const token = data.token || data.access;
      if (!token) throw new Error(data?.msg || data?.message || "Login failed");
      setSnocToken(token, { persist: true }); // 🔔 sẽ phát sự kiện cho guard
      // Điều hướng về dashboard SNOC (hoặc trang bạn muốn)
      nav("/app/dashboard/origin", { replace: true });
    } catch (ex: any) {
      setErr(ex?.response?.data?.msg || ex?.message || "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 64 }}>
      <h3 className="mb-3">SNOC — Đăng nhập</h3>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoFocus />
        </div>
        <div className="mb-3">
          <label className="form-label">Mật khẩu</label>
          <input className="form-control" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <button className="btn btn-primary w-100" disabled={busy}>
          {busy ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p className="text-muted mt-3" style={{ fontSize: 12 }}>
        Token lưu RAM/sessionStorage · Không prefix Bearer · Interceptor tự gắn Authorization/X-CSRFTOKEN
      </p>
    </div>
  );
};

export default SnocLoginInline;
