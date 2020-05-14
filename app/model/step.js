'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const StepSchema = new mongoose.Schema({
    step: { type: Number, default: 0 }, // 步数
    note: { type: String }, // 保留字段
    // datacollectorId: { type: String }, // 数据收集器
    recordAt: { type: Date, default: Date.now }, // 录入时间
    createdAt: { type: Date, default: Date.now }, // 创建日期
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 对应的用户
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Step', StepSchema);
};
