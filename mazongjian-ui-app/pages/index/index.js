// pages/index/index.js
const app = getApp();
var http = require('../../utils/http');
var util1 = require('../../utils/util.js');
var favorite = require('../../utils/favorite');
var location = require('../../utils/location');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: '',
    titleBarHeight: '',
    storeId:'',
    storeEnvImg:[],//图片数组
    bannerImg:[],//banner
    doorinfodata:{},//门店信息
    storeList:[],//门店数组
    filteredStoreList:[],//筛选后的门店数组
    currentFilter: 'billiards',//当前筛选类型
    isLogin: (app && app.globalData) ? app.globalData.isLogin : false,
    popshow: false,
    wifiShow: false,
    simpleModel: '',//简洁模式
    maoHeight:0,//锚链接跳转高度
    businessHours: '00:00-24:00', // 营业时间
    // 新增位置相关字段
    userLat: null, // 用户纬度
    userLng: null, // 用户经度
    userAddress: '', // 用户地址
    userCity: '', // 用户城市
    userDistrict: '', // 用户区县
    longShowPopup: false, // 是否已经显示过弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      isLogin: app.globalData.isLogin,
    })
    console.log("onLoad index");
    var that = this;
    that.getTap();
    console.log(options);
    var storeId='';
    if(options.storeId){
      storeId=options.storeId;
    }
    this.setData({
      longShowPopup: wx.getStorageSync('longShowPopup'),
    });
    if(this.data.longShowPopup){
      wx.setStorageSync('longShowPopup', true);
      this.setData({
        longShowPopup: true,
      })
    }
    // 从本地存储获取筛选状态，如果没有则使用默认值
    let savedFilter = wx.getStorageSync('currentFilter');
    if (!savedFilter) {
      // 首次进入时默认选择台球
      savedFilter = 'billiards';
      wx.setStorageSync('currentFilter', savedFilter);
    }
    
    that.setData({
      currentFilter: savedFilter
    });
    
    that.filterStores(savedFilter);
    var query=wx.getEnterOptionsSync().query;
    console.log(query);
    if(query&&query.storeId){
      storeId=query.storeId;
    }
    if(storeId){
      that.setData({
        storeId: storeId
       });
       wx.setStorageSync('global_store_id',storeId);
    }
   },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("onShow index");
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    var that = this;
    that.setData({
      isLogin: app.globalData.isLogin,
    })
    var popshow=false;//默认不显示广告
    //尝试从缓存获取
    var storeId_1 = wx.getStorageSync('global_store_id');
    var storeId_2 = that.data.storeId;//页面的
    console.log('storeId_1='+storeId_1)
    console.log('storeId_2='+storeId_2)
    //如果两个都是空的，让用户去选择门店
    
    if(!storeId_1&&!storeId_2){
      console.log("未获取到门店id")
      wx.navigateTo({
        url: "../doorList/doorList",
      })
    }else{
      //至少有一个不为空
      //只处理不相等的情况，控制显示公告弹窗，相等的情况说明停留在当前门店
      if(storeId_1!=storeId_2){
        popshow=true
        if(!storeId_1){
          //如果缓存为空，可能是用户第一次扫码那就以扫码的为准
          that.setData({
            storeId: storeId_2
          })
        }else{
          //缓存有  页面也有 优先缓存
          that.setData({
            storeId: storeId_1
          })
        }
      }
    }

    console.log('最终的门店id:'+that.data.storeId)
    if(that.data.storeId){
      that.loadingtime();
      that.getStoreInfodata();
      that.setData({
        popshow: popshow
      })
    }
    // 获取门店列表数据
    this.getStoreListData();
    // 使用保存的筛选状态，如果没有则使用默认值
    let savedFilter = wx.getStorageSync('currentFilter') || 'billiards';
    this.filterStores(savedFilter);
    // 获取用户位置并计算距离
    this.getUserLocationAndCalculateDistance();
  },
  popClose:function(){
    this.setData({popshow: false})
  },
  loadingtime:function(){
    var that = this;
    var date = new Date(); //获取当前时间
    var year = date.getFullYear(); //获取当前年份
    var month = date.getMonth() + 1; //获取当前月份
    var day = date.getDate(); //获取当前日期    
    var atimestring = year+'-'+month+'-'+day
    var atimestring1 = [year, month, day].map(util1.formatNumber).join('-')
    //console.log('atimestring1===11111');
    //console.log(atimestring1);

    var atimelist = that.getDates(5,atimestring1);
    var alist1=[];
    var alist2=[];
    for(var i=0;i<atimelist.length;i++){
      alist1.push(atimelist[i].month+'.'+atimelist[i].day)
      alist2.push(atimelist[i].week)
    }
    that.setData({
      timeDayArr: alist1,
      timeWeekArr: alist2
    })
  },
    //获取当前时间多少天后的日期和对应星期
    getDates:function(days,todate) {//todate默认参数是当前日期，可以传入对应时间
      var dateArry = [];
      for (var i = 0; i < days; i++) {
        var dateObj = this.dateLater(todate, i);
        dateArry.push(dateObj)
      }
      return dateArry;
    },
    /**
     * 传入时间后几天
     * param：传入时间：dates:"2019-04-12",later:往后多少天
     */
    dateLater:function(dates, later) {
      let dateObj = {};
      let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
      let date = new Date(dates);
      date.setDate(date.getDate() + later);
      let day = date.getDay();
      dateObj.year = date.getFullYear();
      dateObj.month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth()+1);
      dateObj.day = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
      
      dateObj.week = show_day[day];
      return dateObj;
    },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    
  },
  getTap(){
    const SelectorQuery = wx.createSelectorQuery();
    SelectorQuery.select('#toolbar').boundingClientRect();
    SelectorQuery.exec(res=>{
     this.setData({maoHeight:res[0].bottom+200})
    })
 },
  showWifi(){
    this.setData({
      wifiShow: true
    })
  },
 
  goTencentMap(e){
    var store = e.currentTarget.dataset.info
    this.goMap(store)
  },
  //续费
  onclickxufei:function(){
    wx.showToast({
      title: '未找到订单',
      icon: 'none'
    })
  },
  // 打开地图
  goMap(store) {
    let that = this
    wx.openLocation({
      latitude: store.lat,
      longitude: store.lon,
      name: store.storeName,
      address: store.address,
      scale: 28
    })
  },

  
  goYuyue(){
    wx.navigateTo({
      url: `/pages/booking/booking?storeId=${this.data.storeId}`
    })
  },
  goIndexPage(){
    console.log(this.data.storeId)
    wx.navigateTo({
        url: '/pages/doorList/doorList?storeId='+this.data.storeId,
    })
  },
  goDoorDetail(){
    var that = this;
    wx.navigateTo({
      url: '../doorDetail/doorDetail?storeId='+that.data.storeId,
    })
  },
  tempArr:function(key){
    Object.keys(aobject.disabledTimeSlot).sort().forEach(function(key){
      requestArr.push(key + '=' + aobject.disabledTimeSlot[key]);
    });
  },
  goOrder(e){
      var that = this;
      let status = e.currentTarget.dataset.status;
      if(status == 0){
        return
      }
      let aroomid = e.currentTarget.dataset.info;
      var atime = '';
      if(that.data.timeselectindex >= 0)
        atime = that.data.timeDayArr[that.data.timeselectindex];
      var storeId = that.data.storeId
      if(status == 2){
        if(that.data.doorinfodata.clearOpen){
          wx.showModal({
            title: '提示',
            content: '您选择的此场地暂未清洁，介意请勿预订！',
            confirmText: '继续预定',
            complete: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../orderSubmit/orderSubmit?roomId='+aroomid+'&daytime='+atime+'&storeId='+storeId+'&timeselectindex='+that.data.timeselectindex,
                })
              } else if (res.cancel) {
                //console.log('用户点击取消')
              }
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '房间暂未清洁，禁止预订！',
            showCancel: false
          })
        }
      }else{
        wx.navigateTo({
          url: '../orderSubmit/orderSubmit?roomId='+aroomid+'&daytime='+atime+'&storeId='+storeId+'&timeselectindex='+that.data.timeselectindex,
        })
      }
  },
  phone:function(e){
    var that = this;
    //console.log('手机号码授权+++++++');
    if(e.detail.errMsg=="getPhoneNumber:fail user deny"){
      wx.showToast({title: '已取消授权'})
    }
    if(e.detail.errMsg=="getPhoneNumber:ok"){
      //console.log('手机号码授权+++++++');
      wx.login({
        success: function(res) {
            if (res.code != null) {
              http.request(
                "/member/auth/weixin-mini-app-login",
                "1",
                "post", {
                  "phoneCode": e.detail.code,
                  "loginCode": res.code
                },
                "",
                "获取中...",
                function success(info) {
                  console.info('返回111===');
                  console.info(info);
                  if (info.code == 0) {
                      if(info.data){
                        app.globalData.userDatatoken = info.data;
                        app.globalData.isLogin=true;
                        that.setData({
                          isLogin:true,
                        })
                        //缓存服务器返回的用户信息
                        wx.setStorageSync("userDatatoken", info.data);
                        this.goOrder(e);
                      }
                  }
                },
                function fail(info) {
                  
                }
              )
            } else {
              //console.log('登录失败！' + res.errMsg)
            }
          }
        })
    }
  },
  //获取房间列表数据
  getDoorListdata:function(e){
    var that = this;
    if (that.data.storeId) 
    {
      http.request(
        "/member/index/getRoomInfoList",
        "1",
        "post", {
          "storeId": that.data.storeId,
          "roomClass": that.data.tabIndex,
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('返回111===');
          console.info(info);
          if (info.code == 0) {
            that.setData({
              doorlistArr: info.data
            });
            that.setroomlistHour(0);
          }else{
            wx.showModal({
              content: '请求服务异常，请稍后重试',
              showCancel: false,
            })
          }
        },
        function fail(info) {
          
        }
      )
    } 
  },
  //设置列表禁用时间轴
  setroomlistHour:function(aindex){
    //aindex代表选的第几天  从0开始
    var that = this;
    console.log(aindex);
    var atemplist = []; 
      //根据门店循环
    for(var i = 0;i<that.data.doorlistArr.length;i++)
    {
        var atemp = that.data.doorlistArr[i].timeSlot.slice(aindex*24,aindex*24+24);
        atemplist.push(atemp);
        // console.log(atemp);
    }
    console.log(atemplist);
    that.setData({
      timeHourAllArr: atemplist
     });
  },
  //获取门店相信信息
  getStoreInfodata:function(e){
    var that = this;
    //if (app.globalData.isLogin) 
    {
      http.request(
        "/member/index/getStoreInfo"+'/'+that.data.storeId,
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('门店信息===');
          // console.info(info);
          if (info.code == 0) {
            if(null!=info.data){
              that.setData({
                doorinfodata: info.data,
                simpleModel: info.data.simpleModel
              });
              if(null!=info.data.storeEnvImg &&info.data.storeEnvImg.length>0){
                var arr=info.data.storeEnvImg.split(",");
                that.setData({
                  storeEnvImg: arr
                });
              }
              if(null!=info.data.bannerImg &&info.data.bannerImg.length>0){
                var arr=info.data.bannerImg.split(",");
                that.setData({
                  bannerImg: arr
                });
              }
              //增加房间类别的筛选条件
            if(null!=info.data.roomClassList&&info.data.roomClassList.length>0){
              const classArr=[];
              info.data.roomClassList.forEach(e=>{
                if(e===0){
                  classArr.push( { text: '棋牌', value: 0});
                }else if(e===1){
                  classArr.push( { text: '台球', value: 1});
                }else if(e===2){
                  classArr.push( { text: '自习室', value: 2});
                }
              });
              that.setData({
                roomClass: classArr
              });
            }
            }else{
              wx.navigateTo({
                url: "../doorList/doorList",
              })
            }
          }else{
            wx.showModal({
              content: '请求服务异常，请稍后重试',
              showCancel: false,
            })
            wx.navigateTo({
              url: "../doorList/doorList",
            })
          }
        },
        function fail(info) {
        }
      )
    } 
  },
  call:function () {
    let that = this;
    var phoneLength=that.data.doorinfodata.kefuPhone.length;
    if(phoneLength>0){
      if(phoneLength==11){
          wx.makePhoneCall({
            phoneNumber:that.data.doorinfodata.kefuPhone,
            success:function () {
              //console.log("拨打电话成功！")
            },
            fail:function () {
              //console.log("拨打电话失败！")
            }
          })
      }else{
        wx.showModal({
          title: '提示',
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：'+that.data.doorinfodata.kefuPhone,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: that.data.doorinfodata.kefuPhone,
                success: function (res) {
                    wx.showToast({ title: '微信号已复制到剪贴板！' })
                }
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      }
    }
  },
  //选中时间
  selectTime:function(e){
    let that = this
    var index = e.currentTarget.dataset.index//获取当前点击的下标
    that.setData({
      timeselectindex: index
    });
    that.setroomlistHour(index);
  },
  // 拨打电话
  makePhoneCall() {
    let that = this;
    var phoneLength = that.data.doorinfodata.kefuPhone.length;
    if(phoneLength > 0){
      if(phoneLength == 11){
        wx.makePhoneCall({
          phoneNumber: that.data.doorinfodata.kefuPhone,
          success: function () {
            console.log("拨打电话成功！")
          },
          fail: function () {
            console.log("拨打电话失败！")
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看"使用帮助"！\r\n本店客服微信号：'+that.data.doorinfodata.kefuPhone,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: that.data.doorinfodata.kefuPhone,
                success: function (res) {
                  wx.showToast({ title: '微信号已复制到剪贴板！' })
                }
              })
            }
          }
        })
      }
    }
  },
  // 切换门店
  switchStore() {
    wx.navigateTo({
      url: '../doorList/doorList',
    })
  },
  goGetBalance(){
    wx.navigateTo({
      url: '../getBalance/getBalance',
    })
  },    
  //充值
  goRecharge(){
    var that = this;
    var storeId = that.data.storeId
    if(that.data.isLogin){
      wx.navigateTo({
        url: '../recharge/recharge?storeId='+storeId,
      })
    }else{
      that.gotologin();
    }
  },
    // 在需要获取位置的页面的Page函数中定义获取位置的方法
    getLocation: function() {
      let that = this;
      wx.getLocation({
        type: 'gcj02',
        success: function(res) {
          const latitude = res.latitude
          const longitude = res.longitude
          that.setData({
            lat: latitude,
            lon:longitude,
          });
          that.getMainListdata('refresh');
          // 处理位置信息，比如将位置信息显示在页面上
          // 示例中使用的是util.js中的函数，开发者可以根据需要自行编写
          //util.showLocation(latitude, longitude)
        },
        fail: function(res) {
          that.getMainListdata('refresh');
          // 如果获取位置信息失败，可以处理错误情况
          //console.log('获取位置失败', res.errMsg)
        }
      })
    },
    call:function (e) {
      // let that = this;
      // var aphoneinfo = e.currentTarget.dataset.info;//获取当前点击的下标
      let that = this;
      var phoneLength=e.currentTarget.dataset.info.length;
      if(phoneLength>0){
        if(phoneLength==11){
            wx.makePhoneCall({
              phoneNumber:e.currentTarget.dataset.info,
              success:function () {
                //console.log("拨打电话成功！")
              },
              fail:function () {
                //console.log("拨打电话失败！")
              }
            })
        }else{
          wx.showModal({
            title: '提示',
            content: '客服上班时间10：00~23：00\r\n如您遇到问题，建议先查看“使用帮助”！\r\n本店客服微信号：'+e.currentTarget.dataset.info,
            confirmText: '复制',
            complete: (res) => {
              if (res.confirm) {
                wx.setClipboardData({
                  data: e.currentTarget.dataset.info,
                  success: function (res) {
                      wx.showToast({ title: '微信号已复制到剪贴板！' })
                  }
                })
              } else if (res.cancel) {
                //console.log('用户点击取消')
              }
            }
          })
        }
      }
      // if(aphoneinfo.length>0){
      //   //console.log("拨打电话+++")
      //   wx.makePhoneCall({
      //     phoneNumber:aphoneinfo,
      //     success:function () {
      //       //console.log("拨打电话成功！")
      //     },
      //     fail:function () {
      //       //console.log("拨打电话失败！")
      //     }
      //   })
      // }
    },
  
  // 扫码开台
  goScanOpen(){
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode', 'barCode'],
      success(res) {
        const result = res.result || '';
        // 尝试从二维码内容中解析 storeId（支持 ?storeId=123 或 /storeId/123）
        let match = result.match(/storeId=(\d+)/) || result.match(/storeId\/(\d+)/);
        if (match && match[1]) {
          const storeId = match[1];
          that.setData({ storeId });
          wx.setStorageSync('global_store_id', storeId);
          wx.showToast({ title: '扫码成功', icon: 'success', duration: 800 });
          // 刷新门店信息与房间列表
          that.getStoreInfodata();
          that.getDoorListdata();
        } else {
          // 无法解析为门店二维码，直接展示扫描结果
          wx.showModal({
            title: '扫码结果',
            content: String(result).slice(0, 1000),
            showCancel: false
          })
        }
      },
      fail() {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },
  //俱乐部报名
  goClubRegister(){
    var that = this;
    wx.navigateTo({
      url: '/pages/join/join',
    })
  },
  //团购
   gototuangou(){
    var that = this;
    wx.navigateTo({
      url: '../tuangou/tuangou',
    })
  },
  //在线组局
  gotodoor(){
    var that = this
    var data = {cityName:that.data.doorinfodata.cityName,storeId: that.data.doorinfodata.storeId}
    wx.setStorageSync('door', data)
    wx.reLaunch({
      url: '../door/door',
    })
  },
  openDoor(e){
    var that = this;
    // let aindex = e.currentTarget.dataset.index;
    if(that.data.isLogin){
      http.request(
        "/member/order/getOrderInfo",
        "1",
        "get", {
        },
        app.globalData.userDatatoken.accessToken,
        "获取中...",
        function success(info) {
          console.info('订单信息===');
          if (info.code === 0 && info.data) {
            //有订单  调用开门
            let startTime=new Date(info.data.startTime);
            if(info.data.status == 0 && startTime>Date.now()){
              wx.showModal({
                title: '温馨提示',
                content: '当前还未到预约时间，是否提前开始消费？',
                success: function (res) {
                  if (res.confirm) {
                    that.openRoomDoor(info.data);
                  }
                }
              })
            }else{
              that.openRoomDoor(info.data);
            }
          }else{
            wx.showModal({
              title: '温馨提示',
              content: '当前无有效订单，请先下单！',
              showCancel: false,
              success (res) {
              }
            })
          }
        },
        function fail(info) {
        }
      )
    }else{
      that.gotologin();
    }
  },
  //到登录界面
  gotologin(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  //图片点击事件
  imgYu: function(event) {
    var that = this;
    let aindex = event.currentTarget.dataset.index;
    var alistimage = that.data.doorlistArr[aindex];
    var aimagearr = alistimage.imageUrls;

    //console.log("点击图片********")

    if(aimagearr.length>0){
      var anewimagearr = aimagearr.split(',');
      var src = anewimagearr[0]+'?Content-Type=image/jpg'; //获取data-src
      var imgList = anewimagearr; //获取data-list
      //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
      })
    }else{
      wx.showToast({
        title: '该房间暂无图片介绍',
        icon: 'none'
      })
    }
  },
  gotest:function(){
    wx.navigateTo({
      url: '../roomRenew/roomRenew?storeId=12&roomId=20',
    })
  },
  copyWifi: function(e){
    let ssid = e.currentTarget.dataset.ssid;
    let pwd = e.currentTarget.dataset.pwd;
    wx.setClipboardData({
      data: pwd,
      success: function (res) {
          wx.showToast({ title: '已复制到剪贴板！' })
      }
    })
    this.setData({
      wifiShow:false
    })
  },
  connectWifi: function(e){
    var that=this;
    let ssid = e.currentTarget.dataset.ssid;
    let pwd = e.currentTarget.dataset.pwd;
    wx.startWifi({
      success (res) {
        // console.log(res.errMsg)
        wx.connectWifi({
          SSID: ssid,
          password: pwd,
          success (res) {
            this.setData({
              wifiShow: false
            })
            wx.showToast({ title: '自动连接WiFi成功' })
          },
          fail(res){
            wx.showToast({ title: res })
          }
        })
      },
      fail(res){
        wx.showToast({ title: res })
      }
    })
  },
  tabChange(e) {
    console.log(e)
    const {target} = e
    this.setData({
      tabIndex: Number(target.dataset.index),
    }, () => {
      this.getDoorListdata()
    })
  },
  openRoomDoor:function(data) {
    let that = this;
    //开房间门
      console.log('开房间门');
      http.request(
        "/member/order/openRoomDoor?orderKey="+data.orderKey,
        "1",
        "post", {
          // "orderKey":that.data.orderKey,
        },
        app.globalData.userDatatoken.accessToken,
        "提交中...",
        function success(info) {
          if (info.code == 0) {
            wx.showToast({
              title: "操作成功",
              icon: 'success'
            })
          }else{
            wx.showModal({
              title:"提示",
              content: info.msg,
              showCancel: false,
            })
          }
        },
        function fail(info) {
        }
      )
    },




    //新增
    // 跳转到门店详情页面
goStoreDetail(e){
  var that = this;
  let storeId = e.currentTarget.dataset.storeid;
  console.log('goStoreDetail', storeId);
  
  // 跳转到门店详情页面（房间列表页面）
  wx.navigateTo({
    url: '../booking/booking?storeId=' + storeId
  })
},

// 新增导航到订单页面的方法
navigateToOrder(roomId, daytime, storeId) {
  wx.navigateTo({
    url: '../orderSubmit/orderSubmit?roomId='+roomId+'&daytime='+daytime+'&storeId='+storeId+'&timeselectindex='+this.data.timeselectindex,
  })
},

// 获取门店列表数据
getStoreListData: function(e){
  var that = this;
  http.request(
    "/member/index/getStoreList",
    "1",
    "post", {
      "pageNo": 1,
      "pageSize": 20,
      "name": "",
      "cityName": ""
      
    },
    app.globalData.userDatatoken.accessToken,
    "获取中...",
    function success(info) {
      if (info.code == 0) {
        // 为每个门店添加距离信息和房间数量（模拟数据，实际应该从后端获取）
        let storesWithDistance = info.data.list.map((store, index) => {
          return {
            ...store,
            distance: (Math.random() * 5 + 0.1).toFixed(1), // 随机生成0.1-5.1km的距离
            isFavorited: false // 初始化收藏状态为false
          }
        });
        
        that.setData({
          storeList: storesWithDistance,
          filteredStoreList: storesWithDistance // 初始化筛选列表为全部门店
        });
        
        // 门店列表加载完成后，使用保存的筛选状态
        let savedFilter = wx.getStorageSync('currentFilter') || 'billiards';
        that.filterStores(savedFilter);
        
        // 门店列表加载完成后，检查收藏状态
        that.checkAllStoresFavoriteStatus();
      }else{
        wx.showModal({
          content: '请求服务异常，请稍后重试',
          showCancel: false,
        })
      }
    },
    function fail(info) {
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    }
  )
},

// 筛选门店方法（兼容直接调用与事件调用）
filterStores: function(e) {
  var that = this;
  
  let filterType = wx.getStorageSync('currentFilter');
  if(!filterType){
    wx.setStorageSync('currentFilter', 'billiards');
    filterType = 'billiards';
  }
  
  // 如果是用户主动选择（通过事件触发），则更新保存的状态
  if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type) {
    filterType = e.currentTarget.dataset.type;
    // 保存用户的选择到本地存储
    wx.setStorageSync('currentFilter', filterType);
    console.log('用户选择筛选类型:', filterType, '已保存到本地存储');
  } else if (typeof e === 'string') {
    filterType = e;
  }
  
  that.setData({ currentFilter: filterType });
  
  let filteredList = [];
  
  // 确保门店列表存在
  if (!that.data.storeList || that.data.storeList.length === 0) {
    console.log('门店列表为空，无法执行筛选');
    return;
  }
  
  if (filterType === 'all') {
    // 显示全部门店
    filteredList = that.data.storeList;
  } else if (filterType === 'billiards') {
    // 筛选包含"台球"的门店
    filteredList = that.data.storeList.filter(store => {
      return store.storeName && store.storeName.includes('台球');
    });
    console.log('台球筛选结果:', filteredList.length, '个门店');
  } else if (filterType === 'chess') {
    // 筛选不包含"台球"的门店（归为棋牌类）
    filteredList = that.data.storeList.filter(store => {
      return store.storeName && !store.storeName.includes('台球');
    });
  }
  
  that.setData({
    filteredStoreList: filteredList
  });
  
  console.log('筛选完成，当前筛选类型:', filterType, '筛选结果数量:', filteredList.length);
},

// 新增快速预订方法
quickReserve(e) {
  var that = this;
  let roomId = e.currentTarget.dataset.roomid;
  let status = e.currentTarget.dataset.status;
  
  if(status == 0){
    wx.showToast({
      title: '该房间暂不可用',
      icon: 'none'
    });
    return;
  }
  
  // 检查登录状态
  if(!that.data.isLogin){
    that.gotologin();
    return;
  }
  
  // 直接跳转到预订页面
  wx.navigateTo({
    url: '../orderSubmit/orderSubmit?roomId='+roomId+'&storeId='+that.data.storeId+'&timeselectindex='+that.data.timeselectindex,
  })
},

// 新增获取用户位置并计算距离的方法
getUserLocationAndCalculateDistance() {
  var that = this;
  
  location.getUserLocation(
    function(res) {
      // 成功获取位置
      that.setData({
        userLat: res.latitude,
        userLng: res.longitude
      });
      
      // 获取真实地址信息
      location.getAddressFromCoordinates(
        res.latitude, 
        res.longitude,
        function(addressInfo) {
          that.setData({
            userAddress: addressInfo.address,
            userCity: addressInfo.address_component.city,
            userDistrict: addressInfo.address_component.district
          });
          
          // 显示用户当前位置
          wx.showToast({
            title: `当前位置: ${addressInfo.address_component.district}`,
            icon: 'none',
            duration: 2000
          });
        },
        function(err) {
          console.log('获取地址失败:', err);
        }
      );
      
      // 计算与各个门店的距离
      that.calculateDistanceToStores(res.latitude, res.longitude);
    },
    function(err) {
      console.log('获取位置失败:', err);
      wx.showToast({
        title: '获取位置失败',
        icon: 'none'
      });
    }
  );
},

// 计算与门店的距离
calculateDistanceToStores(userLat, userLng) {
  var that = this;
  
  // 更新门店列表的距离
  let updatedStoreList = that.data.storeList.map(store => {
    if (store.lat && store.lon) {
      let distance = location.calculateDistance(userLat, userLng, parseFloat(store.lat), parseFloat(store.lon));
      return {
        ...store,
        distance: distance,
        distanceText: location.formatDistance(distance)
      };
    }
    return store;
  });
  
  // 更新筛选后的门店列表
  let updatedFilteredStoreList = that.data.filteredStoreList.map(store => {
    if (store.lat && store.lon) {
      let distance = location.calculateDistance(userLat, userLng, parseFloat(store.lat), parseFloat(store.lon));
      return {
        ...store,
        distance: distance,
        distanceText: location.formatDistance(distance)
      };
    }
    return store;
  });
  
  that.setData({
    storeList: updatedStoreList,
    filteredStoreList: updatedFilteredStoreList
  });
  
  console.log('门店距离计算完成:', updatedStoreList);
},

// 计算房间距离的辅助方法
calculateDistanceToRooms(userLat, userLng) {
  var that = this;
  let updatedRooms = that.data.doorlistArr.map(room => {
    // 这里应该使用实际的房间坐标
    // 现在使用门店的坐标作为示例
    if(that.data.doorinfodata.lat && that.data.doorinfodata.lon) {
      let distance = location.calculateDistance(userLat, userLng, that.data.doorinfodata.lat, that.data.doorinfodata.lon);
      return {
        ...room,
        distance: distance,
        distanceText: location.formatDistance(distance)
      }
    }
    return room;
  });
  
  that.setData({
    doorlistArr: updatedRooms
  });
},

  /**
   * 切换收藏状态
   */
  toggleFavorite: function(e) {
    const that = this;
    const storeId = e.currentTarget.dataset.storeid;
    const index = e.currentTarget.dataset.index;
    
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: '../login/login'
      });
      return;
    }

    const store = that.data.filteredStoreList[index];
    if (!store) return;

    if (store.isFavorited) {
      // 取消收藏
      favorite.unfavoriteStore(storeId, 
        function success() {
          that.updateStoresFavoriteStatus(storeId, false);
        },
        function fail() {
          console.log('取消收藏失败');
        }
      );
    } else {
      // 添加收藏
      favorite.favoriteStore(storeId,
        function success() {
          that.updateStoresFavoriteStatus(storeId, true);
        },
        function fail() {
          console.log('收藏失败');
        }
      );
    }
  },

  /**
   * 更新门店收藏状态
   */
  updateStoresFavoriteStatus: function(storeId, isFavorited) {
    const that = this;
    const targetStoreId = parseInt(storeId);
    
    const storeList = that.data.storeList.map(store => {
      if (parseInt(store.storeId) === targetStoreId) {
        return {
          ...store,
          isFavorited: isFavorited
        };
      }
      return store;
    });
    
    const filteredStoreList = that.data.filteredStoreList.map(store => {
      if (parseInt(store.storeId) === targetStoreId) {
        return {
          ...store,
          isFavorited: isFavorited
        };
      }
      return store;
    });

    that.setData({
      storeList: storeList,
      filteredStoreList: filteredStoreList
    });
    
    console.log(`门店 ${storeId} 收藏状态已更新为:`, isFavorited);
  },

  /**
   * 检查所有门店的收藏状态
   */
  checkAllStoresFavoriteStatus: function() {
    const that = this;
    if (!app.globalData.isLogin) {
      console.log('用户未登录，跳过收藏状态检查');
      return;
    }

    // 确保门店列表已加载
    if (!that.data.storeList || that.data.storeList.length === 0) {
      console.log('门店列表为空，跳过收藏状态检查');
      return;
    }

    console.log('开始检查收藏状态，门店数量:', that.data.storeList.length);

    // 获取用户收藏的门店列表
    http.request(
      "/member/user/getFavoriteStores",
      "1",
      "get",
      {},
      app.globalData.userDatatoken.accessToken,
      "",
      function success(info) {
        console.log('收藏门店接口返回:', info);
        if (info.code == 0) {
          const favoriteStoreIds = (info.data || []).map(store => {
            // 确保数据类型一致，都转换为数字
            return parseInt(store.storeId);
          });
          
          console.log('收藏的门店ID列表:', favoriteStoreIds);
          
          // 更新门店列表的收藏状态
          const storeList = that.data.storeList.map(store => {
            const storeId = parseInt(store.storeId);
            const isFavorited = favoriteStoreIds.includes(storeId);
            console.log(`门店 ${store.storeName} (ID: ${storeId}) 收藏状态:`, isFavorited);
            return {
              ...store,
              isFavorited: isFavorited
            };
          });

          // 更新筛选后的门店列表
          const filteredStoreList = that.data.filteredStoreList.map(store => {
            const storeId = parseInt(store.storeId);
            const isFavorited = favoriteStoreIds.includes(storeId);
            return {
              ...store,
              isFavorited: isFavorited
            };
          });

          that.setData({
            storeList: storeList,
            filteredStoreList: filteredStoreList
          });
          
          console.log('收藏状态更新完成');
        } else {
          console.error('获取收藏状态失败:', info.msg);
        }
      },
      function fail(info) {
        console.error('获取收藏状态失败:', info);
      }
    );
  }
})