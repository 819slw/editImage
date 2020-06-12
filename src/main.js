import Vue from 'vue'
import App from './App.vue'
import editImage from './lib/index.js'

Vue.use(editImage)
new Vue({
  el: '#app',
  render: h => h(App)
})
