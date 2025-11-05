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
    //获取当前用户信息

    const allMetadata = await getAllMetadata();
    const env = await getServerEnv();
    console.log('Metadata loaded:', allMetadata);
    Vue.prototype.$metadata = allMetadata;
    Vue.prototype.$serverEnv = env;
    this.metadataReady = true;
  }
}
</script>

<style></style>
