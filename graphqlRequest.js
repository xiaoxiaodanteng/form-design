import axios from 'axios'

const headers = {
  'Content-Type': 'application/json',
  'ERP-Request-Timestamp': new Date().getTime()
}

// create an axios instance
const service = axios.create({
  baseURL: `${process.env.VUE_APP_BASE_API}/api/data-workflow-process-erp`,
  timeout: 50000 // request timeout
})
service.defaults.headers = headers

export default service
