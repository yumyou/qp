// pages/iotDevice/iotDeviceOperation.js
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
    deviceId: '',
    productKey: '',
    deviceName: '',
    deviceSn: '',
    
    // 设备状态和属性
    deviceInfo: {},
    deviceStatus: 0,
    deviceProperties: [],
    deviceTemplate: {},
    templateProperties: [],
    propertyValues: {},
    
    // 控制开关状态
    chswt1On: false,
    chswt2On: false,
    
    // 历史数据
    historyData: [],
    historyStartTime: "",
    historyEndTime: "",
    historyStartTs: 0,
    historyEndTs: 0,
    minDate: 0,
    maxDate: 0,
    
    // 时间选择器
    showStartTimePicker: false,
    showEndTimePicker: false,
    
    // 属性设置
    propertyIdentifier: "",
    propertyValue: "",
    
    // enum 选择弹层
    showEnumPicker: false,
    enumPickerColumns: [],
    enumPickerIdentifier: '',
    
    // 属性选择弹层
    showPropertyPicker: false,
    propertyPickerColumns: [],
    
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
    
    // Loading状态
    loading: false,
    deviceInfoLoading: false,
    propertiesLoading: false,
    templateLoading: false,
    statusLoading: false,
    historyLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('设备操作页面参数:', options);
    
    this.setData({
      statusBarHeight: wx.getStorageSync("statusBarHeight"),
      titleBarHeight: wx.getStorageSync("titleBarHeight"),
      deviceId: options.deviceId || '',
      productKey: options.productKey || '',
      deviceName: options.deviceName || '',
      deviceSn: options.deviceSn || ''
    });
    
    // 初始化时间范围
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const minDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).getTime();
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).getTime();
    
    this.setData({
      historyStartTime: this.formatDate(oneDayAgo),
      historyEndTime: this.formatDate(now),
      historyStartTs: oneDayAgo.getTime(),
      historyEndTs: now.getTime(),
      minDate: minDate,
      maxDate: maxDate
    });
    
    // 加载设备数据
    this.loadDeviceData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新设备数据
    this.loadDeviceData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadDeviceData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'IoT设备操作',
      path: `/pages/iotDevice/iotDeviceOperation?deviceId=${this.data.deviceId}&productKey=${this.data.productKey}&deviceName=${this.data.deviceName}`
    };
  },

  // ==================== 设备数据加载 ====================

  /**
   * 加载设备数据
   */
  loadDeviceData() {
    const { productKey, deviceName } = this.data;
    
    if (!productKey || !deviceName) {
      wx.showToast({
        title: '设备参数不完整',
        icon: 'none'
      });
      return;
    }
    
    // 设置总体loading状态
    this.setData({ loading: true });
    
    // 并行加载设备信息、属性、模板
    Promise.all([
      this.getDeviceInfo(productKey, deviceName),
      this.getDeviceProperties(productKey, deviceName),
      this.getDeviceTemplate(productKey, deviceName),
      this.getDeviceStatus(productKey, deviceName)
    ]).finally(() => {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 刷新设备数据
   */
  refreshDeviceData() {
    wx.showLoading({ title: '刷新中...' });
    this.loadDeviceData();
    setTimeout(() => {
      wx.hideLoading();
    }, 1000);
  },

  // ==================== API接口调用 ====================

  /**
   * 获取设备基本信息
   */
  getDeviceInfo(productKey, deviceName) {
    return new Promise((resolve, reject) => {
      this.setData({ deviceInfoLoading: true });
      
      wx.request({
        url: `${BACKEND_BASE_URL}/device/info`,
        method: 'GET',
        data: {
          product_key: productKey,
          device_name: deviceName
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('设备信息响应:', res.data);
          if (res.data && res.data.code === 200) {
            this.setData({
              deviceInfo: res.data.data || {},
              deviceStatus: (res.data.data && res.data.data.status) || 0
            });
            resolve(res.data);
          } else {
            console.error('获取设备信息失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('获取设备信息失败:', err);
          reject(err);
        },
        complete: () => {
          this.setData({ deviceInfoLoading: false });
        }
      });
    });
  },

  /**
   * 获取设备的属性
   */
  getDeviceProperties(productKey, deviceName) {
    return new Promise((resolve, reject) => {
      this.setData({ propertiesLoading: true });
      
      wx.request({
        url: `${BACKEND_BASE_URL}/device/properties`,
        method: 'GET',
        data: {
          product_key: productKey,
          device_name: deviceName
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('设备属性响应:', res.data);
          if (res.data && res.data.code === 200) {
            this.setData({
              deviceProperties: res.data.data || []
            });
            // 将属性快照映射到可编辑值
            this.hydratePropertyValuesFromSnapshot();
            resolve(res.data);
          } else {
            console.error('获取设备属性失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('获取设备属性失败:', err);
          reject(err);
        },
        complete: () => {
          this.setData({ propertiesLoading: false });
        }
      });
    });
  },

  /**
   * 获取设备的属性模板
   */
  getDeviceTemplate(productKey, deviceName) {
    return new Promise((resolve, reject) => {
      this.setData({ templateLoading: true });
      
      wx.request({
        url: `${BACKEND_BASE_URL}/device/tsl`,
        method: 'GET',
        data: {
          product_key: productKey,
          device_name: deviceName
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('设备模板响应:', res.data);
          if (res.data) {
            const template = res.data || {};
            const props = Array.isArray(template.properties) ? template.properties : [];
            this.setData({
              deviceTemplate: template,
              templateProperties: props
            });
            resolve(res.data);
          } else {
            console.error('获取设备模板失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('获取设备模板失败:', err);
          reject(err);
        },
        complete: () => {
          this.setData({ templateLoading: false });
        }
      });
    });
  },

  /**
   * 获取设备状态
   */
  getDeviceStatus(productKey, deviceName) {
    return new Promise((resolve, reject) => {
      this.setData({ statusLoading: true });
      
      wx.request({
        url: `${BACKEND_BASE_URL}/device/status`,
        method: 'GET',
        data: {
          product_key: productKey,
          device_name: deviceName
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('设备状态响应:', res.data);
          if (res.data && res.data.code === 200) {
            this.setData({
              deviceStatus: (res.data.data && res.data.data.status) || 0
            });
            resolve(res.data);
          } else {
            console.error('获取设备状态失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('获取设备状态失败:', err);
          reject(err);
        },
        complete: () => {
          this.setData({ statusLoading: false });
        }
      });
    });
  },

  // ==================== 属性处理 ====================

  /**
   * 将属性快照映射到可编辑值
   */
  hydratePropertyValuesFromSnapshot() {
    const values = {};
    const snapshot = this.data.deviceProperties || [];
    snapshot.forEach(item => {
      if (item && item.attribute !== undefined) {
        values[item.attribute] = item.value;
        
        // 同步开关状态到预设开关变量
        if (item.attribute === 'CHSWT1') {
          this.setData({ chswt1On: item.value == '1' || item.value == 1 || item.value === true });
        } else if (item.attribute === 'CHSWT2') {
          this.setData({ chswt2On: item.value == '1' || item.value == 1 || item.value === true });
        }
      }
    });
    this.setData({ propertyValues: values });
  },

  /**
   * 改变布尔/数值/文本值
   */
  onChangePropertyInput(e) {
    const identifier = e.currentTarget.dataset.identifier;
    const value = e.detail && (e.detail.value !== undefined ? e.detail.value : e.detail);
    const propertyValues = { ...this.data.propertyValues };
    propertyValues[identifier] = value;
    this.setData({ propertyValues });
    console.log('属性值已更新:', identifier, value);
  },

  /**
   * 布尔开关（保存为 1/0 字符串）
   */
  onChangePropertySwitch(e) {
    const identifier = e.currentTarget.dataset.identifier;
    const raw = e.detail && (e.detail.value !== undefined ? e.detail.value : e.detail);
    const isOn = !!raw;
    const propertyValues = { ...this.data.propertyValues };
    propertyValues[identifier] = isOn ? '1' : '0';
    this.setData({ propertyValues });
    
    // 自动调用接口设置属性
    this.setDeviceProperty(identifier, isOn ? '1' : '0');
  },

  /**
   * 设置设备属性
   */
  setDeviceProperty(identifier, value) {
    const { productKey, deviceName } = this.data;
    
    if (!productKey || !deviceName) {
      wx.showToast({
        title: '设备参数不完整',
        icon: 'none'
      });
      return;
    }
    
    console.log('开始设置设备属性:', identifier, value);
    
    wx.request({
      url: `${BACKEND_BASE_URL}/device/property/set`,
      method: 'POST',
      data: {
        identifier: identifier,
        value: String(value),
        product_key: productKey,
        device_name: deviceName
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('设置属性响应:', res.data);
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          });
          // 重新获取设备属性
          setTimeout(() => {
            this.getDeviceProperties(productKey, deviceName);
          }, 1000);
        } else {
          wx.showToast({
            title: res.data?.message || '设置失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        console.error('设置设备属性失败:', err);
      }
    });
  },

  // ==================== 设备控制 ====================

  /**
   * 主开关控制
   */
  onDeviceMainSwitch(e) {
    const isOn = e.detail;
    
    console.log('主开关控制:', isOn);
    const v = isOn ? '1' : '0';
    // 同时下发两路开关
    this.setDeviceProperty('CHSWT1', v);
    this.setDeviceProperty('CHSWT2', v);
    
    wx.showToast({
      title: isOn ? '正在开启设备...' : '正在关闭设备...',
      icon: 'loading',
      duration: 2000
    });
    
    // 延迟刷新设备状态和属性
    setTimeout(() => {
      this.getDeviceStatus(this.data.productKey, this.data.deviceName);
      this.getDeviceProperties(this.data.productKey, this.data.deviceName);
    }, 2000);
  },

  /**
   * 开关1控制
   */
  onToggleChswt1(e) {
    const isOn = e.detail;
    this.setData({ chswt1On: isOn });
    const v = isOn ? '1' : '0';
    this.setDeviceProperty('CHSWT1', v);
  },

  /**
   * 开关2控制
   */
  onToggleChswt2(e) {
    const isOn = e.detail;
    this.setData({ chswt2On: isOn });
    const v = isOn ? '1' : '0';
    this.setDeviceProperty('CHSWT2', v);
  },

  // ==================== 枚举选择 ====================

  /**
   * 打开枚举选择
   */
  openEnumPicker(e) {
    const identifier = e.currentTarget.dataset.identifier;
    const item = (this.data.templateProperties || []).find(p => p.identifier === identifier);
    if (!item) return;
    const specs = (item.dataType && item.dataType.specs) || {};
    const columns = Object.keys(specs).map(k => ({ text: specs[k], value: k }));
    this.setData({
      showEnumPicker: true,
      enumPickerColumns: [columns],
      enumPickerIdentifier: identifier
    });
  },

  /**
   * 选择枚举值
   */
  onEnumConfirm(e) {
    const selected = e.detail && e.detail.value ? e.detail.value[0] : null;
    const identifier = this.data.enumPickerIdentifier;
    if (!identifier || !selected) {
      this.setData({ showEnumPicker: false });
      return;
    }
    const propertyValues = { ...this.data.propertyValues };
    propertyValues[identifier] = selected.value;
    this.setData({ propertyValues, showEnumPicker: false, enumPickerIdentifier: '', enumPickerColumns: [] });
    console.log('枚举值已选择:', identifier, selected.value);
  },

  onEnumCancel() {
    this.setData({ showEnumPicker: false, enumPickerIdentifier: '', enumPickerColumns: [] });
  },

  // ==================== 属性设置 ====================

  /**
   * 批量设置所有可写属性
   */
  onSubmitAllProperties() {
    let propertiesToSet = [];
    
    if (this.data.templateProperties && this.data.templateProperties.length > 0) {
      propertiesToSet = this.data.templateProperties.filter(p => (p.accessMode || '').includes('w'));
    } else {
      propertiesToSet = (this.data.deviceProperties || []).map(item => ({
        identifier: item.attribute,
        name: item.attribute
      }));
    }
    
    if (propertiesToSet.length === 0) {
      wx.showToast({ title: '无可设置属性', icon: 'none' });
      return;
    }
    
    console.log('开始批量设置属性，可写属性数量:', propertiesToSet.length);
    
    let successCount = 0;
    let totalCount = 0;
    
    propertiesToSet.forEach(prop => {
      const identifier = prop.identifier;
      const value = this.data.propertyValues[identifier];
      if (value === undefined) return;
      
      totalCount++;
      console.log('批量设置属性:', identifier, value);
      
      setTimeout(() => {
        this.setDeviceProperty(identifier, value);
        successCount++;
        if (successCount === totalCount) {
          wx.showToast({ title: `批量设置完成，共${totalCount}个属性`, icon: 'success' });
        }
      }, totalCount * 100);
    });
    
    if (totalCount === 0) {
      wx.showToast({ title: '没有可设置的属性值', icon: 'none' });
    }
  },

  /**
   * 单个下发当前属性
   */
  onSubmitSingleProperty(e) {
    const identifier = e.currentTarget.dataset.identifier;
    if (!identifier) {
      console.log('未找到属性标识符');
      return;
    }
    const value = this.data.propertyValues[identifier];
    console.log('准备下发属性:', identifier, value);
    if (value === undefined) {
      wx.showToast({ title: '请先填写或选择属性值', icon: 'none' });
      return;
    }
    this.setDeviceProperty(identifier, value);
  },

  /**
   * 设置设备属性
   */
  onSetProperty() {
    const { propertyIdentifier, propertyValue } = this.data;
    
    if (!propertyIdentifier || propertyValue === '') {
      wx.showToast({
        title: '请填写完整的属性信息',
        icon: 'none'
      });
      return;
    }
    
    this.setDeviceProperty(propertyIdentifier, propertyValue);
  },

  /**
   * 属性标识符输入
   */
  onPropertyIdentifierInput(e) {
    this.setData({
      propertyIdentifier: e.detail.value
    });
  },

  /**
   * 属性值输入
   */
  onPropertyValueInput(e) {
    this.setData({
      propertyValue: e.detail.value
    });
  },

  // ==================== 历史数据 ====================

  /**
   * 获取设备属性值的历史数据
   */
  getHistoryData() {
    const { historyStartTs, historyEndTs, propertyIdentifier, productKey, deviceName } = this.data;
    
    if (!propertyIdentifier) {
      wx.showToast({
        title: '请选择属性',
        icon: 'none'
      });
      return;
    }
    
    if (!productKey || !deviceName) {
      wx.showToast({
        title: '设备参数不完整',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ historyLoading: true });
    
    const startTime = Math.floor(historyStartTs / 1000);
    const endTime = Math.floor(historyEndTs / 1000);
    
    wx.request({
      url: `${BACKEND_BASE_URL}/device/property/history`,
      method: 'GET',
      data: {
        identifier: propertyIdentifier,
        start: startTime,
        end: endTime,
        page_size: 200,
        ordered: true,
        product_key: productKey,
        device_name: deviceName
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('历史数据响应:', res.data);
        if (res.data && res.data.code === 200) {
          const items = (res.data.data && res.data.data.items) || [];
          this.setData({
            historyData: items
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取历史数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        console.error('获取历史数据失败:', err);
      },
      complete: () => {
        this.setData({ historyLoading: false });
      }
    });
  },

  /**
   * 查询历史数据
   */
  onQueryHistory() {
    this.getHistoryData();
  },

  // ==================== 时间选择 ====================

  /**
   * 开始时间选择
   */
  onStartTimeChange() {
    this.setData({
      showStartTimePicker: true
    });
  },

  /**
   * 结束时间选择
   */
  onEndTimeChange() {
    this.setData({
      showEndTimePicker: true
    });
  },

  /**
   * 开始时间确认
   */
  onStartTimeConfirm(e) {
    const ts = typeof e.detail === 'number' ? e.detail : (e.detail?.value || e.detail);
    const date = new Date(ts);
    this.setData({
      historyStartTime: this.formatDate(date),
      historyStartTs: date.getTime(),
      showStartTimePicker: false
    });
  },

  /**
   * 结束时间确认
   */
  onEndTimeConfirm(e) {
    const ts = typeof e.detail === 'number' ? e.detail : (e.detail?.value || e.detail);
    const date = new Date(ts);
    this.setData({
      historyEndTime: this.formatDate(date),
      historyEndTs: date.getTime(),
      showEndTimePicker: false
    });
  },

  /**
   * 关闭开始时间选择器
   */
  onStartTimePickerClose() {
    this.setData({
      showStartTimePicker: false
    });
  },

  /**
   * 关闭结束时间选择器
   */
  onEndTimePickerClose() {
    this.setData({
      showEndTimePicker: false
    });
  },

  // ==================== 属性选择 ====================

  /**
   * 打开属性选择器
   */
  onOpenPropertySelector() {
    const properties = this.data.templateProperties || [];
    const columns = [properties.map(p => ({ text: `${p.name}(${p.identifier})`, value: p.identifier }))];
    this.setData({
      showPropertyPicker: true,
      propertyPickerColumns: columns
    });
  },

  /**
   * 确认属性选择
   */
  onPropertyConfirm(e) {
    const selected = e.detail && e.detail.value ? e.detail.value[0] : null;
    if (selected) {
      this.setData({
        propertyIdentifier: selected.value,
        showPropertyPicker: false
      });
    }
  },

  /**
   * 取消属性选择
   */
  onPropertyCancel() {
    this.setData({
      showPropertyPicker: false
    });
  },

  // ==================== 工具方法 ====================

  /**
   * 格式化日期
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

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
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  }
});
