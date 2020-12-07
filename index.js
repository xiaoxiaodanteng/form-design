import Parser from './Parser'
import { emit } from './parseHooks'
const componentFiles = require.context('./components', true, /\.vue$/)

export { emit }
import '@/styles/formGenerator/index.scss'
const ParserPlugin = {
  $Vue: {}
}
ParserPlugin.install = (Vue, options = { hostname: 'http://bi.dev.nearbyexpress.com' }) => {
  Vue.component(Parser.name, Parser)

  Vue.prototype.$hostname = options.hostname
  ParserPlugin.$Vue = Vue
  // 自动注册组件
  componentFiles.keys().forEach((filePath, index) => {
    const componentName = filePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const component = componentFiles(filePath).default
    Vue.component(componentName, component)
  })
}

export function setAuthToken(token) {
  ParserPlugin.$Vue.prototype.authToken = token
}

export default ParserPlugin

