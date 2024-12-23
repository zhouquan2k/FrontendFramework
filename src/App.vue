<template>
  <div id="app">
    <router-view v-if="metadataReady" />
  </div>
</template>

<script>
import '@/assets/styles/index.scss' // global css
import { getAllMetadata } from '@sys/security_api';
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

    const response = await getAllMetadata();
    console.log(response);
    const allMetadata = { dictionariesMap: {} };
    allMetadata.entitiesMap = response.entities.reduce((obj, item) => {
      obj[item.name] = item;
      item.fieldMap = item.fields.reduce((map, field) => {
        map[field.name] = field;
        return map;
      }, {});
      return obj;
    }, {});

    allMetadata.dictionaries = response.dictionaries;
    for (const [key, dict] of Object.entries(response.dictionaries)) {
      var dictMap = {}
      for (var item of dict) {
        dictMap[item.value] = { label: item.label, tag: item.tag, value: item.value };
      }
      allMetadata.dictionariesMap[key] = dictMap;
    }

    Vue.prototype.$metadata = allMetadata;
    this.metadataReady = true;
  }
}
</script>

<style></style>
