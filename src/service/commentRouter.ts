import { Hono } from 'hono';
import { validator } from 'hono/validator';

const commentRouter = new Hono();

commentRouter.get(
  '/',
  validator((v) => ({
    path: v.query('path').isRequired(),
    page: v.query('page'),
    pageSize: v.query('pageSize'),
    sortBy: v.query('sortBy'),
    lang: v.query('lang'),
  })),
  (c) => {
    const queries = c.req.valid();
    console.log(queries);
    return c.json({
      page: 1,
      totalPages: 1,
      pageSize: 10,
      count: 1,
      data: [
        {
          comment: "<p>Hello World</p><script>alert('asd')</script>\n",
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
    });
  },
);

export default commentRouter;
