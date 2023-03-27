export * from '../src/types';
// export { createLsMonitorPlugin } from './src/index';

declare global {
  interface Window {
    monitor: Monitor;
  }

  interface Monitor {
    setHtml: (selector: string) => void;
  }
  type Recordable<T = any> = Record<string, T>;
}
