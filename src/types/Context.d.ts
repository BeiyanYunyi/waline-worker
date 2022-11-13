import 'hono';
import IKVStorage from '../service/storage/IKVStorage';

declare module 'hono' {
  interface Context {
    storage: IKVStorage;
  }
}
