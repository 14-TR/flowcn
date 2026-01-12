/**
 * Main Diagram component for rendering flowcn graphs
 */

import React, { useMemo, useState, useCallback } from 'react';
import type { GraphDoc, LayoutOptions, Node } from '@flowcn/core';
import { layoutGraph } from '@flowcn/core';
import { NodeCard } from './NodeCard';
import { EdgeSvg } from './EdgeSvg';

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
}

export function Diagram({
  doc,
  options,
  onSelect,
  onHover,
  className = '',
  showEdgeLabels = true,
}: DiagramProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Compute layout
  const layout = useMemo(() => {
    return layoutGraph(doc, options);
  }, [doc, options]);

  // Handle node selection
  const handleNodeClick = useCallback(
    (node: Node) => {
      setSelectedNodeId(node.id);
      onSelect?.(node);
    },
    [onSelect]
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

  // Get incident edges for highlighting
  const getIncidentEdges = useCallback(
    (nodeId: string) => {
      return doc.edges.filter(
        edge => edge.from === nodeId || edge.to === nodeId
      );
    },
    [doc.edges]
  );

  const incidentEdgeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    return new Set(
      getIncidentEdges(hoveredNodeId).map(e => e.id || `${e.from}->${e.to}`)
    );
  }, [hoveredNodeId, getIncidentEdges]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: layout.width,
        height: layout.height,
      }}
    >
      {/* SVG layer for edges */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={layout.width}
        height={layout.height}
      >
        {doc.edges.map(edge => {
          const edgeId = edge.id || `${edge.from}->${edge.to}`;
          const route = layout.edgeRoutes[edgeId];
          if (!route) return null;

          const isHighlighted = incidentEdgeIds.has(edgeId);

          return (
            <EdgeSvg
              key={edgeId}
              edge={edge}
              route={route}
              highlighted={isHighlighted}
              showLabel={showEdgeLabels}
            />
          );
        })}
      </svg>

      {/* Node layer */}
      {doc.nodes.map(node => {
        const position = layout.nodePositions[node.id];
        if (!position) return null;

        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

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
          />
        );
      })}
    </div>
  );
}
