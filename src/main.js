import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import './assets/css/app.css'
import './assets/css/normalize.css'

import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
Vue.config.productionTip = false

const i18n = new VueI18n({
  locale: 'kr',
  fallbackLocale: 'kr',
  messages: require('./locales/language.json')
})

new Vue({
  i18n,
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
