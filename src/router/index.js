import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/userManage/index'),
        meta: { title: '用户管理', icon: 'customer' }
      }
    ]
  },

  {
    path: '/systemManage',
    component: Layout,
    children: [{
      path: '/userManage/list',
      name: 'systemManage',
      component: () => import('@/views/systemManage/index'),
      meta: { title: '系统配置', icon: 'config' }
    }]
  },

  {
    path: '/versionManage',
    component: Layout,
    children: [{
      path: '/versionManage/list',
      name: 'versionManage',
      component: () => import('@/views/versionManage/index'),
      meta: { title: '版本管理', icon: 'version' }
    }]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
