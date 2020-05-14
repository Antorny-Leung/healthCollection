/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // mangodb
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/heacol',
    // url: 'mongodb://transfer:tbDsz2EnCaU9dQT@47.52.173.72:27017/transfer?authSource=admin',
    options: {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      bufferMaxEntries: 0,
    },
  };

  config.hihealth = {
    redirect_uri: '',
    client_id: 101940703,
    client_secret: '49ef1739569836badaef9d735c589e6ac181e52319d4b23eb6aa391142fbbb5d',
    // 获取授权码
    getAuthorizationCode: `https://login.cloud.huawei.com/oauth2/v2/authorize?response_type=code&client_id=101940703
    &redirect_uri=http://qbz7cj.natappfree.cc&scope=https://www.huawei.com/health/profile.readonly+https://www.huawei.com/health/sport.readonly+
    https://www.huawei.com/health/health.wgt.readonly+https://www.huawei.com/health/health.slp.readonly+
    https://www.huawei.com/health/health.hr.readonly+https://www.huawei.com/health/health.ecg.readonly+
    https://www.huawei.com/health/health.bg.readonly+https://www.huawei.com/health/motionpath.readonly+
    https://www.huawei.com/health/health.bp.readonly+https://www.huawei.com/health/health.ps.readonly+
    https://www.huawei.com/health/device.readonly+https://www.huawei.com/health/motionpath.readonly&display=mobile`,
    // 获取access_token|POST token通过增加Authorization的HTTP Header请求头。
    // 例： POST /rest.php HTTP/1.1
    //      Host: healthopen.hicloud.com
    //      Content-Type: application/x-www-form-urlencoded
    //      Authorization: Bearer {access_token}
    getAccessToken: 'https://oauth-login.cloud.huawei.com/oauth2/v2/token', // grant_type=authorization_code,code=acode,client_id,client_secret,redirect_uri
    // 更新access_token|POST
    refreshAccessToken: 'https://oauth-login.cloud.huawei.com/oauth2/v2/token', // grant_type=refresh_token,refresh_token=refresh_token,client_id,client_secret,redirect_uri
    // 查询用户基本信息
    getUserInfoBase: 'https://oauth-api.cloud.huawei.com/rest.php?nsp_ts=TIMESTAMP&nsp_svc=huawei.oauth2.user.getTokenInfo',
    // 查询用户每日运动汇总数据
    getSportsStat: 'https://healthopen.hicloud.com/rest.php? nsp_ts=TIMESTAMP&&nsp_svc=com.huawei.fit.getSportsStat', // startDate（int）|endDate（int）20200312
    // 查询运动轨迹统计数据
    getMotionPathData: 'https://healthopen.hicloud.com/rest.php?nsp_ts==TIMESTAMP&nsp_svc=com.huawei.fit.getMotionPathData', // startTime（long）|endTime（long）
    // 查询单次运动详情数据
    getMotionPathDetail: 'https://healthopen.hicloud.com/rest.php?nsp_ts=TIMESTAMP&nsp_svc=com.huawei.fit.getMotionPathDetail', // startTime（long）
    // 查询用户每日健康汇总数据
    getHealthStat: 'https://healthopen.hicloud.com/rest.php?nsp_ts=TIMESTAMP&nsp_svc=com.huawei.fit.getHealthStat', // startDate（int）|endDate（int）20200312|type 7心率/9睡眠
    // 查询用户健康明细数据
    getHealthData: 'https://healthopen.hicloud.com/rest.php?nsp_ts=TIMESTAMP&nsp_svc=com.huawei.fit.getHealthData', // startTime（long）|endTime（long）|type 4血糖/5血压/7心率/8体重体脂/9睡眠
    // 查询用户信息
    getUserInfo: 'https://healthopen.hicloud.com/rest.php? nsp_ts={timestamp}&nsp_svc=com.huawei.fit.getUserInfo', //  profileType 0全部/1用户基本信息/2用户设置目标
    // 查询绑定设备信息
    getDeviceInfo: 'https://healthopen.hicloud.com/rest.php? nsp_ts={timestamp}&nsp_svc=com.huawei.fit.getDeviceInfo', // deviceCode（long）
  };

  config.hmscore = {
    baseurl: 'https://health-api.cloud.huawei.com/hihealth/v1/',
    redirect_uri: 'http://ucbfd3.natappfree.cc/api/oauth/getAccessToken',
    client_id: 101940703,
    client_secret: '49ef1739569836badaef9d735c589e6ac181e52319d4b23eb6aa391142fbbb5d',

    // 获取授权码
    getAuthorizationCode: `https://login.cloud.huawei.com/oauth2/v2/authorize?
    response_type=code&client_id=101940703&redirect_uri=http://z2qiy2.natappfree.cc/api/oauth/getAccessToken
    &scope=https://www.huawei.com/healthkit/heightweight.both+https://www.huawei.com/healthkit/goals.both+
    https://www.huawei.com/healthkit/index.both+https://www.huawei.com/healthkit/step.both+
    https://www.huawei.com/healthkit/distance.both+https://www.huawei.com/healthkit/speed.both+
    https://www.huawei.com/healthkit/calories.both+https://www.huawei.com/healthkit/pulmonary.both+
    https://www.huawei.com/healthkit/strength.both+https://www.huawei.com/healthkit/activity.both+
    https://www.huawei.com/healthkit/location.both+https://www.huawei.com/healthkit/bodyfat.both+
    https://www.huawei.com/healthkit/sleep.both+https://www.huawei.com/healthkit/heartrate.both+
    https://www.huawei.com/healthkit/stress.both+https://www.huawei.com/healthkit/relaxtraining.both+
    https://www.huawei.com/healthkit/nutrition.both+https://www.huawei.com/healthkit/hearthealth.both+
    https://www.huawei.com/healthkit/bloodglucose.both+https://www.huawei.com/healthkit/bloodpressure.both+
    https://www.huawei.com/healthkit/oxygensaturation.both+https://www.huawei.com/healthkit/bodytemperature.both+
    https://www.huawei.com/healthkit/reproductive.both&access_type=offline&display=page
    `,

    // 获取AccessToken
    getAccessToken: 'https://oauth-login.cloud.huawei.com/oauth2/v2/token', // grant_type=authorization_code,code=acode,client_id,client_secret,redirect_uri

    // 更新access_token|POST
    refreshAccessToken: 'https://oauth-login.cloud.huawei.com/oauth2/v2/token', // grant_type=refresh_token,refresh_token=refresh_token,client_id,client_secret,redirect_uri

    // 创建一个数据采集器|POST
    createdataCollectors: 'dataCollectors',
    // 删除一个数据采集器|DELETE
    deletedataCollectors: 'dataCollectors',
    // 查询数据采集器内数据|GET/dataCollectorId
    getdataCollectors: 'dataCollectors/DATACOLLECTORID/sampleSets/STARTTIME-ENDTIME',

  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1584504672338_5206';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
