import render from '../render/render.js'
import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
  name: 'ElementLayoutTable',
  components: { render },
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
        row[child.__config__.field] = {
          __config__: {
            formId: this.parser.getNewId(),
            required: true, // 是否显示必填
            defaultValue: '',
            type: 'text',
            isAddToForm: true,
            children: []
          }
        }
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
              const delIndex = this.scheme.data.find(v => v.dataKey === item.dataKey)
              if (delIndex !== -1) {
                this.scheme.data.splice(delIndex, 1)
              }
            })
          })
      } else {
        if (this.currentRow) {
          const delIndex = this.scheme.data.find(v => v === this.currentRow)
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
        show: true
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
        this.$set(item, `field${formId}`, {
          __config__: {
            formId: this.parser.getNewId(),
            required: true, // 是否显示必填
            defaultValue: '',
            type: 'text',
            isAddToForm: true,
            children: []
          }
        })
      })
    }
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    if (this.mode !== 'edit' && !config.show) return null
    return <el-col span={config.span}>
      <el-row class={this.mode === 'edit' ? 'row' : ''}>
        {this.mode === 'edit' ? <div class='actions mb5'>
          <el-link type='primary' icon='el-icon-circle-plus-outline' onClick={this.addTableRow}>新增</el-link>
          <el-link type='danger' icon='el-icon-circle-plus-outline' onClick={this.delRow}>删除</el-link>
          <el-link type='success' icon='el-icon-plus' onClick={this.handleAddField}>新增列</el-link>
        </div> : null}

        <render conf={scheme}
          oncurrent-change={val => {
            console.log(val)
            this.currentRow = val
          }}
          onheader-click={column => {
            this.parser.activeItem(this.scheme.__config__.children[column.columnKey])
            event.stopPropagation()
          }}
        >
          {config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0 && <el-table-column type='selection' align='center' width='55px'></el-table-column>}
          {config.showIndex && <el-table-column type='index' align='center' width='50px' label='序号'></el-table-column>}

          {this.scheme.__config__.children.map((child, index) => {
            const { __config__: childConfig, ...attrs } = child

            // 编辑模式
            if (this.mode === 'edit') {
              return <el-table-column
                class-name={childConfig ? 'hidden-item' : ''}
                {...attrs}
                columnKey={`${index}`}
                label={childConfig.label}
                prop={childConfig.field}
                scopedSlots={{
                  default: ({ row, $index }) => {
                    const className = this.parser.activeId === row[childConfig.field].__config__.formId
                      ? 'drawing-row-item active-form-item table-row-item'
                      : 'drawing-row-item table-row-item'
                    return <el-row
                      class={className}
                      gutter={childConfig.gutter}
                      tabindex='1'
                      nativeOnClick={event => {
                        this.parser.activeItem(row[childConfig.field])
                        event.stopPropagation()
                      }}
                      nativeOnKeydown={event => {
                        if (event.keyCode === 86 && (event.metaKey || event.ctrlKey)) {
                          try {
                            if (navigator.clipboard && navigator.clipboard.readText) {
                              navigator.clipboard.readText().then((text) => {
                                if (text) {
                                  row[childConfig.field].__config__.defaultValue = text
                                }
                              })
                            }
                          } catch (err) {
                            console.error('Failed to read clipboard contents: ', err)
                          }
                        }
                      }}>
                      {row[childConfig.field].__config__.children.length === 0 && <span class='showValue' class={row[childConfig.field].__config__.required && row[childConfig.field].__config__.defaultValue ? 'showValue required' : 'showValue'}>
                        { row[childConfig.field].__config__.defaultValue }
                      </span>}

                      {this.parser.renderChildren(h, row[childConfig.field].__config__.children)}
                    </el-row>
                  },
                  header: ({ column }) => {
                    // 渲染模式
                    if (this.mode !== 'edit') {
                      return childConfig.show && <span>{column.label}</span>
                    }
                    return <div class={childConfig.show ? 'drawing-row-item' : 'drawing-row-item is-hide'}>
                      <span>{column.label}</span>
                      <div class='draw-actions draw-el-table-header-actions'>
                        <span class='drawing-item-delete drawing-item-action' title='删除该字段' onClick={event => {
                          this.scheme.__config__.children.splice(index, 1); event.stopPropagation()
                        }}>
                          <i class='el-icon-delete'></i>
                        </span>
                      </div>
                    </div>
                  }
                }}
              >
              </el-table-column>
            }

            return childConfig.show && <el-table-column {...attrs} column-key={`${index}`} label={childConfig.label} prop={childConfig.field} scopedSlots={{
              default: ({ row, $index }) => {
                return row[childConfig.field].__config__.children.length > 0 ? this.parser.renderChildren(h, row[childConfig.field].__config__.children)
                  : <span class={row[childConfig.field].__config__.required && row[childConfig.field].__config__.defaultValue ? 'cell-value required' : 'cell-value'}>
                    { row[childConfig.field].__config__.defaultValue }
                  </span>
              },
              header: ({ column }) => {
                // 渲染模式
                return childConfig.show && <span>{column.label}</span>
              }
            }}>
            </el-table-column>
          })}

          { // 操作
            this.mode === 'edit' && <el-table-column align='center' label='操作' width='60px'
              scopedSlots={{
                default: ({ row, $index }) => {
                  return <div>
                    <el-link type='primary' style='font-size:18px;' icon='el-icon-circle-plus-outline' onClick={event => {
                      this.addTableRow(event, $index)
                    }}></el-link>
                    <el-link type='danger' style='font-size:18px;' icon='el-icon-remove-outline' onClick={event => {
                      this.delRow(event, $index)
                    }}></el-link>
                  </div>
                }
              }}
            >
            </el-table-column>
          }
        </render>
      </el-row>
      {this.parser.itemBtns(h, this.scheme, this.index, this.parentList)}
    </el-col>
  }
}
