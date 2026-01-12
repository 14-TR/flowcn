/**
 * @flowcn/core - Core graph types, validation, and layout algorithms
 */

// Export all types
export type {
  Node,
  Edge,
  Group,
  GraphDoc,
  GraphMeta,
  NormalizedGraph,
  LayoutKind,
  LayoutDirection,
  LayoutOptions,
  LayoutResult,
  NodePosition,
  Point,
  EdgeRoute,
  GroupBox,
  Diagnostic,
} from './types';

// Export validation functions
export { validateGraph, hasErrors } from './validate';

// Export normalization functions
export { normalizeGraph } from './normalize';

// Export layout functions
export { layoutGraph } from './layout';
export { computeLayeredLayout, canUseLayeredLayout } from './layout/layered';
export { computeGridLayout } from './layout/grid';
