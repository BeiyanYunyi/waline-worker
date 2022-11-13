// eslint-disable-next-line import/no-extraneous-dependencies
import { SuiteAPI, TestAPI } from 'vitest';

declare global {
  interface ImportMeta {
    vitest: { it: TestAPI; expect: Vi.ExpectStatic; describe: SuiteAPI<{}> };
  }
}
