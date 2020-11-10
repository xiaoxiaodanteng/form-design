import Parser from './Parser'
import { emit } from './parseHooks'

export { emit }

const ParserPlugin = Object.create(null)
ParserPlugin.install = (Vue) => {
  Vue.component(Parser.name, Parser)
}

export default ParserPlugin

