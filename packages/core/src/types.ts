/**
 * Core type definitions for flowcn graph documents
 */

/**
 * A node in the graph
 */
export interface Node {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Node type for semantic meaning or styling */
  type?: string;
  /** Optional group membership */
  group?: string;
  /** Arbitrary node data */
  data?: Record<string, unknown>;
  /** Optional width hint for layout */
  width?: number;
  /** Optional height hint for layout */
  height?: number;
}

/**
 * An edge connecting two nodes
 */
export interface Edge {
  /** Optional unique identifier (auto-generated if missing) */
  id?: string;
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Optional label */
  label?: string;
  /** Edge kind (e.g., 'solid', 'dashed') */
  kind?: string;
  /** Arbitrary edge data */
  data?: Record<string, unknown>;
}

/**
 * A group (cluster) of nodes
 * Stub for future implementation
 */
export interface Group {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Parent group ID for nesting */
  parent?: string;
  /** Arbitrary group data */
  data?: Record<string, unknown>;
}

/**
 * Layout kind
 */
export type LayoutKind = 'layered' | 'grid';

/**
 * Layout direction
 */
export type LayoutDirection = 'LR' | 'TB';

/**
 * Layout options
 */
export interface LayoutOptions {
  /** Layout algorithm kind */
  kind: LayoutKind;
  /** Layout direction */
  direction: LayoutDirection;
  /** Horizontal spacing between nodes */
  spacingX?: number;
  /** Vertical spacing between nodes */
  spacingY?: number;
  /** Padding around the diagram */
  padding?: number;
  /** Default node width if not specified */
  defaultNodeWidth?: number;
  /** Default node height if not specified */
  defaultNodeHeight?: number;
}

/**
 * Node position and dimensions
 */
export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Edge route with path points
 */
export interface EdgeRoute {
  /** Path points from start to end */
  points: Point[];
  /** Optional label position */
  labelPoint?: Point;
}

/**
 * Group bounding box
 * Stub for future implementation
 */
export interface GroupBox {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
}

/**
 * Layout result
 */
export interface LayoutResult {
  /** Node positions by node ID */
  nodePositions: Record<string, NodePosition>;
  /** Edge routes by edge ID */
  edgeRoutes: Record<string, EdgeRoute>;
  /** Group boxes by group ID (stub) */
  groupBoxes?: Record<string, GroupBox>;
  /** Total diagram width */
  width: number;
  /** Total diagram height */
  height: number;
}

/**
 * Metadata for the graph document
 */
export interface GraphMeta {
  /** Document title */
  title?: string;
  /** Document description */
  description?: string;
  /** Creation timestamp */
  created?: string;
  /** Last modified timestamp */
  modified?: string;
  /** Arbitrary metadata */
  [key: string]: unknown;
}

/**
 * Complete graph document
 */
export interface GraphDoc {
  /** Document metadata */
  meta?: GraphMeta;
  /** Nodes in the graph */
  nodes: Node[];
  /** Edges in the graph */
  edges: Edge[];
  /** Groups (clusters) in the graph */
  groups?: Group[];
  /** Layout options */
  layout?: LayoutOptions;
}

/**
 * Validation diagnostic
 */
export interface Diagnostic {
  /** Severity level */
  level: 'error' | 'warning' | 'info';
  /** Diagnostic message */
  message: string;
  /** Node ID if relevant */
  nodeId?: string;
  /** Edge ID if relevant */
  edgeId?: string;
  /** Group ID if relevant */
  groupId?: string;
}

/**
 * Normalized graph document with stable IDs and validated structure
 */
export interface NormalizedGraph extends GraphDoc {
  /** All edges have IDs assigned */
  edges: (Required<Pick<Edge, 'id'>> & Edge)[];
}
