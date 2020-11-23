<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '@/components/FormGenerator/parser/mixins/customScript'
import componentMixin from '@/components/FormGenerator/parser/mixins/componentMixin'

export default {
  name: 'elementLayoutTable',
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
    return (
      <el-col span={config.span}>
        <el-row class='row' >
          <render key={config.renderKey} props={{
            'headerCellStyle': {
              background: config.headerColor
            }
          }} conf={scheme}
          on-current-change={val => {
            this.currentRow = val
          }}
          >
            {this.scheme.__config__.children.map((child, index) => {
              const { __config__: childConfig, ...attrs } = child
              return childConfig.show ? <el-table-column column-key={`${index}`} label={childConfig.label} prop={childConfig.field} scopedSlots={{
                default({ row, $index }) {
                  return (
                    <el-row>
                      {row[childConfig.field].__config__.children.length === 0 ? <div class='showValue'>{row[childConfig.field].__config__.defaultValue}</div> : self.parser.renderChildren(h, row[childConfig.field], index)}
                    </el-row>
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
