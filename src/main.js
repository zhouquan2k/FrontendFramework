import Vue from 'vue'
import App from './App.vue'
import VueMeta from 'vue-meta';

Vue.use(VueMeta);

// added by zhouquan V

import store from './store'  // used by layout
import directive from './directive' // directive
Vue.use(directive);

import '@/icons';

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
// import './assets/styles/element-variables.scss'
Vue.use(Element, {
  size: 'small' // set element-ui default size
});

import { globalErrorHandler } from './utils/utils.js';
//global error handler
Vue.config.errorHandler = globalErrorHandler;

import plugins from './plugins'; // plugins
Vue.use(plugins);
Vue.config.productionTip = false

// print.js
import print from './components/printjs'
import './components/printjs/sass/index.scss';
Vue.prototype.$print = print;

// route related
import Router from 'vue-router'
Vue.use(Router);
import { initRouter } from './router';
import { loadAllModules } from '@/utils/moduleLoader';

async function init() {
  try {
    // 1. 首先加载所有动态模块（只调用一次）
    console.log('开始加载动态模块...');
    const allModules = await loadAllModules();
    
    // 2. 初始化路由（使用缓存的模块数据）
    console.log('开始初始化路由...');
    const allRoutes = await initRouter();
    const router = new Router({
      base: process.env.VUE_APP_APP_NAME ? process.env.VUE_APP_APP_NAME : "/",
      mode: 'history', // 去掉url中的#
      scrollBehavior: () => ({ y: 0 }),
      routes: allRoutes
    });

    // 3. 创建 Vue 实例
    const _vue = new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app');
    
    window.vue = _vue;

    // 4. 注册 store 模块（使用缓存的模块数据）
    await store.initDynamicModules();

    // 5. 依赖动态模块的逻辑（如菜单、权限等）可放在这里
    // 例如：store.dispatch('ProcessMenus', ...);

    console.log('应用初始化完成');
  } catch (error) {
    console.error('应用初始化失败:', error);
    // 可以在这里添加错误处理逻辑
  }
}

init();

// added by zhouquan ^
