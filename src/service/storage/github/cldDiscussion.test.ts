// cld means create, lock, and delete
import { config } from 'dotenv';
import { beforeEach, describe, expect, it } from 'vitest';
import { createDiscussion } from './createDiscussion';
import { lockDiscussion } from './lockDiscussion';

interface TestContext {
  id: string;
}

describe('should able to create Discussion and lock it', () => {
  config();
  beforeEach<TestContext>(async (ctx) => {
    const res = await createDiscussion(process.env.GITHUB_TOKEN, {
      input: {
        repositoryId: process.env.GITHUB_REPO_ID,
        categoryId: process.env.GITHUB_CATEGORY_ID,
        title: crypto.randomUUID(),
        body: crypto.randomUUID(),
      },
    });
    if (!process.env.CI) console.log(JSON.stringify(res, null, 2));
    const id = res?.data?.createDiscussion?.discussion?.id;
    expect(id).toBeDefined();
    if (!id) return;
    ctx.id = id;
  });
  it<TestContext>('should create a discussion', async ({ id }) => {
    const res = await lockDiscussion(process.env.GITHUB_TOKEN, {
      input: {
        clientMutationId: crypto.randomUUID(),
        lockReason: 'RESOLVED',
        lockableId: id,
      },
    });
    if (!process.env.CI) console.log(JSON.stringify(res, null, 2));
    const locked = res.data?.lockLockable?.lockedRecord.locked;
    expect(locked).toBeDefined();
    if (!locked) return;
    expect(locked).toBe(false); // In this case, the discussion is locked.
  });
});
