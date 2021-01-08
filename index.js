import Parser from './Parser.vue'
import { emit } from './parseHooks'
const componentFiles = require.context('./components', true, /\.(js|vue)$/)

import Tinymce from './tinymce/index.vue'

export { emit }
import '@/styles/formGenerator/index.scss'
const ParserPlugin = {
  $Vue: {}
}
ParserPlugin.install = (Vue, options = { hostname: 'http://bi.dev.nearbyexpress.com' }) => {
  Vue.component(Parser.name, Parser)
  Vue.component('tinymce', Tinymce)

  ParserPlugin.$Vue = Vue
  ParserPlugin.$Vue.prototype.$hostname = options.hostname
  console.log(options, ParserPlugin.$Vue.prototype)
  // 自动注册组件
  componentFiles.keys().forEach((filePath, index) => {
    // const componentName = filePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const component = componentFiles(filePath).default
    Vue.component(component.name, component)
  })
}

export function setAuthToken(token) {
  ParserPlugin.$Vue.prototype.authToken = token
}

export default ParserPlugin

