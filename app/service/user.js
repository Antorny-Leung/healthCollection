'use strict';

const Service = require('egg').Service;
const xml2js = require('../util/xml2js');
class UserService extends Service {

  get model() {
    return this.ctx.model.User;
  }

  async create(payload) {
    const { ctx, service } = this;
    return this.model.create(payload);
  }

  async InserOrUpdate(payload) {
    const { ctx, service } = this;
    const instance = await this.model.findOne({ OpenID: payload.OpenID });
    if (!instance) {
      // 未关注新增
      return this.model.create(payload);
    }

    instance.nativeOpenId = payload.nativeOpenId ? payload.nativeOpenId : null,
    instance.OpenID = payload.OpenID,
    instance.wechatName = payload.wechatName,
    instance.sex = payload.sex,
    instance.headimgurl = payload.headimgurl,
    instance.invitor = payload.invitor;
    instance.updatedAt = new Date();
    instance.platform = payload.platform;
    return this.model.findByIdAndUpdate(instance._id, instance);

  }
  // destroy======================================================================================================>
  async destroy(_id) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该记录');
    }
    return this.model.findByIdAndRemove(_id);
  }

  // update======================================================================================================>
  async update(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该记录');
    }
    return this.model.findByIdAndUpdate(_id, payload);
  }

  // updateAccessToken======================================================================================================>
  async updateAccessToken(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该用户');
    }
    instance.access_token = payload.access_token;
    instance.refresh_token = payload.refresh_token;
    return this.model.findByIdAndUpdate(_id, instance);
  }

  // show======================================================================================================>
  async show(_id) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, 'user not found');
    }
    return this.model.findById(_id);
  }

  // index======================================================================================================>
  async index(payload) {
    const { currentPage, pageSize, isPaging = true, user } = payload;
    let res = [];
    let count = 0;
    const _filter = {};
    // const isadmin = user.role.name === 'administrator';//
    // if (!isadmin) {
    //   _filter.career = user.career;
    // }
    const skip = ((Number(currentPage)) - 1) * Number(pageSize || 10);
    if (isPaging) {
      res = await this.model.find(_filter).skip(skip)
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .exec();
      count = await this.model.count({}).exec();
    } else {
      res = await this.model.find(_filter).sort({ createdAt: -1 })
        .exec();
      count = await this.model.count({}).exec();
    }

    return { count, list: res, pageSize: Number(pageSize), currentPage: Number(currentPage) };
  }

  async removes(payload) {
    return this.model.remove({ _id: { $in: payload } });
  }

  async find(id) {
    return this.model.findById(id).populate('platform').populate('invitor');
  }

  async findByIdAndUpdate(id, values) {
    return this.model.findByIdAndUpdate(id, values);
  }


  async findByOpenId(OpenID) {
    return this.model.findOne({ OpenID })
      .populate('invitor')
      .populate('platform')
      .exec();
  }


  async findByinvitecode(invitecode) {
    return this.model.findOne({ invitecode });
  }

  async updateBalance(id, amount) {
    const res = await this.model.update(
      {
        _id: id,
      },
      {
        $inc: { available: amount, balance: -amount },
      }
    );
    return res;
  }

  // 发起付款======================================================================================================>
  async pay(value, orderId, ip) {
    const { ctx, service, app } = this;
    const config = app.config.wxpay_config;
    const url = config.wxpayNowOrderUrl;
    const pkey = config.pkey;
    const openid = this.ctx.cookies.get('openId', { encrypt: true });
    const user = await this.ctx.service.user.findByOpenId(openid);


    const msg = {
      appid: config.appid,
      mch_id: config.mch_id,
      device_info: 'WEB',
      nonce_str: Math.random().toString(),
      body: '询价充值支付',
      out_trade_no: orderId,
      total_fee: (Number(value) * 100).toFixed(0),
      spbill_create_ip: ip,
      notify_url: config.baseurl + '/api/user/confirmed',
      trade_type: 'JSAPI', // 'MWEB',//'JSAPI',
      openid: user.nativeOpenId || user.OpenID,
    };

    const sign = await this.service.order.compress(msg, pkey);
    msg.sign = sign;
    ctx.logger.info('支付原始信息', JSON.stringify(msg));

    const xml = await xml2js.createXml(msg);

    const res = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: xml,
      dataType: 'xml',
    });

    // const resdata = await xml2js.parseXml(res.toString('utf8'))
    const data = await xml2js.parseXml(res.data.toString('utf8'));
    ctx.logger.info('支付信息', JSON.stringify(data));
    if (!data.prepay_id) {
      ctx.throw(408, data.err_code_des);
    }

    // this.ctx.unsafeRedirect(data.mweb_url);
    const params = await this.ctx.service.order.callPayParams(data.prepay_id);

    return params;
  }

  // 支付成功
  async payed(payment, type) {

    if ((payment.result_code === 'SUCCESS' && payment.trade_state === 'SUCCESS' && type == 2) || (payment.result_code === 'SUCCESS' && type == 1)) {

      const tradeins = await this.ctx.service.recharge.find(payment.out_trade_no);
      this.ctx.logger.info('充值回调原来充值信息' + JSON.stringify(tradeins));
      const mc = await this.ctx.service.user.show(tradeins.buyer);
      this.ctx.logger.info('充值回调原来账户信息' + JSON.stringify(mc));
      if (!tradeins) {
        this.ctx.throw(404, '未找到该记录');
      }
      if (tradeins.payStatus == 1) {
        this.ctx.throw(500, '该记录已支付成功');
      }
      if (payment.fee_type === 'CNY' && payment.openid == mc.nativeOpenId && Math.abs(parseInt(payment.total_fee) - parseInt(tradeins.value * 100)) < 10) { // 更安全加验签
        tradeins.payStatus = 1;
        const updatarc = await this.ctx.service.recharge.update(tradeins._id, tradeins);
        this.ctx.logger.info('充值回调更新后充值信息' + JSON.stringify(updatarc));
        // 更新询价次数
        let updateTimes = 0;
        if (tradeins.value == 10) {
          updateTimes = 22;
        } else if (tradeins.value == 50) {
          updateTimes = 120;
        } else if (tradeins.value == 100) {
          updateTimes = 250;
        }
        mc.uconsult = mc.uconsult + updateTimes;
        const updatamc = await this.ctx.service.user.update(mc._id, mc);
        this.ctx.logger.info('充值回调更新后账户信息' + JSON.stringify(updatamc));
        return 'success';
      }

      return '支付失败';

    }
  }

}

module.exports = UserService;
