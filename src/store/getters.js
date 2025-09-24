const getters = {
  // TODO 待分离
  project: state => state.project?.project,
  taskCount: state => state.task?.taskCount,
  url: state => state.project?.project ? state.project?.project?.url : null,

  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  
  title: state => state.system?.title,
  userId: state => state.system.id,
  token: state => state.system?.token,
  avatar: state => state.system?.avatar,
  name: state => state.system?.name,
  nickname: state => state.system?.nickname,
  username: state => state.system?.nickname,
  introduction: state => state.system?.introduction,
  roles: state => state.system?.roles,
  permissions: state => state.system?.permissions,
  userOptions: state => state.system?.userOptions,
  // 工具栏
  routes: state => state.menu.routes, // state.routes,
  menus: state => state.menu.menus,
  topbarRouters: state => [],  //state.permission.topbarRouters,
  defaultRoutes: state => [],  //state.permission.defaultRoutes,

  // 数据字典
  dict_datas: state => state.dict.dictDatas
}
export default getters
