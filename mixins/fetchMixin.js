import graphqlRequest from '../graphqlRequest'
export default {
  methods: {
    fetchData(component, customParamObj = {}) {
      const { dataPath, dataType, url, defaultParams, propParams, graphqlMethod, dependencies, dataFields } = component.__config__
      if (dataType === 'dynamic' && url && graphqlMethod && dataPath) {
        const params = {}
        const paramsStrArr = []
        let dataFieldStr = ''
        // 默认参数
        if (defaultParams) {
          defaultParams.forEach(item => {
            params[item.field] = item.value
          })
        }
        // 自定义依赖参数
        if (dependencies) {
          const formData = this.parserFormData
          dependencies.forEach(field => {
            !!field && (params[field] = formData[field])
          })
        }
        // prop参数
        if (propParams) {
          propParams.forEach(item => {
            if (item && item.fieldPath.includes('.')) {
              const fieldValue = item.fieldPath.split('.').reduce((pre, cur) => pre[cur], this.globalVar)
              params[item.field] = fieldValue
            } else {
              !!item && (params[item.field] = this.globalVar[item.fieldPath])
            }
          })
        }
        for (const [key, value] of Object.entries(params)) {
          !!key && paramsStrArr.push(`${key}:"${value}"`)
        }

        // 动态参数
        for (const [key, value] of Object.entries(customParamObj)) {
          if (key) {
            const hasParamIndex = paramsStrArr.findIndex(item => item.includes(`${key}`))
            if (hasParamIndex !== -1) {
              paramsStrArr[hasParamIndex] = `${key}:"${value}"`
            } else {
              paramsStrArr.push(`${key}:"${value}"`)
            }
          }
        }
        // 返回字段
        if (dataFields) {
          // dataFieldStr = dataFields.map(item => item.field).join(',')
          dataFieldStr = this.getParamsStr(dataFields)
        }

        const paramsStr = paramsStrArr.length > 0 ? `(${paramsStrArr.join(',')})` : ''
        const query = `{${graphqlMethod}${paramsStr}{${dataFieldStr}}}`
        this.setLoading(component, true)
        graphqlRequest({
          url,
          method: 'POST',
          data: JSON.stringify({
            query
          })
        }).then(resp => {
          this.setLoading(component, false)
          this.setRespData(component, resp.data.data)
          if (/businessTable|dynamicFormTable/.test(component.__config__.layout)) {
            // this.value = this.getFormData()
          }
        })
      }
    },
    getParamsStr(list) {
      const strArr = []
      list.forEach(item => {
        let str = item.value
        if (item.children && item.children.length > 0) {
          str += `{${this.getParamsStr(item.children)}}`
        }
        // str = item.value
        strArr.push(str)
      })
      return strArr.join(',')
    },
    setRespData(component, respData) {
      const { dataPath, url, renderKey, dataConsumer } = component.__config__
      if (!url || !dataConsumer) return
      // console.log(respData)
      const data = dataPath.split('.').reduce((pre, item) => pre[item], respData)
      this.setObjectValueByStringKeys(component, dataConsumer, data)
      const i = this.formConf.fields.findIndex(item => item.__config__.renderKey === renderKey)
      if (i > -1) this.$set(this.formConf.fields, i, component)
    },
    setObjectValueByStringKeys(obj, strKeys, val) {
      const arr = strKeys.split('.')
      arr.reduce((pre, item, i) => {
        if (arr.length === i + 1) {
          if (item === 'data') {
            this.$set(this.value, obj.__vModel__, val)
          }
          pre[item] = val
        } else if (Object.prototype.toString.call(pre[item]) !== '[Object Object]') {
          pre[item] = {}
        }
        return pre[item]
      }, obj)
    },
    setLoading(component, val) {
      const { directives } = component
      if (Array.isArray(directives)) {
        const t = directives.find(d => d.name === 'loading')
        if (t) t.value = val
      }
    }
  }
}
