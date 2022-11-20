import type { WalineComment } from '@waline/client';
import type { AddCommentResponse, GetCommentResponse } from '@waline/client/dist/api';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { GRepositoryDiscussion } from '../types/github';
import lidisCrypt from '../utils/crypt';
import digestMessage from '../utils/digestMessage';
import { addDiscussionComment } from './storage/github/addDiscussionComment';
import { createDiscussion } from './storage/github/createDiscussion';
import { getDiscussion, SpecificResponse } from './storage/github/getDiscussion';
import ghCommentToWalineComment from './storage/github/ghCommentToWalineComment';
import { lockDiscussion } from './storage/github/lockDiscussion';

const commentRouter = new Hono<{ Bindings: NodeJS.ProcessEnv }>();

const getAppDiscussion = async (env: NodeJS.ProcessEnv, path: string) => {
  const getDiscussionRes = await getDiscussion(env.GITHUB_TOKEN, {
    repo: env.GITHUB_REPO,
    term: path,
    number: 0,
    category: env.GITHUB_CATEGORY,
    strict: true,
    last: 100,
  });
  if ('message' in getDiscussionRes) {
    throw new Error(getDiscussionRes.message);
  }
  if ('errors' in getDiscussionRes) {
    throw new Error(getDiscussionRes.errors.map((e) => e.message).join(', '));
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
      await createDiscussion(env.GITHUB_TOKEN, {
        input: {
          repositoryId: env.GITHUB_REPO_ID,
          categoryId: env.GITHUB_CATEGORY_ID,
          body: 'This is a Waline Worker Thread and therefore locked by it',
          title: `${path}: ${await digestMessage(path)}`,
        },
      })
    ).data.createDiscussion.discussion;
    // Lock the discussion after creation
    await lockDiscussion(env.GITHUB_TOKEN, {
      input: {
        clientMutationId: 'WalineWorker',
        lockReason: 'RESOLVED',
        lockableId: discussion.id,
      },
    });
  }
  return discussion;
};

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
    let discussion;
    try {
      discussion = await getAppDiscussion(c.env, queries.path);
    } catch (e) {
      return c.json({ errno: 0, errmsg: (e as Error).message }, 500);
    }
    const pageSize = queries.pageSize ? Number(queries.pageSize) : 10;
    try {
      const data = await Promise.all(
        discussion.comments.nodes.map((comment) => ghCommentToWalineComment(comment, c.env)),
      );
      const sortBy = queries.sortBy as 'insertedAt_desc' | 'insertedAt_asc' | 'like_desc';
      switch (sortBy) {
        case 'insertedAt_asc':
          data.sort((a, b) => Number(new Date(a.insertedAt)) - Number(new Date(b.insertedAt)));
          break;
        case 'insertedAt_desc':
          data.sort((a, b) => Number(new Date(b.insertedAt)) - Number(new Date(a.insertedAt)));
          break;
        default:
          break;
      }
      const res: GetCommentResponse = {
        page: queries.page ? Number(queries.page) : 1,
        totalPages: Math.ceil(discussion.comments.totalCount / pageSize),
        pageSize,
        count: discussion.comments.totalCount,
        errmsg: '',
        errno: 0,
        data,
      };
      return c.json(res);
    } catch (e) {
      return c.json({ errno: 500, errmsg: (e as Error).message }, 500);
    }
  },
);

commentRouter.post(
  '/',
  validator((v) => ({
    nick: v.json('nick').isRequired(),
    mail: v.json('mail').isRequired(),
    link: v.json('link').isOptional(),
    comment: v.json('comment').isRequired(),
    ua: v.json('ua').isRequired(),
    pid: v.json('pid').isOptional(),
    rid: v.json('rid').isOptional(),
    at: v.json('at').isOptional(),
    url: v.json('url').isRequired(),
  })),
  async (c) => {
    const queries = c.req.valid();
    const date = new Date().toISOString();
    let discussion;
    try {
      discussion = await getAppDiscussion(c.env, queries.url);
    } catch (e) {
      return c.json({ errno: 0, errmsg: (e as Error).message }, 500);
    }

    const data: WalineComment = {
      avatar:
        'https://avatar.75cdn.workers.dev/?url=https%3A%2F%2Fseccdn.libravatar.org%2Favatar%2Fd41d8cd98f00b204e9800998ecf8427e',
      objectId: crypto.randomUUID(),
      createdAt: date,
      insertedAt: date,
      updatedAt: date,
      children: [],
      nick: queries.nick,
      mail: queries.mail,
      ua: queries.ua,
      url: queries.url,
      comment: queries.comment,
    };
    const { comment, ...innerData } = data;
    const encInnerData = await lidisCrypt.encrypt(JSON.stringify(innerData), c.env.MASTER_KEY);
    const addCommentRes = await addDiscussionComment(
      {
        discussionId: discussion.id,
        body: `<!--${encInnerData}-->\n${comment}`,
      },
      c.env.GITHUB_TOKEN,
    );
    if (!addCommentRes.data) return c.json({ errno: 0, errmsg: 'Failed to add comment' }, 500);
    const res: AddCommentResponse = {
      errno: 0,
      errmsg: '',
      data: { ...data, comment: addCommentRes.data.addDiscussionComment.comment.bodyHTML },
    };
    return c.json(res);
  },
);

export default commentRouter;
