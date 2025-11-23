// 位置功能测试页面
const app = getApp();
var location = require('../../utils/location');

Page({
  data: {
    userLocation: null,
    userAddress: '',
    testStores: [
      { name: '测试门店1', lat: 39.908823, lng: 116.397470, address: '北京市东城区' },
      { name: '测试门店2', lat: 39.918823, lng: 116.407470, address: '北京市西城区' },
      { name: '测试门店3', lat: 39.928823, lng: 116.417470, address: '北京市朝阳区' }
    ]
  },

  onLoad() {
    console.log('位置测试页面加载');
  },

  // 获取用户位置
  getUserLocation() {
    const that = this;
    wx.showLoading({ title: '获取位置中...' });
    
    location.getUserLocation(
      function(res) {
        console.log('位置获取成功:', res);
        that.setData({
          userLocation: res
        });
        
        // 获取地址信息
        that.getAddressInfo(res.latitude, res.longitude);
        wx.hideLoading();
      },
      function(err) {
        console.log('位置获取失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    );
  },

  // 获取地址信息
  getAddressInfo(lat, lng) {
    const that = this;
    wx.showLoading({ title: '解析地址中...' });
    
    location.getAddressFromCoordinates(
      lat, lng,
      function(addressInfo) {
        console.log('地址解析成功:', addressInfo);
        that.setData({
          userAddress: addressInfo.address
        });
        wx.hideLoading();
        wx.showToast({
          title: '地址解析成功',
          icon: 'success'
        });
      },
      function(err) {
        console.log('地址解析失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '地址解析失败',
          icon: 'none'
        });
      }
    );
  },

  // 计算距离
  calculateDistances() {
    const that = this;
    if (!that.data.userLocation) {
      wx.showToast({
        title: '请先获取位置',
        icon: 'none'
      });
      return;
    }

    const userLat = that.data.userLocation.latitude;
    const userLng = that.data.userLocation.longitude;
    
    const storesWithDistance = that.data.testStores.map(store => {
      const distance = location.calculateDistance(userLat, userLng, store.lat, store.lng);
      return {
        ...store,
        distance: distance,
        distanceText: location.formatDistance(distance)
      };
    });

    that.setData({
      testStores: storesWithDistance
    });

    console.log('距离计算完成:', storesWithDistance);
    wx.showToast({
      title: '距离计算完成',
      icon: 'success'
    });
  },

  // 测试坐标验证
  testCoordinateValidation() {
    const testCases = [
      { lat: 39.908823, lng: 116.397470, valid: true },
      { lat: 200, lng: 116.397470, valid: false },
      { lat: 39.908823, lng: 300, valid: false },
      { lat: null, lng: 116.397470, valid: false }
    ];

    testCases.forEach((testCase, index) => {
      const isValid = location.isValidCoordinate(testCase.lat, testCase.lng);
      console.log(`测试用例${index + 1}:`, testCase, '有效:', isValid);
    });
  }
});
