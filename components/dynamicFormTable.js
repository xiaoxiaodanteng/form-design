import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'DynamicFormTable',
  components: { render },
  mixins: [
    customScript,
    componentMixin
  ],
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
      currentRow: undefined
    }

    if (this.scheme.__config__.tableSelectType === 'multiple') data[`multipleSelection${this.scheme.__config__.renderKey}`] = []
    return data
  },
  inject: ['formData', 'parser'],
  created() {
  },
  mounted() {
  },
  methods: {

    addTableRow() {
      const row = {}
      this.scheme.__config__.children.forEach(child => {
        row[child.__config__.field] = child.__config__.defaultValue
      })
      this.scheme.data.push(row)
    },
    delRow() {
      const config = this.scheme.__config__
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
    }
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    const self = this
    if (!config.show) return null
    return h('el-col', {
      attrs: { span: config.span }
    }, [
      h('el-row', [
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
            console.log(child)
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
                  return childConfig.children && childConfig.children.length > 0 ? self.parser.renderTableChildren(h, child, $index, row, self.scheme) : h('span', {}, row[childConfig.field])
                },
                header: ({ column }) => h('span', {}, column.label)
              }
            }, []) : null
          })]
        ])
      ])
    ])
    // return (
    //   <el-col span={config.span}>
    //     <el-row class='row' >
    //       <render key={config.renderKey} conf={scheme} on-selection-change={(val) => {
    //         this[`multipleSelection${config.renderKey}`] = val
    //       }}
    //       on-current-change={val => {
    //         this.currentRow = val
    //       }}
    //       >
    //         {
    //           // 多选
    //           config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0 ? <el-table-column
    //             type='selection'
    //             align='center'
    //             width='55'>
    //           </el-table-column> : null
    //         },
    //         { // 显示序号
    //           config.showIndex ? <el-table-column type='index' align='center' width='50' label='序号'></el-table-column> : null
    //         }
    //         {this.scheme.__config__.children.map((child, index) => {
    //           const { __config__: childConfig, ...attrs } = child
    //           return childConfig.show ? <el-table-column column-key={`${index}`} label={childConfig.label} prop={childConfig.field} scopedSlots={{
    //             default({ row, $index }) {
    //               // scheme.data.forEach(item => console.log(item, row))
    //               return (
    //                 childConfig.children && childConfig.children.length > 0 ? self.parser.renderTableChildren(h, child, $index, row, self.scheme) : <span>{row[childConfig.field]}</span>
    //               )
    //             },
    //             header({ column }) {
    //               return <div>
    //                 <span>{column.label}</span>
    //               </div>
    //             }
    //           }} props={{ ...attrs }}>
    //           </el-table-column> : null
    //         })}
    //       </render>
    //     </el-row>
    //   </el-col>
    // )
  }
}
