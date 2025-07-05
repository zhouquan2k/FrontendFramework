/**
 * System 模块配置文件
 * 定义 System 模块的 store、router 等扩展
 */

export default {
  name: 'system',
  
  // Store 模块配置
  store: [
    {
      name: ['system', 'user'],
      path: '@sys/store/system'
    }
  ],
  
  // Router 模块配置
  router: [
    {
      name: 'system',
      path: '@sys/router'
    }
  ],
  
  // 其他配置可以在这里添加
  components: [],
  plugins: []
}; 