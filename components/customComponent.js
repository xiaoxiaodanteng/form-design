import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'CustomComponent',
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    parentList: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
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

    // 获取render函数
    const code = this.iGetInnerText(this.scheme.__render__)
    // eslint-disable-next-line no-unused-vars
    const $form = this.parser.parserFormData
    // eslint-disable-next-line no-unused-vars
    const $props = this.parser.globalVar || this.parser.$attrs['global-var'] || {}
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
