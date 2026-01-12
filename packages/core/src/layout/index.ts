/**
 * Main layout entry point
 */

import type { GraphDoc, LayoutOptions, LayoutResult } from '../types';
import { normalizeGraph } from '../normalize';
import { canUseLayeredLayout, computeLayeredLayout } from './layered';
import { computeGridLayout } from './grid';

/**
 * Computes layout for a graph document
 * Automatically selects layered layout for DAGs, falls back to grid for cyclic graphs
 */
export function layoutGraph(
  doc: GraphDoc,
  options?: Partial<LayoutOptions>
): LayoutResult {
  // Normalize the graph first
  const normalized = normalizeGraph(doc);

  // Merge with default options
  const layoutOptions: LayoutOptions = {
    kind: options?.kind || 'layered',
    direction: options?.direction || 'LR',
    spacingX: options?.spacingX,
    spacingY: options?.spacingY,
    padding: options?.padding,
    defaultNodeWidth: options?.defaultNodeWidth,
    defaultNodeHeight: options?.defaultNodeHeight,
    ...doc.layout, // Respect document-level layout options
    ...options, // Command-line options override document options
  };

  // Choose layout algorithm
  if (layoutOptions.kind === 'grid') {
    return computeGridLayout(normalized, layoutOptions);
  }

  // For layered layout, check if graph is a DAG
  if (canUseLayeredLayout(normalized)) {
    return computeLayeredLayout(normalized, layoutOptions);
  }

  // Fallback to grid for cyclic graphs
  return computeGridLayout(normalized, layoutOptions);
}
