
<script>

import render from '@/components/FormGenerator/render/render.js'
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
  components: { render },
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
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
          item.pattern && (item.pattern = eval(item.pattern))
          item.trigger = ruleTrigger && ruleTrigger[config.tag]
          return item
        })
      }
      return rule
    }
  },
  render(h) {
    const config = this.scheme.__config__
    if (!config.show) return null
    const listeners = this.parser.buildListeners(this.scheme)
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (this.formData && Object.keys(this.formData).includes(this.scheme.__vModel__)) {
      // console.log(this.formData[this.scheme.__vModel__])
      this.scheme.__config__.defaultValue = this.formData[this.scheme.__vModel__]
      // console.log(this.scheme.__vModel__, this.scheme.__config__.defaultValue, this.formData)
    }
    if (config.showLabel === false) labelWidth = '0'
    const rules = this.getRules()
    return h('el-col', {
      attrs: {
        span: config.span
      }
    }, [h('el-form-item', {
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
    ])])
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
</script>
