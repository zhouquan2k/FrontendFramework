/* Layout */
import Layout from '@/layout'
import store from './store'

import { getRoutes as getSystemRoutes } from '@sys/router'
import { getRoutes as getGcpRoutes } from '@gcp/router'


// TODO refactor to system module
export function initRouter() {
    const appRoute = {
        name: 'app',
        path: '/',
        redirect: '/system/home',
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
            component: (resolve) => require(['@sys/login'], resolve),
        },
    ];

    // get routes from all modules
    [...getGcpRoutes(), ...getSystemRoutes()].forEach(r => {
        appRoute.children.push(r);
    });

    // convert to menu
    store.dispatch('ProcessMenus', appRoute);

    return constantRoutes;
}


