/**
 * Hook for dragging nodes
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseDragNodeOptions {
  /** Initial position of the node */
  initialPosition: { x: number; y: number };
  /** Callback when drag starts */
  onDragStart?: () => void;
  /** Callback during drag with new position */
  onDrag?: (x: number, y: number) => void;
  /** Callback when drag ends with final position */
  onDragEnd?: (x: number, y: number) => void;
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Container element for bounds (optional) */
  containerRef?: React.RefObject<HTMLElement>;
}

export interface UseDragNodeResult {
  /** Whether the node is currently being dragged */
  isDragging: boolean;
  /** Current position during drag (or initial position if not dragging) */
  position: { x: number; y: number };
  /** Props to spread on the draggable element */
  dragHandleProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
  };
}

export function useDragNode({
  initialPosition,
  onDragStart,
  onDrag,
  onDragEnd,
  disabled = false,
  containerRef,
}: UseDragNodeOptions): UseDragNodeResult {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const offsetRef = useRef({ x: 0, y: 0 });
  const containerOffsetRef = useRef({ x: 0, y: 0 });
  const prevInitialPositionRef = useRef(initialPosition);

  // Update position when initialPosition changes (e.g., layout recalculation)
  // Using useEffect to properly handle state updates
  useEffect(() => {
    if (
      !isDragging &&
      (prevInitialPositionRef.current.x !== initialPosition.x ||
        prevInitialPositionRef.current.y !== initialPosition.y)
    ) {
      prevInitialPositionRef.current = initialPosition;
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y, isDragging]);

  const getContainerOffset = useCallback(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    }
    return { x: 0, y: 0 };
  }, [containerRef]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      if (e.button !== 0) return; // Only left mouse button

      e.preventDefault();
      e.stopPropagation();

      const containerOffset = getContainerOffset();
      containerOffsetRef.current = containerOffset;

      // Calculate offset from mouse to element position
      offsetRef.current = {
        x: e.clientX - containerOffset.x - position.x,
        y: e.clientY - containerOffset.y - position.y,
      };

      setIsDragging(true);
      onDragStart?.();
    },
    [disabled, position, onDragStart, getContainerOffset]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      if (e.touches.length !== 1) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      const containerOffset = getContainerOffset();
      containerOffsetRef.current = containerOffset;

      offsetRef.current = {
        x: touch.clientX - containerOffset.x - position.x,
        y: touch.clientY - containerOffset.y - position.y,
      };

      setIsDragging(true);
      onDragStart?.();
    },
    [disabled, position, onDragStart, getContainerOffset]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - containerOffsetRef.current.x - offsetRef.current.x;
      const newY = e.clientY - containerOffsetRef.current.y - offsetRef.current.y;

      // Clamp to positive values
      const clampedX = Math.max(0, newX);
      const clampedY = Math.max(0, newY);

      setPosition({ x: clampedX, y: clampedY });
      onDrag?.(clampedX, clampedY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      const newX = touch.clientX - containerOffsetRef.current.x - offsetRef.current.x;
      const newY = touch.clientY - containerOffsetRef.current.y - offsetRef.current.y;

      const clampedX = Math.max(0, newX);
      const clampedY = Math.max(0, newY);

      setPosition({ x: clampedX, y: clampedY });
      onDrag?.(clampedX, clampedY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const newX = e.clientX - containerOffsetRef.current.x - offsetRef.current.x;
      const newY = e.clientY - containerOffsetRef.current.y - offsetRef.current.y;

      const clampedX = Math.max(0, newX);
      const clampedY = Math.max(0, newY);

      setIsDragging(false);
      setPosition({ x: clampedX, y: clampedY });
      onDragEnd?.(clampedX, clampedY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Use last known position
      setIsDragging(false);
      onDragEnd?.(position.x, position.y);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, position, onDrag, onDragEnd]);

  return {
    isDragging,
    position,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      style: {
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      },
    },
  };
}
