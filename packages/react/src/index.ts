/**
 * @flowcn/react - React components for rendering flowcn diagrams
 */

export { Diagram } from './Diagram';
export { NodeCard } from './NodeCard';
export { EdgeSvg } from './EdgeSvg';
export { FloatingToolbar } from './FloatingToolbar';
export { ConnectionIndicator } from './ConnectionIndicator';
export { ConnectionHandle, ConnectionHandles } from './ConnectionHandle';
export { EdgeWaypoint, EdgeWaypoints, AddWaypointHandle, EdgeEndpoint, EdgeEndpoints } from './EdgeWaypoint';
export { useDragNode } from './hooks/useDragNode';
export { usePanZoom } from './hooks/usePanZoom';
export { ShapeRenderer } from './shapes';

export type { DiagramProps, DiagramRef, EditorMode } from './Diagram';
export type { NodeCardProps } from './NodeCard';
export type { EdgeSvgProps } from './EdgeSvg';
export type { FloatingToolbarProps } from './FloatingToolbar';
export type { ConnectionIndicatorProps } from './ConnectionIndicator';
export type { ConnectionHandleProps, ConnectionHandlesProps, HandlePosition } from './ConnectionHandle';
export type { EdgeWaypointProps, EdgeWaypointsProps, AddWaypointHandleProps, EdgeEndpointProps, EdgeEndpointsProps } from './EdgeWaypoint';
export type { UseDragNodeOptions, UseDragNodeResult } from './hooks/useDragNode';
export type { UsePanZoomOptions, UsePanZoomResult, PanZoomState } from './hooks/usePanZoom';
export type { ShapeRendererProps } from './shapes';

// Re-export core types for convenience
export type {
  GraphDoc,
  Node,
  Edge,
  LayoutOptions,
  LayoutResult,
  ShapeType,
  EndpointStyle,
  LineStyle,
  CurveType,
} from '@flowcn/core';
