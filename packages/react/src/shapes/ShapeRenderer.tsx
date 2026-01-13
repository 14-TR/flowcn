/**
 * ShapeRenderer - Renders different node shapes as SVG
 */

import React from 'react';
import type { ShapeType } from '@flowcn/core';

export interface ShapeRendererProps {
  /** Shape type to render */
  shape: ShapeType;
  /** Width of the shape */
  width: number;
  /** Height of the shape */
  height: number;
  /** Whether the shape is selected */
  selected?: boolean;
  /** Whether the shape is hovered */
  hovered?: boolean;
  /** Fill color */
  fillColor?: string;
  /** Border color */
  borderColor?: string;
  /** Additional className */
  className?: string;
}

/**
 * Renders a node shape as an SVG element
 */
export function ShapeRenderer({
  shape,
  width,
  height,
  selected = false,
  hovered = false,
  fillColor = 'var(--card)',
  borderColor = 'var(--border)',
  className = '',
}: ShapeRendererProps) {
  const strokeWidth = selected ? 2.5 : hovered ? 2 : 1.5;
  const strokeColor = selected ? 'hsl(var(--ring))' : borderColor;

  // Common SVG props
  const svgProps = {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    className: `shape-renderer ${className}`,
    style: { position: 'absolute' as const, top: 0, left: 0, pointerEvents: 'none' as const },
  };

  // Common path/shape style props
  const shapeStyle = {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth,
  };

  // Padding for stroke
  const p = strokeWidth;
  const w = width - p * 2;
  const h = height - p * 2;

  switch (shape) {
    case 'rectangle':
      return (
        <svg {...svgProps}>
          <rect
            x={p}
            y={p}
            width={w}
            height={h}
            rx={4}
            ry={4}
            {...shapeStyle}
          />
        </svg>
      );

    case 'rounded':
      return (
        <svg {...svgProps}>
          <rect
            x={p}
            y={p}
            width={w}
            height={h}
            rx={12}
            ry={12}
            {...shapeStyle}
          />
        </svg>
      );

    case 'pill':
      return (
        <svg {...svgProps}>
          <rect
            x={p}
            y={p}
            width={w}
            height={h}
            rx={h / 2}
            ry={h / 2}
            {...shapeStyle}
          />
        </svg>
      );

    case 'diamond':
      const dCx = width / 2;
      const dCy = height / 2;
      const dPath = `
        M ${dCx} ${p}
        L ${width - p} ${dCy}
        L ${dCx} ${height - p}
        L ${p} ${dCy}
        Z
      `;
      return (
        <svg {...svgProps}>
          <path d={dPath} {...shapeStyle} />
        </svg>
      );

    case 'oval':
      return (
        <svg {...svgProps}>
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={w / 2}
            ry={h / 2}
            {...shapeStyle}
          />
        </svg>
      );

    case 'parallelogram':
      const pSkew = w * 0.15;
      const pPath = `
        M ${p + pSkew} ${p}
        L ${width - p} ${p}
        L ${width - p - pSkew} ${height - p}
        L ${p} ${height - p}
        Z
      `;
      return (
        <svg {...svgProps}>
          <path d={pPath} {...shapeStyle} />
        </svg>
      );

    case 'hexagon':
      const hInset = w * 0.2;
      const hPath = `
        M ${p + hInset} ${p}
        L ${width - p - hInset} ${p}
        L ${width - p} ${height / 2}
        L ${width - p - hInset} ${height - p}
        L ${p + hInset} ${height - p}
        L ${p} ${height / 2}
        Z
      `;
      return (
        <svg {...svgProps}>
          <path d={hPath} {...shapeStyle} />
        </svg>
      );

    case 'cylinder':
      const cEllipseH = h * 0.15;
      return (
        <svg {...svgProps}>
          {/* Bottom ellipse (partial, back) */}
          <ellipse
            cx={width / 2}
            cy={height - p - cEllipseH}
            rx={w / 2}
            ry={cEllipseH}
            {...shapeStyle}
          />
          {/* Main body rectangle */}
          <rect
            x={p}
            y={p + cEllipseH}
            width={w}
            height={h - cEllipseH * 2}
            fill={fillColor}
            stroke="none"
          />
          {/* Side lines */}
          <line
            x1={p}
            y1={p + cEllipseH}
            x2={p}
            y2={height - p - cEllipseH}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <line
            x1={width - p}
            y1={p + cEllipseH}
            x2={width - p}
            y2={height - p - cEllipseH}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Top ellipse */}
          <ellipse
            cx={width / 2}
            cy={p + cEllipseH}
            rx={w / 2}
            ry={cEllipseH}
            {...shapeStyle}
          />
        </svg>
      );

    case 'cloud':
      // Simplified cloud shape using circles
      const cloudPath = `
        M ${p + w * 0.25} ${height - p}
        Q ${p} ${height - p} ${p} ${height * 0.65}
        Q ${p} ${height * 0.35} ${p + w * 0.2} ${height * 0.35}
        Q ${p + w * 0.15} ${p} ${width / 2} ${p + h * 0.1}
        Q ${width - p - w * 0.15} ${p} ${width - p - w * 0.2} ${height * 0.35}
        Q ${width - p} ${height * 0.35} ${width - p} ${height * 0.65}
        Q ${width - p} ${height - p} ${width - p - w * 0.25} ${height - p}
        Z
      `;
      return (
        <svg {...svgProps}>
          <path d={cloudPath} {...shapeStyle} />
        </svg>
      );

    case 'triangle':
      const tPath = `
        M ${width / 2} ${p}
        L ${width - p} ${height - p}
        L ${p} ${height - p}
        Z
      `;
      return (
        <svg {...svgProps}>
          <path d={tPath} {...shapeStyle} />
        </svg>
      );

    case 'star':
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.4;
      const cx = width / 2;
      const cy = height / 2;
      const points = 5;
      let starPath = '';
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        starPath += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
      }
      starPath += 'Z';
      return (
        <svg {...svgProps}>
          <path d={starPath} {...shapeStyle} />
        </svg>
      );

    default:
      // Default to rounded rectangle
      return (
        <svg {...svgProps}>
          <rect
            x={p}
            y={p}
            width={w}
            height={h}
            rx={8}
            ry={8}
            {...shapeStyle}
          />
        </svg>
      );
  }
}
