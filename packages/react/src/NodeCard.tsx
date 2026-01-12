/**
 * NodeCard component - renders a node as a card
 */

import React from 'react';
import type { Node, NodePosition } from '@flowcn/core';

export interface NodeCardProps {
  node: Node;
  position: NodePosition;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function NodeCard({
  node,
  position,
  selected,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: NodeCardProps) {
  // Build class names for styling
  const baseClasses =
    'absolute rounded-lg border bg-card text-card-foreground shadow-sm transition-all cursor-pointer';
  const stateClasses = [
    selected && 'ring-2 ring-ring ring-offset-2',
    hovered && 'shadow-md scale-105',
    !selected && !hovered && 'hover:shadow-md',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Node: ${node.label}`}
      aria-pressed={selected}
    >
      <div className="p-4 h-full flex flex-col">
        <h3 className="font-semibold text-sm truncate">{node.label}</h3>
        {node.type && (
          <p className="text-xs text-muted-foreground mt-1">{node.type}</p>
        )}
        {node.data && Object.keys(node.data).length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {Object.entries(node.data).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                {key}: {String(value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
