'use strict';
// 血压
module.exports = app => {
  const mongoose = app.mongoose;
  const BloodpressureSchema = new mongoose.Schema({
    recordAt: { type: Date, default: Date.now }, // 录入时间
    highvalue: { type: Number, default: 0 }, // 高压
    lowvalue: { type: Number, default: 0 }, // 低压
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    // datacollectorId: { type: String }, // 数据收集器
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 对应的用户
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Bloodpressure', BloodpressureSchema);
};
