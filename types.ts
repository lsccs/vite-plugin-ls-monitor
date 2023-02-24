export * from './src/types';
export { CreateDevToolPlugin } from './src/index';

export interface Monitor {
  setHtml: (selector: string) => void;
}

declare global {
  interface Window {
    monitor: Monitor;
  }
}
