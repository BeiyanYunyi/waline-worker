import type { WalineComment } from '@waline/client';
import { GComment } from '../../../types/github';

const ghCommentToWalineComment = async (gComment: GComment): Promise<WalineComment> => {
  const { bodyHTML, createdAt } = gComment;
  const comment: WalineComment = {
    comment: bodyHTML,
    createdAt,
    insertedAt: createdAt,
    updatedAt: createdAt,
    ua: 'WalineWorker',
    url: '',
    link: '',
    mail: 'd41d8cd98f00b204e9800998ecf8427e',
    nick: '匿名匿名',
    objectId: '9007199254583671',
    avatar:
      'https://avatar.75cdn.workers.dev/?url=https%3A%2F%2Fseccdn.libravatar.org%2Favatar%2Fd41d8cd98f00b204e9800998ecf8427e',
    children: gComment.replies.nodes.map((reply) => ({
      comment: reply.bodyHTML,
      createdAt: reply.createdAt,
      insertedAt: reply.createdAt,
      updatedAt: reply.createdAt,
      ua: 'WalineWorker',
      url: '',
      link: '',
      mail: 'd41d8cd98f00b204e9800998ecf8427e',
      nick: '匿名匿名',
      objectId: '9007199254583671',
      avatar:
        'https://avatar.75cdn.workers.dev/?url=https%3A%2F%2Fseccdn.libravatar.org%2Favatar%2Fd41d8cd98f00b204e9800998ecf8427e',
      children: [],
    })),
  };
  return comment;
};

export default ghCommentToWalineComment;
