import { VITE_STATIC_RESOURCE_PATH } from './setting';

export const templateHtml = '/template/App.html';
export const templateScript = '/template/App.js' + VITE_STATIC_RESOURCE_PATH;
export const script = '/action/index.js' + VITE_STATIC_RESOURCE_PATH;
export const styles = '/styles/index.css' + VITE_STATIC_RESOURCE_PATH;

interface requestBody {
  url: string;
}

export default ({ url }: requestBody) => fetch(url + VITE_STATIC_RESOURCE_PATH);
