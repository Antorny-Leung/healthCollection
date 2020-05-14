'use strict';

const Service = require('egg').Service;


class HuaweiService extends Service {

  get bloodglucosemodel() {
    return this.ctx.model.Bloodglucose;
  }
  get bloodpressuremodel() {
    return this.ctx.model.Bloodpressure;
  }
  get heartratemodel() {
    return this.ctx.model.Heartrate;
  }
  get oxyhemoglobin() {
    return this.ctx.model.Oxyhemoglobin;
  }
  get pressuremodel() {
    return this.ctx.model.Pressure;
  }
  get sleepmodel() {
    return this.ctx.model.Sleep;
  }
  get sportrecordmodel() {
    return this.ctx.model.Sportrecord;
  }
  get temperaturemodel() {
    return this.ctx.model.Temperaturecord;
  }
  get usermodel() {
    return this.ctx.model.User;
  }
  get weightmodel() {
    return this.ctx.model.Weight;
  }

  // updateAccessToken======================================================================================================>
  async updateAccessToken(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.huawei.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该用户');
    }
    instance.access_token = payload.access_token;
    instance.refresh_token = payload.refresh_token;
    return this.model.findByIdAndUpdate(_id, instance);
  }


}

module.exports = HuaweiService;
