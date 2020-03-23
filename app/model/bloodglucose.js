'use strict';
// 血糖
module.exports = app => {
  const mongoose = app.mongoose;
  const BloodglucoseSchema = new mongoose.Schema({
    mealed: { type: Number, default: 0 }, // 是否就餐后测量 |0餐前|1餐后
    recordAt: { type: Date, default: Date.now }, // 录入时间
    value: { type: Number, default: 0 }, // 血糖数值
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Bloodglucose', BloodglucoseSchema);
};
