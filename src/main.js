import Vue from 'vue';
import App from './App';
import router from "@/router";
import store from './store';
// import api from "@/api";
import axios from 'axios';
// import utils from "@/utils";
import './styles/reset.less';
import animate from 'animate.css';
import VueAxios from 'vue-axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { Icon } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';

library.add(fas, far, fab)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)
Vue.component('font-awesome-layers-text', FontAwesomeLayersText)


Vue.config.productionTip = false
const clipboard = window.require('electron').clipboard
const ipcRenderer = window.require('electron').ipcRenderer
Vue.prototype.$ipcRenderer = ipcRenderer
Vue.prototype.$clipboard = clipboard
Vue.use(VueAxios, axios)
Vue.use(ElementUI)
Vue.use(Icon)
Vue.use(animate)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
