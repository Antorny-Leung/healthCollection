'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.UserCreateTransfer = {
      email: { type: 'string', required: true, allowEmpty: false, format: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/ },
      password: { type: 'password', required: true, allowEmpty: false, min: 6 },
      account: { type: 'string', required: true, allowEmpty: false, format: /[a-zA-Z0-9_]{3,16}/ },
    };

    this.UserUpdateTransfer = {
      email: { type: 'string', required: true, allowEmpty: false },
      account: { type: 'string', required: true, allowEmpty: false, format: /[a-zA-Z0-9_]{3,16}/ },
    };
  }

  // 创建用户
  async create() {
    console.log('createing');
    const { ctx, service } = this;
    // const email = this.app.email;
    // 校验参数
    ctx.validate(this.UserCreateTransfer);
    // 组装参数
    const payload = ctx.request.body || {};
    // const msg = '';
    // 调用 Service 进行业务处理
    const res = await service.user.create(payload);
    // const tourist = await service.role.show(res.role);
    // if (tourist.name !== 'tourist' && res.state === 0) {
    //   await service.approval.create({
    //     target: '/setactive',
    //     type: 'register',
    //     object: res._id,
    //     name: res.name,
    //     key: 'uuid',
    //     value: res.uuid,
    //     creater: res.account,
    //     note: res.note,
    //     status: 0,
    //   });
    //   msg = '请等待审核后即可登陆！';
    // } else {
    //   const mailOptions = {
    //     from: '332791402@qq.com',
    //     to: 'jyliangxingtong@163.com',
    //     subject: '邮件验证',
    //     html: `<a href="${this.config.pre}/login/${res.uuid}">点击链接进行验证</a>`,
    //   };
    //   // email==》config.pre+/login/+uuid
    //   email.sendMail(mailOptions, (error, response) => {
    //     if (error) {
    //       console.log('error:', error);
    //     } else {
    //       console.log('email sent: ' + response.message);

    //     }
    //     email.close();
    //   });
    //   msg = '请登陆邮箱并进行认证即可登陆！';
    // }

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, res });
  }

  // 删除单个用户
  async destroy() {
    const { ctx, service } = this;
    // 校验参数
    const { id } = ctx.params;
    // 调用 Service 进行业务处理
    await service.user.destroy(id);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx });
  }

  // 修改用户
  async update() {
    const { ctx, service } = this;
    // 校验参数
    ctx.validate(this.UserUpdateTransfer);
    // 组装参数
    // const { id } = ctx.params;
    const { _id, ...payload } = ctx.request.body || {};
    // 调用 Service 进行业务处理
    await service.user.update(_id, payload);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx });
  }

  // 获取单个用户
  async show() {
    const { ctx, service } = this;
    // 组装参数
    const { id } = ctx.params;
    // 调用 Service 进行业务处理
    const res = await service.user.show(id);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, res });
  }

  async setactive() {
    const { ctx, service } = this;
    // 组装参数
    const payload = ctx.request.body || {};
    // 调用 Service 进行业务处理
    const res = await service.user.setactive(payload.uuid);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, res });
  }
  // 获取所有用户(分页/模糊)
  async index() {
    const { ctx, service } = this;
    const { user } = ctx.state;
    // 组装参数
    const payload = ctx.query;
    const userinfo = await service.user.show(user.data._id);
    // 调用 Service 进行业务处理
    const res = await service.user.index(
      { ...payload,
        user: userinfo,
      });
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, res });
  }

  // 删除所选用户(条件id[])
  async removes() {
    const { ctx, service } = this;
    // 组装参数
    // const payload = ctx.queries.id
    const { id } = ctx.request.body;
    const payload = id.split(',') || [];
    // 调用 Service 进行业务处理
    const result = await service.user.removes(payload);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, result });
  }

  async info() {
    console.log('info');
    const { ctx, service } = this;
    const { user } = ctx.state;
    const res = await service.user.show(user.data._id);
    ctx.helper.success({ ctx, res });
  }

}


module.exports = UserController;
