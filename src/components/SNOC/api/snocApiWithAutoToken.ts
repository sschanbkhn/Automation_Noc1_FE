// src/api/snocApiWithAutoToken.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

/* ========= BASE =========
   YÊU CẦU: REACT_APP_SNOC_API_URL = http://10.155.43.201:8000/api
   ======================= */
const RAW_BASE = process.env.REACT_APP_SNOC_API_URL || "";
export const AUTH_EVENT = "snoc-auth-changed";
const BASE = RAW_BASE.replace(/\/+$/, "");

// Login tuyệt đối: http://host:port/api/users/login
const LOGIN_URL = `${BASE}/users/login`;

/* ===== Token (RAM + sessionStorage + localStorage) ===== */
let accessToken: string | null = null;
const SESSION_KEY = "snoc_jwt_token";
const LOCAL_KEY = "snoc_jwt_token_persist";

// helper phát sự kiện auth
function fireAuthEvent(isLoggedIn: boolean) {
  try {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { isLoggedIn } }));
  } catch {}
}

// Bootstrap token khi module được import
(function bootstrapToken() {
  if (typeof window === "undefined") return;
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    const l = localStorage.getItem(LOCAL_KEY);
    accessToken = s || l || null;
    // Nếu chỉ có local mà chưa có session => copy sang session cho tab hiện tại
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
      // luôn set vào session cho tab hiện tại
      sessionStorage.setItem(SESSION_KEY, token);
      // nếu persist => lưu thêm local để tab khác đọc được
      if (opts?.persist) localStorage.setItem(LOCAL_KEY, token);
      else localStorage.removeItem(LOCAL_KEY);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOCAL_KEY);
    }
  } catch {}

  fireAuthEvent(!!token);
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
  baseURL: BASE,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

export const snocApiNoAuth: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

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

/* ===== Interceptors ===== */
// Gắn Authorization + (tuỳ chọn) X-CSRFTOKEN trước mỗi request
snocApi.interceptors.request.use(
  (config: any) => {
    // Normalize URL: nếu url bắt đầu "/" (không phải http/https) thì bỏ "/" đầu
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
      // GIỮ NGUYÊN CÁCH GỬI TOKEN THEO BE HIỆN TẠI
      config.headers.Authorization = `${token}`;
      config.headers["X-CSRFTOKEN"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 -> gọi handler (ví dụ dispatch LOGOUT) + xoá token cả 2 nơi
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
       setSnocToken(token, { persist: true }); // ⭐ nhớ bật persist để mở tab mới không bị login lại
   - Slice/API khác (giữ nguyên dấu "/" đầu cũng OK):
       await snocApi.post('/nornirps/systemhealth/toggle-exclude/', { host, excluded });
       // -> http://10.155.43.201:8000/api/nornirps/systemhealth/toggle-exclude/
   ======================================== */
