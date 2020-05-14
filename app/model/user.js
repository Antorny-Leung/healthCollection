'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true }, // 姓名
    height: { type: Number, default: 0 }, // 身高
    gender: { type: String }, // 性别
    creatbirthday: { type: Date, default: Date.now }, // 出生日期
    bloodtype: { type: String }, // 血型
    fhistory: { type: mongoose.Schema.Types.ObjectId, ref: 'Fhistory' }, // 遗传病史
    idcode: { type: String }, // 证件号码
    phone: { type: String }, // 联系方式
    email: { type: String }, // 邮箱
    maritalstatus: { type: Boolean }, // 婚姻状况
    education: { type: String }, // 文化程度
    medicaretype: { type: Number, default: 0 }, // 医保类型 |0城镇职工基本医疗保险|1新型农村合作医疗|2城镇居民基本医疗保险
    career: { type: String }, // 职业
    stepdataId: { type: String }, // 步行记录
    weightId: { type: String }, // 体重
    fatrateId: { type: String }, // 体脂
    distancedataId: { type: String }, // 运动距离记录
    speeddataId: { type: String }, // 运动速度记录
    energeId: { type: String }, // 运动热量消耗记录
    heartratedataId: { type: String }, // 心率
    temperaturedataId: { type: String }, // 体温
    bloodglucosedataId: { type: String }, // 血糖
    bloodpressuredataId: { type: String }, // 血压
    oxyhemoglobindataId: { type: String }, // 血氧饱和度
    sleepdataId: { type: String }, // 睡眠
    pressuredataId: { type: String }, // 压力
    account: { type: String, unique: true, required: true }, // 账户
    password: { type: String, required: true }, // 密码
    access_token: { type: String }, // 华为at
    refresh_token: { type: String }, // 华为rt
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('User', UserSchema);
};
