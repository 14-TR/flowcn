/**
 * Graph validation functions
 */

import type { GraphDoc, Diagnostic } from './types';

/**
 * Validates a graph document and returns diagnostics
 */
export function validateGraph(doc: GraphDoc): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Check for duplicate node IDs
  const nodeIds = new Set<string>();
  for (const node of doc.nodes) {
    if (!node.id) {
      diagnostics.push({
        level: 'error',
        message: 'Node missing required id field',
        nodeId: node.id,
      });
    } else if (nodeIds.has(node.id)) {
      diagnostics.push({
        level: 'error',
        message: `Duplicate node ID: ${node.id}`,
        nodeId: node.id,
      });
    } else {
      nodeIds.add(node.id);
    }
  }

  // Check for edges referencing non-existent nodes
  for (const edge of doc.edges) {
    if (!edge.from) {
      diagnostics.push({
        level: 'error',
        message: 'Edge missing required from field',
        edgeId: edge.id,
      });
    } else if (!nodeIds.has(edge.from)) {
      diagnostics.push({
        level: 'error',
        message: `Edge references non-existent source node: ${edge.from}`,
        edgeId: edge.id,
      });
    }

    if (!edge.to) {
      diagnostics.push({
        level: 'error',
        message: 'Edge missing required to field',
        edgeId: edge.id,
      });
    } else if (!nodeIds.has(edge.to)) {
      diagnostics.push({
        level: 'error',
        message: `Edge references non-existent target node: ${edge.to}`,
        edgeId: edge.id,
      });
    }
  }

  // Check for duplicate edge IDs
  const edgeIds = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.id) {
      if (edgeIds.has(edge.id)) {
        diagnostics.push({
          level: 'error',
          message: `Duplicate edge ID: ${edge.id}`,
          edgeId: edge.id,
        });
      } else {
        edgeIds.add(edge.id);
      }
    }
  }

  // Check for nodes referencing non-existent groups
  if (doc.groups && doc.groups.length > 0) {
    const groupIds = new Set(doc.groups.map(g => g.id));
    for (const node of doc.nodes) {
      if (node.group && !groupIds.has(node.group)) {
        diagnostics.push({
          level: 'warning',
          message: `Node references non-existent group: ${node.group}`,
          nodeId: node.id,
        });
      }
    }
  }

  return diagnostics;
}

/**
 * Checks if a graph document has validation errors
 */
export function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some(d => d.level === 'error');
}
