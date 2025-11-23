# 收藏门店功能使用说明

## 功能概述

收藏门店功能允许用户收藏喜欢的门店，方便下次快速预订。功能包括：

- ✅ 查看收藏的门店列表
- ✅ 取消收藏门店
- ✅ 从收藏列表直接预订
- ✅ 长按显示操作菜单
- ✅ 下拉刷新
- ✅ 加载状态显示

## 后端接口

### 1. 获取收藏门店列表
```http
GET /member/user/getFavoriteStores
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "code": 0,
  "data": [
    {
      "storeId": 1,
      "storeName": "测试门店",
      "address": "北京市朝阳区",
      "status": 0,
      "createTime": "2024-01-01T10:00:00"
    }
  ]
}
```

### 2. 收藏门店
```http
POST /member/user/favoriteStore
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": 1
}
```

### 3. 取消收藏门店
```http
POST /member/user/unfavoriteStore
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": 1
}
```

## 前端使用

### 1. 在页面中引入收藏工具
```javascript
var favorite = require('../../utils/favorite');
```

### 2. 收藏门店
```javascript
favorite.favoriteStore(storeId, 
  function success() {
    console.log('收藏成功');
  },
  function fail() {
    console.log('收藏失败');
  }
);
```

### 3. 取消收藏门店
```javascript
favorite.unfavoriteStore(storeId,
  function success() {
    console.log('取消收藏成功');
  },
  function fail() {
    console.log('取消收藏失败');
  }
);
```

### 4. 检查收藏状态
```javascript
favorite.checkFavoriteStatus(storeId, function(isFavorited) {
  console.log('是否已收藏:', isFavorited);
});
```

## 页面文件说明

- `favorite.js` - 收藏页面逻辑
- `favorite.wxml` - 收藏页面模板
- `favorite.wxss` - 收藏页面样式
- `favorite.json` - 页面配置
- `../../utils/favorite.js` - 收藏工具函数

## 样式特点

- 现代化卡片设计
- 响应式布局
- 加载状态指示
- 空状态友好提示
- 长按操作菜单
- 平滑动画效果

## 注意事项

1. 需要用户登录才能使用收藏功能
2. 收藏状态会实时更新
3. 支持下拉刷新
4. 网络错误会有友好提示
5. 操作有防重复保护

