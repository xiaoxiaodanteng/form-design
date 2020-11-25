<template>
  <parser-com
    v-if="isShowParser"
    v-model="formDataModel"
    v-bind="attrs"
    :form-conf="formConf"
    :config="config"
    @submit="onSubmit"
  />
</template>

<script>
import ParserCom from './ParserComponent'
export default {
  name: 'Parser',
  components: { ParserCom },
  props: {
    formConf: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isShowParser() {
      return Object.keys(this.formConf).length > 0
    },
    formDataModel: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    attrs() {
      return {
        ...this.$attrs,
        globalVal: this.$attrs.globalVal || {}
      }
    }
  },
  created() {
  },
  methods: {
    onSubmit(data) {
      this.$emit('submit', data)
    }
  }
}
</script>
