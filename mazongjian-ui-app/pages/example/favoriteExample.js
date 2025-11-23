// 示例：如何在其他页面中使用收藏功能
const app = getApp()
var favorite = require('../../utils/favorite');

Page({
  data: {
    storeList: [],
    favoriteStatus: {} // 存储每个门店的收藏状态
  },

  onLoad: function() {
    this.loadStoreList();
  },

  /**
   * 加载门店列表
   */
  loadStoreList: function() {
    // 模拟门店数据
    const stores = [
      { storeId: 1, storeName: '测试门店1', address: '北京市朝阳区' },
      { storeId: 2, storeName: '测试门店2', address: '上海市浦东区' }
    ];
    
    this.setData({
      storeList: stores
    });
    
    // 检查每个门店的收藏状态
    stores.forEach(store => {
      this.checkFavoriteStatus(store.storeId);
    });
  },

  /**
   * 检查门店收藏状态
   */
  checkFavoriteStatus: function(storeId) {
    favorite.checkFavoriteStatus(storeId, (isFavorited) => {
      const favoriteStatus = this.data.favoriteStatus;
      favoriteStatus[storeId] = isFavorited;
      this.setData({
        favoriteStatus: favoriteStatus
      });
    });
  },

  /**
   * 切换收藏状态
   */
  toggleFavorite: function(e) {
    const storeId = e.currentTarget.dataset.storeId;
    const isFavorited = this.data.favoriteStatus[storeId];
    
    if (isFavorited) {
      // 取消收藏
      favorite.unfavoriteStore(storeId, 
        () => {
          // 成功回调
          this.updateFavoriteStatus(storeId, false);
        },
        () => {
          // 失败回调
          console.log('取消收藏失败');
        }
      );
    } else {
      // 收藏
      favorite.favoriteStore(storeId,
        () => {
          // 成功回调
          this.updateFavoriteStatus(storeId, true);
        },
        () => {
          // 失败回调
          console.log('收藏失败');
        }
      );
    }
  },

  /**
   * 更新收藏状态
   */
  updateFavoriteStatus: function(storeId, isFavorited) {
    const favoriteStatus = this.data.favoriteStatus;
    favoriteStatus[storeId] = isFavorited;
    this.setData({
      favoriteStatus: favoriteStatus
    });
  }
});

