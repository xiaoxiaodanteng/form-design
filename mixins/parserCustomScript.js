import { parse, parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types'

// 钩子函数
// const hookMap = {
//   beforeCreate: 'beforeCreate',
//   created: 'created',
//   mounted: 'mounted'
// }

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
    }
  },
  beforeCreate() {

  },
  computed: {
    $props() {
      return this.globalVar
    }
  },
  watch: {
    $props: {
      deep: true,
      immediate: true,
      handler() {
        this.runHook('props')
      }
    }
  },
  created() {
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
    // 执行钩子
    runHook(type, newForm, oldForm) {
      const code = this.iGetInnerText(this.formConf[`__${type}__`])
      if (!code) return
      const fnStr = this.getHookStr(code)

      // console.log(`----执行${type}钩子---`)
      // console.log(fnStr)
      // console.log(`----执行${type}钩子结束---`)
      this.hookHandler(fnStr, this.formConf, this.parserFormData, oldForm, this.componentModel, this.$props)
    },
    getHookStr(code) {
      const ast = parse(code)
      // 转换变量信息
      traverse(ast, {
        enter(path) {
          // if (path.node.type === '')
          // 如果需要控制其他组件 则查找替换组件内容
        },
        Identifier(path) {
          // console.log(path)
        },
        BinaryExpression(path) {
          // console.log(path)
        },
        ExpressionStatement(path) {
          // console.log(path, generator(path.parentPath.node).code)
          // path.insertAfter(t.assignmentExpression('=', t.identifier('$this.abcqqq'), t.booleanLiteral(true)))
        },
        MemberExpression(path) {
          const { node } = path

          // 全局变量
          if (node.object.name === '$props') {
            // node.object = t.identifier('$props["globalVar"]')
            // path.replaceWith(
            //   parseExpression('$attrs.globalVar')
            // )
          }

          // 删除$form[field]的value
          if (t.isMemberExpression(node.object) && node.object.object.name === '$form') {
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

          // 删除$component[field]的value
          if (t.isMemberExpression(node.object) && node.object.object.name === '$component') {
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
        },
        AssignmentExpression(path) {
          // console.log(path, generator(path.node).code)
          // if (t.isIdentifier(path.node, { name: '$this' })) {
          //   path.node.name = 'this.$attrs.globalVar'
          // }
          // console.log(generator(path.container).code)
          // path.insertAfter(t.assignmentExpression('=', t.identifier('$this.abc'), t.booleanLiteral(true)))
          // console.log(generator().code)
          // path.pushContainer('body', t.assignmentExpression('=', t.identifier('abc'), t.booleanLiteral(true)))
        },
        ObjectProperty(path) {
          // console.log(path, generator(path.node).code)
        },
        BlockStatement(path) {
          // path.node.body.push(t.assignmentExpression('=', t.identifier('abc'), t.booleanLiteral(true)))
          // console.log(path, generator(path.node).code)
        }
      })

      return generator(ast).code
    },
    /**
     *
     * @param {String} code 执行的代码
     * @param {Object} $this 当前表单组件
     * @param {Object} $form form
     * @param {Object} $oldForm
     * @param {Object} $component components
     * @param {Object} $props props
     */
    hookHandler(code, $this, $form, $oldForm, $component, $props) {
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
      const component = this.componentMaps[field] || {}
      return new Proxy(component, {
        get: (target, propKey, receiver) => {
          // 拦截请求
          if (propKey === 'fetchData') {
            return (customParamsObj) => this.fetchData(component, customParamsObj)
          }
          if (propKey === 'on') {
            return (event, fn) => this.on(event, fn)
          }
          return Reflect.get(target, propKey, receiver)
        },
        set: (target, propKey, value, receiver) => {
          if (propKey === 'value') {
            if (target.data) {
              this.value[component.__vModel__] = value
              component.data = value
            } else {
              component.__config__.defaultValue = value
            }
          }
          return Reflect.set(target, propKey, value, receiver)
        }
      })
    }
  }
}
