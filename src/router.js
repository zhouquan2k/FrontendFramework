/* Layout */
import Layout from '@/layout'
import store from './store'
import { loadAllModules } from '@/utils/moduleLoader'

// TODO refactor to system module
export async function initRouter() {
    const appRoute = {
        name: 'app',
        path: '/',
        redirect: '/gcp/home',
        component: Layout,
        children: [
            {
                path: '/profile',
                component: (resolve) => require(['@sys/Profile'], resolve),
            }
        ],
    };

    // public routes
    const constantRoutes = [
        appRoute,
        {
            path: '/login',
            // component: (resolve) => require(['@sys/login'], resolve),
            component: (resolve) => require(['@gcp/view/login'], resolve),
        },
    ];

    // 动态加载路由模块
    await loadDynamicRoutes(appRoute);

    // convert to menu
    store.dispatch('ProcessMenus', appRoute);

    return constantRoutes;
}

/**
 * 动态加载路由模块
 * @param {Object} appRoute 应用路由对象
 */
async function loadDynamicRoutes(appRoute) {
    try {
        console.log('开始加载动态路由...');
        
        // 使用 moduleLoader 获取所有模块（会使用缓存，不会重复加载）
        const { router: dynamicRoutes } = await loadAllModules();
        
        // 直接将动态路由添加到 appRoute.children
        if (Array.isArray(dynamicRoutes)) {
            appRoute.children.push(...dynamicRoutes);
        }
        
        console.log('动态路由加载完成');
    } catch (error) {
        console.warn('动态路由加载失败，可能会影响部分功能:', error);
    }
}


