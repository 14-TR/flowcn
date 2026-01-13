/**
 * NodeCard component - renders a node as a card
 */

import React from 'react';
import type { Node, NodePosition, ShapeType } from '@flowcn/core';
import { useDragNode } from './hooks/useDragNode';
import { ShapeRenderer } from './shapes';
import { ConnectionHandles, type HandlePosition } from './ConnectionHandle';

export interface NodeCardProps {
  node: Node;
  position: NodePosition;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  /** Enable drag-and-drop */
  draggable?: boolean;
  /** Callback when drag starts */
  onDragStart?: (nodeId: string) => void;
  /** Callback when node is dragged to new position */
  onDrag?: (nodeId: string, x: number, y: number) => void;
  /** Callback when drag ends */
  onDragEnd?: (nodeId: string, x: number, y: number) => void;
  /** Whether connect mode is active */
  connectMode?: boolean;
  /** Whether this node is the connection source */
  isConnectionSource?: boolean;
  /** Callback for double-click (edit) */
  onDoubleClick?: () => void;
  /** Reference to container for drag bounds */
  containerRef?: React.RefObject<HTMLElement>;
  /** Callback when a connection handle is clicked */
  onHandleClick?: (handle: HandlePosition) => void;
}

export function NodeCard({
  node,
  position,
  selected,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  onDragStart,
  onDrag,
  onDragEnd,
  connectMode = false,
  isConnectionSource = false,
  onDoubleClick,
  containerRef,
  onHandleClick,
}: NodeCardProps) {
  const { isDragging, position: dragPosition, dragHandleProps } = useDragNode({
    initialPosition: { x: position.x, y: position.y },
    disabled: !draggable || connectMode,
    onDragStart: () => onDragStart?.(node.id),
    onDrag: (x, y) => onDrag?.(node.id, x, y),
    onDragEnd: (x, y) => onDragEnd?.(node.id, x, y),
    containerRef,
  });

  // Use drag position if dragging, otherwise use layout position
  const currentX = isDragging ? dragPosition.x : position.x;
  const currentY = isDragging ? dragPosition.y : position.y;

  // Determine if we should use custom shape rendering
  const nodeShape = node.shape || 'rounded';
  const useCustomShape = nodeShape !== 'rounded' && nodeShape !== 'rectangle';

  // Build class names for styling
  const baseClasses = useCustomShape
    ? 'absolute text-card-foreground transition-shadow'
    : 'absolute rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow';
  const stateClasses = [
    selected && !useCustomShape && 'ring-2 ring-ring ring-offset-2',
    hovered && !isDragging && !useCustomShape && 'shadow-md',
    isDragging && 'shadow-xl z-50 opacity-90',
    connectMode && !isConnectionSource && 'hover:ring-2 hover:ring-blue-400 cursor-pointer',
    connectMode && isConnectionSource && 'ring-2 ring-blue-500',
    !connectMode && !isDragging && !useCustomShape && 'hover:shadow-md',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    onDoubleClick?.();
  };

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      style={{
        left: currentX,
        top: currentY,
        width: position.width,
        height: position.height,
        ...(draggable && !connectMode ? dragHandleProps.style : {}),
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={draggable && !connectMode ? dragHandleProps.onMouseDown : undefined}
      onTouchStart={draggable && !connectMode ? dragHandleProps.onTouchStart : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          // Will be handled by parent via keyboard event
        }
      }}
      aria-label={`Node: ${node.label}`}
      aria-pressed={selected}
      data-node={node.id}
    >
      {/* Shape background for custom shapes */}
      {useCustomShape && (
        <ShapeRenderer
          shape={nodeShape as ShapeType}
          width={position.width}
          height={position.height}
          selected={selected}
          hovered={hovered}
          fillColor={node.color || 'hsl(var(--card))'}
          borderColor={node.borderColor || 'hsl(var(--border))'}
        />
      )}

      {/* Content */}
      <div className="p-4 h-full flex flex-col relative z-10 justify-center items-center text-center">
        <h3 className="font-semibold text-sm truncate w-full">{node.label}</h3>
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

      {/* Connection handles - show when hovered or in connect mode */}
      <ConnectionHandles
        nodeWidth={position.width}
        nodeHeight={position.height}
        visible={connectMode || hovered}
        activeHandle={isConnectionSource ? 'right' : null}
        onHandleClick={connectMode ? onHandleClick : undefined}
      />
    </div>
  );
}
