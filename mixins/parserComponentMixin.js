import elementDynamicTable from '../components/elementDynamicTable.vue'
import elementStaticTable from '../components/elementStaticTable.vue'
import elementLayoutTable from '../components/elementLayoutTable.vue'
import colFormItem from '../components/colFormItem'
import tipFormItem from '../components/tipFormItem'
import uploadTable from '../components/uploadTable'
import rowFormItem from '../components/rowFormItem'
import { deepClone, generateUUID } from '@/utils/formGenerator/index'

const componentList = {
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
  elementDynamicTable: (h, currentItem, index) => h('elementDynamicTable', { props: { scheme: currentItem, index }}),
  elementStaticTable: (h, currentItem, index) => h('elementStaticTable', { props: { scheme: currentItem, index }}),
  elementLayoutTable: (h, currentItem, index) => h('elementLayoutTable', { props: { scheme: currentItem, index }}),

  colFormItem(h, scheme) {
    // return <colFormItem scheme={scheme}/>
    return h('colFormItem', {
      props: {
        scheme
      }
    })
  },
  rowFormItem: (h, scheme) => h('rowFormItem', { props: { scheme }}),

  table(h, currentItem, index, list, parentList) {
    const config = currentItem.__config__
    // eslint-disable-next-line no-useless-call
    const child = this.renderChildren.apply(this, [...arguments, currentItem])
    return (
      <el-col span={config.span}>
        <el-row gutter={config.gutter} class='row'>
          <render key={config.renderKey} conf={currentItem} onInput={ event => {
            this.$set(config, 'defaultValue', event)
          }}>
            {this.componentList.tableColgroup.apply(this, arguments)}
            <tbody>{child}</tbody>
          </render>
        </el-row>
      </el-col>
    )
  },
  trItem(h, currentItem, index, list, parentList, parent) {
    const config = currentItem.__config__
    const child = this.renderChildren.apply(this, arguments)
    return (
      <tr label={config.label}>
        {child}
      </tr>
    )
  },

  tdItem(h, currentItem, index, list, parentList, root, tableRoot) {
    const config = currentItem.__config__
    const child = this.renderChildren.apply(this, arguments)
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
  tipFormItem: (h, currentItem, index, list) => <tipFormItem scheme={currentItem}/>,

  // 渲染业务表格
  businessTable(h, currentItem, index, list, parentList) {
    const config = currentItem.__config__
    // eslint-disable-next-line no-useless-call
    const child = this.renderChildren.apply(this, [...arguments, currentItem])
    const fieldType = {}
    config.children.forEach(child => {
      fieldType[child.__config__.field] = child.__config__.type
    })

    return (
      <el-col span={config.span}>
        <el-row gutter={config.gutter} class='row'>
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
                this[`multipleSelection${config.renderKey}`].length > 0 && this.$confirm('是否删除？')
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
                align='center'
                width='55'>
              </el-table-column>,
              <el-table-column type='index' align='center' width='50' label='序号'></el-table-column>,
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
                      this.parserFormData[`${props.row.dataKey}${config.field}`] = val
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
  },

  // 上传表格
  uploadTable: (h, currentItem, index, list, parentList) => <uploadTable scheme={currentItem}/>,
  uploadTableItem(h, currentItem, index, list, parentList, parent) {
    const config = currentItem.__config__
    const self = this
    return (
      <el-table-column column-key={`${index}`} label={config.label} prop={config.field} scopedSlots={{
        default({ row }) {
          return (
            config.field === 'fileDescription' ? <el-input value={row.fileDescription} placeholder='请输入内容' onInput={event => self.$set(row, config.field, event)}/> : <span>{row[config.field]}</span>
          )
        } }}>
      </el-table-column>
    )
  },

  // 自定义element-table
  dynamicFormTable(h, currentItem, index, list, parentList) {
    const { __config__, ...attrs } = currentItem
    const config = __config__
    // eslint-disable-next-line no-useless-call
    const child = this.renderChildren.apply(this, [...arguments, currentItem])
    return (
      <el-col span={config.span}>
        <el-row class='row'>
          <el-table props={attrs} data={this.parserFormData[config.__vModel__]}>
            {child}
          </el-table>
        </el-row>
      </el-col>
    )
  },

  dynamicFormTableItem(h, currentItem, index, list, parentList, parent) {
    const { __config__, ...others } = currentItem
    const config = __config__
    // const child = renderChildren.apply(this, [...arguments, currentItem])
    const self = this
    // const tempArguments = arguments
    return (
      <el-table-column props={others} column-key={`${index}`} label={config.label} prop={config.field} scopedSlots={{
        default({ row, $index }) {
          // eslint-disable-next-line no-useless-call
          return config.children && config.children.length > 0 ? self.renderTableChildren.apply(self, [h, currentItem, $index, row, parent]) : <span>{row[config.field]}</span>
        },
        header({ column }) {
          return <div>
            <span>{column.label}</span>
          </div>
        }
      }}>
      </el-table-column>
    )
  },
  table_colFormItem(h, scheme, column, columnIndex, row, parent) {
    const config = scheme.__config__
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    const props = {}
    if (this.parserFormData[parent.__vModel__] && this.parserFormData[parent.__vModel__].length > 0) {
      props.prop = `${parent.__vModel__}.${columnIndex}.${column.__config__.field}`
      props.rules = column.rules || {}
      props.label = config.showLabel ? config.label : ''
      props.labelWidth = labelWidth
    } else {
      return null
    }
    return (
      <el-col span={config.span}>
        <el-form-item
          props={props}

          data-prop={this.parserFormData[parent.__vModel__] && this.parserFormData[parent.__vModel__].length > 0 ? `${parent.__vModel__}.${columnIndex}.${column.__config__.field}` : null}
        >
          <render conf={{ ...scheme, __config__: { ...scheme.__config__, defaultValue: row[column.__config__.field] }}} onInput={event => {
            // row[column.__config__.field] = event
            this.$set(row, column.__config__.field, event)
            // console.log(this.parserFormData[parent.__vModel__] === parent.data, row)
            // parent.data.forEach(item => console.log(item === row))
          }}/>
        </el-form-item>
      </el-col>
    )
  }

}
export default {
  data() {
    return {
      componentList,
      layouts
    }
  },
  components: {
    elementDynamicTable,
    elementStaticTable,
    elementLayoutTable,
    colFormItem,
    tipFormItem,
    rowFormItem,
    uploadTable
  },
  methods: {
    renderFormItem(h, elementList, root) {
      return elementList.map((scheme, i) => {
        const config = scheme.__config__
        const layout = this.layouts[config.layout]

        if (layout) {
          return layout.call(this, h, scheme, i, root)
        }
        throw new Error(`没有与${config.layout}匹配的layout`)
      })
    },

    renderTableChildren(h, currentItem, columnIndex, data, parent) {
      const config = currentItem.__config__
      if (!Array.isArray(config.children)) return null
      return config.children.map((el, i) => {
        const layout = this.layouts['table_' + el.__config__.layout]
        if (layout) {
          return layout.call(this, h, el, currentItem, columnIndex, data, parent)
        }
        return this.layoutIsNotFound()
      })
    },

    renderChildren(h, currentItem, index, list, parentList, parent) {
      const config = currentItem.__config__
      if (!Array.isArray(config.children)) return null
      return config.children.map((el, i) => {
        const layout = this.layouts[el.__config__.layout]
        if (layout) {
          return layout.call(this, h, el, i, config.children, list, parentList, parent)
        }
        return this.layoutIsNotFound()
      })
    },
    renderFrom(h) {
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
            props={{ model: this.parserFormData }}
            rules={this.parserFormRules}
          >
            {this.renderFormItem(h, formConfCopy.fields)}
            {formConfCopy.formBtns && this.formBtns(h)}
          </el-form>
        </el-row>
      )
    },

    formBtns(h) {
      return <el-col>
        <el-form-item size={this.formConfCopy.size}>
          <el-button type='primary' onClick={this.submitForm}>提交</el-button>
          <el-button onClick={this.resetForm}>重置</el-button>
        </el-form-item>
      </el-col>
    },

    layoutIsNotFound() {
      throw new Error(`没有与${this.currentItem.__config__.layout}匹配的layout`)
    },

    setValue(event, config, scheme) {
      this.$set(config, 'defaultValue', event)
      if (this.parserFormData) this.$set(this.parserFormData, scheme.__vModel__, event)
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
      listeners.input = event => this.setValue(event, config, scheme)

      return listeners
    }
  }
}
