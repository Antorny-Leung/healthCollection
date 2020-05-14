'use strict';

const Controller = require('egg').Controller;
const dateFormat = require('dateformat');
// const formurlencoded = require('form-urlencoded').default;
class HuaWeiController extends Controller {

  // 查询用户基本信息
  async getUserInfoBase() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const config = this.ctx.app.config.hihealth;
    const uibUrl = config.getUserInfoBase.replace('TIMESTAMP', new Date().getTime());

    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      open_id: 'OPENID',
      access_token: user.access_token,
    };
    // 查询api
    const UserInfoBase = await this.ctx.curl(uibUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
    });
    console.log(UserInfoBase);
    // 调用 Service 进行更新业务处理
    // const res = await service.huawei.getUserInfoBase(userid);
    // 更新 User中的外键
    user.openid = UserInfoBase.open_id;
    const res = await service.user.update(userid, user);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, res });
  }

  // 查询用户每日运动汇总数据
  async getSportsStat() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = query.startdate || new Date();
    const edate = query.endtdate || new Date();
    const startDate = dateFormat(sdate, 'yyyymmdd');
    const endDate = dateFormat(edate, 'yyyymmdd');
    const config = this.ctx.app.config.hihealth;
    const ssUrl = config.getSportsStat.replace('TIMESTAMP', new Date().getTime());
    let sportstate = '';
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      startDate,
      endDate,
      access_token: user.access_token,
    };
    // 查询api
    const SportsStat = await this.ctx.curl(ssUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
    });
    console.log(SportsStat);
    // 调用 Service 进行更新业务处理
    if (user.Sportrecord) {
      sportstate = await service.sportrecord.update(user.Sportrecord, SportsStat);
    } else {
      sportstate = await service.sportrecord.create(SportsStat);
      // 更新 User中的外键
      user.Sportrecord = sportstate;
      await service.user.update(userid, user);
    }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, SportsStat });
  }

  // 查询运动轨迹统计数据
  async getMotionPathData() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const stime = query.starttime || new Date();
    const etime = query.endttime || new Date();
    const startTime = stime.getTime();
    const endTime = etime.getTime();
    const config = this.ctx.app.config.hihealth;
    const ssUrl = config.getMotionPathData.replace('TIMESTAMP', new Date().getTime());
    let mpdata = '';
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      startTime,
      endTime,
      access_token: user.access_token,
    };
    // 查询api
    const MotionPathData = await this.ctx.curl(ssUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
    });
    console.log(MotionPathData);
    // 调用 Service 进行更新业务处理
    if (user.Sportrecord) {
      mpdata = await service.sportrecord.update(user.Sportrecord, MotionPathData);
    } else {
      mpdata = await service.sportrecord.create(MotionPathData);
      // 更新 User中的外键
      user.Sportrecord = mpdata;
      await service.user.update(userid, user);
    }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, MotionPathData });
  }

  // 查询单次运动详情数据
  async getMotionPathDetail() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const stime = query.starttime || new Date();
    const startTime = stime.getTime();
    const config = this.ctx.app.config.hihealth;
    const mpdUrl = config.getMotionPathDetail.replace('TIMESTAMP', new Date().getTime());
    let mpdetail = {};
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      startTime,
      access_token: user.access_token,
    };
    // 查询api
    const MotionPathDetail = await this.ctx.curl(mpdUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
    });
    console.log(MotionPathDetail);
    // 调用 Service 进行更新业务处理
    if (user.Sportrecord) {
      mpdetail = await service.sportrecord.update(user.Sportrecord, MotionPathDetail);
    } else {
      mpdetail = await service.sportrecord.create(MotionPathDetail);
      // 更新 User中的外键
      user.Sportrecord = mpdetail;
      await service.user.update(userid, user);
    }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, MotionPathDetail });
  }

  // 查询用户每日健康汇总数据
  async getHealthStat() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = query.startdate || new Date();
    const edate = query.endtdate || new Date();
    const type = query.type || 7;// 9睡眠
    const startDate = dateFormat(sdate, 'yyyymmdd');
    const endDate = dateFormat(edate, 'yyyymmdd');
    const config = this.ctx.app.config.hihealth;
    const htUrl = config.getHealthStat.replace('TIMESTAMP', new Date().getTime());
    let sleep = '';
    let heartrate = '';
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      startDate,
      endDate,
      type,
      access_token: user.access_token,
    };
    // 查询api
    const HealthStat = await this.ctx.curl(htUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
    });
    console.log(HealthStat);
    // 调用 Service 进行更新业务处理
    if (type === 7) {
      if (user.HeartRate) {
        heartrate = await service.heartrate.update(user.HeartRate, HealthStat);
      } else {
        heartrate = await service.heartrate.create(HealthStat);
        // 更新 User中的外键
        user.HeartRate = heartrate;
        await service.user.update(userid, user);
      }
    } else {
      if (user.Sleep) {
        sleep = await service.sleep.update(user.Sleep, HealthStat);
      } else {
        sleep = await service.sleep.create(HealthStat);
        // 更新 User中的外键
        user.Sleep = sleep;
        await service.user.update(userid, user);
      }
    }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, HealthStat });
  }

  // 查询用户健康明细数据
  async getHealthData() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const stime = query.starttime || new Date();
    const etime = query.endtime || new Date();
    const type = query.type || 4;// 4血糖/5血压/7心率/8体重体脂/9睡眠
    const startTime = stime.getTime();
    const endTime = etime.getTime();
    const config = this.ctx.app.config.hihealth;
    const htUrl = config.getHealthData.replace('TIMESTAMP', parseInt(new Date().getTime() / 1000));
    let bloodglucose = {};
    let bloodpressure = {};
    let heartrate = {};
    let weight = {};
    let sleep = {};
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      // req: formurlencoded({
      startTime,
      endTime,
      type,
      // }),
      access_token: user.access_token, // : formurlencoded(user.access_token),
    };
    // 查询api
    const HealthData = await this.ctx.curl(htUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
      headers: {
        // Authorization: `Bearer ${user.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log(HealthData);
    // 调用 Service 进行更新业务处理
    switch (type) {
      case 4:
        if (user.Bloodglucose) {
          bloodglucose = await service.bloodglucose.update(user.Bloodglucose, HealthData);
        } else {
          bloodglucose = await service.bloodglucose.create(HealthData);
          // 更新 User中的外键
          user.Bloodglucose = bloodglucose;
          await service.user.update(userid, user);
        }
        break;
      case 5:
        if (user.BloodPressure) {
          bloodpressure = await service.bloodpressure.update(user.BloodPressure, HealthData);
        } else {
          bloodpressure = await service.bloodpressure.create(HealthData);
          // 更新 User中的外键
          user.BloodPressure = bloodpressure;
          await service.user.update(userid, user);
        }
        break;
      case 7:
        if (user.HeartRate) {
          heartrate = await service.heartrate.update(user.HeartRate, HealthData);
        } else {
          heartrate = await service.heartrate.create(HealthData);
          // 更新 User中的外键
          user.HeartRate = heartrate;
          await service.user.update(userid, user);
        }
        break;
      case 8:
        if (user.Weight) {
          weight = await service.weight.update(user.Weight, HealthData);
        } else {
          weight = await service.weight.create(HealthData);
          // 更新 User中的外键
          user.Weight = weight;
          await service.user.update(userid, user);
        }
        break;
      default:
        if (user.Sleep) {
          sleep = await service.sleep.update(user.Sleep, HealthData);
        } else {
          sleep = await service.sleep.create(HealthData);
          // 更新 User中的外键
          user.Sleep = sleep;
          await service.user.update(userid, user);
        }
    }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, HealthData });
  }

  // 查询用户信息
  async getUserInfo() {
    const { ctx, service } = this;
    // 校验参数
    const query = this.ctx.query;
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const config = this.ctx.app.config.hihealth;
    const ssUrl = config.getUserInfo.replace('TIMESTAMP', new Date().getTime());
    let userinfo = {};
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const pdata = {
      type: 0,
      access_token: user.access_token,
    };
    // 查询api
    const UserInfo = await this.ctx.curl(ssUrl, {
      method: 'POST',
      dataType: 'json',
      data: pdata,
    });
    console.log(UserInfo);
    // 调用 Service 进行更新业务处理
    if (user.Weight) {
      userinfo = await service.sportrecord.update(user.Weight, UserInfo);
    } else {
      userinfo = await service.sportrecord.create(UserInfo);
      // 更新 User中的外键
      user.Weight = userinfo;
      await service.user.update(userid, user);
    }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, UserInfo });
  }

  // 查询绑定设备信息
  async getDeviceInfo() {
    const { ctx, service } = this;
    const res = '敬请期待';
    ctx.helper.success({ ctx, res });
  }
}

module.exports = HuaWeiController;

