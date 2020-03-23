'use strict';

// 遗传病史
module.exports = app => {
  const mongoose = app.mongoose;
  const FhistorySchema = new mongoose.Schema({
    family: [{ type: String }], // 家族史
    disease: [{ type: String }], // 疾病史
    irritability: [{ type: String }], // 过敏史
    pharmacy: [{ type: String }], // 用药史
    operation: [{ type: String }], // 手术史
    smoke: [{ type: String }], // 吸烟史
    intemperance: [{ type: String }], // 酗酒史
    createdAt: { type: Date, default: Date.now }, // 创建日期
    note: { type: String }, // 保留字段
    extra: { type: mongoose.Schema.Types.Mixed },
  });
  return mongoose.model('Fhistory', FhistorySchema);
};
