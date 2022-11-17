declare module 'esbuild-plugin-resolve' {
  export default function resolve(param: Record<string, string>): import('esbuild').Plugin;
}
