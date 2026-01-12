/**
 * Graph normalization functions
 */

import type { GraphDoc, NormalizedGraph, Edge } from './types';

/**
 * Creates a deterministic hash for an edge based on its endpoints
 */
function createEdgeId(edge: Edge, index: number): string {
  if (edge.id) {
    return edge.id;
  }
  // Create stable ID from source, target, and index
  return `${edge.from}->${edge.to}#${index}`;
}

/**
 * Normalizes a graph document by:
 * - Assigning stable IDs to edges without IDs
 * - Sorting nodes and edges by ID for determinism
 */
export function normalizeGraph(doc: GraphDoc): NormalizedGraph {
  // Sort nodes by ID for determinism
  const sortedNodes = [...doc.nodes].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  // Assign IDs to edges and sort
  const edgesWithIds = doc.edges.map((edge, index) => ({
    ...edge,
    id: createEdgeId(edge, index),
  }));

  const sortedEdges = edgesWithIds.sort((a, b) =>
    a.id!.localeCompare(b.id!)
  );

  // Sort groups by ID if present
  const sortedGroups = doc.groups
    ? [...doc.groups].sort((a, b) => a.id.localeCompare(b.id))
    : undefined;

  return {
    ...doc,
    nodes: sortedNodes,
    edges: sortedEdges as (Required<Pick<Edge, 'id'>> & Edge)[],
    groups: sortedGroups,
  };
}
