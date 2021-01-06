import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'ElementDynamicTable',
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

    return <el-col span={config.span}>
      <el-row class={this.mode === 'edit' ? 'row' : ''}>
        {this.mode === 'edit' && <div class='actions mb5'>
          <el-link type='success' icon='el-icon-plus' onClick={this.handleAddField}>新增列</el-link>
        </div>}

        <render conf={scheme}
          oncurrent-change={val => {
            this.currentRow = val
          }}
          onselection-change={(val) => {
            this[`multipleSelection${config.renderKey}`] = val
          }}
          onheader-click={column => {
            this.parser.activeItem(this.scheme.__config__.children[column.columnKey])
            event.stopPropagation()
          }}
        >
          { // 多选
            config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0 && <el-table-column type='selection' align='center' width='55px'></el-table-column>
          }

          { // 显示序号
            config.showIndex && <el-table-column type='index' align='center' width='50px' label='序号'></el-table-column>
          }

          {// 列表
            this.scheme.__config__.children.map((child, index) => {
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
                    default: (rowParams) => {
                      const { row, $index } = rowParams
                      // console.log(rowParams)
                      const className = 'drawing-row-item table-row-item'
                      return <el-row
                        class={className}
                        gutter={childConfig.gutter}
                        tabindex='1'
                      >
                        {childConfig.children.length === 0 && <span class='showValue'>
                          { row[childConfig.field] }
                        </span>}

                        {this.parser.renderTableChildren(h, childConfig.children, child, $index, row, rowParams, self.scheme)}
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

              return <el-table-column {...attrs} column-key={`${index}`} label={childConfig.label} prop={childConfig.field} scopedSlots={{
                default: (rowParams) => {
                  const { row, $index } = rowParams
                  // console.log(childConfig, row, row[childConfig.field])
                  return childConfig.children.length > 0 ? this.parser.renderTableChildren(h, childConfig.children, child, $index, row, rowParams, self.scheme)
                    : <span>
                      { row[childConfig.field] }
                    </span>
                },
                header: ({ column }) => {
                // 渲染模式
                  return childConfig.show && <span>{column.label}</span>
                }
              }}>
              </el-table-column>
            })}
        </render>
      </el-row>
    </el-col>
  }
}
