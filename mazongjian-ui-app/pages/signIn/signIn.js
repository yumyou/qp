// pages/signIn/signIn.js
const app = getApp();
var http = require('../../utils/http');

Page({
  data: {
    // 用户签到信息
    signInInfo: {
      consecutiveDays: 2, // 连续签到天数
      totalPoints: 20, // 总积分
      todaySigned: false // 今日是否已签到
    },
    // 积分明细列表
    pointsList: [

    ],
    // 加载状态
    loading: false
  },

  onLoad: function (options) {
    this.getSignInInfo();
    this.getPointsRecords();
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.getSignInInfo();
    this.getPointsRecords();
  },

  // 获取签到信息
  getSignInInfo() {
    const that = this;
    that.setData({
      loading: true
    });

    // 获取当前门店ID（从全局数据或页面参数中获取）
    const storeId = wx.getStorageSync('global_store_id') || 1; // 默认门店ID为1

    // 使用统一的http工具类
    http.request(
      '/member/signin/info',
      '1',
      'GET',
      { storeId: storeId },
      app.globalData.userDatatoken.accessToken,
      '获取签到信息中...',
      function success(res) {
        if (res.code === 0) {
          const signInInfo = {
            consecutiveDays: res.data.consecutiveDays,
            totalPoints: res.data.totalPoints,
            todaySigned: res.data.todaySigned
          };
          that.setData({
            signInInfo,
            loading: false
          });
        } else {
          wx.showToast({
            title: res.msg || '获取签到信息失败',
            icon: 'none'
          });
          that.setData({
            loading: false
          });
        }
      },
      function fail() {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        that.setData({
          loading: false
        });
      }
    );
  },

  // 执行签到
  doSignIn() {
    const that = this;
    
    if (that.data.signInInfo.todaySigned) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    that.setData({
      loading: true
    });

    // 获取当前门店ID
    const storeId = wx.getStorageSync('global_store_id') || 1; // 默认门店ID为1

    // 使用统一的http工具类
    http.request(
      '/member/signin/do?storeId=' + storeId,
      '1',
      'POST',
      {},
      app.globalData.userDatatoken.accessToken,
      '签到中...',
      function success(res) {
        if (res.code === 0) {
          const data = res.data;
          
          // 添加新的积分记录
          const newPointsRecord = {
            id: Date.now(),
            title: data.description || `连续${data.consecutiveDays}天签到`,
            date: new Date().toISOString().split('T')[0],
            points: data.pointsEarned,
            type: 'signin',
            totalPoints: data.totalPoints
          };

          that.setData({
            'signInInfo.consecutiveDays': data.consecutiveDays,
            'signInInfo.totalPoints': data.totalPoints,
            'signInInfo.todaySigned': true,
            pointsList: [newPointsRecord, ...that.data.pointsList],
            loading: false
          });

          wx.showToast({
            title: `签到成功，获得${data.pointsEarned}积分`,
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.msg || '签到失败',
            icon: 'none'
          });
          that.setData({
            loading: false
          });
        }
      },
      function fail() {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        that.setData({
          loading: false
        });
      }
    );
  },

  // 获取积分记录
  getPointsRecords() {
    const that = this;
    
    // 使用统一的http工具类
    http.request(
      '/member/signin/points/records',
      '1',
      'GET',
      { limit: 20 },
      app.globalData.userDatatoken.accessToken,
      '',
      function success(res) {
        if (res.code === 0) {
          const pointsList = res.data.map(item => {
            // 格式化时间戳为日期字符串
            const date = new Date(item.createTime);
            const formattedDate = date.getFullYear() + '-' + 
              String(date.getMonth() + 1).padStart(2, '0') + '-' + 
              String(date.getDate()).padStart(2, '0');
            
            return {
              id: item.id,
              title: item.description,
              date: formattedDate,
              points: item.points,
              type: item.sourceType.toLowerCase(),
              totalPoints: item.totalPoints
            };
          });
          
          that.setData({
            pointsList
          });
        }
      },
      function fail() {
        console.log('获取积分记录失败');
      }
    );
  },

  // 查看积分规则
  viewPointsRules() {
    wx.showModal({
      title: '积分规则',
      content: '1. 每日签到可获得10积分\n2. 连续2天签到奖励15积分\n3. 连续3天签到奖励20积分\n4. 连续7天签到奖励50积分\n5. 连续15天签到奖励100积分\n6. 连续30天签到奖励200积分\n7. 积分可用于抵扣消费\n8. 积分永久有效',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
}); 