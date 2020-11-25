import elementDynamicTable from '../components/elementDynamicTable.vue'
import elementStaticTable from '../components/elementStaticTable.vue'
import elementLayoutTable from '../components/elementLayoutTable.vue'
import colFormItem from '../components/colFormItem'
import tipFormItem from '../components/tipFormItem'
import uploadTable from '../components/uploadTable'
import rowFormItem from '../components/rowFormItem'
import cardItem from '../components/cardItem'
import paddingItem from '../components/paddingItem'

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
    return h('colFormItem', {
      props: {
        scheme
      }
    })
  },
  rowFormItem: (h, scheme) => h('rowFormItem', { props: { scheme }}),
  cardItem: (h, scheme, index) => h('cardItem', { props: { scheme, index }}),
  paddingItem: (h, scheme, index) => h('paddingItem', { props: { scheme, index }}),

  tipFormItem: (h, currentItem, index, list) => <tipFormItem scheme={currentItem}/>,
  // 上传表格
  uploadTable: (h, currentItem, index, list, parentList) => <uploadTable scheme={currentItem}/>,

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
    uploadTable,
    cardItem,
    paddingItem
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
