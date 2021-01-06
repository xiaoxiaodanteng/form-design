import render from '../render/render.js'
import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'
import { parseTime } from '../utils/index.js'

export default {
  name: 'UploadTable',
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
    return h('el-col', {
      attrs: {
        span: config.span
      }
    }, [
      h('el-row', [
        h('div', {
          attrs: {
            class: 'actions mb5'
          }
        }, [
          h('el-upload', {
            attrs: {
              multiple: true,
              class: 'upload-table',
              // action: process.env.NODE_ENV === 'development' ? 'http://bi.dev.nearbyexpress.com/api/dfilecenter/file/upload' : window.origin + '/api/dfilecenter/file/upload'
              action: 'http://bi.dev.nearbyexpress.com/api/dfilecenter/file/upload'
            },
            props: props
          }, [
            h('el-link', { attrs: { icon: 'el-icon-upload' }}, '上传')

          ]),
          h('el-link', { attrs: { icon: 'el-icon-remove-outline', type: 'danger' }, on: {
            click: () => {
              this[`multipleSelection${config.renderKey}`].length > 0 && this.$confirm('是否删除？')
                .then(() => {
                  this[`multipleSelection${config.renderKey}`].forEach(item => {
                    const delIndex = scheme.data.find(v => v.dataKey === item.dataKey)
                    if (delIndex !== -1) {
                      scheme.data.splice(delIndex, 1)
                    }
                  })
                })
            }
          }}, '删除')
        ]),

        h('render', {
          props: {
            key: config.renderKey,
            conf: scheme
          },
          on: {
            selectionChange: (val) => {
              this[`multipleSelection${config.renderKey}`] = val
            }
          }
        }, [
          h('el-table-column', { attrs: { type: 'selection', align: 'center', width: '55px' }}),
          h('el-table-column', { attrs: { type: 'index', align: 'center', width: '50px', label: '序号' }}),

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
                  return childConfig.field === 'fileDescription' ? h('el-input', {
                    attrs: { placeholder: '请输入内容' },
                    props: {
                      value: row[childConfig.field]
                    },
                    on: {
                      input: event => self.$set(row, childConfig.field, event)
                    }
                  }) : <span>{row[childConfig.field]}</span>
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

