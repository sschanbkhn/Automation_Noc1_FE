// const IS_LOCAL = true; // ← true: local, false: server
const IS_LOCAL = false; // ← true: local, false: server

export const API_CONFIG = {
  BASE_URL: IS_LOCAL
    ? "https://localhost:7232/api/prbs-load" // Local development
    : "http://10.155.43.202:8081/api/prbs-load", // Production server
};

export default API_CONFIG;
