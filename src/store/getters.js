const getters = {
  title: state => state.project?.project ? `【${state.project?.project?.projectCode}】${state.project?.project?.medicineName ? state.project?.project?.medicineName : state.project?.project?.projectName?.substring(0, 30)}` : '',
  project: state => state.project?.project,
  taskCount: state => state.task?.taskCount,
  url: state => state.project?.project ? state.project?.project?.url : null,
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  userId: state => state.user.id,
  token: state => state.user?.token,
  avatar: state => state.user?.avatar,
  name: state => state.user?.name,
  nickname: state => state.user?.nickname,
  username: state => state.user?.nickname,
  introduction: state => state.user?.introduction,
  roles: state => state.user?.roles,
  permissions: state => state.user?.permissions,
  // 工具栏
  routes: state => state.menu.routes, // state.routes,
  menus: state => state.menu.menus,
  topbarRouters: state => [],  //state.permission.topbarRouters,
  defaultRoutes: state => [],  //state.permission.defaultRoutes,

  // 数据字典
  dict_datas: state => state.dict.dictDatas
}
export default getters
