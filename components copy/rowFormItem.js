import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'RowFormItem',
  mixins: [customScript, componentMixin],
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
    }
  },
  inject: ['formData', 'parser'],
  created() {
  },
  mounted() {
  },
  methods: {

  },
  render(h) {
    const scheme = this.scheme
    // const config = this.scheme.__config__
    let child = this.parser.renderChildren(h, scheme.__config__.children)
    if (scheme.type === 'flex') {
      child = <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
        {child}
      </el-row>
    }
    return (
      <el-col span={scheme.span} class={this.mode === 'edit' ? 'drawing-row-item' : ''}>
        <el-row gutter={scheme.gutter} class='row'>
          {child}
        </el-row>
        {this.parser.itemBtns(h, this.scheme, this.index, this.parentList)}
      </el-col>
    )
  }
}
