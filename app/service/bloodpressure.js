'use strict';

const Service = require('egg').Service;

class BloodpressureService extends Service {

  get model() {
    return this.ctx.model.Bloodpressure;
  }

  // create======================================================================================================>
  async create(payload) {
    const { ctx, service } = this;
    return this.model.create(payload);
  }

  async InserOrUpdate(payload) {
    const { ctx, service } = this;
    const instance = await this.model.findOne({ OpenID: payload.OpenID });
    if (!instance) {
      // 未关注新增
      return this.model.create(payload);
    }


    instance.OpenID = payload.openid,
    instance.wechatName = payload.nickname,
    instance.sex = payload.sex === 1 ? '男' : '女',
    instance.headimgurl = payload.headimgurl,
    instance.updatedAt = new Date();
    return this.model.findByIdAndUpdate(instance._id, instance);

  }
  // destroy======================================================================================================>
  async destroy(_id) {
    const { ctx, service } = this;
    const instance = await service.bloodpressure.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该记录');
    }
    return this.model.findByIdAndRemove(_id);
  }

  // update======================================================================================================>
  async update(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.bloodpressure.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该记录');
    }
    return this.model.findByIdAndUpdate(_id, payload);
  }

  // show======================================================================================================>
  async show(_id) {
    const { ctx, service } = this;
    const instance = await service.bloodpressure.find(_id);
    if (!instance) {
      ctx.throw(404, 'bloodpressure not found');
    }
    return this.model.findById(_id);
  }

  // index======================================================================================================>
  async index(payload) {
    const { currentPage, pageSize, isPaging = true, user } = payload;
    let res = [];
    let count = 0;
    const _filter = {};
    // const isadmin = user.role.name === 'administrator';//
    // if (!isadmin) {
    //   _filter.career = user.career;
    // }
    const skip = ((Number(currentPage)) - 1) * Number(pageSize || 10);
    if (isPaging) {
      res = await this.model.find(_filter).skip(skip)
        .limit(Number(pageSize))
        .sort({ createdAt: -1 })
        .exec();
      count = await this.model.count({}).exec();
    } else {
      res = await this.model.find(_filter).sort({ createdAt: -1 })
        .exec();
      count = await this.model.count({}).exec();
    }

    return { count, list: res, pageSize: Number(pageSize), currentPage: Number(currentPage) };
  }

  // index======================================================================================================>
  async getMcs() {
    const _filter = {
      status: 1,
      actualnotify: 1,
    };
    // const isadmin = user.role.name === 'administrator';//
    // if (!isadmin) {
    //   _filter.career = user.career;
    // }
    // const skip = ((Number(currentPage)) - 1) * Number(pageSize || 10);

    const res = await this.model.find(_filter).sort({ createdAt: 1 })
      .exec();
    // const count = await this.model.count(_filter).exec();


    return res;
  }

  async removes(payload) {
    return this.model.remove({ _id: { $in: payload } });
  }

  async find(id) {
    return this.model.findById(id);
  }

  async findByIdAndUpdate(id, values) {
    return this.model.findByIdAndUpdate(id, values);
  }

}

module.exports = BloodpressureService;
