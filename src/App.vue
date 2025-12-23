<template>
  <div id="app">
    <router-view v-if="metadataReady" />
  </div>
</template>

<script>
import '@/assets/styles/index.scss' // global css
import { getAllMetadata, getServerEnv } from '@/utils/api_base';
import settings from '@/settings';
import Vue from 'vue';
import store from '@/store';
export default {
  name: 'App',
  metaInfo() {
    console.log(process.env.VUE_APP_TITLE, process.env.VUE_APP_ENV);
    return {
      title: this.$store.state.settings.dynamicTitle, // && this.$store.state.settings.title,
      titleTemplate: title => {
        title = false;
        return title ? `${title} - ${settings.title}` : settings.title;
      }
    }
  },
  components: {},
  data() {
    return {
      metadataReady: false
    }
  },
  async created() {
    try {
      // 确保动态 Store 模块（含 system）已注册
      if (store.initDynamicModules) {
        await store.initDynamicModules();
      }

      // 先加载 metadata，再加载用户与环境
      const allMetadata = await getAllMetadata();
      console.log('Metadata loaded:', allMetadata);
      Vue.prototype.$metadata = allMetadata;

      const [user, env] = await Promise.all([
        store.dispatch('GetInfo'),
        getServerEnv()
      ]);
      Vue.prototype.$serverEnv = env;
    } catch (err) {
      console.warn('初始化信息获取失败', err);
    } finally {
      // 确保不阻塞页面渲染
      this.metadataReady = true;
    }
  }
}
</script>

<style></style>
