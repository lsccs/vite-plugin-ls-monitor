import { vueScheduler } from './vue-scheduler';
import { jsScheduler } from './js-scheduler';
import { TransformParams, TransformSchedulerParams } from '../types';
import { parse } from '@vue/compiler-dom';
import MagicString from 'magic-string';

const isJs = /\.(js|ts)$/;
const isVue = /\.vue$/;

export function scheduler(params: TransformParams) {
  const result = new MagicString(params.code);

  const data = params as TransformSchedulerParams;
  data.result = result;

  if (isJs.test(params.id)) {
    jsScheduler(params);
  } else if (isVue.test(params.id)) {
    data.ast = parse(params.code);
    vueScheduler(data);
  }
  params.transform({ code: data.result.toString(), map: null });
}
