import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SaveManagementView from '../views/SaveManagementView.vue'
import CharacterCreationView from '../views/CharacterCreationView.vue'
import CharacterDetailView from '../views/CharacterDetailView.vue'
import AdventureView from '../views/AdventureView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '首页 - 角色列表'
    }
  },
  {
    path: '/save',
    name: 'SaveManagement',
    component: SaveManagementView,
    meta: {
      title: '数据导入导出'
    }
  },
  {
    path: '/create',
    name: 'CharacterCreation',
    component: CharacterCreationView,
    meta: {
      title: '创建新角色'
    }
  },
  {
    path: '/character/:id',
    name: 'CharacterDetail',
    component: CharacterDetailView,
    meta: {
      title: '角色详情'
    }
  },
  {
    path: '/adventure/:id',
    name: 'Adventure',
    component: AdventureView,
    meta: {
      title: '冒险之旅'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由导航守卫 - 设置页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - RPG游戏`
  }
  next()
})

export default router
