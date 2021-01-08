<template>
  <parser-view
    v-if="isShowParser"
    v-model="formDataModel"
    v-bind="$attrs"
    :form-conf="formConf"
    :config="config"
    @submit="onSubmit"
    @active-item="onActiveItem"
  />
</template>

<script>
import ParserView from './parserView'
export default {
  name: 'Parser',
  components: { ParserView },
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
      return this.formConf && Object.keys(this.formConf).length > 0
    },
    formDataModel: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  created() {
  },
  methods: {
    onSubmit(data) {
      this.$emit('submit', data)
    },
    onActiveItem(item) {
      this.$emit('active-item', item)
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '@/styles/formGenerator/index.scss';
</style>
