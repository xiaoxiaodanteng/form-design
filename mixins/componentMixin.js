export default {

  methods: {

    buildListeners(scheme) {
      const config = scheme.__config__
      const methods = this.parser.formConf.__methods__ || {}
      const listeners = {}

      // 给__methods__中的方法绑定this和event
      Object.keys(methods).forEach(key => {
        listeners[key] = event => methods[key].call(this, event)
      })
      // 响应 render.js 中的 vModel $emit('input', val)
      listeners.input = event => this.setValue(event, config, scheme)

      return listeners
    },
    setValue(event, config, scheme) {
      this.$set(config, 'defaultValue', event)
      this.formData[scheme.__vModel__] = event
    }
  }
}
