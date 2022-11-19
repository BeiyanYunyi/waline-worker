import { GCreateDiscussionInput, GRepositoryDiscussion } from '../../../types/github';
import { GITHUB_GRAPHQL_API_URL } from './config';

const CREATE_DISCUSSION_QUERY = `
mutation ($input: CreateDiscussionInput!) {
  createDiscussion(input: $input) {
    discussion {
      id
      url
      locked
      body
      repository {
        nameWithOwner
      }
      comments(first: 1) {
        totalCount
        pageInfo {
          startCursor
          hasNextPage
          hasPreviousPage
          endCursor
        }
        nodes {
          id
          viewerDidAuthor
          createdAt
          url
          lastEditedAt
          deletedAt
          body
          bodyHTML
          replies(last: 1) {
            totalCount
            nodes {
              id
              viewerDidAuthor
              createdAt
              url
              lastEditedAt
              deletedAt
              body
              bodyHTML
              replyTo {
                id
              }
            }
          }
        }
      }
    }
  }
}`;

export interface CreateDiscussionBody {
  input: GCreateDiscussionInput;
}

export interface CreateDiscussionResponse {
  data: {
    createDiscussion: {
      discussion: GRepositoryDiscussion;
    };
  };
}

export async function createDiscussion(
  token: string,
  params: CreateDiscussionBody,
): Promise<CreateDiscussionResponse> {
  return fetch(GITHUB_GRAPHQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WalineWorker',
    },
    body: JSON.stringify({
      query: CREATE_DISCUSSION_QUERY,
      variables: params,
    }),
  }).then((r) => r.json());
}
