import { deepClone } from '@/utils/formGenerator/index'

const componentChild = {}
/**
 * 将./slots中的文件挂载到对象componentChild上
 * 文件名为key，对应JSON配置中的__config__.tag
 * 文件内容为value，解析JSON配置中的__slot__
 */
const slotsFiles = require.context('./slots', false, /\.js$/)
const keys = slotsFiles.keys() || []
keys.forEach(key => {
  const tag = key.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = slotsFiles(key).default
  componentChild[tag] = value
})

function vModel(dataObject, defaultValue, confClone) {
  dataObject.props.value = defaultValue

  dataObject.on.input = val => {
    this.$emit('input', val)
  }
}

function mountSlotFiles(h, confClone, children) {
  const childObjs = componentChild[confClone.__config__.tag]
  if (childObjs) {
    Object.keys(childObjs).forEach(key => {
      const childFunc = childObjs[key]
      if (confClone.__slot__ && confClone.__slot__[key]) {
        children.push(childFunc(h, confClone, key))
      }
    })
  }

  for (const [key, slot] of Object.entries(this.$slots)) {
    if (key === 'default') {
      children.push(slot)
    } else {
      children.push(<template slot={key}>{slot}</template>)
    }
  }
}

function emitEvents(confClone) {
  ['on', 'nativeOn'].forEach(attr => {
    const eventKeyList = Object.keys(confClone[attr] || {})
    eventKeyList.forEach(key => {
      const val = confClone[attr][key]
      if (typeof val === 'string') {
        confClone[attr][key] = event => {
          this.$emit(val, event)
        }
      }
    })
  })
}

const units = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
}

function buildDataObject(confClone, dataObject) {
  Object.keys(confClone).forEach(key => {
    const val = confClone[key]
    if (key === 'data') {
      dataObject.attrs[key] = this.conf[key] // 保持指向
    } else if (['domProps', 'scopedSlots', 'attrs', 'props', 'style'].includes(key)) {
      dataObject[key] = val
    } else if (key === '__vModel__') {
      // vModel.call(this, dataObject, this.formData[key])
      vModel.call(this, dataObject, confClone.__config__.defaultValue, confClone)
    } else if (dataObject[key] !== undefined) {
      if (dataObject[key] === null ||
        dataObject[key] instanceof RegExp ||
        ['boolean', 'string', 'number', 'function'].includes(typeof dataObject[key])) {
        // console.log(key)
        dataObject[key] = val
      } else if (Array.isArray(dataObject[key])) {
        dataObject[key] = [...dataObject[key], ...val]
      } else {
        dataObject[key] = { ...dataObject[key], ...val }
      }
    } else {
      dataObject.attrs[key] = val
      if (key === 'action') {
        dataObject.attrs[key] = `${this.$hostname}/api/dfilecenter/file/upload`
      }
    }
  })

  // 处理事件
  for (const [eventKey, event] of Object.entries(this.$listeners)) {
    dataObject.on[eventKey] = event
  }

  // el-upload
  if (confClone.__config__.tag === 'el-upload') {
    const config = confClone.__config__
    const self = this
    dataObject.attrs['on-success'] = (response, file, fileList) => {
      const values = fileList.map(item => {
        const { response, ...temp } = item

        // eslint-disable-next-line no-unused-vars
        const { raw, ...temp2 } = temp
        return {
          response: {
            data: response.data
          },
          ...response.data,
          ...temp2,
          url: `${this.$hostname}/api/dfilecenter/file/download/${response.data.fileKey}`
        }
      })
      self.$emit('input', values)
      this.conf['file-list'] = values
    }
    dataObject.attrs['on-remove'] = (file, fileList) => {
      const values = fileList.map(item => item.response.data)
      self.$emit('input', values)
      this.conf['file-list'] = fileList.map(item => ({ name: item.name, response: item.response }))
    }
    dataObject.attrs['before-upload'] = (file) => {
      if (config.fileSize) {
        const unitNum = units[config.sizeUnit]
        const isRightSize = file.size / unitNum < config.fileSize
        if (!isRightSize) {
          this.$message.error(`文件大小超过 ${config.fileSize}${config.sizeUnit}`)
          return isRightSize
        }
      }
      if (confClone.accept) {
        const isAccept = new RegExp(confClone.accept).test(file.type)
        if (!isAccept) {
          this.$message.error(`应该选择${confClone.accept}类型的文件`)
          return isAccept
        }
      }
    }
    dataObject.attrs['on-exceed'] = (file) => {
      this.$message.info('已超出上传文件限制')
    }
    dataObject.attrs['on-preview'] = (file) => {
      var a = document.createElement('a')
      var event = new MouseEvent('click')
      a.download = file.name
      a.href = file.url
      a.target = '_blank'
      a.dispatchEvent(event)
    }
  }

  // console.log(dataObject)

  // 清理属性
  clearAttrs(dataObject)
}

function clearAttrs(dataObject) {
  delete dataObject.attrs.__config__
  delete dataObject.attrs.__slot__
  delete dataObject.attrs.__method__
  delete dataObject.attrs.__customDisabled__
  delete dataObject.attrs.__hook__
  delete dataObject.attrs.__created__
  delete dataObject.attrs.__watch__
  delete dataObject.attrs.__mounted__
  delete dataObject.attrs['fn_summary-method']
  delete dataObject.attrs['fn_span-method']
  delete dataObject.attrs['fn_index-method']
}

function makeDataObject() {
  // 深入数据对象：
  // https://cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1
  return {
    class: {},
    attrs: {},
    props: {},
    domProps: {},
    nativeOn: {},
    on: {},
    style: {},
    directives: [],
    scopedSlots: {},
    slot: null,
    key: null,
    ref: null,
    refInFor: true
  }
}

export default {
  props: {
    conf: {
      type: Object,
      required: true
    }
  },
  methods: {
    onSuccess(data) {
    }
  },
  created() {
  },
  render(h) {
    const dataObject = makeDataObject()
    const confClone = deepClone(this.conf)
    const children = []
    // const children = this.$slots.default || []
    // 如果slots文件夹存在与当前tag同名的文件，则执行文件中的代码
    mountSlotFiles.call(this, h, confClone, children)

    // 将字符串类型的事件，发送为消息
    emitEvents.call(this, confClone)
    // 将json表单配置转化为vue render可以识别的 “数据对象（dataObject）”
    buildDataObject.call(this, confClone, dataObject)

    // if (confClone.__config__.tag === 'el-dialog') {
    //   console.log(dataObject)
    // }

    return h(this.conf.__config__.tag, dataObject, children)
  }
}
