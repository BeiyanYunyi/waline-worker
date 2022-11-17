import { GUser, GRepositoryDiscussion, GError, GMultipleErrors } from '../../../types/github';
import { GITHUB_GRAPHQL_API_URL } from './config';

async function digestMessage(message: string, algorithm: AlgorithmIdentifier = 'SHA-1') {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function parseRepoWithOwner(repoWithOwner: string) {
  const [owner, name] = repoWithOwner.split('/');
  return { owner, name };
}

interface PaginationParams {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

interface DiscussionQuery {
  repo: string;
  term: string;
  number: number;
  category: string;
  strict: boolean;
}

const DISCUSSION_QUERY = `
  id
  url
  locked
  repository {
    nameWithOwner
  }
  comments(first: $first last: $last after: $after before: $before) {
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
      replies(last: 100) {
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
  }`;

const SEARCH_QUERY = `
  search(type: DISCUSSION last: 1 query: $query) {
    discussionCount
    nodes {
      ... on Discussion {
        ${DISCUSSION_QUERY}
      }
    }
  }`;

const SPECIFIC_QUERY = `
  repository(owner: $owner, name: $name) {
    discussion(number: $number) {
      ${DISCUSSION_QUERY}
    }
  }
`;

const GET_DISCUSSION_QUERY = (type: 'term' | 'number') => `
  query(${
    type === 'term' ? '$query: String!' : '$owner: String! $name: String! $number: Int!'
  } $first: Int $last: Int $after: String $before: String) {
    viewer {
      avatarUrl
      login
      url
    }
    rateLimit {
      cost
      remaining
    }
    ${type === 'term' ? SEARCH_QUERY : SPECIFIC_QUERY}
  }`;

export interface GetDiscussionParams extends PaginationParams, DiscussionQuery {}

interface SearchResponse {
  data: {
    viewer: GUser;
    rateLimit: { cost: number; remaining: number };
    search: {
      discussionCount: number;
      nodes: Array<GRepositoryDiscussion>;
    };
  };
}

export interface SpecificResponse {
  data: {
    viewer: GUser;
    rateLimit: { cost: number; remaining: number };
    repository: {
      discussion: GRepositoryDiscussion;
    };
  };
}

export type GetDiscussionResponse = SearchResponse | SpecificResponse;

export async function getDiscussion(
  params: GetDiscussionParams,
): Promise<GetDiscussionResponse | GError | GMultipleErrors> {
  const { repo: repoWithOwner, term, number, category, strict, ...pagination } = params;
  const resolvedTerm = strict ? await digestMessage(term) : term;
  const searchIn = strict ? 'in:body' : 'in:title';

  // Force repo to lowercase to prevent GitHub's bug when using category in query.
  // https://github.com/giscus/giscus/issues/118
  const repo = repoWithOwner.toLowerCase();
  const categoryQuery = category ? `category:${JSON.stringify(category)}` : '';
  const query = `repo:${repo} ${categoryQuery} ${searchIn} ${JSON.stringify(resolvedTerm)}`;
  const gql = GET_DISCUSSION_QUERY(number ? 'number' : 'term');

  return fetch(GITHUB_GRAPHQL_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'WalineWorker' },

    body: JSON.stringify({
      query: gql,
      variables: {
        repo,
        query,
        number,
        ...parseRepoWithOwner(repo),
        ...pagination,
      },
    }),
  }).then((r) => r.json());
}
