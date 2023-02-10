import { vueScheduler } from './vue-scheduler';
import { TransformParams } from '../type';

export function scheduler(params: TransformParams) {
  const isVue = /\.vue$/;
  if (isVue.test(params.id)) {
    vueScheduler(params);
  } else {
    params.transform({ code: params.code, map: null });
  }
}
