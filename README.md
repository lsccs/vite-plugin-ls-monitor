#### 安装
```text
npm install vite-plugin-ls-monitor
or
yarn add vite-plugin-ls-monitor
```

#### 基本使用
```typescript
import { createLsMonitorPlugin } from 'vite-plugin-ls-monitor';

// vite.config.ts
export default (config: ConfigEnv): UserConfig => {
  return {
    ...
    plugins: [createLsMonitorPlugin()]
  };
};

```
```html
 // 可支持任意事件
 <button data-point="click:xxx" @click="handle">demo</button>
```
```typescript
 // 将可视化页面设置到特定容器中
 window.monitor.setHtml('.container');
```
