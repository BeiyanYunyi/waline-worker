import { GITHUB_GRAPHQL_API_URL } from './config';

const LOCK_DISCUSSION_QUERY = `
mutation ($input: LockLockableInput!) {
  lockLockable(input: $input) {
    lockedRecord {
      locked
    }
  }
}`;

export interface LockDiscussionBody {
  input: {
    clientMutationId: string;
    lockReason: 'OFF_TOPIC' | 'RESOLVED' | 'SPAM' | 'TOO_HEATED';
    lockableId: string;
  };
}

export interface LockDiscussionResponse {
  data: {
    lockLockable: {
      lockedRecord: {
        locked: boolean;
      };
    };
  };
}

export async function lockDiscussion(
  token: string,
  params: LockDiscussionBody,
): Promise<LockDiscussionResponse> {
  return fetch(GITHUB_GRAPHQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WalineWorker',
    },
    body: JSON.stringify({
      query: LOCK_DISCUSSION_QUERY,
      variables: params,
    }),
  }).then((r) => r.json());
}
