// src/api/snocApiWithAutoToken.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

/* ========= BASE =========
   REACT_APP_SNOC_API_URL = http://10.155.43.201:8000/api
   ======================= */
const RAW_BASE = process.env.REACT_APP_SNOC_API_URL || "";
export const AUTH_EVENT = "snoc-auth-changed";
const BASE = RAW_BASE.replace(/\/+$/, "");

// (Tuỳ BE) Nếu BE yêu cầu dấu "/" cuối, đổi thành `${BASE}/users/login/`
const LOGIN_URL = `${BASE}/users/login`;

/* ===== Token (RAM + sessionStorage + localStorage) ===== */
let accessToken: string | null = null;
const SESSION_KEY = "snoc_jwt_token";
const LOCAL_KEY = "snoc_jwt_token_persist";

// Cho phép cấu hình prefix, ví dụ: REACT_APP_SNOC_AUTH_PREFIX="Bearer "
const AUTH_PREFIX = process.env.REACT_APP_SNOC_AUTH_PREFIX ?? "";

// helper phát sự kiện auth
function fireAuthEvent(isLoggedIn: boolean) {
  try {
    window.dispatchEvent(
      new CustomEvent(AUTH_EVENT, { detail: { isLoggedIn } })
    );
  } catch {}
}

// Bootstrap token khi module được import
(function bootstrapToken() {
  if (typeof window === "undefined") return;
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    const l = localStorage.getItem(LOCAL_KEY);
    accessToken = s || l || null;
    if (!s && l) sessionStorage.setItem(SESSION_KEY, l);
    fireAuthEvent(!!accessToken);
  } catch {}
})();

export function setSnocToken(
  token: string | null,
  opts?: { persist?: boolean }
) {
  accessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token);
      if (opts?.persist) localStorage.setItem(LOCAL_KEY, token);
      else localStorage.removeItem(LOCAL_KEY);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOCAL_KEY);
    }
  } catch {}
  fireAuthEvent(!!token);
}

export function clearSnocToken() {
  setSnocToken(null, { persist: true });
}

export function getSnocToken(): string | null {
  if (accessToken) return accessToken;
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    const l = localStorage.getItem(LOCAL_KEY);
    accessToken = s || l || null;
    if (!s && l) sessionStorage.setItem(SESSION_KEY, l);
  } catch {}
  return accessToken;
}

/** Helper: decode JWT payload để lấy claims (role, is_superuser, ...) */
export function getJwtClaims(): any | null {
  try {
    const token = getSnocToken();
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "===".slice((b64.length + 3) % 4);
    const raw = atob(pad);
    try {
      return JSON.parse(decodeURIComponent(escape(raw)));
    } catch {
      return JSON.parse(raw);
    }
  } catch {
    return null;
  }
}

// Đồng bộ cross-tab qua sự kiện storage
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== LOCAL_KEY) return;
    try {
      const newVal = e.newValue;
      if (newVal) {
        accessToken = newVal;
        sessionStorage.setItem(SESSION_KEY, newVal);
        fireAuthEvent(true);
      } else {
        accessToken = null;
        sessionStorage.removeItem(SESSION_KEY);
        fireAuthEvent(false);
      }
    } catch {}
  });
}

/* ===== Unauthorized hook (401/403) ===== */
type UnauthorizedHandler = () => void;
let unauthorizedHandlers: UnauthorizedHandler[] = [];
export function onSnocUnauthorized(cb: UnauthorizedHandler) {
  unauthorizedHandlers.push(cb);
  return () =>
    (unauthorizedHandlers = unauthorizedHandlers.filter((f) => f !== cb));
}

/* ===== Offline / Online tracking ===== */
type VoidHandler = () => void;
let _offlineHandlers: VoidHandler[] = [];
let _onlineHandlers: VoidHandler[] = [];
export let _snocIsOffline = false;

export function onSnocOffline(cb: VoidHandler) {
  _offlineHandlers.push(cb);
  // Gọi ngay nếu đã offline trước khi component mount (late-mount safe)
  if (_snocIsOffline) { try { cb(); } catch {} }
  return () => (_offlineHandlers = _offlineHandlers.filter((f) => f !== cb));
}
export function onSnocOnline(cb: VoidHandler) {
  _onlineHandlers.push(cb);
  return () => (_onlineHandlers = _onlineHandlers.filter((f) => f !== cb));
}
export function fireSnocOffline() {
  if (_snocIsOffline) return;
  _snocIsOffline = true;
  _offlineHandlers.forEach((fn) => { try { fn(); } catch {} });
}
export function fireSnocOnline() {
  if (!_snocIsOffline) return;
  _snocIsOffline = false;
  _onlineHandlers.forEach((fn) => { try { fn(); } catch {} });
}

/* ===== helper tạo instance + interceptors giống nhau ===== */
function buildInstance(baseURL: string): AxiosInstance {
  const ins = axios.create({
    baseURL,
    timeout: 30000,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });

  ins.interceptors.request.use(
    (config: any) => {
      // nếu url bắt đầu "/" (không phải http/https) thì bỏ "/" đầu
      if (
        config?.url &&
        /^\/(?!\/)/.test(config.url) &&
        !/^https?:\/\//i.test(config.url)
      ) {
        config.url = config.url.replace(/^\/+/, "");
      }
      const token = getSnocToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `${AUTH_PREFIX}${token}`;
        config.headers["X-CSRFTOKEN"] = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  ins.interceptors.response.use(
    (response) => {
      fireSnocOnline(); // reset offline flag khi có response thành công
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = (error.config || {}) as AxiosRequestConfig & {
        _handled401?: boolean;
      };
      const status = error.response?.status;

      if (!error.response && getSnocToken()) {
        // Network error (backend không phản hồi) trong khi còn token
        fireSnocOffline();
      }

      if (status === 401  && !originalRequest._handled401) {
        originalRequest._handled401 = true;
        clearSnocToken();
        unauthorizedHandlers.forEach((fn) => {
          try {
            fn();
          } catch {}
        });
      }
      // Nếu gặp lỗi 403 (Thiếu quyền), KHÔNG clear token, KHÔNG gọi handler logout.
      if (status === 403) {
        console.warn("Lỗi 403: Bạn không có quyền thực hiện hành động này.");
      }
      return Promise.reject(error);
    }
  );

  return ins;
}

/* ===== Axios instances ===== */
// MỌI API cũ dùng /api
export const snocApi: AxiosInstance = buildInstance(BASE);
export const snocApiNoAuth: AxiosInstance = buildInstance(BASE);

// 🔹 Chỉ dành cho các route FastAPI (ví dụ /fastapi/me)
const HOST_ROOT = BASE;
export const snocFastApi: AxiosInstance = buildInstance(`${HOST_ROOT}/fastapi`);

/* ===== Login API (KHÔNG tự lưu token) ===== */
export interface SnocLoginResponse {
  success?: boolean;
  token?: string;
  access?: string;
  user?: any;
  message?: string;
  msg?: string;
}

export const snocLogin = async (
  email: string,
  password: string
): Promise<SnocLoginResponse> => {
  const res = await snocApiNoAuth.post<SnocLoginResponse>(LOGIN_URL, {
    email,
    password,
  });
  return res.data;
};

export default snocApi;
