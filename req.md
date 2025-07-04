# 需求概要

## 动态模块加载机制

### 需求描述
为了便于扩展，框架代码不应依赖某个非框架的目录（如 `@gcp/...`），需要实现可在部署具体项目时动态加载扩展模块的机制，而不是写死在公共的框架文件中。

### 具体要求
1. 框架代码不能硬编码依赖特定的业务模块
2. 支持多个 `modules.config.js` 配置文件，放在指定目录中
3. 配置文件格式为 `modules/xxx.config.js`
4. 系统能够自动扫描和加载所有配置文件
5. 支持动态加载 store、router 等不同类型的模块

### 实现方案

#### 1. 目录结构
```
modules/
├── gcp.config.js
├── system.config.js  
├── kb.config.js
└── ...
```

#### 2. 配置文件格式
```javascript
// modules/gcp.config.js
export default {
  name: 'gcp',
  store: [
    { name: 'project', path: '@gcp/store/project' }
  ],
  router: [
    { name: 'gcp', path: '@gcp/router' }
  ],
  components: [],
  plugins: []
}
```

#### 3. 核心实现机制

##### 3.1 预加载机制
使用 webpack 的 `require.context` 预加载所有可能的模块：

```javascript
// Store 模块预加载
function preloadStoreModules() {
  const storeModules = {};
  
  // 预加载 GCP store 模块
  const gcpStoreContext = require.context('../gcp/store', false, /\.js$/);
  gcpStoreContext.keys().forEach(path => {
    const moduleName = path.replace('./', '').replace('.js', '');
    const module = gcpStoreContext(path);
    storeModules[`gcp_${moduleName}`] = module.default || module;
  });
  
  // 预加载其他模块...
}

// 路由模块预加载
function preloadRouterModules() {
  const routerModules = {};
  
  // 直接 require 路由模块
  const gcpRouter = require('../gcp/router.js');
  routerModules['gcp'] = gcpRouter.default || gcpRouter;
  
  // 预加载其他路由...
}
```

##### 3.2 配置映射机制
根据配置文件中的路径，从预加载的模块中查找对应的模块：

```javascript
// Store 模块映射
if (storeConfig.path.includes('@gcp/store/')) {
  const moduleName = storeConfig.path.replace('@gcp/store/', '');
  module = preloadedModules[`gcp_${moduleName}`];
}

// 路由模块映射
if (routerConfig.path.includes('@gcp/router')) {
  module = preloadedModules['gcp'];
}
```

##### 3.3 动态注册机制
使用 Vuex 的 `registerModule` 方法动态注册模块：

```javascript
// 在 store 中添加初始化方法
store.initDynamicModules = async function() {
  const { store: dynamicStoreModules } = await loadAllModules();
  
  Object.keys(dynamicStoreModules).forEach(moduleName => {
    const moduleConfig = dynamicStoreModules[moduleName];
    if (moduleConfig) {
      if (store.hasModule(moduleName)) {
        store.unregisterModule(moduleName);
      }
      store.registerModule(moduleName, moduleConfig);
    }
  });
}
```

#### 4. 工作流程

1. **应用启动**：
   - 创建基础 store 实例（包含框架核心模块）
   - 正常启动 Vue 应用
   - 应用启动不被模块加载阻塞

2. **配置扫描**：
   - 使用 `require.context` 扫描 `modules/` 目录
   - 加载所有 `*.config.js` 配置文件
   - 解析配置文件内容

3. **模块预加载**：
   - 预加载所有可能的 store 模块
   - 预加载所有可能的路由模块
   - 建立模块索引映射

4. **配置映射**：
   - 根据配置文件中的路径
   - 从预加载的模块中查找对应模块
   - 验证模块格式和有效性

5. **动态注册**：
   - 将找到的模块注册到 store 中
   - 提供详细的加载日志
   - 优雅处理加载失败的情况

#### 5. 实现的文件
- `modules/gcp.config.js` - GCP 模块配置
- `modules/system.config.js` - System 模块配置
- `modules/kb.config.js` - KB 模块配置
- `src/utils/moduleLoader.js` - 模块加载器（预加载机制）
- `src/store/index.js` - 修改为支持动态模块注册
- `src/main.js` - 异步初始化动态模块

#### 6. 核心优势

##### 6.1 技术优势
- **webpack 兼容**：使用 webpack 推荐的模块加载方式
- **编译时确定**：所有模块路径在编译时确定，避免运行时路径解析问题
- **预加载策略**：避免动态 import 的路径别名解析问题
- **向后兼容**：保持 `export default store` 的 API 不变

##### 6.2 架构优势
- **框架解耦**：框架代码完全不依赖特定业务模块
- **插件化架构**：支持模块的热插拔和独立配置
- **优雅降级**：动态模块加载失败不影响应用基本功能
- **非阻塞启动**：应用启动速度不受动态模块影响

##### 6.3 维护优势
- **配置清晰**：每个模块有独立的配置文件
- **日志完整**：详细的加载过程日志，便于调试
- **错误处理**：完善的错误处理和降级机制
- **易于扩展**：新增模块只需添加配置文件

#### 7. 使用方式

##### 7.1 部署新项目
1. 在 `modules/` 目录下创建对应的 `xxx.config.js` 文件
2. 定义需要加载的 store、router 等模块
3. 框架会自动扫描和加载，无需修改任何框架代码

##### 7.2 添加新模块
```javascript
// modules/newmodule.config.js
export default {
  name: 'newmodule',
  store: [
    { name: 'feature', path: '@newmodule/store/feature' }
  ],
  router: [
    { name: 'newmodule', path: '@newmodule/router' }
  ]
}
```

##### 7.3 在组件中使用
```javascript
// 在组件中正常使用 store
import store from '@/store'

// store 立即可用，包含所有基础模块
// 动态模块会在后台加载完成后自动注册
console.log(store.state.project); // 动态加载的模块
```

### 实现状态
- [x] 创建模块配置目录和文件
- [x] 实现预加载机制的模块加载器
- [x] 修改 Store 配置为动态模块注册
- [x] 修改应用初始化为异步加载
- [x] 解决 webpack 路径解析问题
- [x] 完善错误处理和日志记录
- [x] 测试验证功能正常运行
- [x] 更新文档记录实现细节

### 总结
通过预加载机制和配置映射的方式，成功实现了动态模块加载功能，既保证了框架的通用性和可扩展性，又解决了 webpack 动态模块加载的技术难题。该方案具有良好的兼容性、可维护性和扩展性，为项目的模块化架构提供了坚实的基础。 