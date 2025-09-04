import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import SnocLoginInline from "./SnocLoginInline";
import { SnocAuthGuardContext } from "./SnocAuthContext";

// ⚠️ import thêm AUTH_EVENT
import { getSnocToken, onSnocUnauthorized, AUTH_EVENT } from "../api/snocApiWithAutoToken";

const RequireSnocAuthInline: React.FC = () => {
  // App chính đã login?
  const mainLogged: boolean =
    (useSelector((s: any) => s?.account?.isLoggedIn) as boolean) ?? false;

  // Helper đọc token hiện tại
  const readSnoc = () => Boolean(getSnocToken());
  const [snocLogged, setSnocLogged] = useState<boolean>(readSnoc());

  useEffect(() => {
    // BE trả 401 -> coi như logout
    const off401 = onSnocUnauthorized?.(() => setSnocLogged(false));

    // 🔔 Lắng nghe đổi token ở tab khác
    const onStorage = (e: StorageEvent) => {
      if (e.key === "snoc_jwt_token") setSnocLogged(readSnoc());
    };

    // 🔔 QUAN TRỌNG: lắng nghe sự kiện cục bộ sau login/logout trong cùng tab
    const onAuth = () => setSnocLogged(readSnoc());

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_EVENT, onAuth as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_EVENT, onAuth as EventListener);
      if (typeof off401 === "function") off401();
    };
  }, []);

  // Fallback: nếu state chưa kịp cập nhật ngay sau login, vẫn check trực tiếp token
  const isLoggedIn = mainLogged || snocLogged || readSnoc();

  return (
    <SnocAuthGuardContext.Provider value={true}>
      {isLoggedIn ? <Outlet /> : <SnocLoginInline />}
    </SnocAuthGuardContext.Provider>
  );
};

export default RequireSnocAuthInline;
