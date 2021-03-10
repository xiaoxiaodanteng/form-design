<template>
  <div class="fe-input" @click="handleClick">
    <p v-show="!showInput" class="fe-input-value">{{ inputValue }}</p>
    <el-form-item v-bind="attrs" label-width="0">
      <el-input
        v-if="showInput"
        ref="input"
        v-model="inputValue"
        v-bind="attrs"
        v-on="$listeners"
      />
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
        this.$refs.input.focus()
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
    min-height: 40px;
    align-items: center;
  }
}
</style>
