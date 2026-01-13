/**
 * EdgeWaypoint - Draggable control points on edges for custom routing
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { Point } from '@flowcn/core';

export interface EdgeWaypointProps {
  /** Waypoint position */
  point: Point;
  /** Index of this waypoint in the waypoints array */
  index: number;
  /** Callback when waypoint is dragged */
  onDrag?: (index: number, x: number, y: number) => void;
  /** Callback when drag ends */
  onDragEnd?: (index: number, x: number, y: number) => void;
  /** Callback when waypoint is double-clicked (to remove) */
  onDoubleClick?: (index: number) => void;
  /** Whether the edge is selected */
  selected?: boolean;
  /** Whether waypoints are editable */
  editable?: boolean;
}

export function EdgeWaypoint({
  point,
  index,
  onDrag,
  onDragEnd,
  onDoubleClick,
  selected = false,
  editable = false,
}: EdgeWaypointProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - point.x,
      y: e.clientY - point.y,
    });
  }, [editable, point.x, point.y]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onDrag?.(index, newX, newY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setIsDragging(false);
      onDragEnd?.(index, newX, newY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, index, onDrag, onDragEnd]);

  if (!selected && !editable) return null;

  const size = 8;

  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={size / 2}
      className={`
        transition-all cursor-move
        ${isDragging ? 'fill-blue-500' : 'fill-white'}
        ${editable ? 'stroke-blue-500' : 'stroke-slate-400'}
      `}
      style={{
        strokeWidth: 2,
        cursor: editable ? 'move' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (editable) {
          onDoubleClick?.(index);
        }
      }}
    />
  );
}

export interface EdgeWaypointsProps {
  /** Edge ID */
  edgeId: string;
  /** Array of waypoint positions */
  waypoints: Point[];
  /** Callback when a waypoint is moved */
  onWaypointMove?: (edgeId: string, index: number, x: number, y: number) => void;
  /** Callback when a waypoint is removed */
  onWaypointRemove?: (edgeId: string, index: number) => void;
  /** Whether the edge is selected */
  selected?: boolean;
  /** Whether waypoints are editable */
  editable?: boolean;
}

/**
 * Renders all waypoints for an edge
 */
export function EdgeWaypoints({
  edgeId,
  waypoints,
  onWaypointMove,
  onWaypointRemove,
  selected = false,
  editable = false,
}: EdgeWaypointsProps) {
  const handleDragEnd = useCallback((index: number, x: number, y: number) => {
    onWaypointMove?.(edgeId, index, x, y);
  }, [edgeId, onWaypointMove]);

  const handleDoubleClick = useCallback((index: number) => {
    onWaypointRemove?.(edgeId, index);
  }, [edgeId, onWaypointRemove]);

  if (!selected && !editable) return null;

  return (
    <g>
      {waypoints.map((point, index) => (
        <EdgeWaypoint
          key={`${edgeId}-wp-${index}`}
          point={point}
          index={index}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleDoubleClick}
          selected={selected}
          editable={editable}
        />
      ))}
    </g>
  );
}

export interface AddWaypointHandleProps {
  /** Position along the edge path */
  point: Point;
  /** Callback when clicked to add a waypoint */
  onClick: () => void;
  /** Whether handles are visible */
  visible?: boolean;
}

/**
 * Clickable point on edge to add a new waypoint
 */
export function AddWaypointHandle({
  point,
  onClick,
  visible = false,
}: AddWaypointHandleProps) {
  if (!visible) return null;

  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={6}
      className="fill-blue-200 stroke-blue-500 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
      style={{ strokeWidth: 2 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
}

export interface EdgeEndpointProps {
  /** Endpoint position */
  point: Point;
  /** Which end of the edge this is */
  position: 'source' | 'target';
  /** Edge ID */
  edgeId: string;
  /** Node ID this endpoint is connected to */
  connectedNodeId: string;
  /** Whether this endpoint is being dragged */
  isDragging?: boolean;
  /** Whether the edge is selected */
  selected?: boolean;
  /** Whether endpoints are editable */
  editable?: boolean;
  /** Callback when drag starts */
  onDragStart?: (edgeId: string, position: 'source' | 'target') => void;
  /** Callback during drag */
  onDrag?: (edgeId: string, position: 'source' | 'target', x: number, y: number) => void;
  /** Callback when drag ends - returns the target node ID if dropped on a node */
  onDragEnd?: (edgeId: string, position: 'source' | 'target', x: number, y: number) => void;
}

/**
 * Draggable endpoint at the start or end of an edge
 */
export function EdgeEndpoint({
  point,
  position,
  edgeId,
  connectedNodeId,
  isDragging = false,
  selected = false,
  editable = false,
  onDragStart,
  onDrag,
  onDragEnd,
}: EdgeEndpointProps) {
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState(point);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setDragPos(point);
    onDragStart?.(edgeId, position);
  }, [editable, point, edgeId, position, onDragStart]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get position relative to SVG
      const svg = document.querySelector('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragPos({ x, y });
      onDrag?.(edgeId, position, x, y);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const svg = document.querySelector('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragging(false);
      onDragEnd?.(edgeId, position, x, y);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, edgeId, position, onDrag, onDragEnd]);

  if (!selected && !editable) return null;

  const displayPoint = dragging ? dragPos : point;
  const size = 10;

  return (
    <>
      {/* Connection line when dragging */}
      {dragging && (
        <line
          x1={point.x}
          y1={point.y}
          x2={dragPos.x}
          y2={dragPos.y}
          stroke="rgb(59 130 246)"
          strokeWidth={2}
          strokeDasharray="4,4"
        />
      )}
      {/* Endpoint handle */}
      <circle
        cx={displayPoint.x}
        cy={displayPoint.y}
        r={size / 2}
        className={`
          transition-all
          ${dragging ? 'fill-blue-500 stroke-white' : 'fill-orange-500 stroke-white'}
        `}
        style={{
          strokeWidth: 2,
          cursor: editable ? 'crosshair' : 'default',
          filter: dragging ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : undefined,
        }}
        onMouseDown={handleMouseDown}
      />
      {/* Label showing which node it's connected to */}
      {selected && !dragging && (
        <text
          x={displayPoint.x}
          y={displayPoint.y - 12}
          textAnchor="middle"
          fontSize="10"
          fill="rgb(100 116 139)"
          className="select-none pointer-events-none"
        >
          {position === 'source' ? 'from' : 'to'}
        </text>
      )}
    </>
  );
}

export interface EdgeEndpointsProps {
  /** Edge ID */
  edgeId: string;
  /** Start point of the edge */
  startPoint: Point;
  /** End point of the edge */
  endPoint: Point;
  /** Source node ID */
  sourceNodeId: string;
  /** Target node ID */
  targetNodeId: string;
  /** Whether the edge is selected */
  selected?: boolean;
  /** Whether endpoints are editable */
  editable?: boolean;
  /** Callback when an endpoint drag starts */
  onEndpointDragStart?: (edgeId: string, position: 'source' | 'target') => void;
  /** Callback during endpoint drag */
  onEndpointDrag?: (edgeId: string, position: 'source' | 'target', x: number, y: number) => void;
  /** Callback when endpoint drag ends */
  onEndpointDragEnd?: (edgeId: string, position: 'source' | 'target', x: number, y: number) => void;
}

/**
 * Renders draggable endpoints at both ends of an edge
 */
export function EdgeEndpoints({
  edgeId,
  startPoint,
  endPoint,
  sourceNodeId,
  targetNodeId,
  selected = false,
  editable = false,
  onEndpointDragStart,
  onEndpointDrag,
  onEndpointDragEnd,
}: EdgeEndpointsProps) {
  if (!selected && !editable) return null;

  return (
    <g>
      <EdgeEndpoint
        point={startPoint}
        position="source"
        edgeId={edgeId}
        connectedNodeId={sourceNodeId}
        selected={selected}
        editable={editable}
        onDragStart={onEndpointDragStart}
        onDrag={onEndpointDrag}
        onDragEnd={onEndpointDragEnd}
      />
      <EdgeEndpoint
        point={endPoint}
        position="target"
        edgeId={edgeId}
        connectedNodeId={targetNodeId}
        selected={selected}
        editable={editable}
        onDragStart={onEndpointDragStart}
        onDrag={onEndpointDrag}
        onDragEnd={onEndpointDragEnd}
      />
    </g>
  );
}
