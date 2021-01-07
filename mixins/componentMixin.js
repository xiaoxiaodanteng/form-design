import render from '../render/render.js'
import axios from 'axios'

export default {
  components: { render },
  methods: {
    $post(url, data = {}, config) {
      console.log(data)
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
  }
}
