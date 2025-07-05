module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    '@babel/plugin-transform-private-methods'
  ],
  ignore: [
    './node_modules/pinyin/esm/data/phrases-dict.js'
  ]
}
