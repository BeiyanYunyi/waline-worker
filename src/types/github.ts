export const Reactions = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  LAUGH: '😄',
  HOORAY: '🎉',
  CONFUSED: '😕',
  HEART: '❤️',
  ROCKET: '🚀',
  EYES: '👀',
} as const;

export type Reaction = keyof typeof Reactions;

export interface GUser {
  avatarUrl: string;
  login: string;
  url: string;
}

export type GRepositoryDiscussionAuthor = GUser;

export type GCommentAuthorAssociation =
  | 'COLLABORATOR'
  | 'CONTRIBUTOR'
  | 'FIRST_TIMER'
  | 'FIRST_TIME_CONTRIBUTOR'
  | 'MANNEQUIN'
  | 'MEMBER'
  | 'NONE'
  | 'OWNER';

export interface GReactionGroup {
  content: keyof typeof Reactions;
  users: {
    totalCount: number;
  };
  viewerHasReacted: boolean;
}

interface GBaseComment {
  id: string;
  viewerDidAuthor: boolean;
  createdAt: string;
  url: string;
  authorAssociation: GCommentAuthorAssociation;
  lastEditedAt: string | null;
  deletedAt: string | null;
  bodyHTML: string;
  body: string;
}

export interface GReply extends GBaseComment {
  replyTo: {
    id: string;
  };
}

export interface GComment extends GBaseComment {
  replies: {
    totalCount: number;
    nodes: GReply[];
  };
}

export interface GRepositoryDiscussion {
  id: string;
  url: string;
  locked: boolean;
  repository: {
    nameWithOwner: string;
  };
  comments: {
    totalCount: number;
    pageInfo: {
      startCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      endCursor: string;
    };
    nodes: GComment[];
  };
}

export interface GDiscussionCategory {
  id: string;
  name: string;
  emojiHTML: string;
}

export interface GCreateDiscussionInput {
  repositoryId: string;
  categoryId: string;
  title: string;
  body: string;
}

export interface GError {
  message: string;
  documentation_url: string;
}

export interface GMultipleErrors {
  errors: Array<{
    type?: string;
    message: string;
  }>;
}
