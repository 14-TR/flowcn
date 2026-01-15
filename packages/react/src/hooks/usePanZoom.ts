/**
 * Hook for pan and zoom functionality
 */

import { useState, useCallback, useEffect, useRef, RefObject } from 'react';

export interface PanZoomState {
  /** Current pan offset X */
  panX: number;
  /** Current pan offset Y */
  panY: number;
  /** Current zoom level (1 = 100%) */
  zoom: number;
}

export interface UsePanZoomOptions {
  /** Initial pan/zoom state */
  initial?: Partial<PanZoomState>;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Zoom step per wheel scroll */
  zoomStep?: number;
  /** Whether pan/zoom is disabled */
  disabled?: boolean;
  /** Callback when state changes */
  onChange?: (state: PanZoomState) => void;
  /** Container ref for non-passive wheel events */
  containerRef?: RefObject<HTMLElement>;
}

export interface UsePanZoomResult {
  /** Current state */
  state: PanZoomState;
  /** Whether currently panning */
  isPanning: boolean;
  /** Transform CSS string */
  transform: string;
  /** Container props to spread */
  containerProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
  };
  /** Reset to initial state */
  reset: () => void;
  /** Zoom to fit content */
  zoomToFit: (contentWidth: number, contentHeight: number, containerWidth: number, containerHeight: number) => void;
  /** Set zoom level */
  setZoom: (zoom: number) => void;
  /** Pan to position */
  panTo: (x: number, y: number) => void;
}

const DEFAULT_STATE: PanZoomState = {
  panX: 0,
  panY: 0,
  zoom: 1,
};

export function usePanZoom({
  initial,
  minZoom = 0.25,
  maxZoom = 3,
  zoomStep = 0.1,
  disabled = false,
  onChange,
  containerRef,
}: UsePanZoomOptions = {}): UsePanZoomResult {
  const initialState = { ...DEFAULT_STATE, ...initial };
  const [state, setState] = useState<PanZoomState>(initialState);
  const [isPanning, setIsPanning] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startPanRef = useRef({ x: 0, y: 0 });
  // Use refs to avoid stale closures in the wheel event listener
  const stateRef = useRef(state);
  stateRef.current = state;

  const updateState = useCallback((newState: PanZoomState) => {
    setState(newState);
    onChange?.(newState);
  }, [onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    // Start pan on:
    // - Left mouse button (button 0) - works on empty canvas since nodes stopPropagation
    // - Middle mouse button (button 1)
    // - Ctrl/Cmd + left click
    if (e.button === 0 || e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      setIsPanning(true);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startPanRef.current = { x: state.panX, y: state.panY };
    }
  }, [disabled, state.panX, state.panY]);

  // Use native wheel event listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef?.current;
    if (!container || disabled) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentState = stateRef.current;
      
      // Calculate new zoom
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, currentState.zoom + delta));

      if (newZoom === currentState.zoom) return;

      // Zoom towards mouse position
      const zoomRatio = newZoom / currentState.zoom;
      const newPanX = mouseX - (mouseX - currentState.panX) * zoomRatio;
      const newPanY = mouseY - (mouseY - currentState.panY) * zoomRatio;

      updateState({
        zoom: newZoom,
        panX: newPanX,
        panY: newPanY,
      });
    };

    // Attach with { passive: false } to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, disabled, minZoom, maxZoom, zoomStep, updateState]);

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;

      updateState({
        ...state,
        panX: startPanRef.current.x + dx,
        panY: startPanRef.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, state, updateState]);

  const reset = useCallback(() => {
    updateState(initialState);
  }, [initialState, updateState]);

  const zoomToFit = useCallback((
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number
  ) => {
    const padding = 40;
    const availableWidth = containerWidth - padding * 2;
    const availableHeight = containerHeight - padding * 2;

    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(scaleX, scaleY)));

    const scaledWidth = contentWidth * newZoom;
    const scaledHeight = contentHeight * newZoom;
    const newPanX = (containerWidth - scaledWidth) / 2;
    const newPanY = (containerHeight - scaledHeight) / 2;

    updateState({
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY,
    });
  }, [minZoom, maxZoom, updateState]);

  const setZoom = useCallback((zoom: number) => {
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    updateState({ ...state, zoom: newZoom });
  }, [state, minZoom, maxZoom, updateState]);

  const panTo = useCallback((x: number, y: number) => {
    updateState({ ...state, panX: x, panY: y });
  }, [state, updateState]);

  const transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;

  return {
    state,
    isPanning,
    transform,
    containerProps: {
      onMouseDown: handleMouseDown,
      style: {
        cursor: isPanning ? 'grabbing' : disabled ? 'default' : 'grab',
        overflow: 'hidden',
      },
    },
    reset,
    zoomToFit,
    setZoom,
    panTo,
  };
}
