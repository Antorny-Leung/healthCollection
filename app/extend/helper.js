
module.exports = {
  success(data) {
    this.ctx.body = {
      success: true,
      data,
      error: null,
    };

    this.ctx.status = 200;
  },
  error(error) {
    const { code, message } = error;
    this.ctx.throw(code, message)
  }
}