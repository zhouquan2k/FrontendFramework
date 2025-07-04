/**
 * GCP 模块配置文件
 * 定义 GCP 模块的 store、router 等扩展
 */

export default {
  name: 'gcp',
  
  // Store 模块配置
  store: [
    {
      name: 'project',
      path: '@gcp/store/project'
    }
  ],
  
  // Router 模块配置
  router: [
    {
      name: 'gcp',
      path: '@gcp/router'
    }
  ],
  
  // 其他配置可以在这里添加
  components: [],
  plugins: []
}; 