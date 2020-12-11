<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'ElementDialog',
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
  inject: ['formData', 'parser'],
  created() {
  },
  mounted() {
  },
  methods: {
    submit() {
      this.$refs.dialogForm.validate((valid, object) => {
        if (!valid) return
        // 触发submit方法
        this.runHook('submit')
        this.scheme.visible = false
      })
    }
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    // if (!config.show) return null
    const child = this.parser.renderChildren(h, this.scheme, this.index)
    return (
      h('render', {
        props: {
          conf: scheme
        },
        on: {
          // 关闭事件
          close: event => {
            this.scheme.visible = false
          }
        },
        scopedSlots: {
          default: () => {
            return h('div', { slot: 'footer' }, [
              h('el-button', { props: { size: 'mini' }}, config.cancelText || '取消'),
              h('el-button', { props: { type: 'primary', size: 'mini' }}, config.okText || '确定')
            ])
          }
        }
      }, [
        // 弹窗的表单
        h('el-form', {
          props: {
            model: this.parser.parserFormData
          },
          ref: 'dialogForm',
          attrs: {
            'label-width': `${this.parser.formConfCopy.labelWidth}px`,
            'label-position': this.parser.formConfCopy.labelPosition,
            size: this.parser.formConfCopy.size,
            disabled: this.parser.formConfCopy.disabled
          }
        }, [
          child
        ]),

        h('div', { slot: 'footer', style: { 'text-align': scheme.center ? 'center' : 'right' }}, [
          scheme['show-close'] ? h('el-button', { props: { size: 'mini' }, on: { click: event => {
            scheme.visible = false
          } }}, config.cancelText || '取消') : null,
          h('el-button', { props: { size: 'mini' }, on: { click: event => {
            this.$refs.dialogForm.resetFields()
          } }}, '重置'),
          h('el-button', { props: { type: 'primary', size: 'mini' }, on: { click: event => {
            this.submit()
          } }}, config.okText || '确定')
        ])
      ])
    )
  }
}
</script>
