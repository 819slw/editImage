import editImage from './editImage.vue'

editImage.install = function (Vue) {
  Vue.component('editImage', editImage)
  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(editImage)
  }
}

export default editImage