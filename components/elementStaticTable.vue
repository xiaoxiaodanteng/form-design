<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
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
        row[child.__config__.field] = {
          __config__: {
            formId: this.parser.getNewId(),
            defaultValue: '',
            type: 'text',
            children: []
          }
        }
      })
      this.scheme.data.push(row)
    }
  },
  render(h) {
    const scheme = this.scheme
    const config = this.scheme.__config__
    const self = this
    return (
      <el-col span={config.span}>
        <el-row class='row' >
          <render key={config.renderKey} props={{
            'headerCellStyle': {
              background: config.headerColor
            }
          }} conf={scheme} on-selection-change={(val) => {
            this[`multipleSelection${config.renderKey}`] = val
          }}
          on-current-change={val => {
            this.currentRow = val
          }}
          >
            {
              // 多选
              config.tableSelectType === 'multiple' && this.scheme.__config__.children.length > 0 ? <el-table-column
                type='selection'
                align='center'
                width='55'>
              </el-table-column> : null
            },
            { // 显示序号
              config.showIndex ? <el-table-column type='index' align='center' width='50' label='序号'></el-table-column> : null
            }
            {this.scheme.__config__.children.map((child, index) => {
              const { __config__: childConfig, ...attrs } = child
              return childConfig.show ? <el-table-column column-key={`${index}`} label={childConfig.label} prop={childConfig.field} scopedSlots={{
                default({ row, $index }) {
                  return (
                    childConfig.children && childConfig.children.length > 0 ? self.parser.renderTableChildren.apply(self, [h, child, $index, row, self.scheme]) : <span>{row[childConfig.field]}</span>
                  )
                }
              }} props={{ ...attrs }}>
              </el-table-column> : null
            })}
          </render>
        </el-row>
      </el-col>
    )
  }
}
</script>
