<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'
import { parseTime } from '@/utils/index.js'

export default {
  name: 'uploadTable',
  components: { render },
  mixins: [customScript, componentMixin],
  props: {
    scheme: {
      type: Object,
      required: true
    }
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
    const props = {
      'show-file-list': false,
      'on-success': ({ data }) => {
        scheme.data.push({
          fileName: data.fileName,
          fileKey: data.fileKey,
          createDate: parseTime(new Date(data.createDate), '{y}-{m}-{d}')
        })
      }
    }

    return (
      <el-col span={config.span}>
        <el-row class='row'>
          <div class='actions mb5'>
            <el-upload
              class='upload-table'
              action={ process.env.NODE_ENV === 'development' ? 'http://bi.dev.nearbyexpress.com/api/dfilecenter/file/upload' : window.origin + '/api/dfilecenter/file/upload'}
              props={props}
              multiple>
              <el-link icon='el-icon-upload'>上传</el-link>
            </el-upload>
            <el-link icon='el-icon-remove-outline' type='danger' onClick={() => {
              this[`multipleSelection${config.renderKey}`].length > 0 && this.$confirm('是否删除？')
                .then(() => {
                  this[`multipleSelection${config.renderKey}`].forEach(item => {
                    const delIndex = scheme.data.find(v => v.dataKey === item.dataKey)
                    if (delIndex !== -1) {
                      scheme.data.splice(delIndex, 1)
                    }
                  })
                })
            }}>删除</el-link>
          </div>
          <render key={config.renderKey} conf={scheme} on-selection-change={(val) => {
            this[`multipleSelection${config.renderKey}`] = val
          }}>
            <el-table-column
              type='selection'
              align='center'
              width='55'>
            </el-table-column>,
            <el-table-column type='index' align='center' width='50' label='序号'></el-table-column>,
            {this.scheme.__config__.children.map((child, index) => {
              const childConfig = child.__config__
              return <el-table-column column-key={`${index}`} label={childConfig.label} prop={childConfig.field} scopedSlots={{
                default({ row }) {
                  return (
                    childConfig.field === 'fileDescription' ? <el-input value={row.fileDescription} placeholder='请输入内容' onInput={event => self.$set(row, childConfig.field, event)}/> : <span>{row[childConfig.field]}</span>
                  )
                } }}>
              </el-table-column>
            })}
          </render>
        </el-row>

      </el-col>
    )
  }
}
</script>
