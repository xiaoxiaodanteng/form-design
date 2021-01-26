
import { parse, parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import graphqlRequest from '../graphqlRequest'
import generator from '@babel/generator'

// 自身方法
const selfMethodMap = {
  'fn_summary-method': 'summary-method',
  'fn_span-method': 'span-method'
}
const componentConfigAttrs = [
  'required',
  'show',
  'labelWidth',
  'defaultValue',
  'label',
  'span'
]

export default {
  data() {
    return {
      componentFieldMaps: {},

      schemeProxy: null
    }
  },
  beforeCreate() {

  },
  inject: ['mode'],
  computed: {
    // 为了监听自定义脚本值变化
    selfMethodCodeIsChange() {
      let codeStr = ''
      for (const [key] of Object.entries(selfMethodMap)) {
        if (this.scheme[key] !== undefined) codeStr += this.scheme[key]
      }
      return codeStr
    },

    createdCode() {
      return this.scheme.__created__
    },
    mountedCode() {
      return this.scheme.__mounted__
    },

    componentValue() {
      this.parser.isAddToForm(this.scheme.__config__) ? this.parser.parserFormData[this.scheme.__vModel__] : this.parser.componentModel[this.scheme.__vModel__]
    },
    defaultValue() {
      return this.scheme.__config__.defaultValue
    }
  },
  watch: {
    // 监听自定义脚本是否变化
    selfMethodCodeIsChange: {
      immediate: true,
      handler() {
        this.initComponentScript()
      }
    },
    createdCode() {
      this.runHook('created')
    },
    mountedCode() {
      this.runHook('mounted')
    },
    scheme: {
      deep: true,
      immediate: true,
      handler() {
      }
    },
    // 值变化
    componentValue: {
      deep: true,
      immediate: true,
      handler(val) {
        this.runHook('watch')
      }
    },
    defaultValue(val) {
      if (this.mode === 'edit') {
        if (this.parser.isAddToForm(this.scheme.__config__)) {
          this.parser.parserFormData[this.scheme.__vModel__] = val
        } else {
          this.parser.componentModel[this.scheme.__vModel__] = val
        }
      }
    }
  },
  created() {
    // 初始化自定义脚本事件
    this.initComponentScript()
    this.runHook('created')
  },
  mounted() {
    this.runHook('mounted')
  },
  methods: {
    iGetInnerText(testStr) {
      if (testStr === undefined) return ''
      var resultStr = testStr.replace(/\ +/g, '') // 去掉空格
      resultStr = testStr.replace(/[ ]/g, '') // 去掉空格
      resultStr = testStr.replace(/[\r\n]/g, '') // 去掉回车换行
      return resultStr
    },
    initComponentScript() {
      for (const [key, value] of Object.entries(this.scheme)) {
        if (key.indexOf('fn_') !== -1) {
          if (this.iGetInnerText(value)) {
            let fn
            // eslint-disable-next-line no-eval
            eval(`fn = ${value}`)
            this.$nextTick(() => {
              this.$set(this.scheme, key.replace('fn_', ''), fn)
            })
          }
        }
      }
    },
    getHookStr(code) {
      // 转es2015
      // code = this.$babel.transform(code, {
      //   presets: ['es2015']
      // }).code

      const ast = parse(code)
      const vm = this
      // 转换变量信息
      traverse(ast, {
        MemberExpression(path) {
          const { node } = path
          if (node.object.name === '$this') {
            // 改变form value值
            if (node.property.name === 'value') {
              const isFormItem = vm.parser.isAddToForm(vm.scheme.__config__)
              // 替换
              path.replaceWith(
                parseExpression(`$${isFormItem ? 'form' : 'component'}[$this.__vModel__]`)
              )
            }
            // 改变自身值
            if (node.property.name === 'required') {
              node.name = '$this.__config__.required'
            }
            // 更改config上的值
            componentConfigAttrs.includes(node.property.name) && path.replaceWith(
              parseExpression(`$this.__config__.${node.property.name}`)
            )
          }

          // 全局变量
          if (node.object.name === '$props') {
            // node.object = t.identifier('$props["globalVar"]')
            // path.replaceWith(
            //   parseExpression('$attrs.globalVar')
            // )
          }

          // 删除$form[field]的value
          if (node.object && node.object.object && (node.object.object.name === '$form' || node.object.object.name === '$component')) {
            if (node.property.name === 'value') {
              path.replaceWith(
                node.object
              )
            } else {
              path.replaceWith(
                parseExpression(`this.getComponentByField("${node.object.property.name}").${componentConfigAttrs.includes(node.property.name) ? '__config__.' : ''}${node.property.name}`)
              )
            }
          }
        }

        // UnaryExpression(path) {
        //   // 将void 0 还原为this
        //   if (path.node.operator === 'void') {
        //     path.replaceWith(
        //       parseExpression('this')
        //     )
        //   }
        // }
      })

      // return this.$babel.transformFromAst(ast, '', {}).code
      return generator(ast).code
    },
    currentProxy() {
      if (!this.schemeProxy) {
        this.schemeProxy = new Proxy(this.scheme, {
          get: (target, propKey, receiver) => {
            // 拦截请求
            if (propKey === 'fetchData') {
              return (customParamsObj) => this.parser.fetchData(this.scheme, customParamsObj)
            }
            if (propKey === 'on') {
              return (event, fn) => this.on(event, fn)
            }
            return Reflect.get(target, propKey, receiver)
          },
          set: (target, propKey, value, receiver) => {
            if (propKey === 'value') {
              if (target.data) {
                this.formData[this.scheme.__vModel__] = value
              }
            }
            return Reflect.set(target, propKey, value, receiver)
          }
        })
      }
      return this.schemeProxy
    },
    fetch(url, params) {
      return graphqlRequest({
        url: `${this.$hostname}${url}`,
        method: 'POST',
        data: params
      })
    },
    // 绑定事件
    on(event, fn) {
      if (this.scheme.on) {
        this.$set(this.scheme.on, event, fn)
      } else {
        this.$set(this.scheme, 'on', {
          [event]: fn
        })
      }
    },
    // 执行钩子
    runHook(type) {
      const code = this.iGetInnerText(this.scheme[`__${type}__`])
      if (!code) return
      const fnStr = this.getHookStr(code)
      // console.log(fnStr)
      // eslint-disable-next-line no-useless-call
      this.hookHandler.call(
        this,
        fnStr,
        this.currentProxy(),
        this.parser.parserFormData,
        this.parser.componentModel,
        this.parser.globalVar || this.parser.$attrs['global-var'] || {},
        this.row
      )
    },
    /**
     *
     * @param {String} code 执行的代码
     * @param {Object} $this 当前表单组件
     * @param {Object} $form form
     * @param {Object} $component components
     * @param {Object} $props props
     * @param {Object} $row el-table row
     * @param {Function} h 渲染函数
     */
    hookHandler(code, $this, $form, $component, $props, $row, h = this.$createElement) {
      try {
        // eslint-disable-next-line no-eval
        eval(`
        ${code}
        `)
      } catch (err) {
        console.error(err)
        this.$message.error('自定义脚本配置错误')
      }
    },
    // 获取组件数据
    getComponentByField(field) {
      return this.parser.getComponentByField(field)
    }
  }
}
