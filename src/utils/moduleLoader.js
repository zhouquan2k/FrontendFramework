/**
 * 模块加载器
 * 完全依据 modules/ 目录下的配置文件来动态加载模块
 * 使用 webpack 的魔法注释来确保编译时能正确处理所有可能的模块
 */

/**
 * 智能动态导入函数
 * 使用 webpack 魔法注释让 webpack 包含所有可能的模块
 */
import AllModules from '../../modules/all-modules';
import { setNavbarExtension, clearNavbarExtension } from '@/layout/navbarExtension';

// 缓存已加载的模块，避免重复加载
let cachedModules = null;

function findModuleByAlias(aliasPath) {
  for (const prefix in AllModules) {
    const ctx = AllModules[prefix];
    if (aliasPath.startsWith(prefix)) {
      const rawRel = './' + aliasPath.slice(prefix.length);
      const hasExt = rawRel.endsWith('.js') || rawRel.endsWith('.vue');
      const candidates = hasExt ? [rawRel] : [`${rawRel}.js`, `${rawRel}.vue`];

      for (const relPath of candidates) {
        if (ctx && ctx.keys().includes(relPath)) {
          const mod = ctx(relPath);
          return mod.default || mod;
        }
      }
      const keys = ctx ? ctx.keys() : [];
      console.warn(
        `未在模块 ${prefix} 中找到路径: ${aliasPath}, 候选: ${candidates.join(', ')}, 可用文件数量: ${keys.length}, 示例: ${keys.slice(0, 10).join(', ')}`
      );
    }
  }
  return null;
}

/**
 * 获取所有模块配置文件
 */
function getModuleConfigs() {
  const configs = [];
  
  try {
    const requireContext = require.context('../../modules/', false, /\.config\.js$/);
    
    requireContext.keys().forEach(configPath => {
      try {
        const configModule = requireContext(configPath);
        const config = configModule.default || configModule;
        
        if (config && typeof config === 'object') {
          configs.push({
            ...config,
            _source: configPath.replace('./', '').replace('.config.js', '')
          });
        }
      } catch (error) {
        console.warn(`加载模块配置失败: ${configPath}`, error);
      }
    });
  } catch (error) {
    console.warn('扫描模块配置目录失败:', error);
  }
  
  return configs;
}

/**
 * 加载 Navbar 扩展组件
 */
async function loadNavbarExtension(configs) {
  clearNavbarExtension();

  for (const config of configs) {
    if (config.navbarExtension && config.navbarExtension.component) {
      const { component, mode } = config.navbarExtension;
      const mod = findModuleByAlias(component);
      if (mod) {
        const ext = mod.default || mod;
        setNavbarExtension({
          component: ext,
          mode: mode || 'append',
        });
        console.log(`✅ 成功加载 Navbar 扩展: ${component}`);
        return;
      } else {
        console.warn(`未找到 Navbar 扩展组件: ${component}`);
      }
    }
  }
}

/**
 * 根据配置动态加载 Store 模块
 */
async function loadStoreModules(configs) {
  const storeModules = {};
  
  console.log('开始动态加载 Store 模块...');
  
  for (const config of configs) {
    if (config.store && Array.isArray(config.store)) {
      for (const storeConfig of config.store) {
        const module = findModuleByAlias(storeConfig.path);
        if (module && typeof module === 'object') {
          // 支持多个名称注册同一个模块
          const names = Array.isArray(storeConfig.name) ? storeConfig.name : [storeConfig.name];
          
          names.forEach(name => {
            storeModules[name] = module;
            console.log(`✅ 成功加载 Store 模块: ${name}`);
          });
        } else {
          const names = Array.isArray(storeConfig.name) ? storeConfig.name.join(', ') : storeConfig.name;
          console.warn(`未找到 Store 模块: ${storeConfig.path} (${names})`);
        }
      }
    }
  }
  
  return storeModules;
}

/**
 * 根据配置动态加载路由模块
 * 返回按 inLayout 分类的路由对象
 */
async function loadRouterModules(configs) {
  const inLayoutRoutes = [];
  const rootRoutes = [];
  
  console.log('开始动态加载路由模块...');
  
  for (const config of configs) {
    if (config.router && Array.isArray(config.router)) {
      for (const routerConfig of config.router) {
        if (routerConfig.path) {
          const module = findModuleByAlias(routerConfig.path);
          let routes = null;
          
          if (module) {
            if (typeof module.getRoutes === 'function') {
              routes = module.getRoutes();
            } else if (Array.isArray(module)) {
              routes = module;
            } else if (module && typeof module === 'object' && module.Routes) {
              routes = module.Routes;
            } else if (module.default && Array.isArray(module.default)) {
              routes = module.default;
            }
          }
          
          if (routes && Array.isArray(routes)) {
            // 按 inLayout 字段分类路由
            routes.forEach(route => {
              const inLayout = route.inLayout !== false; // 默认为 true
              
              if (inLayout) {
                inLayoutRoutes.push(route);
              } else {
                rootRoutes.push(route);
              }
            });
            
            console.log(`✅ 成功加载路由模块: ${routerConfig.name}`);
          } else {
            console.warn(`未找到或格式不正确的路由模块: ${routerConfig.path}`);
          }
        }
      }
    }
  }
  
  return { inLayoutRoutes, rootRoutes };
}



/**
 * 加载应用路由配置
 */
async function loadAppRouteConfig(configs) {
  // 找到第一个定义了 appRoute 的配置
  for (const config of configs) {
    if (config.appRoute && typeof config.appRoute === 'object') {
      return config.appRoute;
    }
  }
  
  // 如果没有找到，返回默认配置
  return {
    name: 'app',
    path: '/',
    children: []
  };
}

/**
 * 获取所有动态加载的模块
 */
async function loadAllModules() {
  // 如果已经加载过，直接返回缓存的结果
  if (cachedModules) {
    console.log('使用缓存的模块配置');
    return cachedModules;
  }
  
  const configs = getModuleConfigs();
  
  console.log('发现模块配置:', configs.map(c => c._source));
  
  const [storeModules, routerRoutes, appRouteConfig] = await Promise.all([
    loadStoreModules(configs),
    loadRouterModules(configs),
    loadAppRouteConfig(configs)
  ]);

  // Navbar 扩展无需 await（同步处理）
  loadNavbarExtension(configs);
  
  // 缓存结果
  cachedModules = {
    configs,
    store: storeModules,
    inLayoutRoutes: routerRoutes.inLayoutRoutes,
    rootRoutes: routerRoutes.rootRoutes,
    appRouteConfig
  };
  
  return cachedModules;
}

export {
  getModuleConfigs,
  loadStoreModules,
  loadRouterModules,
  loadAppRouteConfig,
  loadAllModules
};
