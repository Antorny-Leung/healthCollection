'use strict';

const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
  static get schedule() {
    return {
      interval: 3600000,
      type: 'worker',
    };
  }

  async subscribe() {
    const users = await this.service.user.findHasToken();
    const config = this.ctx.app.config.hmscore;
    const reatUrl = config.getAccessToken;
    users.map(async user => {
      const pdata = {
        grant_type: 'refresh_token',
        refresh_token: user.refresh_token,
        client_id: config.client_id,
        client_secret: config.client_secret,
      };
      const AccessToken = await this.ctx.curl(reatUrl, {
        method: 'POST',
        dataType: 'json',
        data: pdata,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log(AccessToken);
      await this.service.user.refreshAccessToken(user._id, AccessToken);
      console.log(AccessToken);
    });

  }
}

module.exports = UpdateCache;
