const componentFiles = require.context('../components', true, /\.js$/)
// const components = {}
// componentFiles.keys().forEach((filePath, index) => {
//   // const componentName = filePath.replace(/^\.\/(.*)\.\w+$/, '$1')
//   const component = componentFiles(filePath).default
//   components[component.name.replace(component.name[0], component.name[0].toLowerCase())] = component
// })
// console.log(components)
export default {
  created() {
    this.$options.components
    componentFiles.keys().forEach((filePath, index) => {
      // const componentName = filePath.replace(/^\.\/(.*)\.\w+$/, '$1')
      const component = componentFiles(filePath).default
      // components[component.name.replace(component.name[0], component.name[0].toLowerCase())] = component
      this.$options.components[component.name.replace(component.name[0], component.name[0].toLowerCase())] = component
    })
  }
}
