import { GITHUB_MARKDOWN_API_URL } from './config';

const renderMarkdown = async (text: string, token?: string, context?: string) =>
  fetch(GITHUB_MARKDOWN_API_URL, {
    method: 'POST',
    headers: token ? { Authorization: `token ${token}` } : {},
    body: JSON.stringify({ mode: 'gfm', text, ...(context ? { context } : {}) }),
  }).then((r) => r.text());

export default renderMarkdown;
