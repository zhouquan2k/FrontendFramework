/* Layout */
import Layout from '@/layout'
import store from './store'
import { loadAllModules } from '@/utils/moduleLoader'

export async function initRouter() {
    // 加载所有模块配置
    const { rootRoutes, inLayoutRoutes, appRouteConfig } = await loadAllModules();
    console.log('appRouteConfig', appRouteConfig);
    
    // 构建应用路由
    const appRoute = {
        ...appRouteConfig,
        component: Layout,
        children: [
            ...inLayoutRoutes    // inLayout: true 的所有路由（包括动态路由）
        ]
    };

    // 构建完整的路由配置
    const allRoutes = [
        appRoute,
        ...rootRoutes        // inLayout: false 的所有路由（包括动态路由）
    ];

    // convert to menu
    store.dispatch('ProcessMenus', appRoute);

    return allRoutes;
}




