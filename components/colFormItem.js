
import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'
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
  name: 'ColFormItem',
  mixins: [customScript, componentMixin, componentMixin],
  inheritAttrs: false,
  props: {
    scheme: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    },
    parentList: {
      type: Array,
      default: () => ([])
    },
    column: {
      type: Object,
      required: false,
      default: () => ({})
    },
    columnIndex: {
      type: Number,
      required: false,
      default: -1
    },
    row: {
      type: Object,
      required: false,
      default: () => ({})
    },
    parent: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  inject: ['formData', 'parser', 'mode'],
  computed: {
    config() {
      return this.scheme.__config__
    },
    listeners() {
      return this.parser.buildListeners(this.scheme)
    },
    labelWidth() {
      return this.config.labelWidth ? `${this.config.showLabel ? this.config.labelWidth : 0}px` : null
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
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
    // 编辑模式下 不隐藏元素
    const config = this.scheme.__config__
    let className = ''

    if (this.mode === 'edit') {
      className = !config.show && 'hidden-item'
    } else {
      if (!config.show) return null
    }
    const listeners = this.parser.buildListeners(this.scheme)
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    // 表单元素
    if (this.parser.parserFormData && Object.keys(this.parser.parserFormData).includes(this.scheme.__vModel__) && this.parser.isAddToForm(config)) {
      this.scheme.__config__.defaultValue = this.parser.parserFormData[this.scheme.__vModel__]
    } else { // 非表单元素
      this.scheme.__config__.defaultValue = this.parser.componentModel[this.scheme.__vModel__]
    }
    if (config.showLabel === false) labelWidth = '0'

    const rules = this.getRules()

    // return <el-col span={config.span} class={className}>
    //   <el-form-item
    //     label-width={labelWidth}
    //     prop={this.scheme.__vModel__}
    //     data-prop={this.scheme.__vModel__}
    //     label={config.showLabel ? config.label : ''}
    //     rules={rules}>
    //     <render conf={this.scheme} {...{ on: listeners }} />
    //   </el-form-item>
    //   {this.parser.itemBtns(h, this.scheme, this.index, this.parentList)}
    // </el-col>
    return h('el-col', {
      attrs: {
        span: config.span
      },
      class: className
    }, [
      h('el-form-item', {
        attrs: {
          labelWidth,
          prop: this.scheme.__vModel__,
          label: config.showLabel ? config.label : '',
          rules
        }
      }, [
        h('render', {
          props: {
            conf: this.scheme
          },
          on: listeners
        })
      ]),
      this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
    ]
    )
  }
  // render(h) {
  //   const config = this.scheme.__config__
  //   const listeners = this.parser.buildListeners(this.scheme)
  //   let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
  //   if (config.showLabel === false) labelWidth = '0'
  //   return (
  //     config.show ? <el-col span={config.span}>
  //       <el-form-item label-width={labelWidth} prop={this.scheme.__vModel__} data-prop={this.scheme.__vModel__}
  //         label={config.showLabel ? config.label : ''} rules={this.scheme.rules || {}}>
  //         <render conf={this.scheme} {...{ on: listeners }} />
  //       </el-form-item>
  //     </el-col> : null
  //   )
  // }
}
