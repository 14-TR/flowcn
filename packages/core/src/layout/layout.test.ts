/**
 * Tests for layout determinism
 */

import { describe, it, expect } from 'vitest';
import { layoutGraph } from './index';
import type { GraphDoc } from '../types';

describe('layoutGraph determinism', () => {
  const simpleGraph: GraphDoc = {
    nodes: [
      { id: 'a', label: 'Node A' },
      { id: 'b', label: 'Node B' },
      { id: 'c', label: 'Node C' },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ],
  };

  it('should produce identical layouts for the same input (layered)', () => {
    const result1 = layoutGraph(simpleGraph, { kind: 'layered', direction: 'LR' });
    const result2 = layoutGraph(simpleGraph, { kind: 'layered', direction: 'LR' });

    expect(result1.nodePositions).toEqual(result2.nodePositions);
    expect(result1.edgeRoutes).toEqual(result2.edgeRoutes);
    expect(result1.width).toBe(result2.width);
    expect(result1.height).toBe(result2.height);
  });

  it('should produce identical layouts for the same input (grid)', () => {
    const result1 = layoutGraph(simpleGraph, { kind: 'grid', direction: 'LR' });
    const result2 = layoutGraph(simpleGraph, { kind: 'grid', direction: 'LR' });

    expect(result1.nodePositions).toEqual(result2.nodePositions);
    expect(result1.edgeRoutes).toEqual(result2.edgeRoutes);
    expect(result1.width).toBe(result2.width);
    expect(result1.height).toBe(result2.height);
  });

  it('should handle cyclic graphs by falling back to grid', () => {
    const cyclicGraph: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
        { id: 'c', label: 'Node C' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'a' }, // Creates cycle
      ],
    };

    const result1 = layoutGraph(cyclicGraph, { kind: 'layered', direction: 'LR' });
    const result2 = layoutGraph(cyclicGraph, { kind: 'layered', direction: 'LR' });

    // Should fallback to grid and be deterministic
    expect(result1.nodePositions).toEqual(result2.nodePositions);
  });

  it('should produce different layouts for different directions', () => {
    const resultLR = layoutGraph(simpleGraph, { kind: 'layered', direction: 'LR' });
    const resultTB = layoutGraph(simpleGraph, { kind: 'layered', direction: 'TB' });

    // Layouts should be different
    expect(resultLR.nodePositions).not.toEqual(resultTB.nodePositions);

    // But both should have all nodes
    expect(Object.keys(resultLR.nodePositions)).toHaveLength(3);
    expect(Object.keys(resultTB.nodePositions)).toHaveLength(3);
  });

  it('should generate edge routes for all edges', () => {
    const result = layoutGraph(simpleGraph, { kind: 'layered', direction: 'LR' });

    // Should have routes for both edges
    const routeIds = Object.keys(result.edgeRoutes);
    expect(routeIds.length).toBeGreaterThanOrEqual(2);

    // Each route should have points
    for (const routeId of routeIds) {
      const route = result.edgeRoutes[routeId];
      expect(route.points.length).toBeGreaterThan(1);
      expect(route.points[0]).toHaveProperty('x');
      expect(route.points[0]).toHaveProperty('y');
    }
  });

  it('should handle empty graphs', () => {
    const emptyGraph: GraphDoc = {
      nodes: [],
      edges: [],
    };

    const result = layoutGraph(emptyGraph, { kind: 'layered', direction: 'LR' });
    expect(Object.keys(result.nodePositions)).toHaveLength(0);
    expect(Object.keys(result.edgeRoutes)).toHaveLength(0);
  });

  it('should handle single node graphs', () => {
    const singleNodeGraph: GraphDoc = {
      nodes: [{ id: 'a', label: 'Node A' }],
      edges: [],
    };

    const result = layoutGraph(singleNodeGraph, { kind: 'layered', direction: 'LR' });
    expect(Object.keys(result.nodePositions)).toHaveLength(1);
    expect(result.nodePositions['a']).toBeDefined();
  });
});
