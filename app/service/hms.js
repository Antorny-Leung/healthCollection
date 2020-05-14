'use strict';

const Service = require('egg').Service;
const request = require('request-promise');

class HmsService extends Service {

  get bloodglucosemodel() {
    return this.ctx.model.Bloodglucose;
  }
  get heartrateemodel() {
    return this.ctx.model.Heartrate;
  }
  get bloodpressuremodel() {
    return this.ctx.model.Bloodpressure;
  }
  get oxyhemoglobinmodel() {
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
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该用户');
    }
    instance.access_token = payload.access_token;
    instance.refresh_token = payload.refresh_token;
    return this.model.findByIdAndUpdate(_id, instance);
  }

  // 查询用户步行数据
  async getStep(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    const stepId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Step',
      collectorType: 'derived',
      appInfo: {
        // // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'steps_delta',
            format: 'integer',
          },
        ],
        name: 'com.huawei.continuous.steps.delta',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const options = {
      method: 'POST',
      uri: ccUrl,
      body: datacollector,
      json: true,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${user.access_token}`,
      },
    };
    if (!user.stepdataId) {
      // 未有采集器相关记录
      const stepdatacollector = await request(options).catch(e => e);
      datacollectorId = stepdatacollector.collectorId;
      // 更新 User中的采集器Id
      user.stepdataId = datacollectorId;
      await service.user.update(userid, user);
    } else {
      datacollectorId = user.stepdataId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    const quroptions = {
      method: 'GET',
      uri: queryUrl,
      json: true,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${user.access_token}`,
      },
    };
    // 查询api
    const stepresult = await request(quroptions).catch(e => e);
    const step = {
      step: stepresult.samplePoints[stepresult.samplePoints.length - 1].value,
      recordAt: new Date(stepresult.samplePoints[stepresult.samplePoints.length - 1].endTime),
      user: user._id,
    };
    // 新增采集器记录
    await this.service.step.create(step);
    console.log(stepresult);
    // 设置响应内容和响应状态码
    return stepresult;
  }

  // 查询用户体重数据
  async getWeight(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let weightId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Weight',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'avg',
            format: 'float',
          },
          {
            name: 'max',
            format: 'float',
          },
          {
            name: 'min',
            format: 'float',
          },
        ],
        name: 'com.huawei.continuous.body_weight.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.weight) {
    // 未有相关记录
      const weightdatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initweight = {
        datacollectorId: weightdatacollector.collectorId,
      };
      // 新增采集器记录
      weightId = await this.service.weight.create(initweight);
      // 更新 User中的外键
      user.weight = [ weightId ];
      await service.user.update(userid, user);
      datacollectorId = weightdatacollector.collectorId;
    } else {
      datacollectorId = user.weight[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const weightresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const weight = {
      weight: weightresult.samplePoints[weightresult.samplePoints.length - 1].value,
      recordAt: new Date(weightresult.samplePoints[weightresult.samplePoints.length - 1].endTime),
      datacollectorId: weightresult.samplePoints[weightresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(weightresult);
    // 调用 Service 进行更新业务处理
    await service.weight.InserOrUpdate(weightId, weight);
    // 设置响应内容和响应状态码
    return weightresult;
  }

  // 查询用户体脂数据
  async getFatrate(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let fatrateId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Fatrate',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'avg',
            format: 'float',
          },
          {
            name: 'max',
            format: 'float',
          },
          {
            name: 'min',
            format: 'float',
          },
        ],
        name: 'com.huawei.continuous.body.fat.rate.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.weight) {
    // 未有相关记录
      const fatratedatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initfatrate = {
        datacollectorId: fatratedatacollector.collectorId,
      };
      // 新增采集器记录
      fatrateId = await this.service.fatrate.create(initfatrate);
      // 更新 User中的外键
      user.weight = [ fatrateId ];
      await service.user.update(userid, user);
      datacollectorId = fatratedatacollector.collectorId;
    } else {
      datacollectorId = user.weight[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const fatrateresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const fatrate = {
      fatrate: fatrateresult.samplePoints[fatrateresult.samplePoints.length - 1].value,
      recordAt: new Date(fatrateresult.samplePoints[fatrateresult.samplePoints.length - 1].endTime),
      datacollectorId: fatrateresult.samplePoints[fatrateresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(fatrateresult);
    // 调用 Service 进行更新业务处理
    await service.fatrate.InserOrUpdate(fatrateId, fatrate);
    // 设置响应内容和响应状态码
    return fatrateresult;
  }

  // 查询用户运动距离数据
  async getDistance(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let distanceId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Distance',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'distance_delta',
            format: 'float',
          },
          //   {
          //     name: 'max',
          //     format: 'float',
          //   },
          //   {
          //     name: 'min',
          //     format: 'float',
          //   },
        ],
        name: 'com.huawei.continuous.distance.delta',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.sportrecord) {
    // 未有相关记录
      const distancedatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initdistance = {
        datacollectorId: distancedatacollector.collectorId,
      };
      // 新增采集器记录
      distanceId = await this.service.distance.create(initdistance);
      // 更新 User中的外键
      user.sportrecord = [ distanceId ];
      await service.user.update(userid, user);
      datacollectorId = distancedatacollector.collectorId;
    } else {
      datacollectorId = user.sportrecord[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const distanceresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const distance = {
      distance: distanceresult.samplePoints[distanceresult.samplePoints.length - 1].value,
      recordAt: new Date(distanceresult.samplePoints[distanceresult.samplePoints.length - 1].endTime),
      datacollectorId: distanceresult.samplePoints[distanceresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(distanceresult);
    // 调用 Service 进行更新业务处理
    await service.distance.InserOrUpdate(distanceId, distance);
    // 设置响应内容和响应状态码
    return distanceresult;
  }

  // 查询用户速度数据
  async getSpeed(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let speedId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Speed',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'avg',
            format: 'float',
          },
          {
            name: 'max',
            format: 'float',
          },
          {
            name: 'min',
            format: 'float',
          },
        ],
        name: 'com.huawei.continuous.speed.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.sportrecord) {
    // 未有相关记录
      const speeddatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initspeed = {
        datacollectorId: speeddatacollector.collectorId,
      };
      // 新增采集器记录
      speedId = await this.service.speed.create(initspeed);
      // 更新 User中的外键
      user.sportrecord = [ speedId ];
      await service.user.update(userid, user);
      datacollectorId = speeddatacollector.collectorId;
    } else {
      datacollectorId = user.sportrecord[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const speedresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const speed = {
      speed: speedresult.samplePoints[speedresult.samplePoints.length - 1].value,
      recordAt: new Date(speedresult.samplePoints[speedresult.samplePoints.length - 1].endTime),
      datacollectorId: speedresult.samplePoints[speedresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(speedresult);
    // 调用 Service 进行更新业务处理
    await service.speed.InserOrUpdate(speedId, speed);
    // 设置响应内容和响应状态码
    return speedresult;
  }

  // 查询用户热量数据
  async getEnergy(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let energyId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Energy',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'calories',
            format: 'float',
          },
          //   {
          //     name: 'max',
          //     format: 'float',
          //   },
          //   {
          //     name: 'min',
          //     format: 'float',
          //   },
        ],
        name: 'com.huawei.continuous.calories.burnt',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.sportrecord) {
    // 未有相关记录
      const energydatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initenergy = {
        datacollectorId: energydatacollector.collectorId,
      };
      // 新增采集器记录
      energyId = await this.service.energy.create(initenergy);
      // 更新 User中的外键
      user.sportrecord = [ energyId ];
      await service.user.update(userid, user);
      datacollectorId = energydatacollector.collectorId;
    } else {
      datacollectorId = user.sportrecord[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const energyresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const energy = {
      energy: energyresult.samplePoints[energyresult.samplePoints.length - 1].value,
      recordAt: new Date(energyresult.samplePoints[energyresult.samplePoints.length - 1].endTime),
      datacollectorId: energyresult.samplePoints[energyresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(energyresult);
    // 调用 Service 进行更新业务处理
    await service.energy.InserOrUpdate(energyId, energy);
    // 设置响应内容和响应状态码
    return energyresult;
  }

  // 查询用户心率数据
  async getHeartrate(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let heartrateId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'user.heartrate',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'avg',
            format: 'float',
          },
          {
            name: 'max',
            format: 'float',
          },
          {
            name: 'min',
            format: 'float',
          },
        ],
        name: 'com.huawei.continuous.heart_rate.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.user.heartrate) {
      // 未有相关记录
      const heartratedatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initheartrate = {
        datacollectorId: heartratedatacollector.collectorId,
      };
      // 新增采集器记录
      heartrateId = await this.service.heartrate.create(initheartrate);
      // 更新 User中的外键
      user.user.heartrate = [ heartrateId ];
      await service.user.update(userid, user);
      datacollectorId = heartratedatacollector.collectorId;
    } else {
      datacollectorId = user.user.heartrate[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const heartrateresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const heartrate = {
      heartrate: heartrateresult.samplePoints[heartrateresult.samplePoints.length - 1].value,
      recordAt: new Date(heartrateresult.samplePoints[heartrateresult.samplePoints.length - 1].endTime),
      datacollectorId: heartrateresult.samplePoints[heartrateresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(heartrateresult);
    // 调用 Service 进行更新业务处理
    await service.heartrate.InserOrUpdate(heartrateId, heartrate);
    // 设置响应内容和响应状态码
    return heartrateresult;
  }

  // 查询用户体温数据
  async getTemperature(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let temperatureId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Temperature',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'avg',
            format: 'float',
          },
          {
            name: 'max',
            format: 'float',
          },
          {
            name: 'min',
            format: 'float',
          },
          {
            name: 'measure_body_part_of_temperature',
            format: 'int',
          },
        ],
        name: 'com.huawei.continuous.body.temperature.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.temperature) {
    // 未有相关记录
      const temperaturedatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const inittemperature = {
        datacollectorId: temperaturedatacollector.collectorId,
      };
      // 新增采集器记录
      temperatureId = await this.service.temperature.create(inittemperature);
      // 更新 User中的外键
      user.temperature = [ temperatureId ];
      await service.user.update(userid, user);
      datacollectorId = temperaturedatacollector.collectorId;
    } else {
      datacollectorId = user.temperature[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const temperatureresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const temperature = {
      temperature: temperatureresult.samplePoints[temperatureresult.samplePoints.length - 1].value,
      recordAt: new Date(temperatureresult.samplePoints[temperatureresult.samplePoints.length - 1].endTime),
      datacollectorId: temperatureresult.samplePoints[temperatureresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(temperatureresult);
    // 调用 Service 进行更新业务处理
    await service.temperature.InserOrUpdate(temperatureId, temperature);
    // 设置响应内容和响应状态码
    return temperatureresult;
  }

  // 查询用户血糖数据
  async getBloodglucosee(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let bloodglucoseeId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Bloodglucosee',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'avg',
            format: 'float',
          },
          {
            name: 'max',
            format: 'float',
          },
          {
            name: 'min',
            format: 'float',
          },
          {
            name: 'correlation_with_mealtime',
            format: 'int',
          },
          {
            name: 'meal',
            format: 'int',
          },
          {
            name: 'correlation_with_sleep_state',
            format: 'int',
          },
          {
            name: 'sample_source',
            format: 'int',
          },
        ],
        name: 'com.huawei.continuous.blood_glucose.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.bloodglucosee) {
    // 未有相关记录
      const bloodglucoseedatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initbloodglucosee = {
        datacollectorId: bloodglucoseedatacollector.collectorId,
      };
      // 新增采集器记录
      bloodglucoseeId = await this.service.bloodglucosee.create(initbloodglucosee);
      // 更新 User中的外键
      user.bloodglucosee = [ bloodglucoseeId ];
      await service.user.update(userid, user);
      datacollectorId = bloodglucoseedatacollector.collectorId;
    } else {
      datacollectorId = user.bloodglucosee[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const bloodglucoseeresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const bloodglucosee = {
      bloodglucosee: bloodglucoseeresult.samplePoints[bloodglucoseeresult.samplePoints.length - 1].value,
      recordAt: new Date(bloodglucoseeresult.samplePoints[bloodglucoseeresult.samplePoints.length - 1].endTime),
      datacollectorId: bloodglucoseeresult.samplePoints[bloodglucoseeresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(bloodglucoseeresult);
    // 调用 Service 进行更新业务处理
    await service.bloodglucosee.InserOrUpdate(bloodglucoseeId, bloodglucosee);
    // 设置响应内容和响应状态码
    return bloodglucoseeresult;
  }

  // 查询用户血压数据
  async getBloodpressure(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime();
    const endDate = edate.getTime();
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    let BloodpressureId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Bloodpressure',
      collectorType: 'derived',
      appInfo: {
        // appPackageName: 'com.ylz.health',
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'systolic_pressure',
            format: 'float',
          },
          {
            name: 'diastolic_pressure',
            format: 'float',
          },
          {
            name: 'body_posture',
            format: 'int',
          },
          {
            name: 'measure_body_part_of_blood_pressure',
            format: 'int',
          },
          //   {
          //     name: 'meal',
          //     format: 'int',
          //   },
          //   {
          //     name: 'correlation_with_sleep_state',
          //     format: 'int',
          //   },
          //   {
          //     name: 'sample_source',
          //     format: 'int',
          //   },
        ],
        name: 'com.huawei.instantaneous.blood_pressure',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    if (!user.Bloodpressure) {
    // 未有相关记录
      const Bloodpressuredatacollector = await this.ctx.curl(ccUrl, {
        method: 'POST',
        dataType: 'json',
        data: datacollector,
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const initBloodpressure = {
        datacollectorId: Bloodpressuredatacollector.collectorId,
      };
      // 新增采集器记录
      BloodpressureId = await this.service.Bloodpressure.create(initBloodpressure);
      // 更新 User中的外键
      user.Bloodpressure = [ BloodpressureId ];
      await service.user.update(userid, user);
      datacollectorId = Bloodpressuredatacollector.collectorId;
    } else {
      datacollectorId = user.Bloodpressure[0].datacollectorId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    // 查询api
    const Bloodpressureresult = await this.ctx.curl(queryUrl, {
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const Bloodpressure = {
      Bloodpressure: Bloodpressureresult.samplePoints[Bloodpressureresult.samplePoints.length - 1].value,
      recordAt: new Date(Bloodpressureresult.samplePoints[Bloodpressureresult.samplePoints.length - 1].endTime),
      datacollectorId: Bloodpressureresult.samplePoints[Bloodpressureresult.samplePoints.length - 1].dataCollectorId,
    };
    console.log(Bloodpressureresult);
    // 调用 Service 进行更新业务处理
    await service.Bloodpressure.InserOrUpdate(BloodpressureId, Bloodpressure);
    // 设置响应内容和响应状态码
    return Bloodpressureresult;
  }


  // 查询用户血氧数据
  async getOxyhemoglobine(startdate, endtdate) {
    const { ctx, service } = this;
    // 校验参数
    const userid = '5e8c3d4fb8655fc470b2d3e7';
    const sdate = startdate || new Date();
    const edate = endtdate || new Date();
    const startDate = sdate.getTime() + '000000';
    const endDate = edate.getTime() + '000000';
    const sampleSetId = startDate + '-' + endDate;
    let datacollectorId = '';
    const oxyhemoglobinId = '';
    const config = this.ctx.app.config.hmscore;
    const ccUrl = config.baseurl + config.createdataCollectors;
    const datacollector = {
      collectorName: 'Oxyhemoglobine',
      collectorType: 'derived',
      appInfo: {
        appName: 'YLZHEALTH',
        desc: '',
        appVersion: '1',
      },
      collectorDataType: {
        field: [
          {
            name: 'saturation_avg',
            format: 'float',
          },
          {
            name: 'saturation_max',
            format: 'float',
          },
          {
            name: 'saturation_min',
            format: 'float',
          },
          {
            name: 'oxygen_supply_flow_rate_avg',
            format: 'float',
          },
          {
            name: 'oxygen_supply_flow_rate_max',
            format: 'float',
          },
          {
            name: 'oxygen_supply_flow_rate_min',
            format: 'float',
          },
          {
            name: 'oxygen_therapy',
            format: 'integer',
          },
          {
            name: 'spo2_measurement_mechanism',
            format: 'integer',
          },
          {
            name: 'spo2_measurement_approach',
            format: 'integer',
          },
        ],
        name: 'com.huawei.continuous.spo2.statistics',
      },
    };
    const user = await this.service.user.show(userid);
    if (!user.access_token) {
      ctx.throw(404, '该用户未授权');
    }
    const options = {
      method: 'POST',
      uri: ccUrl,
      body: datacollector,
      json: true,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${user.access_token}`,
      },
    };
    if (!user.oxyhemoglobindataId) {
    // 未有采集器相关记录
      const oxyhemoglobindatacollector = await request(options).catch(e => e);
      datacollectorId = oxyhemoglobindatacollector.collectorId;
      // 更新 User中的采集器Id
      user.oxyhemoglobindataId = datacollectorId;
      await service.user.update(userid, user);
    } else {
      datacollectorId = user.oxyhemoglobindataId;
    }
    const queryUrl = config.baseurl + config.getdataCollectors.replace('DATACOLLECTORID', datacollectorId).replace('STARTTIME-ENDTIME', sampleSetId);
    const quroptions = {
      method: 'GET',
      uri: queryUrl,
      json: true,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${user.access_token}`,
      },
    };
    // 查询api
    const oxyhemoglobinresult = await request(quroptions).catch(e => e);
    const oxyhemoglobin = {
      oxyhemoglobin: oxyhemoglobinresult.samplePoints[oxyhemoglobinresult.samplePoints.length - 1].value,
      recordAt: new Date(oxyhemoglobinresult.samplePoints[oxyhemoglobinresult.samplePoints.length - 1].endTime),
      user: user._id,
    };
    // 新增采集器记录
    await this.service.oxyhemoglobin.create(oxyhemoglobin);
    console.log(oxyhemoglobinresult);
    // 设置响应内容和响应状态码
    return oxyhemoglobinresult;
  }

}

module.exports = HmsService;
