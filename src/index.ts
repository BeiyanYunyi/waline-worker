import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { poweredBy } from 'hono/powered-by';
import { validator } from 'hono/validator';
import commentRouter from './service/commentRouter';
import getStorage from './service/storage/getStorage';
import IKVStorage from './service/storage/IKVStorage';
import CFKV from './types/CFKV';
import lidisCrypt from './utils/crypt';

const app = new Hono<{ Bindings: { CFKV: CFKV; storage: IKVStorage; DB: D1Database } }>();

app.use('*', poweredBy()).use('*', cors()).use('*', etag());

app.use('*', async (c, next) => {
  // eslint-disable-next-line no-param-reassign
  c.storage = await getStorage(c.env);
  await next();
});

app.get('/', async (c) => c.text('Hello Hono!'));

app.post(
  '/crypt',
  validator((v) => ({
    text: v.json('text').isRequired(),
    password: v.json('password'),
  })),
  async (c) => {
    const res = c.req.valid();
    const { text, password } = res;
    const cipher = await lidisCrypt.encrypt(text, password);
    c.storage.set('cipher', cipher);
    return c.json(cipher);
  },
);

app.route('/comment', commentRouter);

export default app;
