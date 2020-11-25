import { parse, parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import { debounce } from 'throttle-debounce'
import * as t from '@babel/types'

// 钩子函数
// const hookMap = {
//   beforeCreate: 'beforeCreate',
//   created: 'created',
//   mounted: 'mounted'
// }
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
      componentFieldMaps: {}
    }
  },
  beforeCreate() {

  },
  computed: {
    // 为了监听自定义脚本值变化
    selfMethodCodeIsChange() {
      let codeStr = ''
      for (const [key] of Object.entries(selfMethodMap)) {
        if (this.scheme[key] !== undefined) codeStr += this.scheme[key]
      }
      return codeStr
    },

    componentValue() {
      if (!this.scheme || !this.scheme.__config__ || !Object.keys(this.scheme.__config__).includes('defaultValue')) return ''
      return this.scheme.__config__.defaultValue
    }
  },
  watch: {
    // 监听自定义脚本是否变化
    selfMethodCodeIsChange(val) {
      this.initComponentScript()
    },
    componentValue(val) {
      debounce(340, this.runHook('watch'))
    }
  },
  created() {
    this.initComponentFieldMaps(this.parser.formConfCopy && this.parser.formConfCopy.fields || this.parser.drawingList, this.componentFieldMaps)
    // 初始化自定义脚本事件
    this.initComponentScript()
    this.runHook('created')
  },
  methods: {
    initComponentFieldMaps(componentList, maps) {
      componentList.forEach(component => {
        if (component.__vModel__ && !maps[component.__vModel__]) maps[component.__vModel__] = component
        if (component.__config__ && component.__config__.children) this.initComponentFieldMaps(component.__config__.children, maps)

        if (component.data && component.__config__.tableType === 'layout') {
          component.data.forEach(v => {
            // eslint-disable-next-line no-unused-vars
            for (const [key, value] of Object.entries(v)) {
              this.initComponentFieldMaps(value.__config__.children, maps)
            }
          })
        }
      })
    },
    iGetInnerText(testStr) {
      if (testStr === undefined) return ''
      var resultStr = testStr.replace(/\ +/g, '') // 去掉空格
      resultStr = testStr.replace(/[ ]/g, '') // 去掉空格
      resultStr = testStr.replace(/[\r\n]/g, '') // 去掉回车换行
      return resultStr
    },
    initComponentScript() {
      // console.log(parse(`function(params) {
      //   console.log(params);
      // }`))
      for (const [key, value] of Object.entries(this.scheme)) {
        if (key.indexOf('fn_') !== -1) {
          if (this.iGetInnerText(value)) {
            let fn
            // eslint-disable-next-line no-eval
            eval(`fn = ${value}`)
            this.scheme[key.replace('fn_', '')] = fn
          }
        }
      }
      // console.log(this.scheme)
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
          if (node.object.name === '$this') {
            // 改变form value值
            if (node.property.name === 'value') {
              // 替换
              path.replaceWith(
                parseExpression('$form[$this.__vModel__]')
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
    // 执行钩子
    runHook(type) {
      const code = this.iGetInnerText(this.scheme[`__${type}__`])
      if (!code) return
      const fnStr = this.getHookStr(code)
      console.log(fnStr)
      this.hookHandler(fnStr, this.scheme, this.formData, this.parser.$attrs.globalVar || this.parser.$attrs['global-var'] || {})
    },
    hookHandler(code, $this, $form, $props) {
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
      return this.handleGetComponent(this.parser.formConfCopy.fields, field)
    },
    handleGetComponent(componentList, field) {
      let component = null
      for (let i = 0; i < componentList.length; i++) {
        const com = componentList[i]
        if (com.__vModel__ === field) {
          component = com
        } else {
          if (com.__config__.children) {
            component = this.handleGetComponent(com.__config__.children, field)
          }
        }
      }
      return component
    }
  }
}
