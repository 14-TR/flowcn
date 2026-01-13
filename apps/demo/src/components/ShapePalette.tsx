'use client';

import React, { useCallback } from 'react';
import type { ShapeType } from '@flowcn/core';

interface ShapeOption {
  type: ShapeType;
  label: string;
  icon: React.ReactNode;
}

const SHAPE_OPTIONS: ShapeOption[] = [
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="4" width="28" height="16" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'rounded',
    label: 'Rounded',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="4" width="28" height="16" rx="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'pill',
    label: 'Pill',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <rect x="2" y="4" width="28" height="16" rx="8" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'diamond',
    label: 'Diamond',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <path d="M16 2 L30 12 L16 22 L2 12 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'oval',
    label: 'Oval',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <ellipse cx="16" cy="12" rx="14" ry="9" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'parallelogram',
    label: 'Parallelogram',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <path d="M6 4 L30 4 L26 20 L2 20 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'hexagon',
    label: 'Hexagon',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <path d="M8 4 L24 4 L30 12 L24 20 L8 20 L2 12 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'cylinder',
    label: 'Cylinder',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <ellipse cx="16" cy="18" rx="12" ry="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="6" width="24" height="12" fill="currentColor" opacity="0.2" />
        <line x1="4" y1="6" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5" />
        <line x1="28" y1="6" x2="28" y2="18" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="16" cy="6" rx="12" ry="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'cloud',
    label: 'Cloud',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <path d="M8 20 Q2 20 2 14 Q2 8 8 8 Q6 2 16 4 Q26 2 24 8 Q30 8 30 14 Q30 20 24 20 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <path d="M16 2 L30 22 L2 22 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'star',
    label: 'Star',
    icon: (
      <svg viewBox="0 0 32 24" className="w-full h-full">
        <path d="M16 2 L18.5 9 L26 9 L20 14 L22.5 22 L16 17 L9.5 22 L12 14 L6 9 L13.5 9 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

interface ShapePaletteProps {
  onShapeSelect: (shape: ShapeType) => void;
  selectedShape?: ShapeType;
}

export function ShapePalette({ onShapeSelect, selectedShape }: ShapePaletteProps) {
  const handleDragStart = useCallback((e: React.DragEvent, shape: ShapeType) => {
    e.dataTransfer.setData('application/flowcn-shape', shape);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground block">
        Click to select, drag to canvas
      </span>
      <div className="grid grid-cols-3 gap-2">
        {SHAPE_OPTIONS.map((option) => (
          <button
            key={option.type}
            className={`
              p-2 rounded-md border transition-all
              hover:bg-muted hover:border-primary/50
              ${selectedShape === option.type ? 'bg-muted border-primary ring-1 ring-primary' : 'bg-background border-border'}
            `}
            onClick={() => onShapeSelect(option.type)}
            draggable
            onDragStart={(e) => handleDragStart(e, option.type)}
            title={option.label}
          >
            <div className="w-8 h-6 mx-auto text-foreground">
              {option.icon}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block truncate">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
