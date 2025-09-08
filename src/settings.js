import {AppName} from '../modules/all-modules';

const settings = {

  /**
   * 侧边栏主题 深色主题theme-dark，浅色主题theme-light
   */
  sideTheme: 'theme-dark',

  /**
   * 是否系统布局配置
   */
  showSettings: false,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: false,

  /**
   * 是否固定头部
   */
  fixedHeader: false,

  /**
   * 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: true,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',

  loginNeeded: true,

  env: process.env.VUE_APP_ENV || 'DEV?',

  filePreviewUrl: '',

  title: AppName || process.env.VUE_APP_TITLE || 'Progartisan?', 

  logo: process.env.VUE_APP_LOGO || '/favicon.jpeg'
};
console.log('settings', settings);

// 同时支持 default export 和 named exports
export default settings;

// 导出各个属性，支持解构导入
export const sideTheme = settings.sideTheme;
export const showSettings = settings.showSettings;
export const topNav = settings.topNav;
export const tagsView = settings.tagsView;
export const fixedHeader = settings.fixedHeader;
export const sidebarLogo = settings.sidebarLogo;
export const dynamicTitle = settings.dynamicTitle;
export const errorLog = settings.errorLog;
export const loginNeeded = settings.loginNeeded;
export const env = settings.env;
export const filePreviewUrl = settings.filePreviewUrl;
export const title = settings.title;
export const logo = settings.logo;
