import { TransformResult } from 'vite';
import { AttributeNode, DirectiveNode, RootNode } from '@vue/compiler-core';
import MagicString from 'magic-string';

export type SchedulerCallback = (result: TransformResult) => void;

export interface TransformParams {
  id: string;
  code: string;
  transform: SchedulerCallback;
}

export interface TransformSchedulerParams extends TransformParams {
  ast: RootNode;
  result: MagicString;
}

export type AstProps = Array<AttributeNode | DirectiveNode>;
export interface EventPointData {
  name: string | undefined;
  data: string | undefined;
}

export interface pointParams {
  event: string;
  data: string;
  ctx: any;
}

export enum NodeTypes {
  ROOT = 0,
  ELEMENT = 1,
  TEXT = 2,
  COMMENT = 3,
  SIMPLE_EXPRESSION = 4,
  INTERPOLATION = 5,
  ATTRIBUTE = 6,
  DIRECTIVE = 7,
  COMPOUND_EXPRESSION = 8,
  IF = 9,
  IF_BRANCH = 10,
  FOR = 11,
  TEXT_CALL = 12,
  VNODE_CALL = 13,
}
