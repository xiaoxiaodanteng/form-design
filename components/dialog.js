import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'ElementDialog',
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

    const child = this.parser.renderChildren(h, this.scheme.__config__.children)
    // 编辑模式
    if (this.mode === 'edit') {
      const className = this.parser.activeId === config.formId
        ? 'drawing-row-item active-form-item table-row-item'
        : 'drawing-row-item table-row-item'
      return h('el-col', { class: className, on: { click: event => {
        this.parser.activeItem(scheme)
        event.stopPropagation()
      } }}, [
        h('div', { class: 'draggable-dialog-header', style: { textAlign: scheme.center ? 'center' : 'left' }}, [
          h('h3', { class: 'dialog-title' }, scheme.title),
          h('a', { class: 'el-icon-close close' })
        ]),
        h('div', { class: 'draggable-dialog-content' }, child),
        this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
      ])
    }

    return h('render', { props: { conf: scheme }, on: { close: () => (this.scheme.visible = false) }}, [
      h('el-row', [
        h(
          'el-form',
          {
            props: {
              model: this.parser.parserFormData,
              labelWidth: `${this.parser.formConfCopy.labelWidth}px`,
              labelPosition: this.parser.formConfCopy.labelPosition,
              size: this.parser.formConf.size,
              disabled: this.parser.formConf.disabled
            },
            ref: 'dialogForm'
          },
          child
        )
      ]),

      h('div', {
        slot: 'footer',
        style: {
          textAlign: scheme.center ? 'center' : 'right'
        }
      }, [
        scheme['show-close'] && h(
          'el-button',
          { attrs: { size: 'mini' }, on: { click: () => (scheme.visible = false) }},
          config.cancelText || '取消'
        ),

        h(
          'el-button',
          { attrs: { size: 'mini' }, on: { click: () => (this.$refs.dialogForm.resetFields()) }},
          '重置'
        ),

        h(
          'el-button',
          { attrs: { size: 'mini', type: 'primary' }, on: { click: () => (this.submit()) }},
          config.okText || '确定'
        )
      ])
    ])
  }
}
