import { Hono } from 'hono';
import { validator } from 'hono/validator';
import type { GetCommentResponse } from '@waline/client/dist/api';
import { getDiscussion, SpecificResponse } from './storage/github/getDiscussion';
import { GRepositoryDiscussion } from '../types/github';
import { createDiscussion } from './storage/github/createDiscussion';
import digestMessage from '../utils/digestMessage';
import { lockDiscussion } from './storage/github/lockDiscussion';
import ghCommentToWalineComment from './storage/github/ghCommentToWalineComment';

const commentRouter = new Hono<{ Bindings: NodeJS.ProcessEnv }>();

commentRouter.get(
  '/',
  validator((v) => ({
    path: v.query('path').isRequired(),
    page: v.query('page'),
    pageSize: v.query('pageSize'),
    sortBy: v.query('sortBy'),
    lang: v.query('lang'),
  })),
  async (c) => {
    const queries = c.req.valid();
    console.log(queries);
    const getDiscussionRes = await getDiscussion(c.env.GITHUB_TOKEN, {
      repo: c.env.GITHUB_REPO,
      term: queries.path,
      number: 0,
      category: c.env.GITHUB_CATEGORY,
      strict: true,
      last: 100,
    });
    if ('message' in getDiscussionRes) {
      return c.json({ errmsg: getDiscussionRes.message, errno: 500 }, 500);
    }
    if ('errors' in getDiscussionRes) {
      return c.json(
        { errmsg: getDiscussionRes.errors.map((e) => e.message).join(', '), errno: 500 },
        500,
      );
    }
    let discussion: GRepositoryDiscussion | null;
    if ('search' in getDiscussionRes.data) {
      const { search } = getDiscussionRes.data;
      const { discussionCount, nodes } = search;
      discussion = discussionCount > 0 ? nodes[0] : null;
    } else {
      discussion = (getDiscussionRes as SpecificResponse).data.repository.discussion;
    }
    if (!discussion) {
      discussion = (
        await createDiscussion(c.env.GITHUB_TOKEN, {
          input: {
            repositoryId: c.env.GITHUB_REPO_ID,
            categoryId: c.env.GITHUB_CATEGORY_ID,
            body: 'This is a Waline Worker Thread and therefore locked by it',
            title: `${queries.path}: ${await digestMessage(queries.path)}`,
          },
        })
      ).data.createDiscussion.discussion;
      // Lock the discussion after creation
      await lockDiscussion(c.env.GITHUB_TOKEN, {
        input: {
          clientMutationId: 'WalineWorker',
          lockReason: 'RESOLVED',
          lockableId: discussion.id,
        },
      });
    }
    const pageSize = queries.pageSize ? Number(queries.pageSize) : 10;
    const res: GetCommentResponse = {
      page: queries.page ? Number(queries.page) : 1,
      totalPages: Math.ceil(discussion.comments.totalCount / pageSize),
      pageSize,
      count: discussion.comments.totalCount,
      errmsg: '',
      errno: 0,
      data: await Promise.all(
        discussion.comments.nodes.map((comment) => ghCommentToWalineComment(comment)),
      ),
    };
    return c.json(res);
  },
);

export default commentRouter;
