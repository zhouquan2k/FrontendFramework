import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import getters from './getters'
import settings from './modules/settings'
import system from './modules/system'
import tagsView from './modules/tagsView'
import menu from './modules/menu'
import { loadAllModules } from '@/utils/moduleLoader'

Vue.use(Vuex)

// 创建基础的 store 实例
const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user: system,
    system: system,
    tagsView,
    menu
  },
  getters
})

// 动态加载模块的初始化方法
store.initDynamicModules = async function() {
  try {
    console.log('开始加载动态模块...')
    
    // 加载所有动态模块
    const { store: dynamicStoreModules } = await loadAllModules()
    
    // 动态注册 store 模块
    Object.keys(dynamicStoreModules).forEach(moduleName => {
      const moduleConfig = dynamicStoreModules[moduleName]
      if (moduleConfig) {
        // 如果模块已存在，先注销再注册
        if (store.hasModule(moduleName)) {
          store.unregisterModule(moduleName)
        }
        store.registerModule(moduleName, moduleConfig)
        console.log(`成功注册 Store 模块: ${moduleName}`)
      }
    })
    
    console.log('动态模块加载完成')
    return true
  } catch (error) {
    console.warn('动态加载模块失败:', error)
    return false
  }
}

// 导出 store 实例（保持原有行为）
export default store
