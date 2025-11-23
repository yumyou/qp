// 收藏门店工具函数
const app = getApp()
var http = require('./http');

/**
 * 收藏门店
 * @param {number} storeId 门店ID
 * @param {function} successCallback 成功回调
 * @param {function} failCallback 失败回调
 */
function favoriteStore(storeId, successCallback, failCallback) {
  if (!app.globalData.isLogin) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }

  wx.showLoading({
    title: '收藏中...',
    mask: true
  });

  http.request(
    "/member/user/favoriteStore",
    "1",
    "post",
    {
      storeId: storeId
    },
    app.globalData.userDatatoken.accessToken,
    "",
    function success(info) {
      wx.hideLoading();
      console.log('收藏门店结果:', info);
      if (info.code == 0) {
        wx.showToast({
          title: '收藏成功',
          icon: 'success'
        });
        if (successCallback) {
          successCallback(info);
        }
      } else {
        wx.showToast({
          title: info.msg || '收藏失败',
          icon: 'none'
        });
        if (failCallback) {
          failCallback(info);
        }
      }
    },
    function fail(info) {
      wx.hideLoading();
      console.error('收藏门店失败:', info);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
      if (failCallback) {
        failCallback(info);
      }
    }
  );
}

/**
 * 取消收藏门店
 * @param {number} storeId 门店ID
 * @param {function} successCallback 成功回调
 * @param {function} failCallback 失败回调
 */
function unfavoriteStore(storeId, successCallback, failCallback) {
  if (!app.globalData.isLogin) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }

  wx.showLoading({
    title: '取消收藏中...',
    mask: true
  });

  http.request(
    "/member/user/unfavoriteStore",
    "1",
    "post",
    {
      storeId: storeId
    },
    app.globalData.userDatatoken.accessToken,
    "",
    function success(info) {
      wx.hideLoading();
      console.log('取消收藏结果:', info);
      if (info.code == 0) {
        wx.showToast({
          title: '取消收藏成功',
          icon: 'success'
        });
        if (successCallback) {
          successCallback(info);
        }
      } else {
        wx.showToast({
          title: info.msg || '取消收藏失败',
          icon: 'none'
        });
        if (failCallback) {
          failCallback(info);
        }
      }
    },
    function fail(info) {
      wx.hideLoading();
      console.error('取消收藏失败:', info);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
      if (failCallback) {
        failCallback(info);
      }
    }
  );
}

/**
 * 检查门店是否已收藏
 * @param {number} storeId 门店ID
 * @param {function} callback 回调函数，参数为是否已收藏
 */
function checkFavoriteStatus(storeId, callback) {
  if (!app.globalData.isLogin) {
    if (callback) {
      callback(false);
    }
    return;
  }

  http.request(
    "/member/user/getFavoriteStores",
    "1",
    "get",
    {},
    app.globalData.userDatatoken.accessToken,
    "",
    function success(info) {
      if (info.code == 0) {
        const favoriteStores = info.data || [];
        const isFavorited = favoriteStores.some(store => store.storeId === storeId);
        if (callback) {
          callback(isFavorited);
        }
      } else {
        if (callback) {
          callback(false);
        }
      }
    },
    function fail(info) {
      console.error('检查收藏状态失败:', info);
      if (callback) {
        callback(false);
      }
    }
  );
}

module.exports = {
  favoriteStore: favoriteStore,
  unfavoriteStore: unfavoriteStore,
  checkFavoriteStatus: checkFavoriteStatus
}

