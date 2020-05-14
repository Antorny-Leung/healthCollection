'use strict';

const Controller = require('egg').Controller;


class OauthController extends Controller {
  async getAccessToken() {
    const { ctx } = this;
    const query = this.ctx.query;
    const acode = query.authorization_code;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const config = this.ctx.app.config.hmscore;
    const pdata = {
      grant_type: 'authorization_code',
      code: acode,
      client_id: config.client_id,
      client_secret: config.client_secret,
      redirect_uri: config.redirect_uri,
    };
    const atUrl = config.getAccessToken;

    const AccessToken = await this.ctx.curl(atUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log(AccessToken);

    const res = await this.saveUserAT(userid, AccessToken);
    ctx.body = '授权成功！！！';
    ctx.helper.success({ ctx, res });
  }

  // 更新该用户的华为AT
  async saveUserAT(userid, AT) {

    const payload = AT;

    const res = await this.service.user.updateAccessToken(userid, payload);

    return res;
  }

}

module.exports = OauthController;

