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
        console.log(valid, object)
        if (!valid) return
        // 触发submit方法
        this.runHook('submit')
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
        /**
         * <el-form
            size={formConfCopy.size}
            label-position={formConfCopy.labelPosition}
            disabled={formConfCopy.disabled}
            label-width={`${formConfCopy.labelWidth}px`}
            ref={formConfCopy.formRef}
            // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
            props={{ model: parserFormData }}
            rules={this.parserFormRules}
          >
            {this.renderFormItem(h, formConfCopy.fields)}
            {formConfCopy.formBtns && this.formBtns(h)}
          </el-form>
         */
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
          h('el-button', { props: { size: 'mini' }, on: { click: event => {
            scheme.visible = false
          } }}, config.cancelText || '取消'),
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
