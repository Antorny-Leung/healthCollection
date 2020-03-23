'use strict';

// 血氧饱和度
module.exports = app => {
  const mongoose = app.mongoose;
  const OxyhemoglobinSchema = new mongoose.Schema({
    recordAt: { type: Date, default: Date.now }, // 录入时间
    recvalue: { type: Number, default: 0 }, // 最近饱和度
    highvalue: { type: Number, default: 0 }, // 最高饱和度
    lowvalue: { type: Number, default: 0 }, // 最低饱和度
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Oxyhemoglobin', OxyhemoglobinSchema);
};
