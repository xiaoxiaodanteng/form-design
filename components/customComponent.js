import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

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
    },
    getRules() {
      let rule = []
      const regList = []
      // 处理正则
      const config = this.scheme.__config__
      if (Array.isArray(config.regList)) {
        if (config.required && this.parser.isAddToForm(config)) {
          const required = { required: config.required, message: this.scheme.placeholder }
          if (Array.isArray(config.defaultValue)) {
            required.type = 'array'
            required.message = `请至少选择一个${config.label}`
          }
          required.message === undefined && (required.message = `${config.label}不能为空`)
          regList.push(required)
        }
        rule = regList.concat(config.regList).map(item => {
          // eslint-disable-next-line no-eval
          item.__pattern__ && (item.pattern = eval(item.__pattern__))
          item.trigger = ruleTrigger && ruleTrigger[config.tag]
          return item
        })
      }
      return rule
    }
  },
  render(h, context) {
    const { __config__: config } = this.scheme
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'

    const listeners = this.parser.buildListeners(this.scheme)

    const nativeOn = {}

    const rules = this.getRules()

    if (this.mode === 'edit') {
      nativeOn.click = event => {
        event.preventDefault()
        this.parser.activeItem(this.scheme)
      }
    }

    const component = h('render', {
      props: {
        conf: {
          ...this.scheme,
          href: this.mode === 'edit' ? null : this.scheme.href, // 处理编辑模式下 el-link不跳转
          target: this.scheme.href ? '_blank' : null
        }
      },
      on: listeners,
      // on: {
      //   input: event => {
      //     const value = this.formatterValue(event)
      //     this.$set(config, 'defaultValue', value)
      //   }
      // },
      nativeOn
    }, [
      config.defaultValue,
      this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
    ])

    // 判断是否需要form-item
    const formItemComponent = config.isFormItem ? h('el-form-item', {
      attrs: {
        labelWidth,
        prop: this.scheme.__vModel__,
        label: config.showLabel ? config.label : '',
        // required: config.required,
        rules
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
