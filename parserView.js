import graphqlRequest from './graphqlRequest'
import parserCustomScript from './mixins/parserCustomScript'
import componentMixin from './mixins/componentMixin'
import parserEditorMixin from './mixins/parserEditorMixin'
import fetchMixin from './mixins/fetchMixin'

import { createHash } from './utils/'
export default {
  name: 'ParserView',
  mixins: [parserCustomScript, parserEditorMixin, fetchMixin, componentMixin],
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
      default: 'default'
    },
    formConf: {
      type: Object,
      default: () => ({
        disabled: false,
        fields: [],
        formBtns: false,
        gutter: 15,
        labelPosition: 'right',
        labelWidth: 100,
        size: 'mini',
        span: 24
      })
    },
    activeId: {
      type: String,
      default: 'abcdef'
    },
    config: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    },
    globalVar: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    fields() {
      return this.formConf.fields
    }
  },
  data() {
    const data = {
      parserFormData: {}, // 表单的数据
      componentModel: {}, // 不加入表单数据的组件数据
      componentMaps: {} // 组件key:component
    }

    if (!this.formConf.fields) {
      this.formConf.fields = []
    }
    // 初始化数据
    data.parserFormData = this.handleUpdateModel(data)
    // 设置代理
    this.setModelToProxy(data.componentModel, data)
    // 初始化表单数据
    this.initFormData(this.formConf.fields, data.parserFormData, data)
    return data
  },
  watch: {
    fields: {
      deep: true,
      handler(newVal, oldVal) {
        // 设置表单全局属性
        this.setForm()

        // 初始化数据
        // this.parserFormData = this.handleUpdateModel(this)
        // 设置代理
        // this.setModelToProxy(this.componentModel, this)

        // 初始化表单数据
        if (newVal !== oldVal) {
          // console.log({ ...this.parserFormData }, { ...this.value }, '----fields', newVal === oldVal)

          this.initFormData(this.formConf.fields, this.parserFormData, this)
        }
      }
    },
    value: {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal && oldVal.value && oldVal.value === newVal) {
          if (Object.keys(this.value).length > 0) {
            // for (const [key, value] of Object.entries(this.value)) {
            //   this.$set(this.parserFormData, key, value)
            // }
            // this.$emit('input', this.parserFormData)
            this.parserFormData = this.handleUpdateModel(this)
            for (const [key, value] of Object.entries(this.value)) {
              // this.$set(this.parserFormData, key, value)
              this.parserFormData[key] = value
            }
          }
        }
        this.runHook('watch', newVal, oldVal)
      }
    }
  },

  provide() {
    return {
      formData: this.parserFormData,
      parser: this,
      mode: this.mode
    }
  },
  created() {
    this.init()
    // 初始化自定义脚本事件
    this.runHook('created')
  },
  methods: {
    // 初始化
    init() {
      // 设置表单全局属性
      this.setForm()
      // 请求异步数据
      // this.getDynamicData(this.formConf.fields)
    },

    // 初始化执行
    initFormData(componentList, formData, self) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (cur.__vModel__) self.componentMaps[cur.__vModel__] = cur
        if (cur.data && cur.__config__.tableType === 'dynamic') { // 动态表格
          if (!formData.hasOwnProperty(cur.__vModel__)) {
            if (this.isAddToForm(config)) {
              this.addPropertyToFormData(cur.__vModel__, cur.data, formData)
            } else {
              this.addPropertyToComponentModel(cur.__vModel__, cur.data, self.componentModel)
            }
          } else {
            cur.data = formData[cur.__vModel__]
          }
        } else if (cur.data && cur.data.length > 0 && cur.__config__.tableType === 'layout') {
          cur.data.forEach(item => {
            for (const [, val] of Object.entries(item)) {
              if (val.__config__.children.length > 0) {
                this.initFormData(val.__config__.children, formData, self)
              }
            }
          })
          this.addPropertyToComponentModel(cur.__vModel__, cur.data, self.componentModel)
        } else if (cur.__config__ && cur.__config__.tableType === 'static') { // 静态表格
          // if (this.mode !== 'edit') {
          //   const newData = []
          //   cur.data.forEach((data, index) => {
          //     const temp = {}
          //     cur.__config__.children.forEach(column => {
          //       // 如果有插入组件 则绑定组件值
          //       if (column.__config__.children.length > 0) {
          //         temp[column.__config__.field] = column.__config__.defaultValue
          //       } else {
          //         temp[column.__config__.field] = data[column.__config__.field].__config__.defaultValue
          //       }
          //     })
          //     newData.push(temp)
          //   })
          //   cur.data = newData
          // }

          if (!formData.hasOwnProperty(cur.__vModel__)) {
            if (this.isAddToForm(config, cur)) {
              this.addPropertyToFormData(cur.__vModel__, cur.data, formData)
            } else {
              this.addPropertyToComponentModel(cur.__vModel__, cur.data, self.componentModel)
            }
          } else {
            cur.data = formData[cur.__vModel__]
          }
        } else {
          if (cur.__vModel__) {
            if (this.isAddToForm(config)) {
              if (!formData.hasOwnProperty(cur.__vModel__)) {
                this.addPropertyToFormData(cur.__vModel__, cur.data || cur.__config__.defaultValue, formData)
              } else {
                if (cur.__config__.tag === 'el-upload') {
                  cur.fileList = formData[cur.__vModel__]
                }
                cur.__config__.defaultValue = formData[cur.__vModel__]
              }
            } else {
              if (cur.data) {
                this.addPropertyToComponentModel(cur.__vModel__, cur.data, self.componentModel)
              } else {
                this.addPropertyToComponentModel(cur.__vModel__, config.defaultValue, self.componentModel)
              }
            }
          }
        }
        if (config.children && config.tag !== 'el-table-column') this.initFormData(config.children, formData, self)
      })
    },
    // 设置代理
    handleUpdateModel(vm) {
      // console.log({ ...this.value })
      const proxyFormData = new Proxy(this.value, {
        get: (target, propKey, receiver) => {
          switch (propKey) {
            case '__validated__':
            {
              let isValidated
              this.$refs[this.formConf.formRef].validate(valid => {
                isValidated = valid
              })
              console.log({ ...this.value }, '---表单数据---', `---__validated__: ${isValidated}`)
              return isValidated
            }
            case 'value':
              return this.value
            case 'clearValidate':
              return this.$refs[this.formConf.formRef].clearValidate
            case 'resetFields':
              return this.$refs[this.formConf.formRef].resetFields
            case 'validate':
              return this.$refs[this.formConf.formRef].validate
            case 'validateField':
              return this.$refs[this.formConf.formRef].validateField
            default:
              return Reflect.get(target, propKey, receiver)
          }
        },
        set: (target, propKey, value, receiver) => {
          this.setValueByField(propKey, value, vm)
          return Reflect.set(target, propKey, value, receiver)
        }
      })

      this.$emit('input', proxyFormData)
      return proxyFormData
    },
    // 通过字段设置值
    setValueByField(field, value, vm = this) {
      // 判断是否是数组类型并且是表格的数据依赖
      const component = vm.componentMaps[field]
      if (component) {
        if (Array.isArray(value)) {
          // console.log(key, val)
          if (component && component.__config__.tag === 'el-table') {
            component.data = value
          } else if (component && component.__config__.tag === 'el-upload') {
            component.fileList = value
          } else {
            component.__config__.defaultValue = value
          }
        } else {
          component.__config__.defaultValue = value
        }
      }
    },
    // 设置不添加到formData的数据代理
    setModelToProxy(data, vm = this) {
      const proxyFormData = new Proxy(data, {
        get: (target, propKey, receiver) => {
          if (propKey === 'value') {
            return data
          }
          return Reflect.get(target, propKey, receiver)
        },
        set: (target, propKey, value, receiver) => {
          this.setValueByField(propKey, value, vm)
          return Reflect.set(target, propKey, value, receiver)
        }
      })
      vm.componentModel = proxyFormData
    },
    // 选中item
    activeItem(currentItem) {
      this.activeData = currentItem
      this.$emit('active-item', currentItem)
    },
    isAddToForm(config, scheme = {}) {
      return !config.hasOwnProperty('isAddToForm') || config.isAddToForm
    },

    // 添加到formData方法
    addPropertyToFormData(propKey, value, formData) {
      this.$set(formData, propKey, value)
    },

    // 添加到组件数据
    addPropertyToComponentModel(propKey, value, componentModel) {
      this.$set(componentModel, propKey, value)
    },
    setValue(event, config, scheme) {
      // 转为数字
      const isNumber = scheme.__config__.isNumber
      let value = event
      if (isNumber) {
        if (!isNaN(value)) {
          value = +value
        }
      }
      this.$set(config, 'defaultValue', value)
      if (this.parserFormData && this.isAddToForm(scheme.__config__)) {
        this.$set(this.parserFormData, scheme.__vModel__, value)
      } else {
        this.$set(this.componentModel, scheme.__vModel__, value)
      }
    },

    fetch(url, params) {
      return graphqlRequest({
        url: `${this.$hostname}${url}`,
        method: 'POST',
        data: params
      })
    },
    // 绑定事件
    on(event, fn) {
      if (this.scheme.on) {
        this.$set(this.scheme.on, event, fn)
      } else {
        this.$set(this.scheme, 'on', {
          [event]: fn
        })
      }
    },
    // 设置表单状态
    setForm() {
      if (Object.keys(this.config).length === 0) return
      for (const [key, val] of Object.entries(this.config)) {
        this.formConf[key] = val
      }
    },

    // 处理数据
    getDynamicData(componentList) {
      componentList.forEach(component => {
        const config = component.__config__
        if (config.dataType === 'dynamic') {
          if (config.autoFetch) {
            // 如果是动态表格 则不需要请求
            if (this.value[component.__vModel__] && component.__config__.tag === 'el-table') return
            this.fetchData(component)
          }
        }
        if (config.tag === 'el-table' && config.tableType === 'layout') {
          component.data.forEach(item => {
            config.children.forEach(column => {
              this.getDynamicData(item[column.__config__.field].__config__.children)
            })
          })
        }
        if (config.children) this.getDynamicData(config.children)
      })
    },

    buildListeners(scheme) {
      const config = scheme.__config__
      const methods = this.formConf.__methods__ || {}
      const listeners = {}

      // 给__methods__中的方法绑定this和event
      Object.keys(methods).forEach(key => {
        listeners[key] = event => methods[key].call(this, event)
      })
      // 响应 render.js 中的 vModel $emit('input', val)
      listeners.input = event => {
        this.setValue(event, config, scheme)
        if (scheme.on && scheme.on.input && typeof scheme.on.input === 'function') {
          scheme.on.input(event)
        }
      }

      return listeners
    },
    // 重置表单
    resetForm() {
      this.$refs[this.formConf.formRef].resetFields()
    },
    // 普通提交
    submitForm() {
      // console.log(this.parserFormData.field105 === this.formConfCopy.fields[1].data)
      console.log(this.value, { ...this.value })
      this.$refs[this.formConf.formRef].validate(valid => {
        if (!valid) return
        // const formData = this.getFormData()
        // console.log(this.formConf, formData, this.value)
        // 触发sumit事件
        this.$emit('submit', this.value)
        return true
      })
    },
    itemBtns(h, currentItem, index, parentList) {
      if (this.mode === 'default') return null
      return (
        <div class='draw-actions'>
          <span class='drawing-item-copy drawing-item-action' title='复制' onClick={event => {
            this.drawingItemCopy(currentItem, parentList); event.stopPropagation()
          }}>
            <i class='el-icon-copy-document' />
          </span>
          <span class='drawing-item-delete drawing-item-action' title='删除' onClick={event => {
            this.drawingItemDelete(index, parentList); event.stopPropagation()
          }}>
            <i class='el-icon-delete' />
          </span>
        </div>
      )
    },
    // 渲染表单按钮
    formBtns(h) {
      return <el-col>
        <el-form-item size={this.formConf.size}>
          <el-button type='primary' onClick={this.submitForm}>提交</el-button>
          <el-button onClick={this.resetForm}>重置</el-button>
        </el-form-item>
      </el-col>
    },
    // 渲染拖拽列表 如果是默认模式 则不渲染拖拽组件
    renderChildren(h, children, isRoot) {
      const components = children.map((scheme, index) => {
        const config = scheme.__config__
        // 编辑模式下选中元素/元素选中状态
        let className = ''
        const nativeOn = {}
        if (this.mode === 'edit') {
          className = this.activeId === config.formId ? 'drawing-row-item active-form-item' : 'drawing-row-item'
          nativeOn.click = event => {
            event.stopPropagation()
            this.activeItem(scheme)
          }
        }
        return h(scheme.__config__.layout, {
          props: { scheme, index, parentList: children },
          class: className,
          nativeOn
        })
      })
      if (this.mode !== 'edit') {
        return (
          components
        )
      }
      return <draggable animation={0} class={isRoot ? 'drawing-board' : 'drag-wrapper'} list={children}
        group='componentsGroup'>
        {
          components
        }
      </draggable>
    },
    // 渲染拖拽列表 如果是默认模式 则不渲染拖拽组件
    renderTableChildren(h, children, column, columnIndex, row, rowParams, parent) {
      const components = children.map((scheme, index) => {
        const config = scheme.__config__
        // 编辑模式下选中元素/元素选中状态
        let className = ''
        const nativeOn = {}
        if (this.mode === 'edit') {
          className = this.activeId === config.formId ? 'drawing-row-item active-form-item' : 'drawing-row-item'
          nativeOn.click = event => {
            event.stopPropagation()
            this.activeItem(scheme)
            console.log(this.activeId, config.formId)
          }
        }

        return h('TableColFormItem', {
          props: { scheme, index, parentList: children, column, columnIndex, row, parent, rowParams },
          class: className,
          nativeOn
        })
      })
      if (this.mode !== 'edit') {
        return (
          components
        )
      }
      return <draggable class='drag-wrapper' list={children} animation={340} group='componentsGroup'>
        {
          components
        }
      </draggable>
    },
    getNewId() {
      return createHash(6)
    }
  },
  render(h) {
    const { fields } = this.formConf
    // 渲染表单
    return (<el-row gutter={this.formConf.gutter} class='parser'>
      <el-form
        size={this.formConf.size}
        label-position={this.formConf.labelPosition}
        disabled={this.formConf.disabled}
        label-width={`${this.formConf.labelWidth}px`}
        ref={this.formConf.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this.parserFormData }}
      >
        {
          // 组件列表
          this.renderChildren(h, this.formConf.fields, true)
        }
        {
          // 提示
          fields.length === 0 && this.mode === 'edit' ? <div class='empty-info'>
            从左侧拖入或点选组件进行表单设计
          </div> : null
        }
        {
          // 渲染表单按钮
          this.mode === 'default' && this.formConf.formBtns && this.formBtns(h)
        }
      </el-form>
    </el-row>
    )
  }
}
