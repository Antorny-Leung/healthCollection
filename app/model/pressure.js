'use strict';

// 压力
module.exports = app => {
  const mongoose = app.mongoose;
  const PressureSchema = new mongoose.Schema({
    pressureavg: { type: Number, default: 0 }, // 压力平均值
    pressurehigh: { type: Number, default: 0 }, // 压力过高
    pressurelow: { type: Number, default: 0 }, // 压力过低
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Pressure', PressureSchema);
};
