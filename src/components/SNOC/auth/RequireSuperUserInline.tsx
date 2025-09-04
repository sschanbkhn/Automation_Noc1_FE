import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getSnocToken } from "../api/snocApiWithAutoToken";

/** decode JWT đơn giản để lấy claim (fallback nếu Redux chưa có user) */
function decodeJwtClaims(token?: string): any | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

const RequireSuperUserInline: React.FC = () => {
  // account slice của bạn
  const account = useSelector((s: any) => s?.account) ?? {};
  const reduxUser = account?.user;

  // Fallback: đọc claim từ JWT nếu Redux chưa có user
  const claims = useMemo(() => decodeJwtClaims(getSnocToken()), []);
  const role = reduxUser?.role ?? claims?.role;
  const isSuperuser = reduxUser?.is_superuser ?? claims?.is_superuser;

  // điều kiện pass: là superuser hoặc role === 'super'
  const allowed = isSuperuser === true || role === "super";

  return allowed ? <Outlet /> : <Navigate to="/page401" replace />;
};

export default RequireSuperUserInline;
