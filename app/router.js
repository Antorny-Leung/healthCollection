'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // oauth ======================================================
  router.get('/api/oauth/getAccessToken', controller.oauth.getAccessToken);

  // user  =====================================================
  router.post('/api/user/create', controller.user.create);
  router.delete('/api/user/:id', controller.user.destroy);
  router.put('/api/user', controller.user.update);
  router.get('/api/user/getuser', controller.user.show);
  router.get('/api/user', controller.user.index);
  router.delete('/api/user', controller.user.removes);
  router.resources('user', '/api/user', controller.user);

  // huawei  =====================================================
  router.get('/api/huawei/getUserInfoBase', controller.huawei.getUserInfoBase);
  router.get('/api/huawei/getSportsStat', controller.huawei.getSportsStat);
  router.get('/api/huawei/getMotionPathData', controller.huawei.getMotionPathData);
  router.get('/api/huawei/getMotionPathDetail', controller.huawei.getMotionPathDetail);
  router.get('/api/huawei/getHealthStat', controller.huawei.getHealthStat);
  router.get('/api/huawei/getHealthData', controller.huawei.getHealthData);
  router.get('/api/huawei/getUserInfo', controller.huawei.getUserInfo);

  // hms  =====================================================
  router.get('/api/hms/getStep', controller.hms.getStep);
  router.get('/api/hms/getWeight', controller.hms.getWeight);
  router.get('/api/hms/getSport', controller.hms.getSport);
  router.get('/api/hms/getEnergy', controller.hms.getEnergy);
  router.get('/api/hms/getHeartrate', controller.hms.getHeartrate);
  router.get('/api/hms/getTemperature', controller.hms.getTemperature);
  router.get('/api/hms/getBloodglucosee', controller.hms.getBloodglucosee);
  router.get('/api/hms/getBloodpressure', controller.hms.getBloodpressure);
  router.get('/api/hms/getOxyhemoglobine', controller.hms.getOxyhemoglobine);
};
