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
  // tang tu 15000ms len 60000ms: CDS (gw-oneoss cell/neighbors) phan hoi khong on dinh,
  // luc nhanh luc cham (co luc qua 15s) - BE da xu ly nhanh phia minh (chi 1 lan goi CDS,
  // khong lap lai), nut co la do CDS cham nen FE phai cho lau hon de khong bao loi gia.
  // day la timeout mac dinh cho ca instance; cac endpoint nhanh (khong goi CDS) tu override
  // timeout ngan hon ngay tai noi goi trong R012Service.ts
  timeout: 60000
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
