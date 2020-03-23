'use strict';

// 心率
module.exports = app => {
  const mongoose = app.mongoose;
  const HeartrateSchema = new mongoose.Schema({
    hraterange: [{ type: Number, default: 0 }], // 心率范围
    hrateavg: { type: Number, default: 0 }, // 心率平均值
    hratehigh: { type: Number, default: 0 }, // 心率过高
    hratelow: { type: Number, default: 0 }, // 心率过低
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Heartrate', HeartrateSchema);
};
