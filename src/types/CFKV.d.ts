export default interface CFKV {
  get: (key: string) => Promise<string | null>;

  put: (key: string, value: string | ReadableStream | ArrayBuffer) => Promise<void>;

  delete: (key: string) => Promise<void>;
}
