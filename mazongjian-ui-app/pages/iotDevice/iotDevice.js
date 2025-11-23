// pages/iotDevice/iotDevice.js
const app = getApp();

// 后端API基础地址
const BACKEND_BASE_URL = 'http://www.beibeiqitaishe.cn/device';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: "",
    titleBarHeight: "",
    // 设备信息
    deviceInfo: {},
    deviceStatus: 0, // 0-未激活 1-在线 3-离线 8-禁用
    deviceProperties: [],
    deviceTemplate: {},
    templateProperties: [],
    propertyValues: {},
    
    // 设备列表（新接口返回的数据）
    deviceList: [],
    currentPage: 1,
    pageSize: 20,
    totalDevices: 0,
    
    // 设备统计信息
    deviceStats: {
      total: 0,
      iotDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      iotOnlineDevices: 0,
      iotOfflineDevices: 0
    },
    
    
    // UI状态
    loading: false,
    refreshing: false,
    deviceListError: false,
    retryCount: 0,
    
    // 状态文本映射
    statusTextMap: {
      0: "未激活",
      1: "在线", 
      3: "离线",
      8: "禁用"
    },
    
    // 状态颜色映射
    statusColorMap: {
      0: "#999999",
      1: "#07c160",
      3: "#ff4d4f", 
      8: "#faad14"
    },
    // 控制开关状态
    chswt1On: false,
    chswt2On: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      statusBarHeight: wx.getStorageSync("statusBarHeight"),
      titleBarHeight: wx.getStorageSync("titleBarHeight"),
    });
    
    
    // 直接获取设备列表
    this.getDeviceList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
    this.getDeviceList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.refreshData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.activeTab === 1) {
      this.loadMoreDevices();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '物联网设备管理',
      path: '/pages/iotDevice/iotDevice'
    };
  },

  // ==================== API接口调用 ====================

  /**
   * 提取IoT设备信息
   */
  extractIoTDeviceInfo(deviceItem) {
    let productKey = '';
    let deviceName = '';
    let isValid = false;
    
    // 方法1: 从device_data中提取
    if (deviceItem.device_data && typeof deviceItem.device_data === 'object') {
      productKey = deviceItem.device_data.productKey || deviceItem.device_data.product_key || '';
      deviceName = deviceItem.device_data.deviceName || deviceItem.device_data.device_name || '';
    }
    
    // 方法2: 从device_sn解析
    if (!productKey || !deviceName) {
      const parsed = this.parseDeviceSn(deviceItem.device_sn);
      productKey = parsed.productKey;
      deviceName = parsed.deviceName;
    }
    
    // 验证是否有效
    isValid = !!(productKey && deviceName);
    
    return {
      productKey,
      deviceName,
      iotId: isValid ? `${productKey}:${deviceName}` : deviceItem.device_sn,
      isValid
    };
  },

  /**
   * 解析设备SN获取product_key和device_name
   */
  parseDeviceSn(deviceSn) {
    if (!deviceSn) return { productKey: '', deviceName: '' };
    
    // deviceSn格式: "product_key,device_name" 或 "product_key,device_name" 或单独的字符串
    const parts = deviceSn.split(',');
    if (parts.length >= 2) {
      return {
        productKey: parts[0].trim(),
        deviceName: parts[1].trim()
      };
    }
    
    // 如果没有逗号分隔，尝试其他解析方式
    // 这里可以根据实际情况调整解析逻辑
    return {
      productKey: deviceSn,
      deviceName: ''
    };
  },



  /**
   * 获取设备列表（主入口）
   */
  getDeviceList() {
    const { currentPage, pageSize } = this.data;
    
    console.log('开始获取设备列表...');
    this.setData({ loading: true });
    
    // 使用设备管理接口获取设备列表
    this.getDevicesFromAPI(currentPage, pageSize);
  },

  /**
   * 从设备管理API获取设备列表
   */
  getDevicesFromAPI(currentPage, pageSize) {
    wx.request({
      url: `${BACKEND_BASE_URL}/api/devices/`,
      method: 'GET',
      data: {
        page: currentPage,
        page_size: pageSize,
        type:14,
        include_deleted: false
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('设备列表响应:', res.data);
        if (res.data && res.data.code === 200) {
          const listRaw = res.data.data || [];
          
          // 处理设备数据，提取IoT设备信息
          const processedList = listRaw.map((item, index) => {
            // 解析IoT设备信息
            const iotInfo = this.extractIoTDeviceInfo(item);
            
            const deviceInfo = {
              // 设备管理字段
              deviceId: item.device_id,
              deviceSn: item.device_sn,
              status: item.status,
              type: item.type,
              rssi: item.rssi,
              share: item.share,
              roomId: item.room_id,
              storeId: item.store_id,
              tenantId: item.tenant_id,
              creator: item.creator,
              updater: item.updater,
              deleted: item.deleted,
              gmtModified: item.update_time || item.create_time,
              createTime: item.create_time,
              
              // IoT设备字段
              productKey: iotInfo.productKey,
              deviceName: iotInfo.deviceName,
              name: iotInfo.deviceName || item.device_sn,
              iotId: iotInfo.iotId,
              
              // 是否支持IoT管理
              isIoTDevice: iotInfo.isValid,
              
              // 原始数据
              rawDeviceData: item.device_data
            };
            return deviceInfo;
          });
          
          this.updateDeviceList(processedList, res.data.total || processedList.length);
        } else {
          // 设备管理接口失败，尝试备用方案
          console.log('设备管理接口失败，尝试备用方案');
          this.setData({ deviceListError: true });
          this.getFallbackDeviceList();
        }
      },
      fail: (err) => {
        console.error('设备管理接口请求失败:', err);
        this.setData({ deviceListError: true });
        // 设备管理接口失败，尝试备用方案
        this.getFallbackDeviceList();
      },
      complete: () => {
        this.setData({ 
          loading: false,
          refreshing: false 
        });
        wx.stopPullDownRefresh();
      }
    });
  },


  /**
   * 更新设备列表数据
   */
  updateDeviceList(processedList, total) {
    const { currentPage } = this.data;
    const newDeviceList = currentPage === 1 ? processedList : [...this.data.deviceList, ...processedList];
    
    // 统计IoT设备数量
    const iotDevices = newDeviceList.filter(device => device.isIoTDevice);
    const deviceStats = this.getDeviceStats(newDeviceList);
    
    console.log(`设备列表更新: 总设备${newDeviceList.length}个, IoT设备${iotDevices.length}个`);
    console.log('设备统计:', deviceStats);
    
    this.setData({
      deviceList: newDeviceList,
      totalDevices: total,
      deviceStats: deviceStats
    });
    
    // 检查是否有IoT设备
    if (newDeviceList.length > 0 && iotDevices.length === 0) {
      console.log('没有找到IoT设备');
      wx.showToast({
        title: '当前没有IoT设备',
        icon: 'none'
      });
    }
    
    this.setData({ 
      loading: false,
      refreshing: false 
    });
    wx.stopPullDownRefresh();
  },

  /**
   * 获取设备统计信息
   */
  getDeviceStats(deviceList) {
    const total = deviceList.length;
    const iotDevices = deviceList.filter(device => device.isIoTDevice);
    const onlineDevices = deviceList.filter(device => device.status === 1);
    const offlineDevices = deviceList.filter(device => device.status === 0);
    
    return {
      total,
      iotDevices: iotDevices.length,
      onlineDevices: onlineDevices.length,
      offlineDevices: offlineDevices.length,
      iotOnlineDevices: iotDevices.filter(device => device.status === 1).length,
      iotOfflineDevices: iotDevices.filter(device => device.status === 0).length
    };
  },



  // ==================== UI事件处理 ====================

  /**
   * 刷新数据
   */
  refreshData() {
    this.setData({ 
      refreshing: true,
      currentPage: 1,
      deviceList: [],
      totalDevices: 0,
      deviceListError: false
    });
    this.getDeviceList();
  },

  /**
   * 重试获取设备列表
   */
  retryGetDeviceList() {
    const { retryCount } = this.data;
    
    if (retryCount >= 3) {
      wx.showToast({
        title: '重试次数过多，请检查网络',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: `重试中...(${retryCount + 1}/3)`
    });
    
    // 重置分页和错误状态
    this.setData({ 
      currentPage: 1,
      deviceList: [],
      totalDevices: 0,
      deviceListError: false,
      retryCount: retryCount + 1
    });
    
    // 重新获取设备列表
    this.getDeviceList();
    
    setTimeout(() => {
      wx.hideLoading();
    }, 2000);
  },

  /**
   * 加载更多设备
   */
  loadMoreDevices() {
    if (this.data.loading) return;
    
    this.setData({ 
      loading: true,
      currentPage: this.data.currentPage + 1 
    });
    this.getDeviceList();
  },

  /**
   * 点击设备项
   */
  onDeviceItemClick(e) {
    console.log('点击设备项事件触发');
    
    const index = e.currentTarget.dataset.index;
    console.log('点击的设备索引:', index);
    
    const device = this.data.deviceList[index];
    console.log('点击的设备信息:', device);
    
    // 显示测试提示
    wx.showToast({
      title: '点击成功',
      icon: 'success',
      duration: 1000
    });
    
    if (device) {
      // 检查是否为有效的IoT设备
      if (!device.isIoTDevice) {
        wx.showToast({
          title: '该设备不支持IoT管理',
          icon: 'none'
        });
        return;
      }
      
      // 跳转到设备操作页面
      wx.navigateTo({
        url: `/pages/iotDeviceManage/iotDeviceOperation?deviceId=${device.deviceId}&productKey=${device.productKey}&deviceName=${device.deviceName}&deviceSn=${device.deviceSn}`
      });
    } else {
      wx.showToast({
        title: '设备信息错误',
        icon: 'none'
      });
    }
  },

  // ==================== 工具方法 ====================

  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return '未知';
    const date = new Date(timestamp);
    return date.toLocaleString();
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    return this.data.statusTextMap[status] || '未知';
  },

  /**
   * 获取状态颜色
   */
  getStatusColor(status) {
    return this.data.statusColorMap[status] || '#999999';
  }
});
