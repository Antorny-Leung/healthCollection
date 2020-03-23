'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true }, // 姓名
    height: { type: Number, default: 0 }, // 身高
    weight: { type: mongoose.Schema.Types.ObjectId, ref: 'Weight' }, // 体重
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
    sportrecord: { type: mongoose.Schema.Types.ObjectId, ref: 'Sportrecord' }, // 运动记录
    bloodglucose: { type: mongoose.Schema.Types.ObjectId, ref: 'Bloodglucose' }, // 血糖
    heartrate: { type: mongoose.Schema.Types.ObjectId, ref: 'HeartRate' }, // 心率
    sleep: { type: mongoose.Schema.Types.ObjectId, ref: 'Sleep' }, // 睡眠
    bloodpressure: { type: mongoose.Schema.Types.ObjectId, ref: ' BloodPressure' }, // 血压
    oxyhemoglobin: { type: mongoose.Schema.Types.ObjectId, ref: 'Oxyhemoglobin' }, // 血氧饱和度
    pressure: { type: mongoose.Schema.Types.ObjectId, ref: 'Pressure' }, // 压力
    temperature: { type: mongoose.Schema.Types.ObjectId, ref: 'Temperature' }, // 体温
    account: { type: String, unique: true, required: true }, // 账户
    password: { type: String, required: true }, // 密码
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('User', UserSchema);
};
