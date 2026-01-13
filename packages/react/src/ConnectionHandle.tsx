/**
 * ConnectionHandle - Visual handles on nodes for creating connections
 */

import React from 'react';

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export interface ConnectionHandleProps {
  /** Position of the handle on the node */
  position: HandlePosition;
  /** Node width */
  nodeWidth: number;
  /** Node height */
  nodeHeight: number;
  /** Whether this handle is active (being dragged from) */
  active?: boolean;
  /** Whether this handle can be connected to */
  canConnect?: boolean;
  /** Callback when handle is clicked */
  onClick?: (position: HandlePosition) => void;
  /** Callback when mouse enters handle */
  onMouseEnter?: (position: HandlePosition) => void;
  /** Callback when mouse leaves handle */
  onMouseLeave?: (position: HandlePosition) => void;
}

/**
 * Get the x,y position for a handle based on its position and node dimensions
 */
function getHandlePosition(
  position: HandlePosition,
  nodeWidth: number,
  nodeHeight: number
): { x: number; y: number } {
  switch (position) {
    case 'top':
      return { x: nodeWidth / 2, y: 0 };
    case 'right':
      return { x: nodeWidth, y: nodeHeight / 2 };
    case 'bottom':
      return { x: nodeWidth / 2, y: nodeHeight };
    case 'left':
      return { x: 0, y: nodeHeight / 2 };
  }
}

export function ConnectionHandle({
  position,
  nodeWidth,
  nodeHeight,
  active = false,
  canConnect = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ConnectionHandleProps) {
  const { x, y } = getHandlePosition(position, nodeWidth, nodeHeight);
  const size = 10;

  return (
    <div
      className={`
        absolute w-2.5 h-2.5 rounded-full border-2 transition-all z-20
        ${active 
          ? 'bg-blue-500 border-white scale-125 shadow-md' 
          : canConnect
            ? 'bg-blue-400 border-white scale-110'
            : 'bg-white border-slate-300 hover:bg-blue-100 hover:border-blue-400 hover:scale-125'
        }
      `}
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        cursor: 'crosshair',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(position);
      }}
      onMouseEnter={() => onMouseEnter?.(position)}
      onMouseLeave={() => onMouseLeave?.(position)}
      data-handle={position}
    />
  );
}

export interface ConnectionHandlesProps {
  /** Node width */
  nodeWidth: number;
  /** Node height */
  nodeHeight: number;
  /** Whether handles are visible */
  visible?: boolean;
  /** Active handle position */
  activeHandle?: HandlePosition | null;
  /** Callback when a handle is clicked */
  onHandleClick?: (position: HandlePosition) => void;
  /** Callback when mouse enters a handle */
  onHandleMouseEnter?: (position: HandlePosition) => void;
  /** Callback when mouse leaves a handle */
  onHandleMouseLeave?: (position: HandlePosition) => void;
}

/**
 * Renders all four connection handles on a node
 */
export function ConnectionHandles({
  nodeWidth,
  nodeHeight,
  visible = true,
  activeHandle = null,
  onHandleClick,
  onHandleMouseEnter,
  onHandleMouseLeave,
}: ConnectionHandlesProps) {
  if (!visible) return null;

  const positions: HandlePosition[] = ['top', 'right', 'bottom', 'left'];

  return (
    <>
      {positions.map((position) => (
        <ConnectionHandle
          key={position}
          position={position}
          nodeWidth={nodeWidth}
          nodeHeight={nodeHeight}
          active={activeHandle === position}
          onClick={onHandleClick}
          onMouseEnter={onHandleMouseEnter}
          onMouseLeave={onHandleMouseLeave}
        />
      ))}
    </>
  );
}
