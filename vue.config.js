const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

const apiTarget = process.env.VUE_APP_API_BASE_URL || process.env.API_TARGET_URL || 'http://host.docker.internal:58080';


module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // turn off lint
  configureWebpack: {
    devtool: 'source-map', //zhouquan
    // name: name,
    resolve: {
      alias: {
        '@': resolve('src'),
        '@sys': resolve('src/system'),
        '@gcp': resolve('src/gcp'),
        '@kb': resolve('src/kb'),
      },
    },
    performance: {
      maxEntrypointSize: 5000000, // 入口起点的最大体积（以字节为单位）
      maxAssetSize: 2000000, // 生成文件的最大体积（以字节为单位）
      hints: 'warning' // 当文件大小超过限制时给出的提示，可以是 'warning'、'error' 或 false
    }
  },
  devServer: {
    client: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: apiTarget, // 后端服务器地址
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        pathRewrite: { '^/api': '/api' } // 如果后端接口没有/api需要通过pathRewrite来重写地址
      },
    },
  },
});
