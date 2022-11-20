/* eslint-disable import/no-extraneous-dependencies */
import '@cloudflare/workers-types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_TOKEN: string;
      GITHUB_REPO: string;
      GITHUB_REPO_ID: string;
      GITHUB_CATEGORY: string;
      GITHUB_CATEGORY_ID: string;
      MASTER_KEY: string;
      CI?: string;
    }
  }
}
