/**
 * EdgeSvg component - renders an edge as SVG path with arrowhead
 */

import React from 'react';
import type { Edge, EdgeRoute } from '@flowcn/core';

export interface EdgeSvgProps {
  edge: Edge;
  route: EdgeRoute;
  highlighted: boolean;
  showLabel: boolean;
}

export function EdgeSvg({
  edge,
  route,
  highlighted,
  showLabel,
}: EdgeSvgProps) {
  // Build path from points
  const pathData = route.points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  // Determine stroke style based on edge kind
  const strokeDasharray = edge.kind === 'dashed' ? '5,5' : undefined;
  const strokeWidth = highlighted ? 2.5 : 1.5;
  const strokeColor = highlighted
    ? 'rgb(59 130 246)' // blue-500
    : 'rgb(148 163 184)'; // slate-400

  // Calculate arrowhead position and angle
  const lastPoint = route.points[route.points.length - 1];
  const secondLastPoint = route.points[route.points.length - 2];

  const angle =
    Math.atan2(
      lastPoint.y - secondLastPoint.y,
      lastPoint.x - secondLastPoint.x
    ) *
    (180 / Math.PI);

  return (
    <g>
      {/* Edge path */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd="url(#arrowhead)"
      />

      {/* Arrowhead marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={strokeColor}
          />
        </marker>
      </defs>

      {/* Edge label */}
      {showLabel && edge.label && route.labelPoint && (
        <g>
          <rect
            x={route.labelPoint.x - 30}
            y={route.labelPoint.y - 10}
            width={60}
            height={20}
            fill="white"
            stroke="rgb(203 213 225)" // slate-300
            strokeWidth={1}
            rx={4}
          />
          <text
            x={route.labelPoint.x}
            y={route.labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="rgb(51 65 85)" // slate-700
            className="select-none"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}
