

## 发布

```bash
# 安装
npm i form-fe-parser

# 使用
import Parser from 'form-fe-parser'
Vue.use(Parser, {
  hostname: '' // graphql api url
})
# 示例

<script>
import { emit, setAuthToken } from 'form-fe-parser'

// 在能拿到用户token时调用 setAuthToken(token)

export default {
  data() {
    return { 
      formJson: {},
      formData: {},
      config: {
        disabled: false,
        formBtns: true,
        formModel: "formData",
        formRef: "elForm",
        formRules: "rules",
        gutter: 15,
        labelPosition: "right",
        labelWidth: 100,
        size: "medium",
        span: 24
      }
    }
  },
  methods: {
    handleSubmit() {
      emit('submit')
        .then(result => {})
        .error(err => {})
    },
    sumbitForm(formData) {
      console.log(formData)
    }
  }
}
</script>

<template>
  <parser 
    v-model="formData"
    :form-conf="formJson"
    :config="config"
    :globalVar="{ status: 3 }"
    @submit="sumbitForm"
  />
</template>

```

# 示例