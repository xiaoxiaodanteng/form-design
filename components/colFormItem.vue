<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  components: { render },
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
      type: Object,
      required: true
    }
  },
  inject: ['formData', 'parser'],
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
    }
  },
  render(h) {
    const config = this.scheme.__config__
    const listeners = this.parser.buildListeners(this.scheme)
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    return (
      config.show ? <el-col span={config.span}>
        <el-form-item label-width={labelWidth} prop={this.scheme.__vModel__} data-prop={this.scheme.__vModel__}
          label={config.showLabel ? config.label : ''} rules={this.scheme.rules || {}}>
          <render conf={this.scheme} {...{ on: listeners }} />
        </el-form-item>
      </el-col> : null
    )
  }
}
</script>
