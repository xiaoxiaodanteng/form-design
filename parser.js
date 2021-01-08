import ParserView from './parserView'
export default {
  name: 'Parser',
  props: {
    formConf: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    formDataModel: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  components: { ParserView },
  inheritAttrs: false,
  render(h) {
    console.log(this.$attrs)
    return h('parser-view', { attrs: this.$attrs })
  }
}
