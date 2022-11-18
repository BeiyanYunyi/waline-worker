import { GITHUB_GRAPHQL_API_URL } from './config';

const DELETE_DISCUSSION_QUERY = `
mutation ($input: DeleteDiscussionInput!) {
  deleteDiscussion(input: $input) {
    discussion {
      id
    }
  }
}`;

export interface DeleteDiscussionBody {
  input: {
    clientMutationId: string;
    id: string;
  };
}

export interface DeleteDiscussionResponse {
  data: {
    deleteDiscussion: {
      discussion: {
        id: string;
      };
    };
  };
}

export async function deleteDiscussion(
  token: string,
  params: DeleteDiscussionBody,
): Promise<DeleteDiscussionResponse> {
  return fetch(GITHUB_GRAPHQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WalineWorker',
    },
    body: JSON.stringify({
      query: DELETE_DISCUSSION_QUERY,
      variables: params,
    }),
  }).then((r) => r.json());
}
