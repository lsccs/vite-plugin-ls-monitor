export * from './src/types';
export { createLsMonitorPlugin } from './src/index';

export interface Monitor {
  setHtml: (selector: string) => void;
}

declare global {
  interface Window {
    monitor: Monitor;
  }
}
declare type Recordable<T = any> = Record<string, T>;
