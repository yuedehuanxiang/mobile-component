import Vue from 'vue'
import Router from 'vue-router'
import { componentPages, defaultPagePath } from '../pages'

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: defaultPagePath
  },
  ...componentPages.map(page => ({
    path: page.path,
    name: page.name,
    component: page.component,
    meta: {
      label: page.label,
      description: page.description
    }
  })),
  {
    path: '*',
    redirect: defaultPagePath
  }
]

export default new Router({
  mode: 'hash',
  routes
})
