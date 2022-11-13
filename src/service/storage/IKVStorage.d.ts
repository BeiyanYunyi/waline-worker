export default interface IKVStorage {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, content: T) => Promise<T>;
  delete: <T>(key: string) => Promise<T | null>;
}
