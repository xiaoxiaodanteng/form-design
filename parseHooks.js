// import * as hooks from 'tapable'
// const {
//   SyncHook
// } = hooks
// console.log(hooks)
/**
 * 创建组件钩子
 */
class ParseHook {
  constructor(component) {
    // this.component = component
    this.hooks = {}
    this.initHook(component)
  }
  initHook(component) {

  }
}

// 绑定组件钩子
function buildHooks(component) {
  if (!component) return
  component.__hooks__ === new ParseHook(component).hooks
}

export default buildHooks
