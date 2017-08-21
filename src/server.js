const http = require('http');
const Koa = require('koa');
const serve = require('koa-static');
const koaBody = require('koa-body');
const bunyan = require('bunyan');
const koaLogger = require('./koalogger.js'); //require('koa-bunyan');

const app = new Koa();
const logger = bunyan.createLogger({name: "etags"});

app.use(koaLogger(logger, { level: 'info' }));

// just give the browser something
app.use(koaBody({ multipart:true }));
app.use(async (ctx, next) => {
  if (ctx.url.startsWith('/api/login')) {
    ctx.status = 200;
    const username = (ctx.request.body.fields || {}).username;
    ctx.body = JSON.stringify({ req_username: username });
    ctx.type = 'application/json';
    logger.info({ url: ctx.url, req: ctx.request, res: ctx.response, req_body: ctx.request.body, res_body: ctx.body }, 'login');
    return;
  } else {
    await next();
  }
});

app.use(serve('./public'));

const server = http.createServer(app.callback());

server.listen(3001, () => {
  logger.info({ address: server.address() }, 'server started');
});
