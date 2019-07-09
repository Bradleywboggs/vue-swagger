import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import store from './store'
import './styles/app.scss'
import JsonViewer from 'vue-json-viewer'


Vue.config.productionTip = false
Vue.use(JsonViewer)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
