/**
 * Tests for graph normalization
 */

import { describe, it, expect } from 'vitest';
import { normalizeGraph } from './normalize';
import type { GraphDoc } from './types';

describe('normalizeGraph', () => {
  it('should assign IDs to edges without IDs', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    };

    const normalized = normalizeGraph(doc);
    expect(normalized.edges[0].id).toBeDefined();
    expect(typeof normalized.edges[0].id).toBe('string');
  });

  it('should preserve existing edge IDs', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ],
      edges: [{ id: 'custom-id', from: 'a', to: 'b' }],
    };

    const normalized = normalizeGraph(doc);
    expect(normalized.edges[0].id).toBe('custom-id');
  });

  it('should sort nodes by ID deterministically', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'z', label: 'Node Z' },
        { id: 'a', label: 'Node A' },
        { id: 'm', label: 'Node M' },
      ],
      edges: [],
    };

    const normalized = normalizeGraph(doc);
    expect(normalized.nodes.map(n => n.id)).toEqual(['a', 'm', 'z']);
  });

  it('should sort edges by ID deterministically', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
        { id: 'c', label: 'Node C' },
      ],
      edges: [
        { id: 'e3', from: 'c', to: 'b' },
        { id: 'e1', from: 'a', to: 'b' },
        { id: 'e2', from: 'b', to: 'c' },
      ],
    };

    const normalized = normalizeGraph(doc);
    expect(normalized.edges.map(e => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('should produce deterministic results on repeated calls', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'c', label: 'Node C' },
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ],
      edges: [
        { from: 'c', to: 'a' },
        { from: 'a', to: 'b' },
      ],
    };

    const result1 = normalizeGraph(doc);
    const result2 = normalizeGraph(doc);

    expect(result1.nodes).toEqual(result2.nodes);
    expect(result1.edges).toEqual(result2.edges);
  });
});
