'use strict';

const Controller = require('egg').Controller;
const dateFormat = require('dateformat');
// const formurlencoded = require('form-urlencoded').default;
class EstimateController extends Controller {

  // 查询用户基本信息
  async getUserEstimate() {
    const { ctx, service } = this;
    // 组装参数
    const payload = ctx.request.body || {};
    // 查询api
    const res = await service.estimate.getEstimate(payload.summary);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, res });
  }
}

module.exports = EstimateController;

