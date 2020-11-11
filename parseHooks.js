// import * as hooks from 'tapable'
// const {
//   SyncHook
// } = hooks
// console.log(hooks)
/**
 * 创建组件钩子
 */

// 用户缓存绑定的组件
const componentList = []

class ParseHook {
  constructor(component) {
    // this.component = component
    // this.hooks = {
    //   submit: new SyncHook(['formData'])
    // }
    this.initHook(component)
    componentList.push(component)
  }
  initHook(component) {
    // 绑定hook

  }
}

// 绑定组件钩子
export function buildHooks(component) {
  if (!component) return
  component.__hooks__ = new ParseHook(component).hooks
}

/**
 * 触发函数
 * @param {*} event
 */
export const emit = event => new Promise((resolve, reject) => {
  switch (event) {
    // 触发提交
    case 'submit':
      {
        console.log(componentList)
        // eslint-disable-next-line no-useless-call
        const promiseArr = componentList.map(component => component.submitFormHook.call(component))
        Promise.all(promiseArr)
          .then((...rest) => {
            resolve(rest)
          })
          .catch((...errors) => {
            reject(errors)
          })
      }
      break
    default:
      break
  }
})

