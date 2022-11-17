import { config } from 'dotenv';
import { describe, expect, it } from 'vitest';
import { GRepositoryDiscussion } from '../../../types/github';
import { getDiscussion, SpecificResponse } from './getDiscussion';

describe('Can get discussion', () => {
  config();
  it('Can get discussion', async () => {
    const res = await getDiscussion({
      repo: 'lixiang810/fk-gfw',
      term: 'posts/%E7%AC%AC%E4%B8%80%E7%AF%87/',
      number: 0,
      category: 'Announcements',
      strict: true,
      last: 1,
    });
    expect(res).toHaveProperty('data');
    expect(res).not.toHaveProperty('message');
    expect(res).not.toHaveProperty('errors');
    if ('message' in res) return;
    if ('errors' in res) return;
    let discussion: GRepositoryDiscussion | null;
    console.log(res.data);
    if ('search' in res.data) {
      const { search } = res.data;
      const { discussionCount, nodes } = search;
      discussion = discussionCount > 0 ? nodes[0] : null;
    } else {
      discussion = (res as SpecificResponse).data.repository.discussion;
    }
    expect(discussion).not.toBeNull();
    console.log(JSON.stringify(discussion, null, 2));
  }, 114514);
});
