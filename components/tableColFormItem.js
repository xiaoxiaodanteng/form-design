
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
  name: 'TableColFormItem',
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
      type: Object,
      required: true
    },
    column: {
      type: Object,
      required: true
    },
    columnIndex: {
      type: Number,
      required: true
    },
    row: {
      type: Object,
      required: true
    },
    parent: {
      type: Object,
      required: true
    },
    rowParams: {
      type: Object,
      required: true
    }
  },
  inject: ['formData', 'parser'],
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
    getTableColumnRules(scheme, column) {
      let rule = []
      const regList = []
      // 处理正则
      const config = scheme.__config__
      const columnConfig = column.__config__
      if (Array.isArray(config.regList)) {
        // console.log(columnConfig)
        if (columnConfig.required && this.parser.isAddToForm(columnConfig)) {
          const required = { required: columnConfig.required, message: scheme.placeholder }
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
  render(h) {
    const config = this.scheme.__config__
    const { column, columnIndex, row, parent } = this
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    if (column.__config__.disabled !== undefined && column.__config__.disabled) {
      this.scheme.disabled = column.__config__.disabled
    }
    const props = {
      label: config.showLabel ? config.label : '',
      labelWidth
    }
    const rules = this.getTableColumnRules(this.scheme, column)
    if (this.parser.parserFormData[parent.__vModel__] && this.parser.parserFormData[parent.__vModel__].length > 0 && column.__config__.children && column.__config__.required) {
      props.prop = `${parent.__vModel__}.${columnIndex}.${column.__config__.field}`
      props.rules = rules
    }
    if (!config.show) return null
    return h('el-col', {
      attrs: {
        span: config.span
      }
    }, [h('el-form-item', {
      attrs: {
        labelWidth,
        label: config.showLabel ? config.label : ''
      },
      props
    }, [
      h('render', {
        props: {
          conf: { ...this.scheme, __config__: { ...this.scheme.__config__, defaultValue: row[column.__config__.field] }
          }
        },
        on: {
          input: event => {
            this.$set(row, column.__config__.field, event)
          }
        }
      })
    ])])
  }
}
