/// <reference types="@cloudflare/workers-types" />

import { SuiteAPI } from 'vitest';
import CFKV from './CFKV';

declare global {
  function setupMiniflareIsolatedStorage(): SuiteAPI<{}>;
  function getMiniflareBindings(): { CFKV: CFKV };
}
