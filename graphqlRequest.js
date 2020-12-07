import axios from 'axios'
import Vue from 'vue'

const headers = {
  'Content-Type': 'application/json',
  'ERP-Request-Timestamp': new Date().getTime()
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // baseURL: `${window.origin}${process.env.VUE_APP_BASE_API}/api/data-workflow-process-erp`,
  // baseURL: `http://bi.dev.nearbyexpress.com/api/data-workflow-process-erp`,
  timeout: 100000 // request timeout
})
service.defaults.headers = headers

service.interceptors.request.use(
  config => {
    // do something before request is sent
    // 针对post的请求设置
    config.headers = {
      ...config.headers,
      'ERP-Auth-Token': Vue.prototype.authToken || '',
      'Access-Control-Expose-Headers': 'Authorization'
    }

    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

export default service
