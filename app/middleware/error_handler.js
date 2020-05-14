'use strict';

module.exports = (options, app) => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      app.emit('error', err, this);
      const status = err.status || 500;
      const error = status === 500 && app.config.env === 'prod' ?
        'Internal Server Error' :
        err.message;

      ctx.body = {
        success: false,
        data: null,
        error: { code: error.status, message: error },
      };
  
      ctx.status = 200;
    }
  };
};
