/**
 * @flowcn/react - React components for rendering flowcn diagrams
 */

export { Diagram } from './Diagram';
export { NodeCard } from './NodeCard';
export { EdgeSvg } from './EdgeSvg';

export type { DiagramProps } from './Diagram';
export type { NodeCardProps } from './NodeCard';
export type { EdgeSvgProps } from './EdgeSvg';

// Re-export core types for convenience
export type {
  GraphDoc,
  Node,
  Edge,
  LayoutOptions,
  LayoutResult,
} from '@flowcn/core';
