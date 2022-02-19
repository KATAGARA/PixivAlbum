import Vue from 'vue'
import VueRouter from 'vue-router'
import Pixiv from "src/views/Pixiv";
import PixivRank from "components/Pixiv/PixivRank/PixivRank";
import PixivSearch from "components/Pixiv/PixivSearch/PixivSearch";
import PixivIllust from "components/Pixiv/PixivIllust/PixivIllust";
import PixivLike from "components/Pixiv/PixivLike/PixivLike";
import PixivCollect from "@/views/PixivCollect";
import Setting from "@/views/Setting";
import User from "@/views/User";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/pixiv/rank'
    // redirect: '/collect'
  },
  {
    path: '/pixiv',
    name: 'pixiv',
    component: Pixiv,
    children: [
      // { path: 'rank', name: 'rank', component: PixivRank},
      { path: 'rank', name: 'rank', component: PixivRank },
      { path: 'search', name: 'search', component: PixivSearch },
      { path: 'like/illust', name: 'like-illust', component: PixivLike },
      { path: 'like/author', name: 'like-author', component: PixivLike },
      { path: 'illust', name: 'illust', component: PixivIllust },
    ],
  },
  {
    path: '/collect',
    name: 'collect',
    component: PixivCollect
  },
  {
    path: '/setting',
    name: 'setting',
    component: Setting
  },
  {
    path: '/user',
    name: 'user',
    component: User
  },
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes,
  // scrollBehavior (to, from, savedPosition) {
  //   console.log(to, from, savedPosition)
  //   if (savedPosition) {
  //     return savedPosition
  //   } else {
  //     return { x: 0, y: 0 }
  //   }
  // }
})

export default router
