<script>
import { deepClone } from '@/utils/formGenerator/index'
import render from '@/components/FormGenerator/parser/render/render.js'
import { buildHooks } from './parseHooks'
import graphqlRequest from './graphqlRequest'
import __method__ from '@/components/FormGenerator/mixins/__method__'
import componentBuildHooks from '@/utils/formGenerator/hooks'
// import { isNumberStr, isBooleanStr } from '@/utils/formGenerator/index'

import parserComponentMixin from './mixins/parserComponentMixin'
import parserCustomScript from './mixins/parserCustomScript'
import { debounce } from 'throttle-debounce'
const ruleTrigger = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-group': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'el-time-picker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change'
}

const FORM_MODEL = 'elForm'
const FORM_RULES = 'rules'

export default {
  name: 'ParserCom',
  components: {
    render
  },
  mixins: [__method__, parserComponentMixin, parserCustomScript],
  props: {
    formConf: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  provide() {
    return {
      formData: this[FORM_MODEL],
      parser: this
    }
  },
  data() {
    const data = {
      formConfCopy: deepClone(this.formConf),
      [FORM_MODEL]: {},
      [FORM_RULES]: {},

      updateModel: debounce(200, this.handleUpdateModel),

      componentMaps: {} // 组件key:component
    }
    data.parserFormData = data[FORM_MODEL]
    data.parserFormRules = data[FORM_MODEL]
    if (this.formConf && this.formConf.fields) {
      this.formConf.fields.forEach(field => {
        if (
          field.__config__.layout === 'businessTable' && field.__config__.tableSelectType === 'multiple' ||
          field.__config__.layout === 'uploadTable'
        ) {
          data[`multipleSelection${field.__config__.renderKey}`] = []
        }
      })
    }
    if (Object.keys(data.formConfCopy).length === 0) {
      data.formConfCopy = {
        disabled: false,
        fields: [],
        formBtns: false,
        gutter: 15,
        labelPosition: 'right',
        labelWidth: 100,
        size: 'mini',
        span: 24
      }
    }

    return data
  },
  watch: {
    config: {
      deep: true,
      handler(config) {
        this.setForm()
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (Object.keys(this.value).length > 0 && !newVal.value) {
          this.setFormDataByValue()
          console.log(this[FORM_MODEL])
        }
      }
    },
    [FORM_MODEL]: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        this.updateModel(this[FORM_MODEL])
      }
    }
  },
  created() {
    // console.log(1)
    this.init()

    buildHooks(this)
  },
  mounted() {
  },
  methods: {
    // 初始化
    init() {
      this.initFormData(this.formConfCopy.fields, this[FORM_MODEL])
      this.buildRules(this.formConfCopy.fields, this[FORM_RULES])

      // 如果有vModel绑定
      if (Object.keys(this.value).length > 0) {
        this.setFormDataByValue()
      }
      // console.log(this[FORM_MODEL], this.formConfCopy.fields)
      if (Object.keys(this.formConfCopy).length > 0) {
      // 全局钩子

        // 事件
        this.hasEventComponentList = this.getHasEventComponentList(this.formConfCopy.fields)
        // 添加钩子
        this.bindComponentsHook(this.formConfCopy.fields)
        // 绑定钩子事件
        this.addHookListener(this.formConfCopy.fields)
        // 设置表单
        this.setForm()
        // 请求异步数据
        this.getDynamicData(this.formConfCopy.fields)
      }
    },
    handleUpdateModel(formData) {
      this.parserFormData = formData

      const proxyFormData = new Proxy(formData, {
        get: (target, propKey, receiver) => {
          if (propKey === '__validated__') {
            let isValidated
            this.$refs[this.formConf.formRef].validate(valid => {
              isValidated = valid
            })
            return isValidated
          } else if (propKey === 'value') {
            return formData
          }
          return Reflect.get(target, propKey, receiver)
        },
        set: (target, propKey, value, receiver) => {
          return Reflect.set(target, propKey, value, receiver)
        }
      })
      this.$emit('input', proxyFormData)
      this.runHook('watch')
    },
    setComponentConf(componentList) {
      componentList.forEach(component => {
        const formValue = this.value[component.__vModel__]
        // 布局表格数据
        if (component.data && component.__config__.tableType === 'layout') {
          component.data.forEach(item => {
            component.__config__.children.forEach(column => {
              if (item[column.__config__.field].__config__.children.length > 0) {
                this.setComponentConf(item[column.__config__.field].__config__.children)
              }
            })
          })
        } else if (component.data && component.__config__.tag === 'el-table') { // 静态表格/动态表格
          if (this.value[component.__vModel__]) {
            if (component.__config__.tableType === 'static' && component.data.length === this.value[component.__vModel__].length) {
              const value = this.value[component.__vModel__]
              component.data.forEach((item, index) => {
                for (const [key, val] of Object.entries(item)) {
                  if (val.__config__.children && val.__config__.children.length > 0) {
                    val.__config__.children[0].__config__.defaultValue = value[index][key]
                  } else {
                    val.__config__.defaultValue = value[index][key]
                  }
                }
              })
            } else {
              component.__config__.autoFetch = false
              component.data = this.value[component.__vModel__]
            }
          }
        } else {
          if (formValue !== null && formValue !== undefined) {
            component.__config__.defaultValue = formValue
            if (component.__config__.tag === 'el-upload') {
              component['file-list'] = formValue
            }
          }
        }
        if (component.__config__.children) {
          this.setComponentConf(component.__config__.children)
        }
      })
    },
    // 初始化执行 只执行一次
    initFormData(componentList, formData) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (cur.__vModel__) this.componentMaps[cur.__vModel__] = cur
        if (cur.data && cur.__config__.tableType === 'dynamic') { // 动态表格
          this.$set(formData, cur.__vModel__, cur.data)
        } else if (cur.data && cur.data.length > 0 && cur.__config__.tableType === 'layout') {
          cur.data.forEach(item => {
            // eslint-disable-next-line no-unused-vars
            for (const [key, val] of Object.entries(item)) {
              if (val.__config__.children.length > 0) {
                val.__config__.children.forEach(v => {
                  this.$set(formData, v.__vModel__, v.__config__.defaultValue)
                })
              }
            }
          })
        } else if (cur.__config__ && cur.__config__.tableType === 'static') { // 静态表格
          const newData = []
          cur.data.forEach((data, index) => {
            const temp = {}
            cur.__config__.children.forEach(column => {
              if (index === 0) {
                column.__config__.children = data[column.__config__.field].__config__.children
                column.__config__.defaultValue = data[column.__config__.field].__config__.defaultValue
              }
              if (data[column.__config__.field].__config__.children.length > 0) {
                temp[column.__config__.field] = data[column.__config__.field].__config__.children[0].__config__.defaultValue
              } else {
                temp[column.__config__.field] = data[column.__config__.field].__config__.defaultValue
              }
            })
            newData.push(temp)
          })
          cur.data = newData
          this.$set(formData, cur.__vModel__, cur.data)
        } else {
          if (cur.__vModel__) {
            this.$set(formData, cur.__vModel__, config.defaultValue)
          }
        }
        if (config.children && config.tag !== 'el-table-column') this.initFormData(config.children, formData)
      })
    },
    buildRules(componentList, rules) {
      componentList.forEach(cur => {
        const config = cur.__config__

        // 表格数据
        if (cur.data) {
          cur.__config__.tableType !== 'layout' && config.children.forEach(column => {
            if (column.__config__.children && column.__config__.children.length > 0) {
              if (column.__config__.children[0].__config__.required) {
                const required = { required: column.__config__.children[0].__config__.required, message: cur.placeholder, trigger: 'blur' }
                required.message === undefined && (required.message = `${column.__config__.label}不能为空`)
                this.$set(column, 'rules', required)
              }
            }
          })

          // 布局表格
          cur.__config__.tableType === 'layout' && cur.data.forEach(item => {
            // eslint-disable-next-line no-unused-vars
            for (const [key, val] of Object.entries(item)) {
              if (val.__config__.children) this.buildRules(val.__config__.children, rules)
            }
          })
        }

        if (Array.isArray(config.regList)) {
          if (config.required) {
            const required = { required: config.required, message: cur.placeholder }
            if (Array.isArray(config.defaultValue)) {
              required.type = 'array'
              required.message = `请至少选择一个${config.label}`
            }
            required.message === undefined && (required.message = `${config.label}不能为空`)
            config.regList.push(required)
          }
          const rule = config.regList.map(item => {
            // eslint-disable-next-line no-eval
            item.pattern && (item.pattern = eval(item.pattern))
            item.trigger = ruleTrigger && ruleTrigger[config.tag]
            return item
          })
          rules[cur.__vModel__] = rule
          this.$set(cur, 'rules', rule)
        }
        if (config.children) this.buildRules(config.children, rules)
      })
    },
    // 根据vModel设置form
    setFormDataByValue() {
      for (const [key, val] of Object.entries(this.value)) {
        // eslint-disable-next-line no-prototype-builtins
        if (this[FORM_MODEL].hasOwnProperty(key)) {
          this[FORM_MODEL][key] = val
          // 判断是否是数组类型并且是表格的数据依赖
          if (Array.isArray(val)) {
            // console.log(key, val)
            const component = this.componentMaps[key]
            if (component && component.__config__.tag === 'el-table') {
              component.data = val
              // console.log(this[FORM_MODEL], component)
            }
          }
        }
      }
    },
    // 获取组件数据
    getComponentByField(field) {
      const component = this.handleGetComponent(this.formConfCopy.fields, field)
      return component
      // return new Proxy(component, {
      //   get: (target, propKey, receiver) => {
      //     // 拦截请求
      //     if (propKey === 'fetchData') {
      //       return (customParamsObj) => this.fetchData(component, customParamsObj)
      //     }
      //     return Reflect.get(target, propKey, receiver)
      //   },
      //   set: (target, propKey, value, receiver) => {
      //     if (propKey === 'value') {
      //       if (target.data) {
      //         this.parserFormData[component.__vModel__] = value
      //         component.data = value
      //       }
      //     }
      //     return Reflect.set(target, propKey, value, receiver)
      //   }
      // })
    },
    handleGetComponent(componentList, field) {
      let component = null
      for (let i = 0; i < componentList.length; i++) {
        const com = componentList[i]
        if (com.__vModel__ === field) {
          component = com
        } else {
          if (com.__config__.children) {
            const temp = this.handleGetComponent(com.__config__.children, field)
            if (temp) return temp
          }
        }
      }
      return component
    },
    bindComponentsHook(componentList) {
      componentList.forEach(component => {
        if (component.__method__ && component.__method__.options) {
          componentBuildHooks(component)
        }
        if (component.__config__ && component.__config__.children) this.bindComponentsHook(component.__config__.children)
        if (component.data && component.__config__.tableType === 'layout') {
          component.data.forEach(v => {
            // eslint-disable-next-line no-unused-vars
            for (const [key, value] of Object.entries(v)) {
              this.bindComponentsHook(value.__config__.children)
            }
          })
        }
      })
    },
    // 设置表单状态
    setForm() {
      if (Object.keys(this.config).length === 0) return
      this.formConfCopy = { ...this.formConfCopy, ...this.config }
    },

    // 处理自定义禁用组件
    disposeCustomDisabledComponent() {
      this.customDisabledComponentList.forEach(component => {
        // 并且 操作
        const customOptions = component.__customDisabled__.options
        const type = component.__customDisabled__.type
        const results = customOptions.reduce((prev, curr) => {
          let result = true
          if (curr.operation === 'includes') {
            for (let i = 0; i < curr.value.length; i++) {
              const val = curr.value[i]
              if (!this[FORM_MODEL][curr.field].includes(val)) {
                result = false
                break
              }
            }
          } else {
            // eslint-disable-next-line no-eval
            result = eval(`${this[FORM_MODEL][curr.field]}${curr.operation}${curr.value}`)
          }
          return [...prev, result]
        }, [])
        component.disabled = type === 'and' ? !results.includes(false) : results.includes(true)
      })
    },

    // 处理数据
    getDynamicData(componentList) {
      componentList.forEach(component => {
        const config = component.__config__
        if (config.dataType === 'dynamic') {
          if (config.autoFetch) this.fetchData(component)
        }
        if (config.children) this.getDynamicData(config.children)
      })
    },

    resetForm() {
      this.formConfCopy = deepClone(this.formConf)
      this.$refs[this.formConf.formRef].resetFields()
    },
    // 钩子触发提交函数
    submitFormHook() {
      return new Promise((resolve, reject) => {
        this.$refs[this.formConf.formRef].validate(valid => {
          if (!valid) return reject(false)
          const formData = this.getFormData()
          resolve(formData)
          return true
        })
      })
    },
    // 普通提交
    submitForm() {
      // console.log(this.parserFormData.field105 === this.formConfCopy.fields[1].data)
      console.log(this[FORM_MODEL])
      this.$refs[this.formConf.formRef].validate(valid => {
        if (!valid) return
        // const formData = this.getFormData()
        // console.log(this.formConf, formData, this[FORM_MODEL])
        // 触发sumit事件
        this.$emit('submit', this[FORM_MODEL])
        return true
      })
    },
    getFormData() {
      // 处理数据
      const formData = deepClone(this[FORM_MODEL])
      // 业务表格
      this.formConfCopy.fields.forEach(item => {
        if (item.__config__.layout === 'businessTable' || item.__config__.layout === 'dynamicFormTable' || item.__config__.layout === 'uploadTable') {
          const key = item.__vModel__
          formData[key] = deepClone(item.data)
        }
      })
      return formData
    },

    fetchData(component, customParamObj = {}) {
      const { dataPath, dataType, url, defaultParams, graphqlMethod, dependencies, dataFields } = component.__config__
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
          const formData = this.getFormData(this.drawingList)
          dependencies.forEach(field => {
            !!field && (params[field] = formData[field])
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

        const query = `{
            ${graphqlMethod}${paramsStr} {
              ${dataFieldStr}
            }
          }`
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
            // this[FORM_MODEL] = this.getFormData()
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
      const i = this.formConfCopy.fields.findIndex(item => item.__config__.renderKey === renderKey)
      if (i > -1) this.$set(this.formConfCopy.fields, i, component)
    },
    setObjectValueByStringKeys(obj, strKeys, val) {
      const arr = strKeys.split('.')
      arr.reduce((pre, item, i) => {
        if (arr.length === i + 1) {
          if (item === 'data') {
            this.$set(this[FORM_MODEL], obj.__vModel__, val)
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
  },
  render(h) {
    return this.renderFrom(h)
  }
}
</script>

<style lang="scss">
@import '@/styles/formGenerator';
</style>
