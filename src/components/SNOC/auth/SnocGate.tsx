import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SnocLoginInline from "./SnocLoginInline";
import { SnocAuthGuardContext } from "./SnocAuthContext";
// chỉnh đường dẫn import tùy vị trí file API của bạn
import { getSnocToken, onSnocUnauthorized } from "../api/snocApiWithAutoToken";

type Props = { children: React.ReactNode };

// Optional: nếu snocApiWithAutoToken có bắn custom event đổi trạng thái đăng nhập
const AUTH_EVENT = "snoc-auth-changed";

const SnocGate: React.FC<Props> = ({ children }) => {
  // Nếu route đã guard (RequireSnocAuthInline) thì bỏ qua check tại Gate
  const guardedByRoute = useContext(SnocAuthGuardContext);
  if (guardedByRoute) return <>{children}</>;

  // Nếu app chính đã đăng nhập (account.isLoggedIn), cũng cho qua
  const mainLogged: boolean =
    (useSelector((s: any) => s?.account?.isLoggedIn) as boolean) ?? false;

  // Token của SNOC (lưu sessionStorage / RAM) => đã login SNOC?
  const readSnoc = () => Boolean(getSnocToken());
  const [snocLogged, setSnocLogged] = useState<boolean>(readSnoc());

  useEffect(() => {
    // Khi backend trả 401 (hook), ép logout local
    const off401 = onSnocUnauthorized?.(() => setSnocLogged(false));

    // Nếu token đổi (đăng nhập/đăng xuất ở tab khác)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "snoc_jwt_token") setSnocLogged(readSnoc());
    };

    // Nếu bạn có bắn custom event sau khi login/logout
    const onAuthEvent = () => setSnocLogged(readSnoc());

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_EVENT, onAuthEvent as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_EVENT, onAuthEvent as EventListener);
      if (typeof off401 === "function") off401();
    };
  }, []);

  const ok = mainLogged || snocLogged;
  return ok ? <>{children}</> : <SnocLoginInline />;
};

export default SnocGate;
