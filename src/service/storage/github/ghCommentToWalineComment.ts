import type { WalineComment } from '@waline/client';
import { GComment } from '../../../types/github';
import lidisCrypt from '../../../utils/crypt';

const ghCommentToWalineComment = async (
  gComment: GComment,
  env: NodeJS.ProcessEnv,
): Promise<WalineComment> => {
  const { bodyHTML, body } = gComment;
  const matchAry = body.match(/^(?:<!--)(.*)(?:-->)$/m);
  if (!matchAry || !matchAry[1]) {
    throw new Error('Invalid comment body');
  }
  const matchRes = matchAry[1];
  let decryptRes;
  if (matchRes) decryptRes = await lidisCrypt.decrypt(matchRes, env.MASTER_KEY);
  if (!decryptRes) {
    throw new Error('Invalid comment body');
  }
  const comment: WalineComment = {
    comment: bodyHTML,
    ...JSON.parse(decryptRes),
  };
  return comment;
};

export default ghCommentToWalineComment;
