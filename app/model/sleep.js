'use strict';

// 睡眠
module.exports = app => {
  const mongoose = app.mongoose;
  const SleepSchema = new mongoose.Schema({
    duration: { type: Number, default: 0 }, // 时长|单位分钟
    deep: { type: Number, default: 0 }, // 深睡时长|单位分钟
    light: { type: Number, default: 0 }, // 浅睡时长|单位分钟
    rem: { type: Number, default: 0 }, // 快速眼动|单位分钟
    sober: { type: Number, default: 0 }, // 清醒|单位分钟
    fragmentary: { type: Number, default: 0 }, // 零星|单位分钟
    recordAt: { type: Date, default: Date.now }, // 记录时间
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    // datacollectorId: { type: String }, // 数据收集器
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 对应的用户
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Sleep', SleepSchema);
};
