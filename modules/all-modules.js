// modules/all-modules.js
// 排除 tests 目录下的 js 文件
const gcpModule = require.context('../src/gcp', true, /^(?!.*tests).*\.js$/);
const sysModule = require.context('../src/system', true, /^(?!.*tests).*\.js$/);
// 如有其他业务模块，继续添加
// const kbModule = require.context('../src/kb', true, /^(?!.*tests).*\.js$/);

const AllModules = {
  '@gcp/': gcpModule,
  '@sys/': sysModule,
  // '@kb/': kbModule,
};

export default AllModules; 