<script>
import { deepClone, generateUUID } from '@/utils/formGenerator/index'
import render from '@/components/FormGenerator/render/render.js'
import { buildHooks, emit } from './parseHooks'

const ruleTrigger = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-group': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'el-time-picker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change'
}

const components = {
  tableColgroup(h, currentItem) {
    const config = currentItem.__config__
    return (
      <colgroup>
        {config.columnWidths.map((item, index) => (
          <col name={item.field} key={index} width={item.minWidth}/>
        ))}
      </colgroup>
    )
  }
}

const layouts = {
  colFormItem(h, scheme) {
    const config = scheme.__config__
    const listeners = buildListeners.call(this, scheme)

    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    return (
      <el-col span={config.span}>
        <el-form-item label-width={labelWidth} prop={scheme.__vModel__}
          label={config.showLabel ? config.label : ''}>
          <render conf={scheme} {...{ on: listeners }} />
        </el-form-item>
      </el-col>
    )
  },
  rowFormItem(h, scheme) {
    let child = renderChildren.apply(this, arguments)
    if (scheme.type === 'flex') {
      child = <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
        {child}
      </el-row>
    }
    return (
      <el-col span={scheme.span}>
        <el-row gutter={scheme.gutter}>
          {child}
        </el-row>
      </el-col>
    )
  },

  table(h, currentItem, index, list, parentList) {
    const config = currentItem.__config__
    // console.log([...arguments, currentItem])
    const child = renderChildren.apply(this, [...arguments, currentItem])
    return (
      <el-col span={config.span}>
        <el-row gutter={config.gutter}>
          <render key={config.renderKey} conf={currentItem} onInput={ event => {
            this.$set(config, 'defaultValue', event)
          }}>
            {components.tableColgroup.apply(this, arguments)}
            <tbody>{child}</tbody>
          </render>
        </el-row>
      </el-col>
    )
  },
  trItem(h, currentItem, index, list, parentList, parent) {
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    return (
      <tr label={config.label}>
        {child}
      </tr>
    )
  },

  tdItem(h, currentItem, index, list, parentList, root, tableRoot) {
    console.log(tableRoot)
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    return (
      <render key={config.renderKey} conf={currentItem} onInput={ event => {
        this.$set(config, 'defaultValue', event)
      }}>
        <el-row class={'t-cell ' + tableRoot.__config__.columnWidths[index].field} style={{ minWidth: currentItem.colspan > 1 ? tableRoot.__config__.columnWidths[index].minWidth + 'px' : 'auto' }}>
          {child}
        </el-row>
      </render>
    )
  },
  tipFormItem(h, currentItem, index, list) {
    const config = currentItem.__config__
    return (
      <el-col span={config.span}>
        <render key={config.renderKey} conf={currentItem}>
          {config.defaultValue}
        </render>
      </el-col>
    )
  },

  // 渲染业务表格
  businessTable(h, currentItem, index, list, parentList) {
    const config = currentItem.__config__
    const child = renderChildren.apply(this, [...arguments, currentItem])
    const fieldType = {}
    config.children.forEach(child => {
      fieldType[child.__config__.field] = child.__config__.type
    })

    return (
      <el-col span={config.span}>
        <el-row gutter={config.gutter}>
          <el-row>
            <div class='actions mb5'>
              <el-link icon='el-icon-circle-plus-outline' type='primary' onClick={() => {
                const newItem = deepClone(currentItem.data[currentItem.data.length - 1])
                for (const [key, val] of Object.entries(newItem)) {
                  newItem[key] = fieldType[key] === 'default' ? val : ''
                }
                newItem.dataKey = generateUUID()
                currentItem.data.push(newItem)
              }}>新增</el-link>
              <el-link icon='el-icon-remove-outline' type='danger' onClick={() => {
                this.$message.error('测试')
                this.$confirm('是否删除？')
                  .then(() => {
                    this[`multipleSelection${config.renderKey}`].forEach(item => {
                      const delIndex = currentItem.data.find(v => v.dataKey === item.dataKey)
                      if (delIndex !== -1) {
                        currentItem.data.splice(delIndex, 1)
                      }
                    })
                  })
              }}>删除</el-link>
            </div>
            <render key={config.renderKey} conf={currentItem} on-selection-change={(val) => {
              this[`multipleSelection${config.renderKey}`] = val
            }}>
              <el-table-column
                type='selection'
                width='55'>
              </el-table-column>,
              <el-table-column type='index' width='50' label='序号'></el-table-column>,
              {child}
            </render>
          </el-row>
        </el-row>
      </el-col>
    )
  },
  businessTableItem(h, currentItem, index, list, parentList, parent) {
    const config = currentItem.__config__

    // console.log(currentItem, index, list, parentList, parent)
    return (
      h(config.tag, {
        props: {
          label: config.label,
          prop: config.field
        },
        scopedSlots: {
          default: props => {
            // console.log(this)
            if (config.type === 'input') {
              return h('el-form-item', {
                props: {
                  labelWidth: '12px',
                  label: config.required ? ' ' : '',
                  prop: `${props.row.dataKey}${config.field}`,
                  required: config.required
                }
              }, [
                h('el-input', {
                  attrs: {
                    placeholder: config.placeholder
                  },
                  on: {
                    input: val => {
                      this[this.formConf.formModel][`${props.row.dataKey}${config.field}`] = val
                      props.row[config.field] = val
                    }
                  },
                  props: {
                    value: props.row[config.field],
                    placeholder: config.placeholder
                  }
                })
              ])
            }
            return h('span', props.row[config.field])
          }
        }
      })
    )
  }

}

function renderFrom(h) {
  const { formConfCopy } = this

  return (
    <el-row gutter={formConfCopy.gutter}>
      <el-form
        size={formConfCopy.size}
        label-position={formConfCopy.labelPosition}
        disabled={formConfCopy.disabled}
        label-width={`${formConfCopy.labelWidth}px`}
        ref={formConfCopy.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this[formConfCopy.formModel] }}
        rules={this[formConfCopy.formRules]}
      >
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {formConfCopy.formBtns && formBtns.call(this, h)}
      </el-form>
    </el-row>
  )
}

function formBtns(h) {
  return <el-col>
    <el-form-item size={this.formConfCopy.size}>
      <el-button type='primary' onClick={this.submitForm}>提交</el-button>
      <el-button onClick={this.resetForm}>重置</el-button>
    </el-form-item>
  </el-col>
}

function renderFormItem(h, elementList, root) {
  return elementList.map((scheme, i) => {
    const config = scheme.__config__
    const layout = layouts[config.layout]

    if (layout) {
      return layout.call(this, h, scheme, i, root)
    }
    throw new Error(`没有与${config.layout}匹配的layout`)
  })
}

function renderChildren(h, currentItem, index, list, parentList, parent) {
  const config = currentItem.__config__
  if (!Array.isArray(config.children)) return null
  return config.children.map((el, i) => {
    const layout = layouts[el.__config__.layout]
    if (layout) {
      return layout.call(this, h, el, i, config.children, list, parentList, parent)
    }
    return layoutIsNotFound.call(this)
  })
}

function layoutIsNotFound() {
  throw new Error(`没有与${this.currentItem.__config__.layout}匹配的layout`)
}

function setValue(event, config, scheme) {
  this.$set(config, 'defaultValue', event)
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event)
}

function buildListeners(scheme) {
  const config = scheme.__config__
  const methods = this.formConf.__methods__ || {}
  const listeners = {}

  // 给__methods__中的方法绑定this和event
  Object.keys(methods).forEach(key => {
    listeners[key] = event => methods[key].call(this, event)
  })
  // 响应 render.js 中的 vModel $emit('input', val)
  listeners.input = event => setValue.call(this, event, config, scheme)

  return listeners
}
let self = null
export default {
  name: 'Parser',
  components: {
    render
  },
  props: {
    formConf: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const data = {
      formConfCopy: deepClone(this.formConf),
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {}
    }
    self = this
    if (this.formConf && this.formConf.fields) {
      this.formConf.fields.forEach(field => {
        if (field.__config__.layout === 'businessTable' && field.__config__.tableType === 'multipleTable') {
          data[`multipleSelection${field.__config__.renderKey}`] = []
        }
      })
    }
    this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel])
    this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules])
    // console.log(data[this.formConf.formRules])
    return data
  },
  watch: {
    formConf: {
      deep: true,
      handler: data => {
        // console.log(data, self)
        self.formConfCopy = deepClone(data)
        self.initFormData(self.formConfCopy.fields, self[self.formConf.formModel])
        self.buildRules(self.formConfCopy.fields, self[self.formConf.formRules])
        self.setForm()
      }
    },
    config: {
      deep: true,
      handler: config => {
        this.setForm()
      }
    }
  },
  created() {
    buildHooks(this)
    this.setForm()
  },
  mounted() {
    console.log(this.rules, this.formData)
  },
  methods: {
    // 设置表单状态
    setForm() {
      if (Object.keys(this.config).length === 0) return
      this.formConfCopy = { ...this.formConfCopy, ...this.config }
    },
    initFormData(componentList, formData) {
      componentList.forEach(cur => {
        const config = cur.__config__

        if (config.componentName === 'business-table') {
          cur.data.forEach(item => {
            config.children.forEach(column => {
              if (column.__config__.type !== 'default') {
                formData[item.dataKey + column.__config__.field] = item[column.__config__.field]
              }
            })
          })
          return
        }

        if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue
        if (config.children) this.initFormData(config.children, formData)
      })
    },
    buildRules(componentList, rules) {
      componentList.forEach(cur => {
        const config = cur.__config__
        // 业务组件

        if (config.componentName === 'business-table') {
          cur.data.forEach(item => {
            config.children.forEach(column => {
              if (column.__config__.required) {
                const required = { required: column.__config__.required, message: cur.placeholder, trigger: 'blur' }
                required.message === undefined && (required.message = `${column.__config__.label}不能为空`)
                rules[item.dataKey + column.__config__.field] = [required]
              }
            })
          })
          return
        }

        if (Array.isArray(config.regList)) {
          if (config.required) {
            const required = { required: config.required, message: cur.placeholder }
            if (Array.isArray(config.defaultValue)) {
              required.type = 'array'
              required.message = `请至少选择一个${config.label}`
            }
            required.message === undefined && (required.message = `${config.label}不能为空`)
            config.regList.push(required)
          }
          rules[cur.__vModel__] = config.regList.map(item => {
            // eslint-disable-next-line no-eval
            item.pattern && (item.pattern = eval(item.pattern))
            item.trigger = ruleTrigger && ruleTrigger[config.tag]
            return item
          })
        }
        if (config.children) this.buildRules(config.children, rules)
      })
    },
    resetForm() {
      this.formConfCopy = deepClone(this.formConf)
      this.$refs[this.formConf.formRef].resetFields()
    },
    // 钩子触发提交函数
    submitFormHook() {
      return new Promise((resolve, reject) => {
        this.$refs[this.formConf.formRef].validate(valid => {
          if (!valid) return reject(false)
          const formData = this.getFormData()
          resolve(formData)
          return true
        })
      })
    },
    // 普通提交
    submitForm() {
      this.$refs[this.formConf.formRef].validate(valid => {
        if (!valid) return
        const formData = this.getFormData()
        // 触发sumit事件
        this.$emit('submit', formData)
        return true
      })
    },
    getFormData() {
      // 处理数据
      const formData = deepClone(this[this.formConf.formModel])
      // 业务表格
      this.formConfCopy.fields.forEach(item => {
        if (item.__config__.layout === 'businessTable') {
          const key = item.__vModel__
          formData[key] = []
          item.data.forEach(v => {
            // eslint-disable-next-line no-unused-vars
            const { dataKey, ...reset } = v
            formData[key].push(reset)
            item.__config__.children.forEach(column => {
              delete formData[`${v.dataKey}${column.__config__.field}`]
            })
          })
        }
      })

      return formData
    }
  },
  render(h) {
    return renderFrom.call(this, h)
  }
}
</script>
