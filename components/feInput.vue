<template>
  <div class="fe-input" @click="handleClick">
    <p v-show="!showInput" :style="{minHeight, 'justify-content': align}" class="fe-input-value">
      <span :style="prependStyle">{{ prepend }}</span>
      <pre>{{ inputValue }}</pre>
      <span :style="appendStyle">{{ append }}</span>
    </p>
    <el-form-item v-bind="attrs" label-width="0">
      <el-input
        v-if="showInput && !$scopedSlots.default"
        ref="input"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
      >
        <template v-if="prepend" slot="prepend">{{ prepend }}</template>
        <template v-if="append" slot="append">{{ append }}</template>
      </el-input>
      <template v-if="showInput && $scopedSlots.default">
        <slot />
      </template>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'FeInput',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    form: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    prepend: {
      type: String,
      default: ''
    },
    append: {
      type: String,
      default: ''
    },
    prependStyle: {
      type: Object,
      default: () => ({})
    },
    appendStyle: {
      type: Object,
      default: () => ({})
    },
    minHeight: {
      type: String,
      default: '40px'
    },
    align: {
      type: String,
      default: 'left'
    }
  },
  data() {
    return {
      showInput: false
    }
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    attrs() {
      // eslint-disable-next-line no-unused-vars
      const { value, ...attrs } = this.$attrs
      return attrs
    }
  },
  mounted() {
    // 初始化事件
    document.addEventListener('click', this.init)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.init)
  },

  methods: {
    handleClick() {
      if (this.disabled) return
      this.showInput = true
      this.$nextTick(() => {
        this.$refs.input && this.$refs.input.focus()
      })
    },
    init(e) {
      if (!this.$el.contains(e.target) && e.target !== document.querySelector('body')) {
        this.showInput = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fe-input{
  width: 100%;
  height: 100%;
  position: relative;

  .fe-input-value{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 20px;
  }
  pre {
    font-family: PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif, Helvetica Neue, Helvetica;
    font-size: 12px;
    white-space: pre-wrap!important;
    word-wrap: break-word!important;
    width: 100%;
    line-height: 20px;
  }
}
</style>
