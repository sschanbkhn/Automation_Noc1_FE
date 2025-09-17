import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  AUTH_EVENT,
  getJwtClaims,
  getSnocToken,
  snocFastApi,
} from "../api/snocApiWithAutoToken"; // ✅ Đảm bảo đúng đường dẫn import

type State = "loading" | "allow" | "deny";

const RequireSuperUserInline: React.FC = () => {
  const accountUser = useSelector((s: any) => s?.account?.user);
  const [state, setState] = useState<State>("loading");

  // đọc claim từ JWT (nếu Redux chưa có user)
  const claims = useMemo(() => getJwtClaims(), [getSnocToken()]);

  useEffect(() => {
    let cancelled = false;

    // 1) Shortcut: nếu Redux/JWT đã nói rõ là super => allow ngay
    const isSuperLocal =
      accountUser?.is_superuser === true ||
      accountUser?.role === "super" ||
      claims?.is_superuser === true ||
      claims?.role === "super";

    if (isSuperLocal) {
      setState("allow");
      return;
    }

    // 2) Chưa rõ -> gọi FastAPI /me (đã gắn Bearer trong snocFastApi)
    const check = async () => {
      if (!getSnocToken()) {
        setState("deny");
        return;
      }
      setState("loading");
      try {
        const { data } = await snocFastApi.get("me"); // -> http(s)://host/fastapi/me
        if (cancelled) return;
        const ok = data?.is_superuser === true || data?.role === "super";
        setState(ok ? "allow" : "deny");
      } catch {
        if (!cancelled) setState("deny");
      }
    };

    check();

    // 3) Nếu token đổi (login/logout) thì kiểm tra lại
    const onAuth = () => {
      if (!cancelled) {
        setState("loading");
        // thử lại shortcut sau khi token đổi
        const stillSuper =
          accountUser?.is_superuser === true ||
          accountUser?.role === "super" ||
          getJwtClaims()?.is_superuser === true ||
          getJwtClaims()?.role === "super";
        if (stillSuper) setState("allow");
        else check();
      }
    };

    window.addEventListener(AUTH_EVENT, onAuth as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_EVENT, onAuth as EventListener);
    };
  }, [accountUser, claims]);

  // ĐỪNG redirect khi đang "loading" — tránh nhảy sớm sang /page401
  if (state === "loading") return null; // hoặc spinner nho nhỏ

  return state === "allow" ? <Outlet /> : <Navigate to="/page401" replace />;
};

export default RequireSuperUserInline;
