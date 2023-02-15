import { AstProps, NodeTypes, EventPointData, TransformSchedulerParams } from '../type';
import { transform } from '@vue/compiler-dom';
import type {
  AttributeNode,
  DirectiveNode,
  ElementNode,
  SimpleExpressionNode,
} from '@vue/compiler-core';

import { POINT_PROP, LISTENING_EVENT, SPLIT_IDENT, replaceReg } from '../setting';

/**
 * vue 文件
 * @param params
 */
export function vueScheduler(params: TransformSchedulerParams) {
  transform(params.ast, {
    nodeTransforms: [
      (node) => {
        node = node as ElementNode;
        const type = node.type as unknown as NodeTypes;
        if (type === NodeTypes.ELEMENT) {
          const currentAttrNode = (node.props as AstProps).find((item) => item.name === POINT_PROP);
          currentAttrNode && iterationNodeProps(node.props, currentAttrNode, params);
        }
      },
    ],
  });
}

/**
 * 遍历 props，并修改或绑定事件
 */
function iterationNodeProps(
  props: AstProps,
  currentAttrNode: AttributeNode | DirectiveNode,
  params: TransformSchedulerParams,
) {
  props.forEach((item) => {
    const type = item.type as unknown as NodeTypes;
    if (type === NodeTypes.DIRECTIVE) {
      // 把节点转为指令类型
      const nodeDir = item as DirectiveNode;
      const { name, data } = getEventPointData((currentAttrNode as AttributeNode).value?.content);

      const nodeArg = nodeDir.arg as SimpleExpressionNode;
      // 事件名称是否一致 && 排除当前比较的 node
      if (name === nodeArg.content) {
        const { content } = (nodeDir.exp || {}) as SimpleExpressionNode;
        const eventParams = `{ data: '${data}', event: '${name}', ctx: this }`;
        // 修改替换目标事件方法
        params.result = params.result.replace(replaceReg(content), (str) => {
          return str + `window.${LISTENING_EVENT}(${eventParams})`;
        });
      }
    }
  });
}

/**
 * 根据自定义标识，获取事件名称
 * @param content
 */
function getEventPointData(content: string | undefined): EventPointData {
  if (!content) return {} as EventPointData;
  const [name, data] = content.split(SPLIT_IDENT);
  return { name, data };
}
