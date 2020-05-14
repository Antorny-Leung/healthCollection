'use strict';

const Controller = require('egg').Controller;
class HmsCoreController extends Controller {


  // 查询用户步行数据
  async getStep() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const stepresult = await service.hms.getStep(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, stepresult });
  }

  // 查询用户体重数据
  async getWeight() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const weightresult = await service.hms.getWeight(sdate, edate);
    const fatrateresult = await service.hms.getFatrate(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, weightresult, fatrateresult });
  }

  // 查询用户运动数据
  async getSport() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const distanceresult = await service.hms.getDistance(sdate, edate);
    const energyresult = await service.hms.getEnergy(sdate, edate);
    const heartrateresult = await service.hms.getHeartrate(sdate, edate);
    const speedresult = await service.hms.getSpeed(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, distanceresult, energyresult, heartrateresult, speedresult });
  }

  // 查询用户热量数据
  async getEnergy() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const energyresult = await service.hms.getEnergy(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, energyresult });
  }

  // 查询用户心率数据
  async getHeartrate() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const heartrateresult = await service.hms.getHeartrate(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, heartrateresult });
  }

  // 查询用户体温数据
  async getTemperature() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const temresult = await service.hms.getTemperature(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, temresult });
  }

  // 查询用户血糖数据
  async getBloodglucosee() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const bloodglucoseeresult = await service.hms.getBloodglucosee(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, bloodglucoseeresult });
  }

  // 查询用户血压数据
  async getBloodpressure() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const bloodpressureresult = await service.hms.getBloodpressure(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, bloodpressureresult });
  }

  // 查询用户血氧数据
  async getOxyhemoglobine() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const sdate = query.startdate ? new Date(query.startdate) : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const edate = query.enddate ? new Date(query.enddate) : new Date();
    const oxyhemoglobineresult = await service.hms.getOxyhemoglobine(sdate, edate);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, oxyhemoglobineresult });
  }

}

module.exports = HmsCoreController;

