/**
 * EdgeSvg component - renders an edge as SVG path with configurable endpoints
 */

import React, { useMemo } from 'react';
import type { Edge, EdgeRoute, EndpointStyle, LineStyle, CurveType } from '@flowcn/core';

export interface EdgeSvgProps {
  edge: Edge;
  route: EdgeRoute;
  highlighted: boolean;
  showLabel: boolean;
}

/**
 * Generate a unique marker ID for an edge
 */
function getMarkerId(edgeId: string | undefined, position: 'start' | 'end', style: EndpointStyle): string {
  return `marker-${edgeId || 'default'}-${position}-${style}`;
}

/**
 * Render an endpoint marker definition
 * 
 * refX determines where the marker attaches to the line endpoint:
 * - For end markers: high refX value places the marker "before" the endpoint (visible)
 * - For start markers: low refX value places the marker "after" the endpoint (visible)
 */
function EndpointMarker({
  id,
  style,
  color,
  position,
}: {
  id: string;
  style: EndpointStyle;
  color: string;
  position: 'start' | 'end';
}) {
  if (style === 'none') return null;

  const isStart = position === 'start';

  switch (style) {
    case 'arrow':
      return (
        <marker
          id={id}
          markerWidth="10"
          markerHeight="10"
          refX={isStart ? 1 : 9}
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d={isStart ? 'M9,0 L9,6 L0,3 z' : 'M0,0 L0,6 L9,3 z'}
            fill={color}
          />
        </marker>
      );
    case 'dot':
      // Circle centered at (4,4) with radius 3
      // For end: refX=7 places the right edge at the endpoint
      // For start: refX=1 places the left edge at the endpoint
      return (
        <marker
          id={id}
          markerWidth="8"
          markerHeight="8"
          refX={isStart ? 1 : 7}
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <circle cx="4" cy="4" r="3" fill={color} />
        </marker>
      );
    case 'diamond':
      // Diamond shape: points at 0,5 | 5,0 | 10,5 | 5,10
      // For end: refX=10 places the right point at the endpoint
      // For start: refX=0 places the left point at the endpoint
      return (
        <marker
          id={id}
          markerWidth="10"
          markerHeight="10"
          refX={isStart ? 0 : 10}
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,5 L5,0 L10,5 L5,10 z" fill={color} />
        </marker>
      );
    case 'square':
      // Square from (1,1) to (7,7) - 6x6 centered in 8x8 viewport
      // For end: refX=7 places the right edge at the endpoint
      // For start: refX=1 places the left edge at the endpoint
      return (
        <marker
          id={id}
          markerWidth="8"
          markerHeight="8"
          refX={isStart ? 1 : 7}
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <rect x="1" y="1" width="6" height="6" fill={color} />
        </marker>
      );
    default:
      return null;
  }
}

/**
 * Generate a bezier curve path from points
 */
function generateBezierPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const start = points[0];
  const end = points[points.length - 1];

  // Calculate control points for a smooth curve
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Use horizontal/vertical control points based on direction
  if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
    // Horizontal-ish: curve with horizontal control points
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  } else {
    // Vertical-ish: curve with vertical control points
    return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  }
}

/**
 * Generate a straight/elbow path from points
 */
function generateStraightPath(points: { x: number; y: number }[]): string {
  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');
}

export function EdgeSvg({
  edge,
  route,
  highlighted,
  showLabel,
}: EdgeSvgProps) {
  // Determine edge styling
  const lineStyle: LineStyle = edge.lineStyle || (edge.kind === 'dashed' ? 'dashed' : 'solid');
  const curveType: CurveType = edge.curveType || 'elbow';
  const sourceEndpoint: EndpointStyle = edge.sourceEndpoint || 'none';
  const targetEndpoint: EndpointStyle = edge.targetEndpoint || 'arrow';

  // Build path based on curve type
  const pathData = useMemo(() => {
    if (curveType === 'bezier') {
      return generateBezierPath(route.points);
    }
    return generateStraightPath(route.points);
  }, [route.points, curveType]);

  // Determine stroke style
  const strokeDasharray = lineStyle === 'dashed' ? '5,5' : lineStyle === 'dotted' ? '2,3' : undefined;
  const strokeWidth = highlighted ? 2.5 : 1.5;
  const strokeColor = edge.color || (highlighted ? 'rgb(59 130 246)' : 'rgb(148 163 184)');

  // Generate marker IDs
  const startMarkerId = getMarkerId(edge.id, 'start', sourceEndpoint);
  const endMarkerId = getMarkerId(edge.id, 'end', targetEndpoint);

  return (
    <g>
      {/* Marker definitions */}
      <defs>
        <EndpointMarker
          id={startMarkerId}
          style={sourceEndpoint}
          color={strokeColor}
          position="start"
        />
        <EndpointMarker
          id={endMarkerId}
          style={targetEndpoint}
          color={strokeColor}
          position="end"
        />
      </defs>

      {/* Edge path */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerStart={sourceEndpoint !== 'none' ? `url(#${startMarkerId})` : undefined}
        markerEnd={targetEndpoint !== 'none' ? `url(#${endMarkerId})` : undefined}
      />

      {/* Edge label */}
      {showLabel && edge.label && route.labelPoint && (
        <g>
          <rect
            x={route.labelPoint.x - 30}
            y={route.labelPoint.y - 10}
            width={60}
            height={20}
            fill="white"
            stroke="rgb(203 213 225)"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={route.labelPoint.x}
            y={route.labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="rgb(51 65 85)"
            className="select-none"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}
