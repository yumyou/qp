/**
 * 位置相关工具函数
 */

/**
 * 获取用户位置信息
 * @param {Function} successCallback 成功回调
 * @param {Function} failCallback 失败回调
 */
function getUserLocation(successCallback, failCallback) {
  // 检查位置权限
  wx.getSetting({
    success: function(res) {
      if (res.authSetting['scope.userLocation'] === false) {
        // 用户拒绝了位置权限，引导用户开启
        wx.showModal({
          title: '位置权限',
          content: '需要获取您的位置信息来计算距离，请在设置中开启位置权限',
          confirmText: '去设置',
          success: function(modalRes) {
            if (modalRes.confirm) {
              wx.openSetting({
                success: function(settingRes) {
                  if (settingRes.authSetting['scope.userLocation']) {
                    getUserLocation(successCallback, failCallback);
                  } else {
                    failCallback && failCallback('用户拒绝开启位置权限');
                  }
                }
              });
            } else {
              failCallback && failCallback('用户取消开启位置权限');
            }
          }
        });
        return;
      }
      
      // 获取用户位置
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: function(res) {
          console.log('用户位置获取成功:', res);
          successCallback && successCallback(res);
        },
        fail: function(err) {
          console.log('获取位置失败:', err);
          failCallback && failCallback(err);
        }
      });
    }
  });
}

/**
 * 通过经纬度获取地址信息（逆地理编码）
 * @param {Number} lat 纬度
 * @param {Number} lng 经度
 * @param {Function} successCallback 成功回调
 * @param {Function} failCallback 失败回调
 */
function getAddressFromCoordinates(lat, lng, successCallback, failCallback) {
  wx.request({
    url: 'https://apis.map.qq.com/ws/geocoder/v1/',
    method: 'GET',
    data: {
      location: `${lat},${lng}`,
      key: 'FQGBZ-OY4CQ-XM35H-BWLYV-2U2V2-SRBZ6', // 腾讯地图API Key
      get_poi: 1
    },
    success: function(res) {
      if (res.data && res.data.status === 0) {
        const addressInfo = res.data.result;
        console.log('地址信息获取成功:', addressInfo);
        successCallback && successCallback(addressInfo);
      } else {
        console.log('地址信息获取失败:', res.data);
        failCallback && failCallback(res.data);
      }
    },
    fail: function(err) {
      console.log('地址信息请求失败:', err);
      failCallback && failCallback(err);
    }
  });
}

/**
 * 计算两点间距离（使用Haversine公式）
 * @param {Number} lat1 第一个点的纬度
 * @param {Number} lng1 第一个点的经度
 * @param {Number} lat2 第二个点的纬度
 * @param {Number} lng2 第二个点的经度
 * @returns {Number} 距离（公里）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // 参数验证
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    console.warn('距离计算参数不完整');
    return 0;
  }
  
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // 返回距离，保留1位小数
  return Math.round(distance * 10) / 10;
}

/**
 * 格式化距离显示
 * @param {Number} distance 距离（公里）
 * @returns {String} 格式化后的距离字符串
 */
function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance}km`;
  }
}

/**
 * 检查坐标是否有效
 * @param {Number} lat 纬度
 * @param {Number} lng 经度
 * @returns {Boolean} 是否有效
 */
function isValidCoordinate(lat, lng) {
  return lat && lng && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

module.exports = {
  getUserLocation,
  getAddressFromCoordinates,
  calculateDistance,
  formatDistance,
  isValidCoordinate
};
