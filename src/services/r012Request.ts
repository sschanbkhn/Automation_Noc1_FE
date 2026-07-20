import axios from 'axios'
import { Notification } from 'element-react'
import { Cookie } from 'helpers/cookie'

// Separate axios instance for R012 (NQM Proactive CC 4G).
// The shared helpers/request.ts unwraps a { StatusCode, Success, Message, Data }
// envelope from the legacy .NET backend. R012's backend is a FastAPI service
// that returns raw JSON (e.g. { total, data }), so it cannot share that instance
// without breaking the response interceptor.
const r012Request = axios.create({
  baseURL: process.env.R012_API_URL || 'http://127.0.0.1:8000/api/v1',
  // giam tu 60000ms xuong 15000ms: BE gio tra 202 NGAY khi trigger CR (khong con block cho SSH chay het),
  // response chi mang session_id de FE theo doi tiep qua SSE - 15s la du du cho 1 response 202 tra ve ngay
  timeout: 15000
})

r012Request.interceptors.request.use(
  config => {
    config.headers['Authorization'] = 'Bearer ' + Cookie.getCookie('Token')
    return config
  },
  error => Promise.reject(error)
)

r012Request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      Notification({
        title: 'Cảnh báo',
        message: 'Hết thời gian truy cập',
        type: 'warning'
      })
      Cookie.deleteCookie('Token')
      Cookie.deleteCookie('UserInfo')
      window.location.href = '/'
    } else {
      Notification({
        title: 'Lỗi',
        message: error.response?.data?.detail || error.response?.statusText || error.message || 'Network Error',
        type: 'error'
      })
    }
    return Promise.reject(error)
  }
)

export default r012Request
