import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'ElementStaticTable',
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
    addTableRow(event, index) {
      event.stopPropagation()

      const row = {}
      this.scheme.__config__.children.forEach(child => {
        row[child.__config__.field] = ''
      })
      if (index === 0 || index) {
        return this.scheme.data.splice(index + 1, 0, row)
      }
      this.scheme.data.push(row)
    },
    delRow(event, index) {
      event.stopPropagation()
      const config = this.scheme.__config__
      if (index === 0 || index) {
        return this.scheme.data.splice(index, 1)
      }
      if (config.tableSelectType === 'multiple') {
        this[`multipleSelection${config.renderKey}`].length > 0 && this.$confirm('是否删除？')
          .then(() => {
            this[`multipleSelection${config.renderKey}`].forEach(item => {
              const delIndex = this.scheme.data.findIndex(v => v === item)
              if (delIndex !== -1) {
                this.scheme.data.splice(delIndex, 1)
              }
            })
          })
      } else {
        if (this.currentRow) {
          const delIndex = this.scheme.data.findIndex(v => v === this.currentRow)
          if (delIndex !== -1) {
            this.scheme.data.splice(delIndex, 1)
          }
        }
      }
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

    return h('el-col', { attrs: { span: config.span }}, [
      h('el-row', { class: this.mode === 'edit' ? 'row' : '' }, [
        h('div', { class: 'actions mb5' }, [
          (config.showAction || this.mode === 'edit') && h('el-link', { attrs: { icon: 'el-icon-circle-plus-outline', type: 'primary' }, on: { click: this.addTableRow }}, '新增'),
          (config.showAction || this.mode === 'edit') && h('el-link', { attrs: { icon: 'el-icon-remove-outline', type: 'danger' }, on: { click: this.delRow }}, '删除'),
          this.mode === 'edit' && h('el-link', { attrs: { icon: 'el-icon-plus', type: 'success' }, on: { click: this.handleAddField }}, '新增列')
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
          // 操作
          config.showAction && h('el-table-column', { attrs: { align: 'center', label: '操作', width: '60px' }, scopedSlots: {
            default: ({ row, $index }) => {
              return h('div', [
                h('el-link', { attrs: { icon: 'el-icon-circle-plus-outline', type: 'primary' }, style: { fontSize: '18px' }, on: { click: event => this.addTableRow(event, $index) }}),
                h('el-link', { attrs: { icon: 'el-icon-remove-outline', type: 'danger' }, style: { fontSize: '18px' }, on: { click: event => this.delRow(event, $index) }})
              ])
            }
          }}),
          // 多选
          config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0 && h('el-table-column', { attrs: { type: 'selection', align: 'center', width: '55px' }}),
          // 显示序号
          config.showIndex && h('el-table-column', { attrs: { type: 'index', align: 'center', width: '50px', label: '序号' }}),

          // 列表
          this.scheme.__config__.children.map((child, index) => {
            const { __config__: childConfig, ...attrs } = child
            return h('el-table-column', { attrs: { ...attrs, className: !childConfig.show ? 'hidden-item' : '', columnKey: `${index}`, label: childConfig.label, prop: childConfig.field }, scopedSlots: {
              default: (rowParams) => {
                const { row, $index, column } = rowParams
                const id = `${$index}${column.columnKey}`
                const className = 'drawing-row-item table-row-item'

                if (this.mode === 'edit') {
                  return h('el-row', { class: className, attrs: { tabindex: '1' }, nativeOn: {
                    click: event => {
                      event.stopPropagation()
                      this.$refs[id].handleFocus()
                    },
                    keyup: event => {
                      // esc
                      if (event.keyCode === 27) {
                        event.preventDefault()
                        this.$refs[id].handleBlur()
                      }
                    },
                    keydown: event => {
                      if (event.keyCode === 86 && (event.metaKey || event.ctrlKey)) {
                        try {
                          if (navigator.clipboard && navigator.clipboard.readText) {
                            navigator.clipboard.readText().then((text) => {
                              if (text) {
                                row[childConfig.field] = text
                              }
                            })
                          }
                        } catch (err) {
                          console.error('Failed to read clipboard contents: ', err)
                        }
                      }
                    }
                  }}, [
                    childConfig.children.length === 0 && h('TableInput', { ref: id, props: { value: row[childConfig.field] }, on: { input: event => { row[childConfig.field] = event } }}),

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
        ])
      ]),

      this.parser.itemBtns(h, this.scheme, this.index, this.parentList)
    ])
  }
}
