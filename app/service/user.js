'use strict';

const Service = require('egg').Service;
class UserService extends Service {

  get model() {
    return this.ctx.model.User;
  }

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

    instance.nativeOpenId = payload.nativeOpenId ? payload.nativeOpenId : null,
    instance.OpenID = payload.OpenID,
    instance.wechatName = payload.wechatName,
    instance.sex = payload.sex,
    instance.headimgurl = payload.headimgurl,
    instance.invitor = payload.invitor;
    instance.updatedAt = new Date();
    instance.platform = payload.platform;
    return this.model.findByIdAndUpdate(instance._id, instance);

  }
  // destroy======================================================================================================>
  async destroy(_id) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该记录');
    }
    return this.model.findByIdAndRemove(_id);
  }

  // update======================================================================================================>
  async update(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该记录');
    }
    return this.model.findByIdAndUpdate(_id, payload);
  }

  // updateAccessToken======================================================================================================>
  async updateAccessToken(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该用户');
    }
    instance.access_token = payload.data.access_token;
    instance.refresh_token = payload.data.refresh_token ? payload.data.refresh_token : '';
    return this.model.findByIdAndUpdate(_id, instance);
  }

  async refreshAccessToken(_id, payload) {
    const { ctx, service } = this;
    const instance = await service.user.find(_id);
    if (!instance) {
      ctx.throw(404, '没有找到该用户');
    }
    instance.access_token = payload.data.access_token;
    return this.model.findByIdAndUpdate(_id, instance);
  }

  // show======================================================================================================>
  async show(_id) {
    const { ctx, service } = this;
    const instance = await this.model.findById(_id);

    if (!instance) {
      ctx.throw(404, 'user not found');
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

  async findHasToken() {
    const res = await this.model.find({
      access_token: { $ne: null },
    });
    return { count: res.length, list: res };
  }

  async removes(payload) {
    return this.model.remove({ _id: { $in: payload } });
  }

  async find(id) {
    return this.model.findById(id).populate('platform').populate('invitor');
  }

  async findByIdAndUpdate(id, values) {
    return this.model.findByIdAndUpdate(id, values);
  }


  async findByOpenId(OpenID) {
    return this.model.findOne({ OpenID })
      .populate('invitor')
      .populate('platform')
      .exec();
  }


  async findByinvitecode(invitecode) {
    return this.model.findOne({ invitecode });
  }


}

module.exports = UserService;
