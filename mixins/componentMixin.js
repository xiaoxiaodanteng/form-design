import render from '../render/render.js'
import axios from 'axios'

export default {
  components: { render },
  methods: {
    $post(url, data = {}, config) {
      let fetchUrl = url
      if (!/http|https/.test(fetchUrl)) {
        fetchUrl = `${this.$hostname}${url}`
      }
      return axios({
        url: fetchUrl,
        method: 'POST',
        data,
        headers: {
          'ERP-Auth-Token': this.authToken || '',
          'Access-Control-Expose-Headers': 'Authorization'
        },
        ...config
      })
    },
    $get(url, params = {}, config) {
      let fetchUrl = url
      if (!/http|https/.test(fetchUrl)) {
        fetchUrl = `${this.$hostname}${url}`
      }
      return axios({
        url: fetchUrl,
        method: 'GET',
        params,
        headers: {
          'ERP-Auth-Token': this.authToken || '',
          'Access-Control-Expose-Headers': 'Authorization'
        },
        ...config
      })
    }
  },
  created() {
    if (!this.scheme) return
    const { __config__: config } = this.scheme
    // 发送请求
    if (config.dataType === 'dynamic') {
      if (config.autoFetch) {
        // 如果是动态表格 则不需要请求
        if (this.parser.parserFormData[this.scheme.__vModel__] && this.scheme.__config__.tag === 'el-table') return
        this.parser.fetchData(this.scheme)
      }
    }
  }
}
