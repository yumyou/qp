// app.js
App({
  /**
   * 全局数据
   */
  globalData: {
    // 基础URL - 需要根据实际环境配置
    baseUrl: 'http://www.beibeiqitaishe.cn/app-api',
    // 租户ID
    tenantId: '150',
    // 登录状态
    isLogin: false,
    // 用户数据
    userData: null,
    // 用户token
    userDatatoken: null,
    // 应用名称
    appName: '麻将'
  },

  /**
   * 小程序初始化完成时执行（全局只触发一次）
   */
  onLaunch(options) {
    console.log('小程序启动', options);
    
    // 从本地存储恢复用户登录状态
    const userDatatoken = wx.getStorageSync('userDatatoken');
    if (userDatatoken) {
      this.globalData.userDatatoken = userDatatoken;
      this.globalData.userData = userDatatoken;
      this.globalData.isLogin = true;
    }

    // 检查更新版本
    this.checkUpdateVersion();
  },

  /**
   * 小程序显示时执行（从后台进入前台时）
   */
  onShow(options) {
    console.log('小程序显示', options);
  },

  /**
   * 小程序隐藏时执行（从前台进入后台时）
   */
  onHide() {
    console.log('小程序隐藏');
  },

  /**
   * 小程序发生脚本错误或 API 调用报错时触发
   */
  onError(msg) {
    console.error('小程序错误', msg);
  },

  /**
   * 小程序要打开的页面不存在时触发
   */
  onPageNotFound(res) {
    console.warn('页面不存在', res);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  /**
   * 检查小程序更新版本
   */
  checkUpdateVersion() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });

          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请删除小程序重新打开',
              showCancel: false
            });
          });
        }
      });
    }
  }
});