'use strict';

const Controller = require('egg').Controller;


class OauthController extends Controller {
  async getAccessToken() {
    const query = this.ctx.query;
    const code = query.acode;
    const path = query.path;
    const usertype = query.usertype;
    const id = query.id;
    const config = this.ctx.app.config.bwechat_config;
    let redirectUrl = '';
    // 获取授权access_token
    const url = config.getOauthAccessTokenUrl.replace('APPID', config.appid)
      .replace('SECRET', config.appsecret).replace('CODE', code);
    const res = await this.ctx.curl(url, {
      dataType: 'json',
    });
    const access_token = res.data.access_token;
    const openid = res.data.openid;
    // 获取用户信息
    const userInfoUrl = config.getOauthUserInfoUrl.replace('ACCESS_TOKEN', access_token).replace('OPENID', openid);
    const userInfoRes = await this.ctx.curl(userInfoUrl, {
      dataType: 'json',
    });
    console.log(userInfoRes.data);

    // this.ctx.cookies.set('user', JSON.stringify(userInfoRes.data), {
    //     httpOnly: true, // 默认就是 true
    //     encrypt: true, // 加密传输
    //   })
    this.ctx.cookies.set('openId', userInfoRes.data.openid, {
      encrypt: true,
    });
    this.ctx.cookies.set('headimgurl', userInfoRes.data.headimgurl, {
      encrypt: true,
    });
    this.ctx.cookies.set('nickname', userInfoRes.data.nickname, {
      encrypt: true,
    });
    this.ctx.cookies.set('sex', userInfoRes.data.sex === 1 ? '男' : '女', {
      encrypt: true,
    });

    let invitecode = 10000;//
    const lastnumber = await this.ctx.model.User.find()
      .sort({ invitecode: -1 })
      .limit(1);
    if (lastnumber.length > 0) {
      if (typeof (lastnumber[0].invitecode) !== 'undefined') { invitecode = Number(lastnumber[0].invitecode) + 1; }
    }

    if (usertype == 1) { // 1同行0票务
      this.ctx.service.user.InserOrUpdate({
        nativeOpenId: userInfoRes.data.openid,
        OpenID: userInfoRes.data.openid,
        wechatName: userInfoRes.data.nickname,
        usertype: 'business',
        sex: userInfoRes.data.sex === 1 ? '男' : '女',
        headimgurl: userInfoRes.data.headimgurl,
        status: 1, // 目前直接通过审核，
        invitecode,
      });
      // var user = this.ctx.cookies.get('nickname', { encrypt: true })
      this.ctx.body = 'hi, ' + userInfoRes.data.nickname;
      if (path) {
        if (path == 'order') {
          redirectUrl = config.b2burl + '/#/order/info?orderId=' + id;
        } else if (path == 'wait') {
          redirectUrl = config.b2burl + '/#/order/wait?orderId=' + id;
        }

      } else {
        redirectUrl = config.b2burl;
      }

    } else {
      this.ctx.service.merchant.InserOrUpdate({
        OpenID: userInfoRes.data.openid,
        wechatName: userInfoRes.data.nickname,
        sex: userInfoRes.data.sex === 1 ? '男' : '女',
        headimgurl: userInfoRes.data.headimgurl,
        status: 0,
      });
      // var user = this.ctx.cookies.get('nickname', { encrypt: true })
      this.ctx.body = 'hi, ' + userInfoRes.data.nickname;
      redirectUrl = config.weburl;
      if (path) {

        if (path == 'offer') {
          redirectUrl = redirectUrl + '/offer?id=' + id;
        } else if (path == 'issue') {
          redirectUrl = redirectUrl + '/issue?id=' + id;
        } else if (path == 'user') {
          redirectUrl = redirectUrl + '/user';
        }

      }
    }


    this.ctx.unsafeRedirect(redirectUrl);
  }

  // 绑定微信
  async authAgent() {
    const { ctx, service } = this;
    const query = this.ctx.query;
    const code = query.code;
    const platform = query.platform;
    const config = this.ctx.app.config.bwechat_config;
    // 获取授权access_token
    const url = config.getOauthAccessTokenUrl.replace('APPID', config.appid)
      .replace('SECRET', config.appsecret).replace('CODE', code);
    const res = await this.ctx.curl(url, {
      dataType: 'json',
    });
    const access_token = res.data.access_token;
    const openid = res.data.openid;
    // 获取用户信息
    const userInfoUrl = config.getOauthUserInfoUrl.replace('ACCESS_TOKEN', access_token).replace('OPENID', openid);
    const userInfoRes = await this.ctx.curl(userInfoUrl, {
      dataType: 'json',
    });
    console.log(userInfoRes.data);

    // this.ctx.cookies.set('user', JSON.stringify(userInfoRes.data), {
    //     httpOnly: true, // 默认就是 true
    //     encrypt: true, // 加密传输
    //   })
    this.ctx.cookies.set('openId', userInfoRes.data.openid, {
      encrypt: true,
    });
    this.ctx.cookies.set('headimgurl', userInfoRes.data.headimgurl, {
      encrypt: true,
    });
    this.ctx.cookies.set('nickname', userInfoRes.data.nickname, {
      encrypt: true,
    });
    this.ctx.cookies.set('sex', userInfoRes.data.sex === 1 ? '男' : '女', {
      encrypt: true,
    });


    // this.ctx.service.merchant.InserOrUpdate({
    //     OpenID: userInfoRes.data.openid,
    //     wechatName:userInfoRes.data.nickname,
    //     sex:userInfoRes.data.sex===1?'男':'女',
    //     headimgurl:userInfoRes.data.headimgurl,
    //     status:1//目前直接通过审核
    //   });
    // var user = this.ctx.cookies.get('nickname', { encrypt: true })


    this.ctx.body = 'hi, ' + userInfoRes.data.nickname;
    // var redirectUrl=this.ctx.app.config.awechat_config.bindwx;
    if (platform) {
      const agent = await this.service.adminuser.get(platform);
      if (!agent) {
        // 没有找到
        this.ctx.body = '没有找到该代理记录,请联系客服';
        // ctx.throw(404, '没有找到该代理记录,请联系客服');
      } else {
        if (agent.OpenID) {
          this.ctx.body = '该代理记录已有绑定微信,请联系客服';
          // ctx.throw(405, '该代理记录已有绑定记录,请联系客服');
        } else {
          agent.OpenID = userInfoRes.data.openid;
          await this.service.adminuser.findByIdAndUpdate(agent._id, agent);
          // ctx.helper.success({ ctx, res, msg });
          this.ctx.body = '绑定成功';
        }
        // todo返回绑定成功

      }


    } else {
      // 返回绑定失败，请联系客服
      this.ctx.body = '返回绑定失败，请联系客服';
      // this.ctx.unsafeRedirect(redirectUrl);
      // ctx.throw(403, '绑定失败，请联系客服');
    }

    // this.ctx.unsafeRedirect(redirectUrl);
  }

  // 获取代理信息
  async getAgentToken() {
    const query = this.ctx.query;
    const code = query.code;
    const platform = query.platform;
    const config = this.ctx.app.config.bwechat_config;
    // 获取授权access_token
    const url = config.getOauthAccessTokenUrl.replace('APPID', config.appid)
      .replace('SECRET', config.appsecret).replace('CODE', code);
    const res = await this.ctx.curl(url, {
      dataType: 'json',
    });
    const access_token = res.data.access_token;
    const openid = res.data.openid;
    // 获取用户信息
    const userInfoUrl = config.getOauthUserInfoUrl.replace('ACCESS_TOKEN', access_token).replace('OPENID', openid);
    const userInfoRes = await this.ctx.curl(userInfoUrl, {
      dataType: 'json',
    });

    this.ctx.cookies.set('openId', userInfoRes.data.openid, {
      encrypt: true,
    });
    this.ctx.cookies.set('headimgurl', userInfoRes.data.headimgurl, {
      encrypt: true,
    });
    this.ctx.cookies.set('nickname', userInfoRes.data.nickname, {
      encrypt: true,
    });
    this.ctx.cookies.set('sex', userInfoRes.data.sex === 1 ? '男' : '女', {
      encrypt: true,
    });

    // var user = this.ctx.cookies.get('nickname', { encrypt: true })


    this.ctx.body = 'hi, ' + userInfoRes.data.nickname;
    const redirectUrl = config.bindwx;
    const nfUrl = redirectUrl + '/notfound';
    const agent = await this.service.adminuser.findByOpenId(userInfoRes.data.openid);

    // if(trade){
    //     redirectUrl=redirectUrl+'/trade?id='+trade.split('-')[1]
    // }

    if (!agent)// 找不到openid的返回未授权，请联系客服
    {
      this.ctx.unsafeRedirect(nfUrl);
    } else {
      agent.headimgurl = userInfoRes.data.headimgurl;
      await this.service.adminuser.findByIdAndUpdate(agent._id, agent);
      this.ctx.unsafeRedirect(redirectUrl);
    }

  }

  // B2B
  async movie() {
    const query = this.ctx.query;
    const config = this.ctx.app.config.bwechat_config;
    const wbaseUrl = config.baseurl;
    const appid = config.appid;
    const platfromcode = query.platfromcode;
    const invitecode = query.icode;
    const pappid = 'wx0aff8dfdb9e59ecd';

    this.ctx.logger.info('总他妈找不到' + JSON.stringify(query));
    let redir = '';
    if (platfromcode) {
      const adminuser = await this.ctx.service.adminuser.findByPcode(platfromcode);
      if (!adminuser) {
        this.ctx.throw(404, '没有找到该记录');
      }
      if (!adminuser.appid) {
        this.ctx.throw(404, '没有找到该记录的appid');
      }
      const webappid = adminuser.appid;

      redir = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + webappid + '&redirect_uri=' + wbaseUrl + '/api/oauth/getAccessToken?platform=' + platfromcode + '&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=' + pappid + '#wechat_redirect';
      this.ctx.logger.info('ceshi1');
    }
    // else if(invitecode)
    // {
    //     redir= 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + wbaseUrl + '/api/oauth/getAccessToken?icode=' + invitecode + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
    // }
    else {

      redir = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + wbaseUrl + '/api/oauth/getAccessToken?usertype=1&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
    }


    this.ctx.unsafeRedirect(redir);
    // 重定向
  }
}

module.exports = OauthController;

