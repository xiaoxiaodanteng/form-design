

## 发布

```bash
# 安装
npm i form-fe-parser

# 使用
import Parser from 'form-fe-parser'
Vue.use(Parser)
# 示例

import { emit } from 'form-fe-parser'
emit('submit')
  .then(result => {})
  .error(err => {})
  
config = {
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

<parser :form-conf="formJson" :config="config" @submit="sumbitForm" />
```

# 示例