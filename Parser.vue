<template>
  <parser-com
    v-if="isShowParser"
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
    }
  },
  computed: {
    isShowParser() {
      return Object.keys(this.formConf).length > 0
    }
  },
  methods: {
    onSubmit(data) {
      this.$emit('submit', data)
    }
  }
}
</script>
