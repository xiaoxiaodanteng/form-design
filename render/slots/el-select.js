export default {
  options(h, conf, key) {
    const list = []
    conf.__slot__.options.forEach(item => {
      list.push(<el-option label={item[conf.props.props.label]} value={item[conf.props.props.value]} disabled={item.disabled}></el-option>)
    })
    return list
  }
}
