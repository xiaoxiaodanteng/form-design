<script>
import render from '@/components/FormGenerator/render/render.js'
import customScript from '../mixins/customScript'
import componentMixin from '../mixins/componentMixin'

export default {
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
    // const config = this.scheme.__config__
    let child = this.parser.renderChildren(h, scheme)
    if (scheme.type === 'flex') {
      child = <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
        {child}
      </el-row>
    }
    return (
      <el-col span={scheme.span}>
        <el-row gutter={scheme.gutter} class='row'>
          {child}
        </el-row>
      </el-col>
    )
  }
}
</script>
