import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { poweredBy } from 'hono/powered-by';
import { validator } from 'hono/validator';
import getStorage from './service/storage/getStorage';
import IKVStorage from './service/storage/IKVStorage';
import CFKV from './types/CFKV';
import lidisCrypt from './utils/crypt';

const app = new Hono<{ Bindings: { CFKV: CFKV; storage: IKVStorage } }>();

app.use('*', poweredBy()).use('*', cors()).use('*', etag());

app.use('*', async (c, next) => {
  // eslint-disable-next-line no-param-reassign
  c.storage = await getStorage(c.env);
  await next();
});

app.get('/', async (c) => {
  c.storage.set('test', 'test');
  return c.text('Hello Hono!');
});

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

app.get('/comment', async (c) =>
  c.json({
    page: 1,
    totalPages: 1,
    pageSize: 10,
    count: 1,
    data: [
      {
        comment: '<p>Hello World</p>\n',
        insertedAt: '2021-12-02T08:26:20.614Z',
        link: '',
        mail: 'd41d8cd98f00b204e9800998ecf8427e',
        nick: '匿名匿名',
        objectId: '9007199254583671',
        avatar:
          'https://avatar.75cdn.workers.dev/?url=https%3A%2F%2Fseccdn.libravatar.org%2Favatar%2Fd41d8cd98f00b204e9800998ecf8427e',
        children: [],
      },
    ],
  }),
);

export default app;
