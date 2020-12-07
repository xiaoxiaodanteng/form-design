<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'ElementStaticTable',
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
    }
  },
  data() {
    const data = {
      currentRow: undefined,
      visibleAddFieldDialog: false
    }

    return data
  },
  inject: ['formData', 'parser'],
  created() {
  },
  mounted() {
  },
  methods: {

    setInputValue(value, field) {
      this.filedForm[field] = value
    },
    addTableRow() {
      const row = {}
      this.scheme.__config__.children.forEach(child => {
        row[child.__config__.field] = child.__config__.defaultValue || ''
      })
      this.scheme.data.push(row)
    },
    delRow() {
      const config = this.scheme.__config__
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
    }
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    const self = this
    if (!config.show) return null
    return h('el-col', {
      attrs: { span: config.span }
    }, [h('el-row', [
      h('div', { class: 'actions mb5' }, [
        config.showAction && h('el-link', { attrs: { icon: 'el-icon-circle-plus-outline', type: 'primary' }, on: { click: event => {
          this.addTableRow()
          event.stopPropagation()
        } }}, '新增'),
        config.showAction && h('el-link', { attrs: { icon: 'el-icon-circle-plus-outline', type: 'danger' }, on: { click: event => {
          this.delRow()
          event.stopPropagation()
        } }}, '删除')
      ]),
      h('render', {
        props: {
          conf: scheme
        },
        on: {
          selectionChange: (val) => {
            this[`multipleSelection${config.renderKey}`] = val
          },
          currentChange: (val) => {
            this.currentRow = val
          }
        }
      }, [
        // 多选
        config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0
          ? h('el-table-column', {
            attrs: {
              type: 'selection',
              align: 'center',
              width: '55px'
            }
          }) : null,
        // 显示序号

        config.showIndex ? h('el-table-column', {
          attrs: {
            type: 'index',
            align: 'center',
            width: '50px',
            label: '序号'
          }
        }) : null,

        // 列
        [...this.scheme.__config__.children.map((child, index) => {
          const { __config__: childConfig, ...attrs } = child
          return childConfig.show ? h('el-table-column', {
            props: {
              ...attrs,
              columnKey: `${index}`,
              label: childConfig.label,
              prop: childConfig.field
            },
            scopedSlots: {
              default: ({ row, $index }) => {
                // 显示内容不显示表单元素
                if (childConfig.showContent && !childConfig.showFormItem) return h('span', {}, row[childConfig.field])
                // 不显示内容也不显示表单元素
                if (!childConfig.showContent && !childConfig.showFormItem) return null
                // 显示表单元素不显示内容
                if (!childConfig.showContent && childConfig.showFormItem) return childConfig.children && childConfig.children.length > 0 ? self.parser.renderTableChildren(h, child, $index, row, self.scheme) : h('span', {}, row[childConfig.field])

                // 默认
                return childConfig.children && childConfig.children.length > 0 ? self.parser.renderTableChildren(h, child, $index, row, self.scheme) : h('span', {}, row[childConfig.field])
              },
              header: ({ column }) => h('span', {}, column.label)
            }
          }, []) : null
        })]
      ])
    ])
    ])
  }
}
</script>
