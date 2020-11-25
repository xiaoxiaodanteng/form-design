<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'CardItem',
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
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    if (!config.show) return null
    const child = this.parser.renderChildren(h, this.scheme, this.index)
    return (
      h('el-col', { attrs: { span: config.span }}, [
        h('el-card', {
          class: 'fe-card',
          attrs: {
            bodyStyle: scheme['body-style'] ? JSON.parse(scheme['body-style']) : {
              padding: 0
            }
          }
        }, [
          h('div', { slot: 'header', style: { textAlign: config.align }}, config.label),
          h('el-row', {
          }, [
            child
          ])
        ])
      ])
    )
  }
}
</script>
