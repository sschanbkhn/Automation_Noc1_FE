import axios from 'axios'
import { Notification } from 'element-react'
import { Cookie } from './cookie'

// create an axios instance
const service = axios.create({
  baseURL: process.env.API_URL,// url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 15000 // request timeout
})

// request interceptor
service.interceptors.request.use(

  config => {
    config.headers['Authorization'] = 'Bearer ' + Cookie.getCookie("Token")
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if ((res.StatusCode === 200 || res.StatusCode === 300) && res.Success) {
      return res;
    } else {
      if (res.StatusCode === 401) {
        window.location.href = "/page401";
      } else  if (res.StatusCode === 500) {
        Notification({
          title: "Lỗi",
          message: res.Message,
          type: 'error'
        });  
      } else {
        if(response.status)
        {
          return response.data
        }
        console.log(response)
        Notification({
          title: "Lỗi",
          message: res.Message,
          type: 'error'
        });  
      }      
    }
  },
  error => {
    if (error.response.status === 401) {
      Notification({
        title: "Cảnh báo",
        message: "Hết thời gian truy cập",
        type: 'warning'
      }); 
      Cookie.deleteCookie("Token");
      Cookie.deleteCookie("UserInfo");
      window.location.href = "/";  
    } else {
      Notification({
        title: "Lỗi",
        message: error.response.statusText,
        type: 'error'
      });              
    }    
  }
)

export default service
