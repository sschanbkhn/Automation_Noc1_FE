import axios from 'axios';

const snocApi = axios.create({
  baseURL: process.env.REACT_APP_SNOC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Instance riêng không interceptor để login
const snocApiNoAuth = axios.create({
  baseURL: process.env.REACT_APP_SNOC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Hàm login lấy JWT Token
export const loginAndGetToken = async () => {
  try {
    const baseURL = process.env.REACT_APP_SNOC_API_URL;
    const email = process.env.REACT_APP_SNOC_USER_EMAIL;
    const password = process.env.REACT_APP_SNOC_USER_PASS;
    const csrf = process.env.REACT_APP_SNOC_CSRF_TOKEN; // dùng lại biến môi trường
    console.log('SNOC LOGIN DEBUG:', { baseURL, email, password, csrf });
    if (!baseURL || !email || !password) {
      console.error('SNOC LOGIN: Thiếu biến môi trường cấu hình!');
      throw new Error('SNOC LOGIN: Thiếu biến môi trường cấu hình!');
    }
    const response = await snocApiNoAuth.post('/users/login', {
      email,
      password,
    }, {
      headers: csrf ? { 'X-CSRFTOKEN': csrf } : {},
      timeout: 10000,
    });
    console.log('ĐÃ NHẬN RESPONSE LOGIN:', response);
    if (response.data && response.data.success) {
      return response.data.token;
    } else {
      throw new Error(response.data && response.data.message ? response.data.message : 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Request interceptor để thêm token vào mỗi request
snocApi.interceptors.request.use(
  async (config) => {
    let token = sessionStorage.getItem('snoc_jwt_token');
    if (!token) {
      try {
        token = await loginAndGetToken();
        sessionStorage.setItem('snoc_jwt_token', token);
      } catch (err) {
        console.error('SNOC: Lỗi khi login lấy token, không gửi request tiếp:', err);
        throw err; // Dừng request, không retry nữa
      }
    }
    config.headers['X-CSRFTOKEN'] = token;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor xử lý lỗi 401 tự động lấy lại token mới khi token cũ hết hạn
snocApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      sessionStorage.removeItem('snoc_jwt_token');
      try {
        const newToken = await loginAndGetToken();
        sessionStorage.setItem('snoc_jwt_token', newToken);
        originalRequest.headers['X-CSRFTOKEN'] = newToken;
        return snocApi(originalRequest);
      } catch (err) {
        console.error('SNOC: Lỗi khi refresh token sau 401:', err);
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default snocApi;
