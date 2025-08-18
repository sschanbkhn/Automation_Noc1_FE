// src/api/snocApiWithAutoToken.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// Khai báo instance có kiểu rõ ràng
const snocApi: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SNOC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Instance riêng không có interceptor (dùng cho login)
const snocApiNoAuth: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SNOC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Hàm login lấy JWT Token
export const loginAndGetToken = async (): Promise<string> => {
  const baseURL = process.env.REACT_APP_SNOC_API_URL;
  const email = process.env.REACT_APP_SNOC_USER_EMAIL;
  const password = process.env.REACT_APP_SNOC_USER_PASS;
  const csrf = process.env.REACT_APP_SNOC_CSRF_TOKEN;

  if (!baseURL || !email || !password) {
    throw new Error("SNOC LOGIN: Thiếu biến môi trường cấu hình!");
  }

  const response = await snocApiNoAuth.post(
    "/users/login",
    { email, password },
    {
      headers: csrf ? { "X-CSRFTOKEN": csrf } : {},
      timeout: 10000,
    }
  );

  if (response.data?.success && response.data?.token) {
    return response.data.token;
    
  }

  throw new Error(response.data?.message || "Đăng nhập SNOC thất bại");
};

// Request interceptor: tự động thêm token vào request
snocApi.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    let token = sessionStorage.getItem("snoc_jwt_token");
    if (!token) {
      token = await loginAndGetToken();
      sessionStorage.setItem("snoc_jwt_token", token);
    }
    if (config.headers) {
      config.headers["X-CSRFTOKEN"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: nếu bị 401 thì tự login lại
snocApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      sessionStorage.removeItem("snoc_jwt_token");

      try {
        const newToken = await loginAndGetToken();
        sessionStorage.setItem("snoc_jwt_token", newToken);
        if (originalRequest.headers) {
          originalRequest.headers["X-CSRFTOKEN"] = newToken;
        }
        return snocApi(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default snocApi;
