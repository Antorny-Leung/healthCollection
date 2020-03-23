'use strict';

// 体温
module.exports = app => {
  const mongoose = app.mongoose;
  const TemperatureSchema = new mongoose.Schema({
    recordAt: { type: Date, default: Date.now }, // 录入时间
    value: { type: Number, default: 0 }, // 体温数值
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Temperature', TemperatureSchema);
};
