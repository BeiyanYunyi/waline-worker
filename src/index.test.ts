import { expect, it, describe } from 'vitest';
import app from '.';
import lidisCrypt from './utils/crypt';

// We don't need Isolated Storage, just for now.
// const describe = setupMiniflareIsolatedStorage();
describe('Test the application', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('http://localhost/');
    expect(res.status).toBe(200);
  });
  it('should encrypt', async () => {
    const text = '114514';
    const password = '114514';
    const req = new Request('http://localhost/crypt', {
      body: JSON.stringify({ text: '114514', password: '114514' }),
      method: 'POST',
    });
    const res2 = await app.request(req);
    expect(res2.status).toBe(200);
    const json = await res2.json<string>();
    expect(await lidisCrypt.decrypt(json, password)).toBe(text);
  });
});
