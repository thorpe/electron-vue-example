import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Settings from './views/Settings.vue'
import Update from './views/Update.vue'
import Guide01 from './views/Guide01'
import Guide02 from './views/Guide02'
import Guide03 from './views/Guide03'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/update',
      name: 'update',
      component: Update
    },
    {
      path: '/guide01',
      name: 'guide01',
      component: Guide01
    },
    {
      path: '/guide02',
      name: 'guide02',
      component: Guide02
    },
    {
      path: '/guide03',
      name: 'guide03',
      component: Guide03
    }
  ]
})
