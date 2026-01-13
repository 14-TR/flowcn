/**
 * FloatingToolbar component - draggable, collapsible toolbar for graph editing
 */

import React, { useCallback, useState, useEffect } from 'react';
import type { EditorMode } from './Diagram';

export interface FloatingToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onAddNode: () => void;
  onDeleteSelected: () => void;
  onResetLayout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  hasSelection: boolean;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  isConnecting?: boolean;
  onCancelConnection?: () => void;
}

export function FloatingToolbar({
  mode,
  onModeChange,
  onAddNode,
  onDeleteSelected,
  onResetLayout,
  collapsed,
  onToggleCollapse,
  hasSelection,
  position,
  onPositionChange,
  isConnecting = false,
  onCancelConnection,
}: FloatingToolbarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setIsDragging(true);
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      onPositionChange({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);

  return (
    <div
      className="absolute bg-card border rounded-lg shadow-lg z-50 select-none"
      style={{
        left: position.x,
        top: position.y,
        opacity: isDragging ? 0.9 : 1,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle / header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium text-foreground">Tools</span>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label={collapsed ? 'Expand toolbar' : 'Collapse toolbar'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="p-2 space-y-2 min-w-[140px]">
          {/* Connection in progress indicator */}
          {isConnecting && (
            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1.5 flex items-center justify-between">
              <span>Click target...</span>
              <button
                onClick={onCancelConnection}
                className="text-blue-600 hover:text-blue-800 ml-2"
                title="Cancel (Esc)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Mode selection */}
          <div className="flex gap-1">
            <button
              onClick={() => onModeChange('select')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors ${
                mode === 'select'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              title="Select mode"
            >
              {/* Mouse pointer icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                <path d="M13 13l6 6" />
              </svg>
              <span>Select</span>
            </button>
            <button
              onClick={() => onModeChange('connect')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors ${
                mode === 'connect'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              title="Connect mode - click two nodes to create an edge"
            >
              {/* Link icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Connect</span>
            </button>
          </div>

          <div className="border-t pt-2 space-y-1">
            {/* Add node */}
            <button
              onClick={onAddNode}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              {/* Plus icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Node</span>
            </button>

            {/* Delete selected */}
            <button
              onClick={onDeleteSelected}
              disabled={!hasSelection}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                hasSelection
                  ? 'bg-muted hover:bg-destructive/10 text-destructive'
                  : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
              }`}
              title={hasSelection ? 'Delete selected (Del)' : 'Select a node or edge first'}
            >
              {/* Trash icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete</span>
            </button>
          </div>

          <div className="border-t pt-2">
            {/* Reset layout */}
            <button
              onClick={onResetLayout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm bg-muted hover:bg-muted/80 text-foreground transition-colors"
              title="Reset all nodes to automatic layout positions"
            >
              {/* Refresh icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              <span>Reset Layout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
