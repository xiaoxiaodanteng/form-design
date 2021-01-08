import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'ElementDynamicTable',
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    parentList: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    const data = {
      currentRow: undefined,
      visibleAddFieldDialog: false
    }

    return data
  },
  inject: ['formData', 'parser', 'mode'],
  created() {
  },
  mounted() {
  },
  methods: {
    setInputValue(value, field) {
      this.filedForm[field] = value
    },
    handleAddField(event) {
      event.stopPropagation()
      this.scheme.__config__.children.push()
      const formId = this.parser.getNewId()
      const config = {
        tag: 'el-table-column',
        field: `field${formId}`,
        label: `field${formId}`,
        defaultValue: '',
        formId,
        children: [],
        show: true,
        showContent: true, // 是否显示内容
        showFormItem: true, // 是否显示
        disabled: false, // 是否禁用
        required: false // 表单是否必填
      }
      this.scheme.__config__.children.push({
        __config__: config,
        minWidth: 'auto',
        width: 'auto',
        showOverflowTooltip: false,
        headerAlign: 'left',
        align: 'left',
        fixed: false,
        resizable: true
      })
      this.scheme.data.forEach(item => {
        this.$set(item, `field${formId}`, '')
      })
    }
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    const self = this
    if (this.mode !== 'edit' && !config.show) return null

    const indexFnCodeStr = this.scheme['fn_index-method']
    const indexAttr = {}
    if (indexFnCodeStr) {
      let fn
      try {
        // eslint-disable-next-line no-eval
        eval(`fn = ${indexFnCodeStr}`)
        indexAttr.index = fn
      } catch (e) {
        console.error(e)
        this.$message.error('序号自定义函数配置错误')
      }
    }

    return h('el-col', { attrs: { span: config.span }}, [
      h('el-row', { class: this.mode === 'edit' ? 'row' : '' }, [
        this.mode === 'edit' && h('div', { class: 'actions mb5' }, h('el-link', { attrs: { type: 'success', icon: 'el-icon-plus' }, on: { click: this.handleAddField }}, '新增列'))
      ]),

      h('render', { props: { conf: scheme }, on: {
        oncurrentChange: val => {
          this.currentRow = val
        },
        onselectionChange: (val) => {
          this[`multipleSelection${config.renderKey}`] = val
        },
        onheaderClick: column => {
          this.parser.activeItem(this.scheme.__config__.children[column.columnKey])
        }
      }}, [
        // 多选
        config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0 && h('el-table-column', { attrs: { type: 'selection', align: 'center', width: '55px' }}),
        // 显示序号
        config.showIndex && h('el-table-column', { attrs: { type: 'index', align: 'center', width: '50px', label: '序号' }}),
        // 列表
        this.scheme.__config__.children.map((child, index) => {
          const { __config__: childConfig, ...attrs } = child
          return h('el-table-column', { attrs: { ...attrs, className: !childConfig.show ? 'hidden-item' : '', columnKey: `${index}`, label: childConfig.label, prop: childConfig.field }, scopedSlots: {
            default: (rowParams) => {
              const { row, $index } = rowParams
              // console.log(rowParams)
              const className = 'drawing-row-item table-row-item'

              if (this.mode === 'edit') {
                return h('el-row', { class: className, attrs: { tabindex: '1' }}, [
                  childConfig.children.length === 0 && h('span', { class: 'showValue' }, row[childConfig.field]),
                  this.parser.renderTableChildren(h, childConfig.children, child, $index, row, rowParams, self.scheme)
                ])
              }
              return childConfig.children.length > 0 ? this.parser.renderTableChildren(h, childConfig.children, child, $index, row, rowParams, self.scheme)
                : h('span', row[childConfig.field])
            },
            header: ({ column }) => {
              // 渲染模式
              if (this.mode !== 'edit') {
                return childConfig.show && h('span', column.label)
              }
              return h('div', { class: childConfig.show ? 'drawing-row-item' : 'drawing-row-item is-hide' }, [
                h('span', column.label),
                h('div', { class: 'draw-actions draw-el-table-header-actions' }, [
                  h('span', { class: 'drawing-item-delete drawing-item-action', attrs: { title: '删除该字段' }, on: { click: event => {
                    event.stopPropagation()
                    this.scheme.__config__.children.splice(index, 1)
                  } }}, [h('i', { class: 'el-icon-delete' })])
                ])
              ])
            }
          }})
        })
      ]),

      this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
    ])
  }
}
