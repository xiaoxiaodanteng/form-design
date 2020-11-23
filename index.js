import Parser from './Parser'
import { emit } from './parseHooks'
const componentFiles = require.context('./components', true, /\.vue$/)

export { emit }
import '@/styles/formGenerator/index.scss'
const ParserPlugin = Object.create(null)
ParserPlugin.install = (Vue) => {
  Vue.component(Parser.name, Parser)

  // 自动注册组件
  componentFiles.keys().forEach((filePath, index) => {
    const componentName = filePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const component = componentFiles(filePath).default
    Vue.component(componentName, component)
  })
}

export default ParserPlugin

