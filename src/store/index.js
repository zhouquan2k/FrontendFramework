import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import getters from './getters'
import settings from './modules/settings'
import system from './modules/system'
import tagsView from './modules/tagsView'
import menu from './modules/menu';
import project from '@gcp/store/project';

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user: system,
    system: system,
    tagsView,
    menu,
    //
    project,
  },
  getters
})

export default store
