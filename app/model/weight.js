'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const WeightSchema = new mongoose.Schema({
    weight: { type: Number, default: 0 }, // 体重 |单位/公斤
    target: { type: Number, default: 0 }, // 目标体重 |单位/公斤
    BMI: { type: Number, default: 0 }, // BMI
    fatrate: { type: Number, default: 0 }, // 体脂率|百分比
    muscle: { type: Number, default: 0 }, // 肌肉量 |单位/公斤
    metabolism: { type: Number, default: 0 }, // 基础代谢率 |千卡/日
    pbw: { type: Number, default: 0 }, // 水分率|百分比
    visceralfat: { type: Number, default: 0 }, // 内脏脂肪等级
    bonesalts: { type: Number, default: 0 }, // 骨盐量 |单位/公斤
    protein: { type: Number, default: 0 }, // 蛋白质|百分比
    bodyage: { type: Number, default: 0 }, // 身体年龄
    bodytype: { type: String }, // 身体类型
    skeletalmuscle: { type: Number, default: 0 }, // 骨骼肌量量 |单位/公斤
    recordAt: { type: Date, default: Date.now }, // 录入时间
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Weight', WeightSchema);
};
