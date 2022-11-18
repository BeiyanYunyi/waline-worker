import type { WalineComment, WalineCommentData } from '@waline/client';

export interface ICommentQueryParam {
  page: string;
  pageSize: string;
}

export interface IClientCommentQueryParam extends ICommentQueryParam {
  path: string;
  sortBy: 'insertedAt_desc' | 'insertedAt_asc' | 'like_desc';
}

export interface IComments {
  delete: (id: string) => Promise<void>;
  count: (url: string) => Promise<number>;
  getForClient: (param: IClientCommentQueryParam) => Promise<WalineComment[]>;
  getForAdmin: () => Promise<WalineComment[]>;
  post: (param: WalineCommentData) => Promise<WalineComment>;
}

export interface IUsers {}
