# 位置功能增强说明

## 功能概述

本次更新为小程序添加了完整的位置功能，包括：
- 获取用户真实位置信息
- 通过经纬度解析真实地址
- 精确计算门店距离
- 智能距离格式化显示

## 新增文件

### 1. utils/location.js
位置相关工具函数库，包含：
- `getUserLocation()` - 获取用户位置
- `getAddressFromCoordinates()` - 逆地理编码获取地址
- `calculateDistance()` - 计算两点间距离
- `formatDistance()` - 格式化距离显示
- `isValidCoordinate()` - 验证坐标有效性

### 2. pages/example/locationTest.*
位置功能测试页面，用于验证各项功能是否正常工作。

## 主要功能

### 1. 获取用户位置
```javascript
location.getUserLocation(
  function(res) {
    // 成功回调
    console.log('用户位置:', res.latitude, res.longitude);
  },
  function(err) {
    // 失败回调
    console.log('获取位置失败:', err);
  }
);
```

### 2. 地址解析
```javascript
location.getAddressFromCoordinates(
  lat, lng,
  function(addressInfo) {
    // 成功回调
    console.log('地址:', addressInfo.address);
    console.log('城市:', addressInfo.address_component.city);
  },
  function(err) {
    // 失败回调
    console.log('地址解析失败:', err);
  }
);
```

### 3. 距离计算
```javascript
const distance = location.calculateDistance(
  userLat, userLng,    // 用户位置
  storeLat, storeLng   // 门店位置
);
console.log('距离:', distance, '公里');
```

### 4. 距离格式化
```javascript
const distanceText = location.formatDistance(0.5);  // "500m"
const distanceText2 = location.formatDistance(1.2); // "1.2km"
```

## 在index.js中的集成

### 数据字段新增
```javascript
data: {
  // 新增位置相关字段
  userLat: null,        // 用户纬度
  userLng: null,        // 用户经度
  userAddress: '',      // 用户地址
  userCity: '',         // 用户城市
  userDistrict: '',     // 用户区县
}
```

### 核心方法
1. `getUserLocationAndCalculateDistance()` - 获取位置并计算距离
2. `calculateDistanceToStores()` - 计算与门店的距离
3. `calculateDistanceToRooms()` - 计算与房间的距离

### 自动调用
在`onShow()`生命周期中自动调用位置获取功能：
```javascript
onShow() {
  // ... 其他代码
  // 获取用户位置并计算距离
  this.getUserLocationAndCalculateDistance();
}
```

## 权限处理

### 位置权限检查
- 自动检查用户是否授权位置权限
- 未授权时引导用户到设置页面开启权限
- 提供友好的权限申请提示

### 错误处理
- 位置获取失败时的降级处理
- 网络请求失败的重试机制
- 用户友好的错误提示

## 距离计算算法

使用Haversine公式计算球面距离：
```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## 腾讯地图API配置

### API Key配置
在`utils/location.js`中配置你的腾讯地图API Key：
```javascript
key: 'YOUR_TENCENT_MAP_API_KEY'
```

### 域名配置
在小程序后台配置以下域名：
- `https://apis.map.qq.com`

## 使用示例

### 1. 基本使用
```javascript
// 获取位置
location.getUserLocation(
  function(res) {
    console.log('位置获取成功');
  },
  function(err) {
    console.log('位置获取失败');
  }
);
```

### 2. 完整流程
```javascript
// 1. 获取用户位置
location.getUserLocation(
  function(locationRes) {
    // 2. 解析地址
    location.getAddressFromCoordinates(
      locationRes.latitude, locationRes.longitude,
      function(addressRes) {
        console.log('地址:', addressRes.address);
        
        // 3. 计算距离
        const distance = location.calculateDistance(
          locationRes.latitude, locationRes.longitude,
          storeLat, storeLng
        );
        console.log('距离:', location.formatDistance(distance));
      }
    );
  }
);
```

## 测试页面

访问 `pages/example/locationTest` 页面可以测试所有位置功能：
- 获取用户位置
- 地址解析
- 距离计算
- 坐标验证

## 注意事项

1. **API Key安全**: 请妥善保管腾讯地图API Key，避免泄露
2. **权限申请**: 确保在小程序配置中申请位置权限
3. **网络域名**: 配置腾讯地图API的域名白名单
4. **性能优化**: 避免频繁调用位置API，建议缓存位置信息
5. **错误处理**: 做好网络异常和权限拒绝的处理

## 更新日志

- ✅ 添加位置获取功能
- ✅ 集成腾讯地图逆地理编码API
- ✅ 实现精确距离计算
- ✅ 添加权限处理和错误处理
- ✅ 创建测试页面验证功能
- ✅ 优化距离显示格式
