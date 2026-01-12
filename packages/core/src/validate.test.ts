/**
 * Tests for graph validation
 */

import { describe, it, expect } from 'vitest';
import { validateGraph, hasErrors } from './validate';
import type { GraphDoc } from './types';

describe('validateGraph', () => {
  it('should pass validation for a valid graph', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ],
      edges: [{ from: 'a', to: 'b' }],
    };

    const diagnostics = validateGraph(doc);
    expect(diagnostics).toHaveLength(0);
    expect(hasErrors(diagnostics)).toBe(false);
  });

  it('should detect duplicate node IDs', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'a', label: 'Node A Duplicate' },
      ],
      edges: [],
    };

    const diagnostics = validateGraph(doc);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(hasErrors(diagnostics)).toBe(true);
    expect(diagnostics[0].message).toContain('Duplicate node ID');
  });

  it('should detect edges referencing non-existent nodes', () => {
    const doc: GraphDoc = {
      nodes: [{ id: 'a', label: 'Node A' }],
      edges: [{ from: 'a', to: 'nonexistent' }],
    };

    const diagnostics = validateGraph(doc);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(hasErrors(diagnostics)).toBe(true);
    expect(diagnostics[0].message).toContain('non-existent target node');
  });

  it('should detect duplicate edge IDs', () => {
    const doc: GraphDoc = {
      nodes: [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ],
      edges: [
        { id: 'e1', from: 'a', to: 'b' },
        { id: 'e1', from: 'a', to: 'b' },
      ],
    };

    const diagnostics = validateGraph(doc);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(hasErrors(diagnostics)).toBe(true);
    expect(diagnostics.some(d => d.message.includes('Duplicate edge ID'))).toBe(true);
  });

  it('should warn about nodes referencing non-existent groups', () => {
    const doc: GraphDoc = {
      nodes: [{ id: 'a', label: 'Node A', group: 'nonexistent' }],
      edges: [],
      groups: [{ id: 'g1', label: 'Group 1' }],
    };

    const diagnostics = validateGraph(doc);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].level).toBe('warning');
    expect(diagnostics[0].message).toContain('non-existent group');
  });
});
