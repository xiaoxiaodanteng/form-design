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
  },
  render(h) {
    const scheme = this.scheme
    // const config = this.scheme.__config__
    // if (!config.show) return null
    const child = this.parser.renderChildren(h, this.scheme, this.index)
    return (
      h('render', {
        props: {
          conf: scheme
        },
        on: {
          close: event => {
            console.log(event)
            this.scheme.visible = false
          }
        }
      }, [
        child
      ])
    )
  }
}
</script>
