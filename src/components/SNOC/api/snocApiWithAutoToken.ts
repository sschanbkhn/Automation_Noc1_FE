// src/api/snocApiWithAutoToken.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

/* ========= BASE =========
   YÊU CẦU: REACT_APP_SNOC_API_URL = http://10.155.43.201:8000/api
   ======================= */
const RAW_BASE = process.env.REACT_APP_SNOC_API_URL || "";
export const AUTH_EVENT = "snoc-auth-changed"; // 👈 thêm dòng này
const BASE = RAW_BASE.replace(/\/+$/, ""); // bỏ "/" cuối nếu có

// Login tuyệt đối: http://host:port/api/users/login
const LOGIN_URL = `${BASE}/users/login`;

/* ===== Token (RAM + sessionStorage) ===== */
let accessToken: string | null = null;
const SESSION_KEY = "snoc_jwt_token";

export function setSnocToken(
  token: string | null,
  opts?: { persist?: boolean }
) {
  accessToken = token;
  if (opts?.persist) {
    if (token) sessionStorage.setItem(SESSION_KEY, token);
    else sessionStorage.removeItem(SESSION_KEY);
  }
  // 🔔 PHÁT SỰ KIỆN cho gate/guard biết để re-render
  try {
    window.dispatchEvent(
      new CustomEvent(AUTH_EVENT, { detail: { isLoggedIn: !!token } })
    );
  } catch {}
}

export function getSnocToken(): string | null {
  if (accessToken) return accessToken;
  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached) accessToken = cached;
  return accessToken;
}

/* ===== Unauthorized hook (401) ===== */
type UnauthorizedHandler = () => void;
let unauthorizedHandlers: UnauthorizedHandler[] = [];
export function onSnocUnauthorized(cb: UnauthorizedHandler) {
  unauthorizedHandlers.push(cb);
  return () =>
    (unauthorizedHandlers = unauthorizedHandlers.filter((f) => f !== cb));
}

/* ===== Axios instances ===== */
export const snocApi: AxiosInstance = axios.create({
  baseURL: BASE, // <-- slice gọi '/nornirps/...' cũng sẽ về `${BASE}/nornirps/...` nhờ normalize bên dưới
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

export const snocApiNoAuth: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

/* ===== Login API (KHÔNG tự lưu token) ===== */
export interface SnocLoginResponse {
  success?: boolean;
  token?: string; // BE cũ
  access?: string; // nếu BE trả field access
  user?: any;
  message?: string;
  msg?: string;
}

export const snocLogin = async (
  email: string,
  password: string
): Promise<SnocLoginResponse> => {
  // gọi tuyệt đối để chắc chắn đúng /api/users/login
  const res = await snocApiNoAuth.post<SnocLoginResponse>(LOGIN_URL, {
    email,
    password,
  });
  return res.data;
};

/* ===== Interceptors ===== */
// Gắn Authorization + (tuỳ chọn) X-CSRFTOKEN trước mỗi request
snocApi.interceptors.request.use(
  (config: any) => {
    // 🔧 Normalize URL:
    // Nếu url bắt đầu bằng "/" (và KHÔNG phải http/https), bỏ "/" đầu
    // để axios không đè mất path "/api" của baseURL.
    if (
      config?.url &&
      /^\/(?!\/)/.test(config.url) &&
      !/^https?:\/\//i.test(config.url)
    ) {
      config.url = config.url.replace(/^\/+/, ""); // "/nornirps/..." => "nornirps/..."
    }

    const token = getSnocToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `${token}`; // chuẩn
      config.headers["X-CSRFTOKEN"] = token; // nếu BE cũ đang đọc header này
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 -> gọi handler (ví dụ dispatch LOGOUT)
snocApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as AxiosRequestConfig & {
      _handled401?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._handled401) {
      originalRequest._handled401 = true;
      setSnocToken(null, { persist: true });
      unauthorizedHandlers.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    }
    return Promise.reject(error);
  }
);

export default snocApi;

/* ==== Cách dùng nhanh:
   - .env: REACT_APP_SNOC_API_URL=http://10.155.43.201:8000/api
   - Login:
       const data = await snocLogin(email, password);
       const token = data.token || data.access;
       setSnocToken(token, { persist: true });
   - Slice/API khác (giữ nguyên dấu "/" đầu cũng OK):
       await snocApi.post('/nornirps/systemhealth/toggle-exclude/', { host, excluded });
       // -> http://10.155.43.201:8000/api/nornirps/systemhealth/toggle-exclude/
   ======================================== */
