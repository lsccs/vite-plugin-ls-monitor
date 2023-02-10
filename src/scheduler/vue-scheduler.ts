import { TransformParams, AstProps, NodeTypes, EventPointData } from '../type';
import { transform, parse } from '@vue/compiler-dom';
import type {
  AttributeNode,
  DirectiveNode,
  ElementNode,
  SimpleExpressionNode,
} from '@vue/compiler-core';

import MagicString from 'magic-string';

/**
 * vue 文件
 * @param params
 */
export function vueScheduler(params: TransformParams) {
  const ast = parse(params.code);
  const result = new MagicString(params.code);
  transform(ast, {
    nodeTransforms: [
      (node: ElementNode) => {
        const type = node.type as unknown as NodeTypes;
        if (type === NodeTypes.ELEMENT) {
          const currentAttrNode = (node.props as AstProps).find((item) => item.name === 'data-lishi');
          currentAttrNode && iterationNodeProps(node.props, currentAttrNode, result);
        }
      },
    ],
  });
  console.log(result.toString());
  params.transform({ code: result.toString(), map: null });
}

/**
 * 遍历 props，并修改或绑定事件
 * @param props
 */
function iterationNodeProps(
  props: AstProps,
  currentAttrNode: AttributeNode | DirectiveNode,
  result: MagicString,
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
        const { loc, content } = (nodeDir.exp || {}) as SimpleExpressionNode;
        console.log(nodeDir, content);
        // 移除并替换事件
        result.remove(loc.start.offset, loc.end.offset);
        result.appendRight(
          loc.start.offset,
          `(...arg) => { window.lishi(${data});${content}(...arg); }`,
        );
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
  const [name, data] = content.split(':');
  return { name, data };
}
