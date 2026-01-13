/**
 * ConnectionIndicator component - shows a line from source node to cursor during edge creation
 */

import React from 'react';

export interface ConnectionIndicatorProps {
  sourcePosition: { x: number; y: number };
  mousePosition: { x: number; y: number };
}

export function ConnectionIndicator({
  sourcePosition,
  mousePosition,
}: ConnectionIndicatorProps) {
  return (
    <g>
      {/* Dashed line from source to cursor */}
      <line
        x1={sourcePosition.x}
        y1={sourcePosition.y}
        x2={mousePosition.x}
        y2={mousePosition.y}
        stroke="rgb(59 130 246)"
        strokeWidth={2}
        strokeDasharray="6,4"
        strokeLinecap="round"
      />
      {/* Circle at cursor position */}
      <circle
        cx={mousePosition.x}
        cy={mousePosition.y}
        r={6}
        fill="rgb(59 130 246)"
        stroke="white"
        strokeWidth={2}
      />
      {/* Circle at source position */}
      <circle
        cx={sourcePosition.x}
        cy={sourcePosition.y}
        r={4}
        fill="rgb(59 130 246)"
      />
    </g>
  );
}
