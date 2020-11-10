

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

<parser :form-conf="formJson" @submit="sumbitForm" />
```

# 示例