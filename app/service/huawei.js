'use strict';

const Service = require('egg').Service;
const crypto = require('crypto');
const config = require('./config');
const dateFormat = require('dateformat');

class WxService extends Service {

  // 入口验证信息
  async handel(message) {
    const { ctx, service, config } = this;
    const wechatconfig = config.bwechat_config;
    const { MsgType, Content, Event, FromUserName, EventKey, PicUrl, MediaId } = message;
    let invitor = {};
    let invitecode = '';

    if (MsgType === 'text') {
      let reply = '';
      if (Content == 'updatemenu') {
        this.updateMenu();
        reply = '更新菜单完成';
      } else if (Content.indexOf('下单') > 0) {
        const userres = await this.service.user.findByOpenId(FromUserName);
        if (!userres.orderPic || (new Date().getTime() - userres.PicTime.getTime()) > 86400000) {
          reply = '没有检测到合适到下单图片，请先上传！！！';
        } else {
          const ordermsgs = Content.split(' ');
          if (ordermsgs.length < 3) {
            reply = '请输入正确的下单格式';
          } else if (ordermsgs.length == 3) {
            if (ordermsgs[0].split(':') < 1) {
              reply = '请按下单格式输入正确的电影时间';
            } else {

              const filmtime = new Date(
                new Date().toLocaleDateString() +
                                ' ' +
                                ordermsgs[0] +
                                ' GMT+08:00'
              );
              if (filmtime.getTime() - new Date().getTime() < 3600000) {

                reply = '请按下单格式输入正确的电影时间';
              } else {
                // 下单
                const date = new Date().toLocaleDateString().replace(/\//g, '-');
                this.createOrder(FromUserName, date, ordermsgs[0], ordermsgs[1]);
                reply = '下单成功';
              }
            }

          } else {
            if (ordermsgs[0].split('-') < 1) {
              reply = '请按下单格式输入正确的电影日期';
            } else {
              if (ordermsgs[1].split(':') < 1) {
                reply = '请按下单格式输入正确的电影时间';
              } else {
                // 下单
                this.createOrder(FromUserName, ordermsgs[0], ordermsgs[1], ordermsgs[2]);
                reply = '下单成功';
              }
            }
          }
        }


      } else {
        const msgs = [
          '欢迎使用拓谦票务',
        ];
        const rand = Math.floor(Math.random() * msgs.length);
        reply = msgs[rand];
      }
      return reply;
    } else if (MsgType === 'image') {
      const userres = await service.user.findByOpenId(FromUserName);
      if (userres.uconsult <= 0) {
        return '已无可用询价次数，请充值！！！';
      }

      userres.orderPic = PicUrl,
      userres.orderPicId = MediaId;
      userres.PicTime = new Date();
      const updateuser = await this.service.user.update(userres._id, userres);
      return '上传下单图片成功！！！';


    } else if (MsgType === 'event') {
      const wxconfig = await service.config.get('wechat', 'access_token', 'business');
      if (Event === 'subscribe') {
        const url = wechatconfig.getUserInfoUrl.replace('ACCESS_TOKEN', wxconfig.value).replace('OPENID', FromUserName);
        const merchant = await this.ctx.curl(url, {
          dataType: 'json',
        });

        const newaccount = {
          OpenID: merchant.data.openid,
          wechatName: merchant.data.nickname,
          sex: merchant.data.sex === 1 ? '男' : '女',
          headimgurl: merchant.data.headimgurl,
          status: 0, // 目前直接通过审核
        };

        if (merchant.data.qr_scene_str.indexOf('CL') === 0) {
          invitor = await service.user.findByinvitecode(merchant.data.qr_scene_str);
          invitecode = ('CL' + new Date().getTime().toString());

          if (invitor) {
            newaccount.invitor = invitor._id;
          }
          service.user.InserOrUpdate(newaccount);
        } else {
          invitor = await service.merchant.findByinvitecode(merchant.data.qr_scene_str);
          invitecode = ('MC' + new Date().getTime().toString());

          if (invitor) {
            newaccount.invitor = invitor._id;
          }
          const newmc = await service.merchant.InserOrUpdate(newaccount);
          // 目前没有发布广告功能先在关注时就立即更新一条广告
          const newpu = service.publish.create({ merchantId: newmc.id });
        }
        return '欢迎加入拓谦票务组，这里有最活跃的客户和最多的业务机会，祝您业务蒸蒸日上。';
      } else if (Event === 'CLICK') {
        if (EventKey === 'V1001_Order') {
          return '【上传座位截图后】输入口令：yyyy-MM-DD(日期不带默认当天) HH:mm(开映时间) 城市 下单；口令示范：2019-12-06 19:30 厦门 下单';
        }

        return '欢迎使用拓谦票务' + EventKey;

      }
    } else {
      return '欢迎使用拓谦票务';
    }
  }

  // 更新菜单
  async updateMenu() {
    const { app } = this;
    const config = app.config.bwechat_config;
    const baseurl = config.baseurl;
    const appid = config.appid;
    const menu = {
      button: [
        // {
        //     name: '下单',
        //     sub_button: [
        //         {
        //             type: 'view',
        //             name: '下单入口',
        //             url: 'http://api.ttwsss.com/api/oauth/movie',
        //         },
        //         {
        //             type: "click",
        //             name: "下单口令",
        //             key: "V1001_Order",
        //         }
        //     ],
        // },
        {
          type: 'click',
          name: '下单口令',
          key: 'V1001_Order',
        },
        {
          name: '更多',
          sub_button: [
            {
              type: 'media_id',
              name: '联系客服',
              media_id: 'LBLCjmH1PRGluL6nLZzVaFJZoVnAbBshWNmbGggGSiQ',
            },
            {
              type: 'view',
              name: '通知开关',
              url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=user&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
            },
          ],
        },
        {
          type: 'view',
          name: '接单入口',
          url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
        },
      ],
    };


    const wxconfig = await this.service.config.get('wechat', 'access_token', 'business');
    const access_token = wxconfig.value;

    const url = config.postCreateMenuUrl.replace('ACCESS_TOKEN', access_token);
    const res = await app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: menu,
      dataType: 'json',
    });
    if (res.data.errcode === 0) {
      return '更新成功';
    }

    return '更新失败';


  }

  // 直接下单
  async createOrder(buyerOpenid, date, time, city) {

    const userres = await this.service.user.findByOpenId(buyerOpenid);
    this.ctx.logger.info('开始下单用户' + JSON.stringify(userres));
    const payload = {
      filmId: userres.orderPicId,
      filmImg: userres.orderPic,
      type: 2,
      buyer: userres._id, // 买家
      film: ' ', // 电影名
      city, // 城市
      cinema: '影院点击进入参看图片', // 电影院
      date, // 日期
      session: time, // 场次
      room: '参照图片', // 厅
      address: '参照图片', // 地址
      peoples: 2, // 人数
      seats: [ '参照图片' ], // 座位
      price: 999, // 市场价格
      tradeId: dateFormat(new Date(), 'yyyymmddHHMM') + new Date().getTime().toString()
        .substring(2),
    };

    this.ctx.logger.info('图片下单' + JSON.stringify(payload));
    const traderes = await this.service.trade.create(payload);
    this.ctx.logger.info('图片下单结果' + JSON.stringify(traderes));
    const neworder = await this.service.order.create({
      agent: payload.agent || null,
      invitor: payload.invitor || null,
      subinvitor: payload.subinvitor || null,
      channel: payload.channel || null,
      trade: traderes._id.toString(),
      buyer: userres._id.toString(),
      peoples: traderes.peoples,
      type: 2,
      // finalPrice: (traderes.price * traderes.peoples * discount).toFixed(2) //traderes.price > 35 ? (traderes.price * traderes.peoples * 0.85).toFixed(2) : (traderes.price * 0.85 * traderes.peoples).toFixed(2)
    });
    const fullorder = await this.service.order.find(neworder._id);
    // 同行单
    const newuser = await this.service.user.find(userres._id.toString());
    newuser.uconsult = newuser.uconsult - 1;
    const updateuser = await this.service.user.update(newuser._id, newuser);
    // 竞价单后通知竞价
    const matchMerchants = await this.service.merchant.getMcs();

    this.ctx.logger.info('票务' + matchMerchants[0]);
    // todo向匹配的商家发送新订单邀请竞价通知
    // this.service.bwx.sendNewOrderTem('oaUU-wa2PNOE4UwYPws7_E1tI_rk', traderes)
    // this.service.bwx.sendNewOrderTem('oaUU-wShayfbD5uwY44vZSpsmK30', traderes)
    // this.service.bwx.sendNewOrderTem('oaUU-wVMgKUHtGKnQz_T2CMY7Hhs', traderes)
    // this.service.bwx.sendNewOrderTem('oaUU-wQYG_IhMynN1-UOZBKgf5M4', traderes)
    // this.service.bwx.sendNewOrderTem('oaUU-wSjrVPFns8nET_6X5E-FsXA', traderes)
    // ////////////////////////////////
    if (matchMerchants.length > 0) {
      matchMerchants.forEach(merchant => {
        if (traderes.buyer != merchant._id) {
          this.service.bwx.sendNewOrderTem(merchant.OpenID, traderes);
        }
      });
    }
    // //////////////////////////
    const first = '您好，您的订单已经生成，系统正在激烈竞价中，报价将在10-15分钟实时向您推送，请耐心等待~~';
    const remark = '点击查看订单详情';
    // 并向票务客户推送订单状态
    this.service.bwx.sendTradeStatus(traderes, first, remark, fullorder._id, true);

    return fullorder;

  }

  // 出价被超越通知
  async sendSurpassOfferTem(offer, type) {

    const { ctx, service, app } = this;
    const config = app.config.bwechat_config;
    const wxconfig = await service.config.get('wechat', 'access_token', 'business');
    const baseurl = config.baseurl;
    const appid = config.appid;
    // if(app.atokenexp<=new Date().getTime()){
    //     this.updateAccessToken();//如果token过期需要更新
    // }
    let firstmsg = '您的出价已被超越！赶快出价反超吧！';
    let remarkmsg = '竞价相当激烈，期待您的参与';
    if (type == 2) {
      firstmsg = '本订单已有票务报出底价，竞价结束，谢谢您的参与，欢迎再接再厉！！！';
      remarkmsg = '请继续积极竞价，平台将在月底根据出价积极性评定给予适当奖励！！！';
    }
    const access_token = wxconfig.value;
    const color2 = offer.trade.type == 2 ? '#00AA00' : '#173199';
    const msg = {
      touser: offer.seller.OpenID,
      template_id: 'X7Ryj_RgM1XZteZ0CU9zXt01RUy20FdrIWbyEHbqmks',
      url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=offer%26id=' + offer.trade._id.toString() + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
      data: {
        first: {
          value: firstmsg,
          color: '#173100',
        },

        keyword1: {
          value: offer.trade.city + '-' + offer.trade.cinema + '-' + offer.trade.date + ' ' + offer.trade.session + ',' + offer.trade.film + ',' + offer.trade.peoples + '张', // offer.trade.seats.join('-'),
          color: color2,
        },
        keyword2: {
          value: Number(offer.nowPrice).toFixed(2),
          color: color2,
        },
        keyword3: {
          value: Number(offer.price).toFixed(2),
          color: color2,
        },
        keyword4: {
          value: new Date(offer.createdAt).toLocaleString(),
          color: color2,
        },
        remark: {
          value: remarkmsg,
          color: '#ff0000',
        },
      },
    };
    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    return res;
  }

  // 抢单成功
  async sendGetOrderTem(offer, msgval) {

    const { ctx, service, app } = this;
    const config = app.config.bwechat_config;
    const wxconfig = await service.config.get('wechat', 'access_token', 'business');
    const baseurl = config.baseurl;
    const appid = config.appid;
    // if(app.atokenexp<=new Date().getTime()){
    //     this.updateAccessToken();//如果token过期需要更新
    // }
    const msgfirst = msgval ? msgval : '恭喜您，竞价成功；请静候客人付款后及时出票！！！';
    const color2 = offer.trade.type == 2 ? '#00AA00' : '#173199';
    const access_token = wxconfig.value;

    const msg = {
      touser: offer.seller.OpenID,
      template_id: '-nG2KkY_lZ9eGL7Kwc9yFMac8NpKj_74TmMeiL7V9t4',
      url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=issue%26id=' + offer._id + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
      data: {
        first: {
          value: msgfirst,
          color: '#173100',
        },

        keyword1: {
          value: new Date(offer.createdAt).toLocaleString(),
          color: color2,
        },
        keyword2: {
          value: '第1名',
          color: color2,
        },
        keyword3: {
          value: (offer.finalPrice - offer.fee).toFixed(2),
          color: color2,
        },
        remark: {
          value: '影片信息:' + offer.trade.city + '-' + offer.trade.cinema + '-' + offer.trade.date + ' ' + offer.trade.session + ',' + offer.trade.film + ',' + offer.trade.seats.join('-'),
          color: '#ff0000',
        },
      },
    };
    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    this.ctx.logger.info('订单票务通知' + JSON.stringify(res));
    return res;
  }

  // 催促出票
  async sendUrge(offer, msgtype, msgval) {

    const { ctx, service, app } = this;
    const config = app.config.bwechat_config;
    const wxconfig = await service.config.get('wechat', 'access_token', 'business');
    const baseurl = config.baseurl;
    const appid = config.appid;
    // if(app.atokenexp<=new Date().getTime()){
    //     this.updateAccessToken();//如果token过期需要更新
    // }
    const msgfirst = msgval ? msgval : '您好，请尽快出票，以免影响用户的购票体验！！！';
    const sendtype = msgtype ? msgtype == 2 ? '同行' : '实单' : '实单模式';

    const access_token = wxconfig.value;

    const msg = {
      touser: offer.seller.OpenID,
      template_id: '8fcXkS1UH9R5EwtVRvuLkzGgxn8L2jODMuIPpox_gQw',
      url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=issue%26id=' + offer._id + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
      data: {
        first: {
          value: msgfirst,
          color: '#173100',
        },

        keyword1: {
          value: '(' + sendtype + ')' + '影片信息:' + offer.trade.city + '-' + offer.trade.cinema + '-' + offer.trade.date + ' ' + offer.trade.session + ',' + offer.trade.film + ',' + offer.trade.seats.join('-'),
          color: '#173188',
        },
        keyword2: {
          value: offer.trade.tradeId,
          color: '#173199',
        },
        keyword3: {
          value: (offer.finalPrice - offer.fee).toFixed(2),
          color: '#173199',
        },
        remark: {
          value: '点击出票',
          color: '#ff0000',
        },
      },
    };
    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    return res;
  }

  // 客服
  async sendkf(trade, msgtype, msgval) {
    const adminOpenIds = [
      'oaUU-wShayfbD5uwY44vZSpsmK30',
      'oaUU-wSjrVPFns8nET_6X5E-FsXA',
      'oaUU-wf-2w0hs5CNT4jH_JtD9ecw',
      'oaUU-wfq_gFP73Wk-V0zzL6zBWzg',
      'oaUU-wVMgKUHtGKnQz_T2CMY7Hhs',
      'oaUU-wVGGzDna-yrkTJjwBW2ZIXU', // vivan
      'oaUU-wQYG_IhMynN1-UOZBKgf5M4', // 大拿
    ];
    adminOpenIds.forEach(element => {
      this.ctx.service.bwx.sendFlowOrder(element, trade, msgtype, msgval);
    });
  }

  // 流单超时
  async sendFlowOrder(to, trade, msgtype, msgval) {

    const { ctx, service, app } = this;
    const config = app.config.bwechat_config;
    const wxconfig = await service.config.get('wechat', 'access_token', 'business');
    const baseurl = config.baseurl;
    const appid = config.appid;
    // if(app.atokenexp<=new Date().getTime()){
    //     this.updateAccessToken();//如果token过期需要更新
    // }
    const msgfirst = msgval ? msgval : '管理员您好，有订单竞拍超时，请及时处理！！！';
    const sendtype = msgtype ? msgtype : '订单流拍';
    const access_token = wxconfig.value;

    const msg = {
      touser: to,
      template_id: 'ArYnjomF8UerWU6t--qzFIumsRZ00cufDrkTrMJM6_g',
      url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=offer%26id=' + trade._id + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
      data: {
        first: {
          value: msgfirst,
          color: '#173100',
        },

        keyword1: {
          value: sendtype,
          color: '#FF00FF',
        },
        keyword2: {
          value: trade.tradeId,
          color: '#173199',
        },
        keyword3: {
          value: new Date().toLocaleString(),
          color: '#173199',
        },
        remark: {
          value: '订单即将超时，请联系线下票务积极处理，或为客人办理退款事宜！',
          color: '#ff0000',
        },
      },
    };
    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    this.ctx.logger.info('客服通知' + JSON.stringify(res));
    return res;

  }

  // 新到订单通知开始竞价
  async sendNewOrderTem(touser, trade) {

    const { ctx, service, app } = this;
    const config = app.config.bwechat_config;
    const wxconfig = await service.config.get('wechat', 'access_token', 'business');
    const access_token = wxconfig.value;
    const appid = config.appid;
    const baseurl = config.baseurl;
    const otype = trade.type == 0 ? '（竞价）' : trade.type == 1 ? '（实单）' : '（同行）';
    const color1 = trade.type == 2 ? '#663399' : '#808080';
    const color2 = trade.type == 2 ? '#00AA00' : '#173199';
    const color3 = trade.type == 2 ? '#ff0000' : '#ff0000';
    const remarkval = trade.price == 999 ? '详细信息点击进入参看图片' : '市场参考价格' + '(' + trade.price + '元)' + add;
    let add = trade.type == 0 ? '（竞价）' : trade.type == 1 ? '（实单）' : '（同行,竞价成功者最低可获每单0.5元补贴）';// trade.type==2?"，"+trade.discount+"折起拍":""
    const msg = {
      touser,
      template_id: 'MQ7sQI7HSmr6nij_cjHCKZ-tbqVSXm1ZAijo0sQMlfI',
      url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=offer%26id=' + trade._id.toString() + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
      data: {
        first: {
          value: '有新的订单生成,请积极参与竞价！' + otype,
          color: color1,
        },
        keyword1: {
          value: trade.date + ' ' + trade.session,
          color: color2,
        },
        keyword2: {
          value: trade.city + '-' + trade.cinema + ',' + trade.film + ',' + trade.peoples + '张', // trade.seats.join('-'),
          color: color2,
        },
        keyword3: {
          value: trade.tradeId,
          color: color2,
        },
        remark: {
          value: remarkval,
          color: color3,
        },
      },
    };
    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    return res;
  }

  // 用户付款通知商户出票
  async sendPayTem(order) {
    const { ctx, service, app } = this;
    const config = app.config.bwechat_config;
    const wxconfig = await service.config.get('wechat', 'access_token', 'business');

    // if(app.atokenexp<=new Date().getTime()){
    //     this.updateAccessToken();//如果token过期需要更新
    // }
    const color2 = order.trade.type == 2 ? '#00AA00' : '#173199';
    const access_token = wxconfig.value;
    const baseurl = config.baseurl;
    const appid = config.appid;
    const msg = {
      touser: order.seller.OpenID,
      template_id: '_lKc92SJTym7iSpzSU74bLEWbPZHwjCuCJt_V0bnKTs',
      url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?path=issue%26id=' + order._id + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
      data: {
        first: {
          value: '订单已支付成功，请尽快出票！',
          color: '#173100',
        },
        keyword1: {
          value: order.buyer.invitecode,
          color: color2,
        },
        keyword2: {
          value: order.trade.film + ',' + order.trade.peoples + '张', // order.trade.seats.join('-'),
          color: color2,
        },
        keyword3: {
          value: (Number(order.finalPrice) - Number(order.fee)).toFixed(2),
          color: color2,
        },
        keyword4: {
          value: new Date(order.createdAt).toLocaleString(),
          color: color2,
        },
        remark: {
          value: order.trade.city + '-' + order.trade.cinema + '-' + order.trade.date + ' ' + order.trade.session,
          color: '#ff0000',
        },
      },
    };
    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    ctx.logger.info(res);
    return res;

  }


  // 通知买家订单状态
  async sendTradeStatus(trade, first, remark, oid, wait) {

    const { ctx, service, app } = this;
    let access_token = '';
    let temId = '';
    let appid = '';
    first = first || '您好，您的订单已经生成，系统正在激烈竞价中，报价将在10-15分钟实时向您推送，请耐心等待~~';
    remark = remark || '点击查看订单详情';
    const config = app.config.bcwechat_config;

    const baseurl = config.baseurl;
    const user = await this.service.user.find(trade.buyer);
    let msgurl = '';
    let asd = '';
    let assd = '';
    let res = {};
    if (user.platform) {
      if (oid) {
        asd = user.platform.invitecode + '%26path=order' + '%26id=' + oid;
      }
      temId = user.platform.notifylist[4] || '';
      const pconfig = await service.config.getv('platform', 'authorizer_access_token', 'auth', user.platform.appid);
      access_token = pconfig.value;
      appid = user.platform.appid;
      const pappid = 'wx0aff8dfdb9e59ecd';
      msgurl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?platform=' + asd + '&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=' + pappid + '#wechat_redirect';
    } else {
      if (oid) {
        if (wait) {
          assd = '?usertype=1%26path=wait%26id=' + oid;
        } else {

          assd = '?usertype=1%26path=order%26id=' + oid;
        }
      }
      const admin = await this.service.adminuser.findadmin();
      temId = admin.notifylist[4] || '';
      const config = app.config.bcwechat_config;
      const wxconfig = await service.config.get('wechat', 'access_token', 'business');
      const pappid = 'wx0aff8dfdb9e59ecd';
      access_token = wxconfig.value;
      appid = config.appid,
      msgurl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken' + assd + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
    }


    if (temId != '') {
      var msg = {
        touser: user.OpenID,
        template_id: temId,
        url: msgurl,
        data: {
          first: {
            value: first,
            color: '#00AA00',
          },
          keyword1: {
            value: trade.film + ',' + trade.city + '-' + trade.cinema,
            color: '#00AA00',
          },
          keyword2: {
            value: trade.seats.join('-'),
            color: '#00AA00',
          },
          keyword3: {
            value: trade.date + ' ' + trade.session,
            color: '#00AA00',
          },
          remark: {
            value: remark,
            color: '#ff0000',
          },
        },
      };

      const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
      res = await this.app.curl(url, {
        method: 'POST',
        contentType: 'json',
        data: msg,
        dataType: 'json',
      });
    }

    this.ctx.logger.info('代理客户通知:' + JSON.stringify(res) + '-' + JSON.stringify(msg) + '+' + access_token);
    return res;
  }

  // 支付成功
  async sendPayed(trade, orderid, price) {

    const { ctx, service, app } = this;
    let access_token = '';
    let temId = '';
    let appid = '';
    const config = app.config.bcwechat_config;
    const baseurl = config.baseurl;
    const user = await this.service.user.find(trade.buyer);
    let msgurl = '';
    let oid = '';
    let msgv1 = '';
    if (orderid) {
      msgv1 = '订单已支付成功，系统正在努力出票中，请耐心等待10-60分钟~';
      oid = orderid;
    } else {
      msgv1 = '订单已支付成功，系统正在努力出票中，请耐心等待10-60分钟~';
      oid = trade.id;
    }

    if (user.platform) {
      temId = user.platform.notifylist[2];
      const pconfig = await service.config.getv('platform', 'authorizer_access_token', 'auth', user.platform.appid);
      access_token = pconfig.value;
      appid = user.platform.appid;
      const pappid = 'wx0aff8dfdb9e59ecd';
      msgurl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?platform=' + user.platform.invitecode + '%26path=order' + '%26id=' + oid + '&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=' + pappid + '#wechat_redirect';
    } else {
      const admin = await this.service.adminuser.findadmin();
      temId = admin.notifylist[5];
      const config = app.config.bwechat_config;
      const wxconfig = await service.config.get('wechat', 'access_token', 'business');
      access_token = wxconfig.value;
      appid = config.appid,
      msgurl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + baseurl + '/api/oauth/getAccessToken?usertype=1%26path=order' + '%26id=' + oid + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
    }


    const msg = {
      touser: user.OpenID,
      template_id: temId,
      url: msgurl,
      data: {
        first: {
          value: msgv1,
          color: '#00AA00',
        },
        keyword1: {
          value: (price).toFixed(2),
          color: '#00AA00',
        },
        keyword2: {
          value: trade.tradeId,
          color: '#00AA00',
        },
        remark: {
          value: '点击查看订单详情',
          color: '#ff0000',
        },
      },
    };

    const url = config.postTemMsg.replace('ACCESS_TOKEN', access_token);
    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: msg,
      dataType: 'json',
    });
    this.ctx.logger.info('订单支付通知' + JSON.stringify(res));
    return res;
  }
}

module.exports = WxService;
