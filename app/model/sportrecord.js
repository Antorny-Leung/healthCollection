'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const UserSchema = new mongoose.Schema({
    sporttype: { type: Number, default: 0 }, // 运动类型 |0室内跑步|1室外跑步|2户外步行|3户外骑行|4泳池游泳|
    duration: { type: Number, default: 0 }, // 时长|单位分钟
    distance: { type: Number, default: 0 }, // 距离|单位公里
    heat: { type: Number, default: 0 }, // 热量|卡路里
    speedallocation: { type: Number, default: 0 }, // 平均配速|时间分钟/公里
    speed: { type: Number, default: 0 }, // 平均速度|公里/分钟
    step: { type: Number, default: 0 }, // 步数
    stridefrequency: { type: Number, default: 0 }, // 步频|步数/分钟
    stride: { type: Number, default: 0 }, // 步幅|单位cm
    recordAt: { type: Date, default: Date.now }, // 录入时间
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('User', UserSchema);
};
