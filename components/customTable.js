import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'CustomTable',
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    // createdFn = function() {
    //   console.log(this)
    // }

    const data = {
    }

    return data
  },
  inject: ['formData', 'parser'],
  created: () => {
  },
  mounted() {
  },
  methods: {

  },
  render(h, context) {
    const { __config__: config } = this.scheme
    // let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    // if (config.showLabel === false) labelWidth = '0'

    // 获取render函数
    const code = this.iGetInnerText(this.scheme.__render__)
    // eslint-disable-next-line no-unused-vars
    const $form = this.parser.parserFormData
    // eslint-disable-next-line no-unused-vars
    const $component = this.parser.componentModel
    // eslint-disable-next-line no-unused-vars
    const $this = this.currentProxy()
    const fnStr = this.getHookStr(code)
    let renderFn
    try {
      if (!fnStr) renderFn = (h) => h('div', '请配置render函数')
      else {
        // eslint-disable-next-line no-eval
        eval(`
        renderFn = ${fnStr}
      `)
      }
    } catch (e) {
      this.$message.error('render函数配置错误')
    }

    let className = ''
    if (this.mode === 'edit') {
      className = !config.show && 'hidden-item'
    } else {
      if (!config.show) return null
    }

    const component = renderFn.call(this, h, context)
    // 判断是否需要form-item
    // const formItemComponent = config.isFormItem ? h('el-form-item', {
    //   attrs: {
    //     labelWidth,
    //     // prop: this.scheme.__vModel__,
    //     label: config.showLabel ? config.label : '',
    //     required: config.required
    //   }

    // }, [component]) : component

    return config.isNeedCol ? h('el-col', {
      attrs: {
        span: config.span
      },
      class: className
    }, [
      component,

      this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
    ]) : component
  }
}
