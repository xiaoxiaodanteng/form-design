
import { createHash, deepClone } from './utils/'
export default {
  methods: {
    drawingItemCopy(item, list) {
      let clone = deepClone(item)
      clone = this.createIdAndKey(clone)
      list.push(clone)
      this.activeItem(clone)
    },
    drawingItemAdd(item, list) {
      if (item.__config__.tag === 'table') {
        let maxLengthIndex
        let maxLength = 0
        item.__config__.children.forEach((child, index) => {
          if (child.__config__.children.length > maxLength) {
            maxLength = child.__config__.children.length
            maxLengthIndex = index
          }
        })
        let newItem = deepClone(item.__config__.children[maxLengthIndex])
        newItem.__config__.children = newItem.__config__.children.map((child) => ({
          ...child,
          __config__: {
            ...child.__config__,
            children: []
          }
        }))
        newItem = this.createIdAndKey(newItem)
        item.__config__.children.push(newItem)
      }
      this.activeItem(item)
    },
    drawingItemDelete(index, list) {
      list.splice(index, 1)
      this.$nextTick(() => {
        const len = this.fields.length
        if (len) {
          this.activeItem(this.fields[len - 1])
        }
      })
    },
    createIdAndKey(item) {
      const config = item.__config__
      if (!config) return
      config.formId = createHash(6)
      config.isAddToForm = true
      config.renderKey = `${config.formId}${+new Date()}` // 改变renderKey后可以实现强制更新组件
      item.__vModel__ = `field${createHash(6)}`
      if (config.layout === 'colFormItem' || config.layout === 'businessTable' || config.layout === 'dynamicFormTable' || config.layout === 'uploadTable') {
        item.__vModel__ = `field${createHash(6)}`
      } else if (config.layout === 'rowFormItem') {
        config.componentName = `row${createHash(6)}`
        !Array.isArray(config.children) && (config.children = [])
        delete config.label // rowFormItem无需配置label属性
      }
      if (Array.isArray(config.children)) {
        config.children = config.children.map(childItem => this.createIdAndKey(childItem))
      }
      return item
    }
  }
}
