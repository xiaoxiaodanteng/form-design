<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'CustomComponent',
  components: { render },
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
    const data = {
    }

    return data
  },
  inject: ['formData', 'parser', 'draggable'],
  created: () => {
  },
  mounted() {
  },
  methods: {
    formatterValue(event) {
      // 输入框数字类型
      if (this.scheme.__config__.numberType) {
        // 整数类型
        if (this.scheme.__config__.numberType === 'Int') {
          return event.replace('.', '')
        } else if (this.scheme.__config__.numberType === 'Decimal') {
          // 是否需要限制小数点位数
          const limit = this.scheme.__config__.decimalPointLength
          if (this.scheme.__config__.decimalPointLength) {
            const numberValues = event.split('.')
            if (numberValues[1] && numberValues[1].length > limit) {
              numberValues[1] = numberValues[1].slice(0, limit)
            }
            return numberValues.join('.')
          }
        }
      }

      return event
    }
  },
  render(h, context) {
    const { __config__: config } = this.scheme
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'

    const component = h('render', {
      props: {
        conf: this.scheme
      },
      on: {
        input: event => {
          const value = this.formatterValue(event)
          this.$set(config, 'defaultValue', value)
        }
      },
      nativeOn: {
        click: event => {
          event.preventDefault()
          this.parser.activeItem(this.scheme)
        }
      }
    })
    // 判断是否需要form-item
    const formItemComponent = config.isFormItem ? h('el-form-item', {
      attrs: {
        labelWidth,
        prop: this.scheme.__vModel__,
        label: config.showLabel ? config.label : '',
        required: config.required
      }

    }, [component]) : component

    return config.isNeedCol ? h('el-col', {
      attrs: {
        span: config.span
      }
    }, [
      formItemComponent
    ]) : formItemComponent
  }
}
</script>
