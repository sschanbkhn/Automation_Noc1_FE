import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SnocLoginInline from "./SnocLoginInline";
import { SnocAuthGuardContext } from "./SnocAuthContext";
import {
  getSnocToken,
  onSnocUnauthorized,
  AUTH_EVENT,
  onSnocOffline,
  onSnocOnline,
  clearSnocToken,
} from "../api/snocApiWithAutoToken";
import { LOGOUT } from "../redux/User/authSlice";

const RequireSnocAuthInline: React.FC = () => {
  const dispatch = useDispatch();

  const mainLogged: boolean =
    (useSelector((s: any) => s?.account?.isLoggedIn) as boolean) ?? false;

  // Track main login state để Effect 3 không xóa SNOC token khi user là SNOC-only
  const mainLoggedRef = React.useRef(mainLogged);
  React.useEffect(() => { mainLoggedRef.current = mainLogged; }, [mainLogged]);

  const readSnoc = () => Boolean(getSnocToken());
  const [snocLogged, setSnocLogged] = useState<boolean>(readSnoc());
  const [isOffline, setIsOffline] = useState(false);

  // Effect 1: 401 handler + cross-tab token sync
  useEffect(() => {
    const off401 = onSnocUnauthorized?.(() => setSnocLogged(false));
    const onStorage = (e: StorageEvent) => {
      if (e.key === "snoc_jwt_token") setSnocLogged(readSnoc());
    };
    const onAuth = () => setSnocLogged(readSnoc());

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_EVENT, onAuth as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_EVENT, onAuth as EventListener);
      if (typeof off401 === "function") off401();
    };
  }, []);

  // Effect 2: Offline/online — onSnocOffline gọi callback ngay nếu đã offline (late-mount safe)
  useEffect(() => {
    const offOff = onSnocOffline(() => setIsOffline(true));
    const offOn  = onSnocOnline(() => setIsOffline(false));
    return () => { offOff(); offOn(); };
  }, []);

  // Effect 3: Detect main app logout — Token cookie biến mất trong khi SNOC vẫn có token
  // Guard mainLoggedRef: chỉ clear SNOC nếu main app đã từng logged in (không logout SNOC-only user)
  useEffect(() => {
    const getMainToken = () =>
      Boolean(document.cookie.match(/(^|;\s*)Token=([^;]*)/));
    const check = () => {
      if (readSnoc() && mainLoggedRef.current && !getMainToken()) {
        clearSnocToken();
      }
    };
    window.addEventListener("focus", check);
    const iv = setInterval(check, 5000);
    return () => {
      window.removeEventListener("focus", check);
      clearInterval(iv);
    };
  }, []);

  const isLoggedIn = mainLogged || snocLogged || readSnoc();

  return (
    <SnocAuthGuardContext.Provider value={true}>
      {isLoggedIn ? (
        <>
          {isOffline && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: "#dc3545",
                color: "#fff",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              <span>
                ⚠️ Mất kết nối tới server. Đang thử kết nối lại...
              </span>
              <button
                style={{
                  background: "#fff",
                  color: "#dc3545",
                  border: "none",
                  padding: "4px 14px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 600,
                  marginLeft: 16,
                }}
                onClick={() => dispatch(LOGOUT())}
              >
                Đăng xuất
              </button>
            </div>
          )}
          <Outlet />
        </>
      ) : (
        <SnocLoginInline />
      )}
    </SnocAuthGuardContext.Provider>
  );
};

export default RequireSnocAuthInline;
