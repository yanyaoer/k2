require('dotenv').config();
import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import redisy from 'koa-redisy';
import views from 'koa-views';
import serve from 'koa-static';
import stylus from 'koa-stylus';
import body from 'koa-better-body';
import convert from 'koa-convert';


const dict = [ '教堂＋酒席', '酒席', '不来了' ];
const REDIS_BASE = process.env.APP_REDIS_BASE;
const REDIS_KEY = process.env.APP_REDIS_KEY;
const app = new Koa();
const router = Router()

app.use(convert(redisy));
app.use(convert(body()));
app.use(views(path.join(__dirname, 'public')));
app.use(convert(stylus(path.join(__dirname, 'public'))));
app.use(serve(path.join(__dirname, 'public')));


router
  .post('/api', (ctx, next)=> {
    ctx.redis.select(REDIS_BASE);
    ctx.redis.lpush(REDIS_KEY, JSON.stringify(ctx.body));
    ctx.body = 'ok';
  })
  .get('/output', async (ctx, next)=> {
    let db = await ctx.redis.onBase(REDIS_BASE).lrange(REDIS_KEY, 0, -1);
    ctx.body = db.map((raw)=> {
      let d = JSON.parse(raw);
      return `${d.name || 'unnamed'}
        出席: ${dict[d.live - 1] || '...'}
        人数: ${d.number || 0}`;
    }).join('\n');
  });


app.use(router.routes()).use(router.allowedMethods());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.body = { message: err.message };
    ctx.status = err.status || 500;
  }
});


app.listen(process.env.APP_PORT, ()=> {
  console.info(`${process.env.APP_NAME} is running on ${process.env.APP_PORT}`);
});
