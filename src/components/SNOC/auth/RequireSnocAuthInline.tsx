// // // src/components/SNOC/auth/RequireSnocAuthInline.tsx
// // import React from "react";
// // import { Navigate, Outlet, useLocation } from "react-router-dom";
// // import { getSnocToken } from "../api/snocApiWithAutoToken";

// // type Props = { children?: React.ReactNode };

// // export default function RequireSnocAuthInline({ children }: Props) {
// //   const location = useLocation();
// //   const token = getSnocToken();

// //   if (!token) {
// //     return <Navigate to="/snoc/login" replace state={{ from: location }} />;
// //   }
// //   // Dùng được cả layout-route (Outlet) và wrapper (children)
// //   return children ? <>{children}</> : <Outlet />;
// // }



// // import React, { useEffect, useState } from "react";
// // import { Outlet } from "react-router-dom";
// // import SnocLoginInline from "./SnocLoginInline";
// // import { getSnocToken, onSnocUnauthorized, AUTH_EVENT } from "../api/snocApiWithAutoToken";

// // type Props = { children?: React.ReactNode };

// // const RequireSnocAuthInline: React.FC<Props> = ({ children }) => {
// //   const [authed, setAuthed] = useState<boolean>(!!getSnocToken());

// //   useEffect(() => {
// //     // cập nhật ngay khi token thay đổi (login/logout)
// //     const onAuth = (e: any) => setAuthed(!!getSnocToken());
// //     window.addEventListener(AUTH_EVENT, onAuth);

// //     // khi server trả 401 -> xem như logout
// //     const off401 = onSnocUnauthorized(() => setAuthed(false));

// //     return () => {
// //       window.removeEventListener(AUTH_EVENT, onAuth);
// //       if (typeof off401 === "function") off401();
// //     };
// //   }, []);

// //   if (!authed) return <SnocLoginInline />;
// //   return children ? <>{children}</> : <Outlet />;
// // };

// // export default RequireSnocAuthInline;


// import React, { useEffect, useState } from "react";
// import { Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import SnocLoginInline from "./SnocLoginInline";
// import { SnocAuthGuardContext } from "./SnocAuthContext";

// // ⚠️ Điều chỉnh đường dẫn import này theo vị trí file API của bạn
// import { getSnocToken, onSnocUnauthorized } from "../api/snocApiWithAutoToken";

// const RequireSnocAuthInline: React.FC = () => {
//   // App chính đã login?
//   const mainLogged: boolean =
//     (useSelector((s: any) => s?.account?.isLoggedIn) as boolean) ?? false;

//   // Đọc token SNOC (sessionStorage/RAM)
//   const readSnoc = () => Boolean(getSnocToken());
//   const [snocLogged, setSnocLogged] = useState<boolean>(readSnoc());

//   useEffect(() => {
//     // Nếu backend trả 401 qua interceptor → update state
//     const off401 = onSnocUnauthorized?.(() => setSnocLogged(false));

//     // Nếu token SNOC đổi ở tab khác → update state
//     const onStorage = (e: StorageEvent) => {
//       if (e.key === "snoc_jwt_token") setSnocLogged(readSnoc());
//     };
//     window.addEventListener("storage", onStorage);

//     return () => {
//       window.removeEventListener("storage", onStorage);
//       if (typeof off401 === "function") off401();
//     };
//   }, []);

//   const isLoggedIn = mainLogged || snocLogged;

//   return (
//     <SnocAuthGuardContext.Provider value={true}>
//       {isLoggedIn ? <Outlet /> : <SnocLoginInline />}
//     </SnocAuthGuardContext.Provider>
//   );
// };

// export default RequireSnocAuthInline;


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
