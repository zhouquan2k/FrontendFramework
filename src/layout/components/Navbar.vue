<template>
  <div class="navbar">
    <div>
      <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container"
        @toggleClick="toggleSideBar" />

      <div class="back"><i class="el-icon-back" @click="onBack" /><span style="margin-left: 4px;"
          @click="onBack">返回</span>
      </div>

      <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav" />

      <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav" />
    </div>
    <div v-if="title" class="title">
      <div class="text"><a :href="url">{{ title }}</a></div>
    </div>
    <div class="right-menu">

      <div class="myicon">
        <a href="/download/ChromeStandaloneSetup64.exe" style="font-size:12px;margin-right:10px">下载浏览器</a>
        <a href="/"><i class=" el-icon-s-home"></i>
          <el-badge :value="taskCount" class="badge"></el-badge>
        </a>
      </div>

      <template v-if="device !== 'mobile'">
        <!-- search id="header-search" class="right-menu-item" /-->
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <!--el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip-->
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img v-if="avatar" :src="avatar" class="user-avatar">
          <i v-else class="el-icon-user-solid"></i>
          <span v-if="nickname" class="user-nickname">{{ nickname }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <!--el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item-->
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span v-if="env == 'Prod'" class="right-menu-item" style="background:#67C23A;color:white;">Prod</span>
      <span v-else class="right-menu-item"
        style="background:#E6A23C;color:white; width:60px; text-align:center;padding-top:5px;">{{ env
        }}<el-badge :value="$store.state.user.version" class="badge" style="top:-67px;left:0px;"></el-badge></span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/layout/components/Breadcrumb'
import TopNav from '@/layout/components/TopNav'
import Hamburger from '@/layout/components/Hamburger'
import Screenfull from '@/layout/components/Screenfull'
import SizeSelect from '@/layout/components/SizeSelect'
import Search from '@/layout/components/HeaderSearch'
import { env } from '@/settings'

export default {
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
  },
  data() {
    return {
      env
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'nickname',
      'device',
      'title',
      'url',
      'taskCount',
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    onBack() {
      this.$router.back();
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示').then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/login';
        }).catch(error => {
          location.href = "/login";
        }).catch(() => { });
      })
    },
  },
  created() {
    console.log("env..." + this.env);
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 45px;
  overflow: hidden;
  position: relative;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  /* 分散对齐，确保左右元素靠边，中间元素居中 */
  /* box-shadow: 0 1px 4px rgba(0, 21, 41, .08); */

  .back {
    float: left;
    padding: 12px;
    padding-top: 15px;
    font-size: 14px;
    margin-right: 15px;
    background: #f5f5f5;
    color: #909399;
    height: 100%;
    cursor: pointer;
    transition: background .3s;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;
    background: #fafafa;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .title {
    text-align: center;
    vertical-align: middle;
    padding: 10px;
    background-color: white;
    /* #f0f9eb; */
    color: black;
    display: flex;



    .text {
      max-width: 400px;
      text-overflow: ellipsis;
      /* 使用省略号表示被截断的文本 */
      white-space: nowrap;
      /* 确保文本在一行内 */
      overflow: hidden;
    }
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .myicon {
      display: inline-block;
      vertical-align: top;
      padding-left: 12px;
      margin-right: -4px;
      font-weight: 800 !important;
      height: 100%;

      .badge {
        top: -5px;
        left: -5px;
      }
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        justify-content: center;
        align-items: center;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 35px;
          height: 35px;
          border-radius: 50%;
        }

        .user-nickname {
          margin-left: 5px;
          font-size: 14px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
