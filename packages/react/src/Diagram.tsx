/**
 * Main Diagram component for rendering flowcn graphs
 */

import React, { useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { GraphDoc, LayoutOptions, Node, Edge, NodePosition, Point, HandlePosition } from '@flowcn/core';
import { layoutGraph, normalizeGraph } from '@flowcn/core';
import { NodeCard } from './NodeCard';
import { EdgeSvg } from './EdgeSvg';
import { ConnectionIndicator } from './ConnectionIndicator';
import { EdgeWaypoints, AddWaypointHandle } from './EdgeWaypoint';
import { usePanZoom, type PanZoomState } from './hooks/usePanZoom';
import { ConnectionHandles } from './ConnectionHandle';

export type EditorMode = 'select' | 'connect';

export interface DiagramRef {
  addNode: () => void;
  deleteSelected: () => void;
  resetLayout: () => void;
  setMode: (mode: EditorMode) => void;
  cancelConnection: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetView: () => void;
  getZoom: () => number;
}

export interface DiagramProps {
  /** Graph document to render */
  doc: GraphDoc;
  /** Layout options (overrides doc.layout) */
  options?: Partial<LayoutOptions>;
  /** Callback when a node is selected */
  onSelect?: (node: Node | null) => void;
  /** Callback when a node is hovered */
  onHover?: (node: Node | null) => void;
  /** Additional CSS class */
  className?: string;
  /** Show edge labels */
  showEdgeLabels?: boolean;
  /** Enable edit mode (draggable nodes, etc.) */
  editable?: boolean;
  /** Callback when graph document changes (editable mode) */
  onDocChange?: (doc: GraphDoc) => void;
  /** Callback when a node is double-clicked for editing */
  onNodeEdit?: (node: Node) => void;
  /** External control of editor mode */
  mode?: EditorMode;
  /** Callback when mode changes internally */
  onModeChange?: (mode: EditorMode) => void;
  /** Callback when selection state changes */
  onSelectionChange?: (hasSelection: boolean, selectedNodeId: string | null, selectedEdgeId: string | null) => void;
  /** Callback when connecting state changes */
  onConnectingChange?: (isConnecting: boolean) => void;
  /** Callback when node drag starts (useful for disabling pan) */
  onNodeDragStart?: (nodeId: string) => void;
  /** Callback when node drag ends */
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void;
  /** Callback when an edge waypoint is moved */
  onEdgeWaypointMove?: (edgeId: string, index: number, x: number, y: number) => void;
  /** Callback when an edge waypoint is removed */
  onEdgeWaypointRemove?: (edgeId: string, index: number) => void;
  /** Callback when a waypoint is added to an edge */
  onEdgeWaypointAdd?: (edgeId: string, x: number, y: number) => void;
  /** Enable pan/zoom controls */
  panZoomEnabled?: boolean;
  /** Callback when pan/zoom state changes */
  onPanZoomChange?: (state: PanZoomState) => void;
  /** Callback when connection starts from a specific handle */
  onConnectionStart?: (nodeId: string, handle: HandlePosition) => void;
  /** Callback when connection ends at a specific handle */
  onConnectionEnd?: (targetNodeId: string, handle: HandlePosition | null) => void;
  /** Callback when an edge endpoint is reconnected to a different node */
  onEdgeReconnect?: (edgeId: string, position: 'source' | 'target', newNodeId: string) => void;
}

export const Diagram = forwardRef<DiagramRef, DiagramProps>(function Diagram({
  doc,
  options,
  onSelect,
  onHover,
  className = '',
  showEdgeLabels = true,
  editable = false,
  onDocChange,
  onNodeEdit,
  mode: externalMode,
  onModeChange,
  onSelectionChange,
  onConnectingChange,
  onNodeDragStart,
  onNodeDragEnd: onNodeDragEndProp,
  onEdgeWaypointMove,
  onEdgeWaypointRemove,
  onEdgeWaypointAdd,
  panZoomEnabled = true,
  onPanZoomChange,
  onConnectionStart,
  onConnectionEnd,
  onEdgeReconnect,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Edge endpoint dragging state
  const [draggingEndpoint, setDraggingEndpoint] = useState<{
    edgeId: string;
    position: 'source' | 'target';
    x: number;
    y: number;
  } | null>(null);

  // Pan/zoom state
  const { state: panZoomState, containerProps: panZoomContainerProps, reset: resetPanZoom, zoomToFit, setZoom } = usePanZoom({
    disabled: !panZoomEnabled,
    onChange: onPanZoomChange,
  });

  // Track connection source handle
  const [connectionSourceHandle, setConnectionSourceHandle] = useState<HandlePosition | null>(null);

  // Position overrides for manual node positioning
  const [positionOverrides, setPositionOverrides] = useState<Record<string, { x: number; y: number }>>({});

  // Editor state - use external mode if provided
  const [internalMode, setInternalMode] = useState<EditorMode>('select');
  const editorMode = externalMode ?? internalMode;

  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Normalize graph to get stable edge IDs
  const normalizedDoc = useMemo(() => {
    return normalizeGraph(doc);
  }, [doc]);

  // Compute layout
  const layout = useMemo(() => {
    return layoutGraph(doc, options);
  }, [doc, options]);

  // Merge layout positions with overrides
  const effectivePositions = useMemo(() => {
    const merged: Record<string, NodePosition> = {};

    for (const [nodeId, position] of Object.entries(layout.nodePositions)) {
      const override = positionOverrides[nodeId];
      if (override) {
        merged[nodeId] = {
          ...position,
          x: override.x,
          y: override.y,
        };
      } else {
        merged[nodeId] = position;
      }
    }

    return merged;
  }, [layout.nodePositions, positionOverrides]);

  // Helper to get handle position on a node
  const getHandlePoint = useCallback((nodePos: NodePosition, handle: HandlePosition | undefined, defaultHandle: HandlePosition): Point => {
    const h = handle || defaultHandle;
    switch (h) {
      case 'top':
        return { x: nodePos.x + nodePos.width / 2, y: nodePos.y };
      case 'bottom':
        return { x: nodePos.x + nodePos.width / 2, y: nodePos.y + nodePos.height };
      case 'left':
        return { x: nodePos.x, y: nodePos.y + nodePos.height / 2 };
      case 'right':
      default:
        return { x: nodePos.x + nodePos.width, y: nodePos.y + nodePos.height / 2 };
    }
  }, []);

  // Recompute edge routes when positions change
  const effectiveEdgeRoutes = useMemo(() => {
    // Always recalculate to respect handle positions
    const direction = options?.direction || doc.layout?.direction || 'LR';
    const routes: Record<string, { points: Point[]; labelPoint?: Point }> = {};
    const MARGIN = 20; // Clearance margin around nodes

    for (const edge of normalizedDoc.edges) {
      const fromPos = effectivePositions[edge.from];
      const toPos = effectivePositions[edge.to];

      if (!fromPos || !toPos) continue;

      // Get the handle positions or use defaults based on layout direction
      const defaultSourceHandle: HandlePosition = direction === 'LR' ? 'right' : 'bottom';
      const defaultTargetHandle: HandlePosition = direction === 'LR' ? 'left' : 'top';
      
      const sourceHandle = edge.sourceHandle || defaultSourceHandle;
      const targetHandle = edge.targetHandle || defaultTargetHandle;
      
      const startPoint = getHandlePoint(fromPos, sourceHandle, defaultSourceHandle);
      const endPoint = getHandlePoint(toPos, targetHandle, defaultTargetHandle);

      // If edge has waypoints, use them
      if (edge.waypoints && edge.waypoints.length > 0) {
        const points = [startPoint, ...edge.waypoints, endPoint];
        const midIndex = Math.floor(points.length / 2);
        routes[edge.id!] = { points, labelPoint: points[midIndex] };
        continue;
      }

      // Generate routing that avoids going through nodes
      const points = (() => {
        // Get first exit point outside the source node
        const exitPoint = (() => {
          switch (sourceHandle) {
            case 'right': return { x: fromPos.x + fromPos.width + MARGIN, y: startPoint.y };
            case 'left': return { x: fromPos.x - MARGIN, y: startPoint.y };
            case 'bottom': return { x: startPoint.x, y: fromPos.y + fromPos.height + MARGIN };
            case 'top': return { x: startPoint.x, y: fromPos.y - MARGIN };
            default: return { x: fromPos.x + fromPos.width + MARGIN, y: startPoint.y };
          }
        })();
        
        // Get entry point outside the target node
        const entryPoint = (() => {
          switch (targetHandle) {
            case 'left': return { x: toPos.x - MARGIN, y: endPoint.y };
            case 'right': return { x: toPos.x + toPos.width + MARGIN, y: endPoint.y };
            case 'top': return { x: endPoint.x, y: toPos.y - MARGIN };
            case 'bottom': return { x: endPoint.x, y: toPos.y + toPos.height + MARGIN };
            default: return { x: toPos.x - MARGIN, y: endPoint.y };
          }
        })();
        
        // Check if horizontal or vertical handles
        const sourceIsHorizontal = sourceHandle === 'left' || sourceHandle === 'right';
        const targetIsHorizontal = targetHandle === 'left' || targetHandle === 'right';
        
        if (sourceIsHorizontal && targetIsHorizontal) {
          // Both horizontal - route with vertical middle segment
          // Choose midpoint that doesn't intersect nodes
          const midX = (exitPoint.x + entryPoint.x) / 2;
          return [
            startPoint,
            exitPoint,
            { x: midX, y: exitPoint.y },
            { x: midX, y: entryPoint.y },
            entryPoint,
            endPoint,
          ];
        }
        
        if (!sourceIsHorizontal && !targetIsHorizontal) {
          // Both vertical - route with horizontal middle segment
          const midY = (exitPoint.y + entryPoint.y) / 2;
          return [
            startPoint,
            exitPoint,
            { x: exitPoint.x, y: midY },
            { x: entryPoint.x, y: midY },
            entryPoint,
            endPoint,
          ];
        }
        
        // Mixed: one horizontal, one vertical
        // Route through the corner outside both nodes
        if (sourceIsHorizontal) {
          // Source is horizontal (exit left/right), target is vertical (entry top/bottom)
          return [
            startPoint,
            exitPoint,
            { x: entryPoint.x, y: exitPoint.y },
            entryPoint,
            endPoint,
          ];
        } else {
          // Source is vertical (exit top/bottom), target is horizontal (entry left/right)
          return [
            startPoint,
            exitPoint,
            { x: exitPoint.x, y: entryPoint.y },
            entryPoint,
            endPoint,
          ];
        }
      })();

      const midIndex = Math.floor(points.length / 2);
      routes[edge.id!] = { points, labelPoint: points[midIndex] };
    }

    return routes;
  }, [doc, options, normalizedDoc.edges, effectivePositions, getHandlePoint]);

  // Calculate effective diagram dimensions
  const effectiveDimensions = useMemo(() => {
    if (Object.keys(positionOverrides).length === 0) {
      return { width: layout.width, height: layout.height };
    }

    let maxX = 0;
    let maxY = 0;

    for (const pos of Object.values(effectivePositions)) {
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    }

    return {
      width: Math.max(layout.width, maxX + 40),
      height: Math.max(layout.height, maxY + 40),
    };
  }, [layout.width, layout.height, effectivePositions, positionOverrides]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(!!selectedNodeId || !!selectedEdgeId, selectedNodeId, selectedEdgeId);
  }, [selectedNodeId, selectedEdgeId, onSelectionChange]);

  // Notify parent of connecting state changes
  useEffect(() => {
    onConnectingChange?.(!!connectionSource);
  }, [connectionSource, onConnectingChange]);

  // Set mode handler
  const setMode = useCallback((mode: EditorMode) => {
    setInternalMode(mode);
    onModeChange?.(mode);
    if (mode !== 'connect') {
      setConnectionSource(null);
    }
  }, [onModeChange]);

  // Handle node selection
  const handleNodeClick = useCallback(
    (node: Node) => {
      if (editorMode === 'connect') {
        if (!connectionSource) {
          setConnectionSource(node.id);
        } else if (connectionSource !== node.id) {
          const newEdge: Edge = {
            from: connectionSource,
            to: node.id,
          };
          const newDoc: GraphDoc = {
            ...doc,
            edges: [...doc.edges, newEdge],
          };
          onDocChange?.(newDoc);
          setConnectionSource(null);
        }
      } else {
        setSelectedNodeId(node.id);
        setSelectedEdgeId(null);
        onSelect?.(node);
      }
    },
    [editorMode, connectionSource, doc, onDocChange, onSelect]
  );

  // Handle node hover
  const handleNodeMouseEnter = useCallback(
    (node: Node) => {
      setHoveredNodeId(node.id);
      onHover?.(node);
    },
    [onHover]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    onHover?.(null);
  }, [onHover]);

  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (nodeId: string) => {
      onNodeDragStart?.(nodeId);
    },
    [onNodeDragStart]
  );

  // Handle node drag end
  const handleNodeDragEnd = useCallback(
    (nodeId: string, x: number, y: number) => {
      setPositionOverrides(prev => ({
        ...prev,
        [nodeId]: { x, y },
      }));
      onNodeDragEndProp?.(nodeId, x, y);
    },
    [onNodeDragEndProp]
  );

  // Handle node double-click for editing
  const handleNodeDoubleClick = useCallback(
    (node: Node) => {
      onNodeEdit?.(node);
    },
    [onNodeEdit]
  );

  // Handle reset layout
  const handleResetLayout = useCallback(() => {
    setPositionOverrides({});
  }, []);

  // Handle add node
  const handleAddNode = useCallback(() => {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      label: 'New Node',
      type: 'process',
    };
    const newDoc: GraphDoc = {
      ...doc,
      nodes: [...doc.nodes, newNode],
    };
    onDocChange?.(newDoc);
    setSelectedNodeId(newId);
  }, [doc, onDocChange]);

  // Handle delete selected
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      const newDoc: GraphDoc = {
        ...doc,
        nodes: doc.nodes.filter(n => n.id !== selectedNodeId),
        edges: doc.edges.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId),
      };
      onDocChange?.(newDoc);
      setSelectedNodeId(null);
      setPositionOverrides(prev => {
        const { [selectedNodeId]: _, ...rest } = prev;
        return rest;
      });
    } else if (selectedEdgeId) {
      const selectedNormalizedEdge = normalizedDoc.edges.find(e => e.id === selectedEdgeId);
      if (selectedNormalizedEdge) {
        const newDoc: GraphDoc = {
          ...doc,
          edges: doc.edges.filter(e =>
            !(e.from === selectedNormalizedEdge.from && e.to === selectedNormalizedEdge.to)
          ),
        };
        onDocChange?.(newDoc);
      }
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId, doc, normalizedDoc, onDocChange]);

  // Cancel connection
  const cancelConnection = useCallback(() => {
    setConnectionSource(null);
  }, []);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom(panZoomState.zoom + 0.1);
  }, [panZoomState.zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(panZoomState.zoom - 0.1);
  }, [panZoomState.zoom, setZoom]);

  const handleZoomToFit = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      zoomToFit(effectiveDimensions.width, effectiveDimensions.height, rect.width, rect.height);
    }
  }, [effectiveDimensions, zoomToFit]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addNode: handleAddNode,
    deleteSelected: handleDeleteSelected,
    resetLayout: handleResetLayout,
    setMode,
    cancelConnection,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomToFit: handleZoomToFit,
    resetView: resetPanZoom,
    getZoom: () => panZoomState.zoom,
  }), [handleAddNode, handleDeleteSelected, handleResetLayout, setMode, cancelConnection, handleZoomIn, handleZoomOut, handleZoomToFit, resetPanZoom, panZoomState.zoom]);

  // Get incident edges for highlighting
  const getIncidentEdges = useCallback(
    (nodeId: string) => {
      return normalizedDoc.edges.filter(
        edge => edge.from === nodeId || edge.to === nodeId
      );
    },
    [normalizedDoc.edges]
  );

  const incidentEdgeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    return new Set(
      getIncidentEdges(hoveredNodeId).map(e => e.id)
    );
  }, [hoveredNodeId, getIncidentEdges]);

  // Track mouse position for connection indicator
  useEffect(() => {
    if (!editable || editorMode !== 'connect' || !connectionSource) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [editable, editorMode, connectionSource]);

  // Handle escape to cancel connection
  useEffect(() => {
    if (!editable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectionSource(null);
        setMode('select');
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedNodeId || selectedEdgeId)) {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editable, selectedNodeId, selectedEdgeId, handleDeleteSelected, setMode]);

  // Handle click on canvas to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === containerRef.current?.querySelector('svg')) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      onSelect?.(null);
      if (connectionSource) {
        setConnectionSource(null);
      }
    }
  }, [connectionSource, onSelect]);

  // Handle edge click for selection
  const handleEdgeClick = useCallback((edgeId: string) => {
    if (!editable) return;
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    onSelect?.(null);
  }, [editable, onSelect]);

  // Handle waypoint move
  const handleWaypointMove = useCallback((edgeId: string, index: number, x: number, y: number) => {
    onEdgeWaypointMove?.(edgeId, index, x, y);
  }, [onEdgeWaypointMove]);

  // Handle waypoint remove
  const handleWaypointRemove = useCallback((edgeId: string, index: number) => {
    onEdgeWaypointRemove?.(edgeId, index);
  }, [onEdgeWaypointRemove]);

  // Handle adding waypoint on edge click (when edge is selected)
  const handleAddWaypoint = useCallback((edgeId: string, x: number, y: number) => {
    onEdgeWaypointAdd?.(edgeId, x, y);
  }, [onEdgeWaypointAdd]);

  // Helper to find the closest handle on a node
  const findClosestHandle = useCallback((nodePos: NodePosition, x: number, y: number): HandlePosition => {
    const handles: { pos: HandlePosition; x: number; y: number }[] = [
      { pos: 'top', x: nodePos.x + nodePos.width / 2, y: nodePos.y },
      { pos: 'right', x: nodePos.x + nodePos.width, y: nodePos.y + nodePos.height / 2 },
      { pos: 'bottom', x: nodePos.x + nodePos.width / 2, y: nodePos.y + nodePos.height },
      { pos: 'left', x: nodePos.x, y: nodePos.y + nodePos.height / 2 },
    ];
    
    let closest = handles[0];
    let minDist = Infinity;
    
    for (const handle of handles) {
      const dist = Math.sqrt((handle.x - x) ** 2 + (handle.y - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = handle;
      }
    }
    
    return closest.pos;
  }, []);

  // Handle edge endpoint drag end - check if dropped on a node to reconnect
  const handleEdgeEndpointDragEnd = useCallback((
    edgeId: string,
    position: 'source' | 'target',
    x: number,
    y: number
  ) => {
    // Find which node (if any) the endpoint was dropped on or near
    let targetNodeId: string | null = null;
    let targetNodePos: NodePosition | null = null;
    const SNAP_DISTANCE = 30; // Pixels to snap to a node handle
    
    // First check if inside a node
    for (const [nodeId, nodePos] of Object.entries(effectivePositions)) {
      if (
        x >= nodePos.x - SNAP_DISTANCE &&
        x <= nodePos.x + nodePos.width + SNAP_DISTANCE &&
        y >= nodePos.y - SNAP_DISTANCE &&
        y <= nodePos.y + nodePos.height + SNAP_DISTANCE
      ) {
        targetNodeId = nodeId;
        targetNodePos = nodePos;
        break;
      }
    }

    if (targetNodeId && targetNodePos) {
      // Find the edge and check we're not connecting to the same node
      const edge = normalizedDoc.edges.find(e => e.id === edgeId);
      if (edge) {
        const currentNodeId = position === 'source' ? edge.from : edge.to;
        
        // Find which handle is closest to the drop point
        const handlePos = findClosestHandle(targetNodePos, x, y);
        
        if (targetNodeId !== currentNodeId || true) { // Always update if handle changed
          // Call the external handler if provided
          if (onEdgeReconnect) {
            onEdgeReconnect(edgeId, position, targetNodeId);
          } else {
            // Default behavior: update the edge in the document
            const newEdges = doc.edges.map(e => {
              // Match by from/to since original edges may not have IDs
              if (e.from === edge.from && e.to === edge.to) {
                if (position === 'source') {
                  return { ...e, from: targetNodeId, sourceHandle: handlePos };
                } else {
                  return { ...e, to: targetNodeId, targetHandle: handlePos };
                }
              }
              return e;
            });
            onDocChange?.({ ...doc, edges: newEdges });
          }
        }
      }
    }
  }, [effectivePositions, normalizedDoc.edges, doc, onDocChange, onEdgeReconnect, findClosestHandle]);

  // Get source node position for connection indicator based on handle
  const sourcePosition = useMemo(() => {
    if (!connectionSource) return null;
    const pos = effectivePositions[connectionSource];
    if (!pos) return null;
    
    // If we have a specific handle, use its position
    if (connectionSourceHandle) {
      switch (connectionSourceHandle) {
        case 'top':
          return { x: pos.x + pos.width / 2, y: pos.y };
        case 'bottom':
          return { x: pos.x + pos.width / 2, y: pos.y + pos.height };
        case 'left':
          return { x: pos.x, y: pos.y + pos.height / 2 };
        case 'right':
        default:
          return { x: pos.x + pos.width, y: pos.y + pos.height / 2 };
      }
    }
    
    // Default to right side
    return {
      x: pos.x + pos.width,
      y: pos.y + pos.height / 2,
    };
  }, [connectionSource, effectivePositions, connectionSourceHandle]);

  // Handle connection start from a specific handle
  const handleConnectionHandleClick = useCallback((nodeId: string, handle: HandlePosition) => {
    if (editorMode !== 'connect') return;
    
    if (!connectionSource) {
      setConnectionSource(nodeId);
      setConnectionSourceHandle(handle);
      onConnectionStart?.(nodeId, handle);
    } else if (connectionSource !== nodeId) {
      // Complete the connection
      const newEdge: Edge = {
        from: connectionSource,
        to: nodeId,
      };
      const newDoc: GraphDoc = {
        ...doc,
        edges: [...doc.edges, newEdge],
      };
      onDocChange?.(newDoc);
      onConnectionEnd?.(nodeId, handle);
      setConnectionSource(null);
      setConnectionSourceHandle(null);
    }
  }, [editorMode, connectionSource, doc, onDocChange, onConnectionStart, onConnectionEnd]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: editable ? 400 : undefined,
        overflow: 'hidden',
        ...panZoomContainerProps.style,
      }}
      onClick={handleCanvasClick}
      onMouseDown={panZoomContainerProps.onMouseDown}
      onWheel={panZoomContainerProps.onWheel}
    >
      {/* Transformable content layer */}
      <div
        ref={contentRef}
        style={{
          transform: `translate(${panZoomState.panX}px, ${panZoomState.panY}px) scale(${panZoomState.zoom})`,
          transformOrigin: '0 0',
          width: effectiveDimensions.width,
          height: effectiveDimensions.height,
          position: 'relative',
        }}
      >
        {/* SVG layer for edges */}
        <svg
          className="absolute top-0 left-0"
          width={effectiveDimensions.width}
          height={effectiveDimensions.height}
          style={{ pointerEvents: editable ? 'auto' : 'none' }}
        >
        {normalizedDoc.edges.map(edge => {
          const edgeId = edge.id;
          const route = effectiveEdgeRoutes[edgeId];
          if (!route) return null;

          const isHighlighted = incidentEdgeIds.has(edgeId);
          const isSelected = selectedEdgeId === edgeId;

          return (
            <g
              key={edgeId}
              onClick={(e) => {
                e.stopPropagation();
                handleEdgeClick(edgeId);
              }}
              style={{ cursor: editable ? 'pointer' : 'default' }}
            >
              <EdgeSvg
                edge={edge}
                route={route}
                highlighted={isHighlighted || isSelected}
                showLabel={showEdgeLabels}
              />
              {/* Wider hit area for easier edge selection */}
              {editable && (
                <path
                  d={route.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  stroke="transparent"
                  strokeWidth={12}
                  fill="none"
                />
              )}
              {/* Render waypoints when edge is selected */}
              {editable && isSelected && (
                <>
                  {/* Existing waypoints (the middle points, not start/end) */}
                  <EdgeWaypoints
                    edgeId={edgeId}
                    waypoints={route.points.slice(1, -1)}
                    onWaypointMove={handleWaypointMove}
                    onWaypointRemove={handleWaypointRemove}
                    selected={true}
                    editable={true}
                  />
                  {/* Add waypoint handles at midpoints between existing points */}
                  {route.points.slice(0, -1).map((point, i) => {
                    const nextPoint = route.points[i + 1];
                    const midX = (point.x + nextPoint.x) / 2;
                    const midY = (point.y + nextPoint.y) / 2;
                    return (
                      <AddWaypointHandle
                        key={`add-wp-${i}`}
                        point={{ x: midX, y: midY }}
                        onClick={() => handleAddWaypoint(edgeId, midX, midY)}
                        visible={true}
                      />
                    );
                  })}
                </>
              )}
            </g>
          );
        })}

          {/* Connection indicator */}
          {editable && connectionSource && sourcePosition && mousePosition && (
            <ConnectionIndicator
              sourcePosition={sourcePosition}
              mousePosition={mousePosition}
            />
          )}
        </svg>

        {/* Node layer */}
        {doc.nodes.map(node => {
          const position = effectivePositions[node.id];
          if (!position) return null;

          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isConnectionSource = connectionSource === node.id;
          // Show handles while dragging an edge endpoint
          const showHandlesForDrag = !!draggingEndpoint;

          return (
            <NodeCard
              key={node.id}
              node={node}
              position={position}
              selected={isSelected}
              hovered={isHovered}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeMouseEnter(node)}
              onMouseLeave={handleNodeMouseLeave}
              draggable={editable && !draggingEndpoint}
              onDragStart={handleNodeDragStart}
              onDragEnd={handleNodeDragEnd}
              connectMode={editorMode === 'connect' || showHandlesForDrag}
              isConnectionSource={isConnectionSource}
              onDoubleClick={() => handleNodeDoubleClick(node)}
              containerRef={contentRef}
              onHandleClick={(handle) => handleConnectionHandleClick(node.id, handle)}
            />
          );
        })}

        {/* Edge endpoint handles - rendered on top of nodes as HTML elements */}
        {editable && selectedEdgeId && (() => {
          const edge = normalizedDoc.edges.find(e => e.id === selectedEdgeId);
          if (!edge) return null;
          
          const edgeId = selectedEdgeId;
          const route = effectiveEdgeRoutes[edgeId];
          if (!route || route.points.length < 2) return null;
          
          const originalStart = route.points[0];
          const originalEnd = route.points[route.points.length - 1];
          const secondPt = route.points[1] || originalEnd;
          const secondLastPt = route.points[route.points.length - 2] || originalStart;
          
          // Offset the handles outward along the edge direction so they're not hidden by nodes
          const startDx = secondPt.x - originalStart.x;
          const startDy = secondPt.y - originalStart.y;
          const startLen = Math.sqrt(startDx * startDx + startDy * startDy) || 1;
          const startPt = { 
            x: originalStart.x + (startDx / startLen) * 20, 
            y: originalStart.y + (startDy / startLen) * 20 
          };
          
          const endDx = secondLastPt.x - originalEnd.x;
          const endDy = secondLastPt.y - originalEnd.y;
          const endLen = Math.sqrt(endDx * endDx + endDy * endDy) || 1;
          const endPt = { 
            x: originalEnd.x + (endDx / endLen) * 20, 
            y: originalEnd.y + (endDy / endLen) * 20 
          };
          
          // Helper to start dragging an endpoint
          const startDrag = (pos: 'source' | 'target', handlePt: { x: number; y: number }) => (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            
            const rect = contentRef.current?.getBoundingClientRect();
            if (!rect) return;
            
            // Calculate the offset between mouse and handle center to prevent jumping
            const mouseX = (e.clientX - rect.left) / panZoomState.zoom - panZoomState.panX / panZoomState.zoom;
            const mouseY = (e.clientY - rect.top) / panZoomState.zoom - panZoomState.panY / panZoomState.zoom;
            const offsetX = handlePt.x - mouseX;
            const offsetY = handlePt.y - mouseY;
            
            // Set initial drag position at the handle position
            setDraggingEndpoint({ edgeId, position: pos, x: handlePt.x, y: handlePt.y });
            
            const handleMouseMove = (moveE: MouseEvent) => {
              const x = (moveE.clientX - rect.left) / panZoomState.zoom - panZoomState.panX / panZoomState.zoom + offsetX;
              const y = (moveE.clientY - rect.top) / panZoomState.zoom - panZoomState.panY / panZoomState.zoom + offsetY;
              setDraggingEndpoint({ edgeId, position: pos, x, y });
            };
            
            const handleMouseUp = (upE: MouseEvent) => {
              const x = (upE.clientX - rect.left) / panZoomState.zoom - panZoomState.panX / panZoomState.zoom + offsetX;
              const y = (upE.clientY - rect.top) / panZoomState.zoom - panZoomState.panY / panZoomState.zoom + offsetY;
              setDraggingEndpoint(null);
              handleEdgeEndpointDragEnd(edgeId, pos, x, y);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          };
          
          // Get display positions (use drag position if dragging)
          const sourceDisplayPt = draggingEndpoint?.edgeId === edgeId && draggingEndpoint?.position === 'source'
            ? draggingEndpoint
            : startPt;
          const targetDisplayPt = draggingEndpoint?.edgeId === edgeId && draggingEndpoint?.position === 'target'
            ? draggingEndpoint
            : endPt;
          
          const isDraggingSource = draggingEndpoint?.edgeId === edgeId && draggingEndpoint?.position === 'source';
          const isDraggingTarget = draggingEndpoint?.edgeId === edgeId && draggingEndpoint?.position === 'target';
          
          // Calculate the fixed end position (the end that's NOT being dragged)
          const fixedEndPt = isDraggingSource ? originalEnd : originalStart;
          const draggedPt = isDraggingSource ? { x: draggingEndpoint!.x, y: draggingEndpoint!.y } 
                          : isDraggingTarget ? { x: draggingEndpoint!.x, y: draggingEndpoint!.y }
                          : null;
          
          return (
            <>
              {/* Dynamic edge path while dragging - shows the arrow following the drag */}
              {(isDraggingSource || isDraggingTarget) && draggedPt && (
                <svg className="absolute top-0 left-0 pointer-events-none z-40" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <marker
                      id="drag-arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                  {/* The edge path from fixed end to dragged position */}
                  <path
                    d={(() => {
                      const from = isDraggingSource ? draggedPt : fixedEndPt;
                      const to = isDraggingTarget ? draggedPt : fixedEndPt;
                      // Create a smooth path with a bend
                      const midX = (from.x + to.x) / 2;
                      return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
                    })()}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="none"
                    markerEnd={isDraggingSource ? undefined : "url(#drag-arrowhead)"}
                    markerStart={isDraggingSource ? "url(#drag-arrowhead)" : undefined}
                  />
                  {/* Circle at the fixed end */}
                  <circle
                    cx={fixedEndPt.x}
                    cy={fixedEndPt.y}
                    r={6}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={2}
                  />
                </svg>
              )}
              
              {/* Source endpoint handle */}
              <div
                className={`absolute w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-xl cursor-move z-50 transition-transform ${isDraggingSource ? 'scale-125 ring-4 ring-blue-400' : 'hover:scale-125'}`}
                style={{
                  left: sourceDisplayPt.x - 16,
                  top: sourceDisplayPt.y - 16,
                }}
                title={`Drag to reconnect from: ${edge.from}`}
                onMouseDown={startDrag('source', startPt)}
              />
              {/* Target endpoint handle */}
              <div
                className={`absolute w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-xl cursor-move z-50 transition-transform ${isDraggingTarget ? 'scale-125 ring-4 ring-blue-400' : 'hover:scale-125'}`}
                style={{
                  left: targetDisplayPt.x - 16,
                  top: targetDisplayPt.y - 16,
                }}
                title={`Drag to reconnect to: ${edge.to}`}
                onMouseDown={startDrag('target', endPt)}
              />
            </>
          );
        })()}
      </div>

      {/* Zoom controls overlay */}
      {panZoomEnabled && editable && (
        <div className="absolute bottom-4 right-4 flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm p-1 z-50">
          <button
            className="px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            −
          </button>
          <span className="px-2 py-1 text-sm min-w-[4rem] text-center">
            {Math.round(panZoomState.zoom * 100)}%
          </span>
          <button
            className="px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            className="px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
            onClick={handleZoomToFit}
            title="Fit to View"
          >
            ⊡
          </button>
          <button
            className="px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
            onClick={resetPanZoom}
            title="Reset View"
          >
            ↺
          </button>
        </div>
      )}
    </div>
  );
});
