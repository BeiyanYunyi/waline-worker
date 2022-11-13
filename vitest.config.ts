import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'miniflare',
    // Configuration is automatically loaded from `.env`, `package.json` and
    // `wrangler.toml` files by default, but you can pass any additional Miniflare
    // API options here:
    environmentOptions: {
      kvNamespaces: ['CFKV'],
      module: true,
    },
    includeSource: ['src/**/*.{ts,tsx}'],
    coverage: { provider: 'c8', reporter: ['html', 'text'] },
  },
});
