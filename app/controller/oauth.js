'use strict';

const Controller = require('egg').Controller;


class OauthController extends Controller {
  async getAccessToken() {
    const query = this.ctx.query;
    const acode = query.acode;
    const config = this.ctx.app.config.hihealth;
    const pdata = {};
    const atUrl = config.getAccessToken;

    const AccessToken = await this.ctx.curl(atUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
      headers: {
        Host: 'healthopen.hicloud.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + acode,
      },
    });
    console.log(AccessToken);

    // this.ctx.cookies.set('user', JSON.stringify(userInfoRes.data), {
    //     httpOnly: true, // 默认就是 true
    //     encrypt: true, // 加密传输
    //   })
    // this.ctx.unsafeRedirect(redirectUrl);
  }

  async getUerInfo() {
    const { ctx, service } = this;
    const query = this.ctx.query;
    const acode = query.acode;
    const userid = query.userid;
    const config = this.ctx.app.config.hihealth;
    const pdata = {};
    const atUrl = config.getAccessToken;

    const AccessToken = await this.ctx.curl(atUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
      headers: {
        Host: 'healthopen.hicloud.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + acode,
      },
    });
    console.log(AccessToken);

    const payload = AccessToken;

    const res = await service.User.updateAccessToken(userid, payload);

    ctx.helper.success({ ctx, res });
    // this.ctx.cookies.set('user', JSON.stringify(userInfoRes.data), {
    //     httpOnly: true, // 默认就是 true
    //     encrypt: true, // 加密传输
    //   })
    // this.ctx.unsafeRedirect(redirectUrl);
  }
}

module.exports = OauthController;

