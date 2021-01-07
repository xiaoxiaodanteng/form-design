import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'CardItem',
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
  inject: ['formData', 'parser', 'mode'],
  created() {
  },
  mounted() {
  },
  methods: {
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    if (!config.show) return null
    const child = this.parser.renderChildren(h, this.scheme.__config__.children)
    return h('el-col', { attrs: { span: config.span }}, [
      h('el-card', { attrs: { bodyStyle: scheme['body-style'] ? JSON.parse(scheme['body-style']) : { padding: 0 }}}, [
        h('div', { style: { textAlign: config.align }, slot: 'header' }, config.label),
        h('el-row', [child])
      ]),

      this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
    ])
  }
}
