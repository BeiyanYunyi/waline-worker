import { getJSONFile } from './getFile';

type CommentOrder = 'oldest' | 'newest';

interface IRepoConfig {
  origins?: string[];
  originsRegex?: string[];
  defaultCommentOrder?: CommentOrder;
}

const getRepoConfig = async (repoWithOwner: string, token?: string) => {
  try {
    return await getJSONFile<IRepoConfig>(repoWithOwner, 'giscus.json', token);
  } catch (err) {
    return {};
  }
};

export default getRepoConfig;
