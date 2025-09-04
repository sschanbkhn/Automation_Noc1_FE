// // src/components/SNOC/auth/snocApi.js
// // Access giữ in-memory + Refresh qua HttpOnly cookie + CSRF tự động qua proxy /snoc/api

// import axios from "axios";

// // KHÓA baseURL về proxy SNOC (đừng để env override trỏ thẳng IP)
// const BASE = "/snoc/api/users";

// // ==== In-memory state ====
// let ACCESS = null; // access token chỉ giữ trong RAM (tắt XSS persistence)
// let CSRF_CACHED = null; // cache CSRF để đỡ gọi lại
// let refreshing = null; // single-flight refresh
// const listeners = new Set();
// const notify = () =>
//   listeners.forEach((fn) => {
//     try {
//       fn(!!ACCESS);
//     } catch {}
//   });

// export const onSnocAuthChange = (cb) => {
//   listeners.add(cb);
//   return () => listeners.delete(cb);
// };
// export const isSnocAuthed = () => !!ACCESS;
// export const getSnocAccess = () => ACCESS;

// // ==== Axios instances (tách biệt axios global) ====
// const snocNoAuth = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
//   timeout: 20000,
// });

// export const snocApi = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
//   timeout: 20000,
// });

// // ==== Helpers ====
// function getCookie(name) {
//   const m = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
//   return m ? decodeURIComponent(m.split("=")[1]) : null;
// }

// async function ensureCsrf() {
//   if (CSRF_CACHED) return CSRF_CACHED;

//   // Nếu cookie đã có (same-site) thì dùng luôn
//   const c = getCookie("csrftoken");
//   if (c) {
//     CSRF_CACHED = c;
//     return CSRF_CACHED;
//   }

//   // Xin CSRF từ backend qua proxy
//   const res = await snocNoAuth.get("/auth2/csrf");
//   const token = res?.data?.csrftoken || getCookie("csrftoken");
//   if (!token) {
//     throw new Error(
//       "Cannot obtain CSRF token (hãy chắc các call đi qua /snoc/api)."
//     );
//   }
//   CSRF_CACHED = token;
//   return CSRF_CACHED;
// }

// // ==== Public auth ====
// export async function snocLogin(email, password) {
//   const csrf = await ensureCsrf();
//   const { data } = await snocNoAuth.post(
//     "/auth2/login",
//     { email, password },
//     { headers: { "X-CSRFToken": csrf, "Content-Type": "application/json" } }
//   );
//   const access = data?.access;
//   if (!access) throw new Error(data?.detail || data?.msg || "Login failed");
//   ACCESS = access;
//   notify();
//   return data;
// }

// export async function snocLogout() {
//   const csrf = await ensureCsrf();
//   await snocNoAuth.post("/auth2/logout", null, {
//     headers: { "X-CSRFToken": csrf },
//   });
//   ACCESS = null;
//   notify();
// }

// // ==== Interceptors cho snocApi (dùng cho các API SNOC khác) ====
// // 1) Thêm Authorization: Bearer <access>
// snocApi.interceptors.request.use(async (cfg) => {
//   if (ACCESS) {
//     cfg.headers = cfg.headers || {};
//     cfg.headers.Authorization = `Bearer ${ACCESS}`;
//   }
//   return cfg;
// });

// // 2) Tự chèn CSRF cho method không an toàn
// snocApi.interceptors.request.use(async (cfg) => {
//   const method = (cfg.method || "get").toLowerCase();
//   if (["post", "put", "patch", "delete"].includes(method)) {
//     const csrf = await ensureCsrf();
//     cfg.headers = cfg.headers || {};
//     cfg.headers["X-CSRFToken"] = csrf;
//   }
//   return cfg;
// });

// // 3) 401 -> tự refresh bằng refresh cookie HttpOnly, sau đó replay request
// snocApi.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const { response, config } = err || {};
//     if (response?.status === 401 && config && !config._retry) {
//       config._retry = true;
//       try {
//         if (!refreshing) {
//           refreshing = (async () => {
//             const csrf = await ensureCsrf();
//             const { data } = await snocNoAuth.post("/auth2/refresh", null, {
//               headers: { "X-CSRFToken": csrf },
//             });
//             const newAccess = data?.access;
//             if (!newAccess) throw new Error("Refresh missing access");
//             ACCESS = newAccess;
//             notify();
//             return newAccess;
//           })().finally(() => {
//             refreshing = null;
//           });
//         }
//         const token = await refreshing;
//         config.headers = config.headers || {};
//         config.headers.Authorization = `Bearer ${token}`;
//         return snocApi(config);
//       } catch (e) {
//         ACCESS = null;
//         notify();
//         throw e;
//       }
//     }
//     throw err;
//   }
// );

// export default snocApi;


// src/components/SNOC/auth/snocApi.js
import axios from "axios";

// === DIRECT MODE (không proxy) ===
const BASE = process.env.REACT_APP_SNOC_API_ABS || "http://10.155.43.201:8000/api/users";

let ACCESS = null;
let CSRF_CACHED = null;
let refreshing = null;
const listeners = new Set();
const notify = () => listeners.forEach(fn => { try { fn(!!ACCESS); } catch {} });

export const onSnocAuthChange = (cb) => { listeners.add(cb); return () => listeners.delete(cb); };
export const isSnocAuthed = () => !!ACCESS;

// instances tách biệt
const snocNoAuth = axios.create({ baseURL: BASE, withCredentials: true, timeout: 20000 });
export const snocApi = axios.create({ baseURL: BASE, withCredentials: true, timeout: 20000 });

// helper cookie
function getCookie(name) {
  const m = document.cookie.split("; ").find(r => r.startsWith(name + "="));
  return m ? decodeURIComponent(m.split("=")[1]) : null;
}

// lấy CSRF: gọi GET /auth2/csrf (server set cookie csrftoken; ta đọc từ JSON)
async function ensureCsrf() {
  if (CSRF_CACHED) return CSRF_CACHED;
  const c = getCookie("csrftoken");
  if (c) { CSRF_CACHED = c; return CSRF_CACHED; }

  const res = await snocNoAuth.get("/auth2/csrf");   // cross-site GET
  const token = res?.data?.csrftoken || getCookie("csrftoken");
  if (!token) throw new Error("Cannot obtain CSRF token (check CORS/CSRF settings).");
  CSRF_CACHED = token;
  return token;
}

// === Public auth ===
export async function snocLogin(email, password) {
  const csrf = await ensureCsrf();
  const { data } = await snocNoAuth.post(
    "/auth2/login",
    { email, password },
    { headers: { "X-CSRFToken": csrf, "Content-Type": "application/json" } }
  );
  const access = data?.access;
  if (!access) throw new Error(data?.detail || data?.msg || "Login failed");
  ACCESS = access; notify();
  return data;
}

export async function snocLogout() {
  const csrf = await ensureCsrf();
  await snocNoAuth.post("/auth2/logout", null, { headers: { "X-CSRFToken": csrf } });
  ACCESS = null; notify();
}

// === Interceptors cho SNOC APIs khác ===
snocApi.interceptors.request.use(async (cfg) => {
  if (ACCESS) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${ACCESS}`;
  }
  return cfg;
});
snocApi.interceptors.request.use(async (cfg) => {
  const m = (cfg.method || "get").toLowerCase();
  if (["post","put","patch","delete"].includes(m)) {
    const csrf = await ensureCsrf();
    cfg.headers = cfg.headers || {};
    cfg.headers["X-CSRFToken"] = csrf;
  }
  return cfg;
});
snocApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (response?.status === 401 && config && !config._retry) {
      config._retry = true;
      try {
        if (!refreshing) {
          refreshing = (async () => {
            const csrf = await ensureCsrf();
            const { data } = await snocNoAuth.post("/auth2/refresh", null, {
              headers: { "X-CSRFToken": csrf }
            });
            const newAccess = data?.access;
            if (!newAccess) throw new Error("Refresh missing access");
            ACCESS = newAccess; notify(); return newAccess;
          })().finally(() => { refreshing = null; });
        }
        const token = await refreshing;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        return snocApi(config);
      } catch (e) {
        ACCESS = null; notify(); throw e;
      }
    }
    throw err;
  }
);

export default snocApi;

