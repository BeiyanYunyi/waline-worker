import CFKVT from '../../types/CFKV';
import IKVStorage from './IKVStorage';

export default class CFKVStorage implements IKVStorage {
  env: { CFKV: CFKVT };

  constructor(env: { CFKV: CFKVT }) {
    this.env = env;
    // For test use
    if (!this.env.CFKV) {
      const { CFKV } = getMiniflareBindings();
      this.env.CFKV = CFKV;
    }
  }

  async get<T>(key: string) {
    const res = await this.env.CFKV.get(key);
    if (!res) return null;
    return JSON.parse(res) as T;
  }

  async set<T>(key: string, content: T) {
    await this.env.CFKV.put(key, JSON.stringify(content));
    return content;
  }

  async delete<T>(key: string) {
    const res = await this.env.CFKV.get(key);
    if (!res) return null;
    await this.env.CFKV.delete(key);
    return JSON.parse(res) as T;
  }
}
