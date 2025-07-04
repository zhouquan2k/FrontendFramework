/**
 * System 模块配置文件
 * 定义 System 模块的 store、router 等扩展
 */

export default {
  name: 'system',
  
  // Store 模块配置
  store: [
    // System 模块的 store 已经在框架中定义，这里可以根据需要添加其他扩展
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