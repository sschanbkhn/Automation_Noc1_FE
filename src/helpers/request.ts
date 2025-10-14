import axios from 'axios'
import { Notification } from 'element-react'
import { Cookie } from './cookie'

// create an axios instance
const service = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5001/api',// url = base url + request url  
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout - increased to 60s for large bandwidth queries
})

// Debug: Log the actual base URL being used
console.log('🌐 Axios baseURL:', service.defaults.baseURL);
console.log('🌐 process.env.API_URL:', process.env.API_URL);

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
    if (!response || !response.data) {
      console.warn('Empty response received');
      return { Success: false, Message: 'Empty response', Data: null };
    }
    
    const res = response.data
    if ((res.StatusCode === 200 || res.StatusCode === 300) && res.Success) {
      return res;
    } else {
      if (res.StatusCode === 401) {
        window.location.href = "/page401";
      } else  if (res.StatusCode === 500) {
        Notification({
          title: "Lỗi",
          message: res.Message || 'Internal Server Error',
          type: 'error'
        });  
      } else {
        if(response && response.status)
        {
          return response.data
        }
        console.log('Response data:', response)
        Notification({
          title: "Lỗi",
          message: res.Message || 'Unknown error',
          type: 'error'
        });
        // Return a proper error response instead of undefined
        return { Success: false, Message: res.Message || 'Unknown error', Data: [] };
      }      
    }
  },
  error => {
    if (error.response && error.response.status === 401) {
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
        message: error.response ? error.response.statusText : error.message || 'Network Error',
        type: 'error'
      });              
    }
    
    // Always reject to let calling code handle the error
    return Promise.reject(error);
  }
)

export default service
