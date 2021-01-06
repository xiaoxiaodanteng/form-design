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
      return <el-col class={className} onClick={event => {
        this.parser.activeItem(scheme)
        event.stopPropagation()
      }}>
        <div class='draggable-dialog-header' style={{ textAlign: scheme.center ? 'center' : 'left' }}>
          <h3 class='dialog-title'>{scheme.title}</h3>
          <a class='el-icon-close close'></a>
        </div>
        <div class='draggable-dialog-content'>{child}</div>
        {this.parser.itemBtns(h, this.scheme, this.index, this.parentList)}
      </el-col>
    }
    return <render conf={scheme} onclose={event => {
      this.scheme.visible = false
    }}>
      <el-row>
        <el-form>
          <el-form model={this.parser.parserFormData} ref='dialogForm' label-width={`${this.parser.formConfCopy.labelWidth}px`} label-position={this.parser.formConfCopy.labelPosition} size={this.parser.formConfCopy.size} disabled={this.parser.formConfCopy.disabled}>
            {child}
          </el-form>
        </el-form>
      </el-row>

      <div slot='footer' style={{ textAlign: scheme.center ? 'center' : 'right' }}>
        {scheme['show-close'] && <el-button size='mini' onClick={event => (scheme.visible = false)}>{config.cancelText || '取消'}</el-button>}
        <el-button size='mini' onClick={event => (this.$refs.dialogForm.resetFields())}>重置</el-button>
        <el-button type='primary' size='mini' onClick={event => (this.submit())}>{config.okText || '确定'}</el-button>
      </div>
    </render>
  }
}
</script>
