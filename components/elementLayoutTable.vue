<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

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
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    const self = this
    if (!config.show) return null
    return h('el-col', {
      attrs: { span: config.span }
    }, [h('el-row', [
      h('render', {
        props: {
          conf: scheme
        },
        on: {
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
                return row[childConfig.field].__config__.children.length > 0 ? self.parser.renderChildren(h, row[childConfig.field], index) : h('span', { class: {
                  'cell-value': true,
                  required: row[childConfig.field].__config__.required && row[childConfig.field].__config__.defaultValue
                }}, row[childConfig.field].__config__.defaultValue)
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
