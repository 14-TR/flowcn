/**
 * Grid layout algorithm - deterministic fallback for graphs with cycles
 */

import type {
  NormalizedGraph,
  LayoutOptions,
  LayoutResult,
  NodePosition,
  Point,
} from '../types';

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;
const DEFAULT_SPACING_X = 100;
const DEFAULT_SPACING_Y = 80;
const DEFAULT_PADDING = 40;

/**
 * Computes a simple grid layout for nodes
 */
export function computeGridLayout(
  graph: NormalizedGraph,
  options: LayoutOptions
): LayoutResult {
  const {
    direction = 'LR',
    spacingX = DEFAULT_SPACING_X,
    spacingY = DEFAULT_SPACING_Y,
    padding = DEFAULT_PADDING,
    defaultNodeWidth = DEFAULT_NODE_WIDTH,
    defaultNodeHeight = DEFAULT_NODE_HEIGHT,
  } = options;

  // Sort nodes by ID for determinism (already sorted by normalize, but enforce)
  const sortedNodes = [...graph.nodes].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  // Calculate grid dimensions
  const nodeCount = sortedNodes.length;
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / cols);

  const nodePositions: Record<string, NodePosition> = {};

  // Place nodes in grid
  sortedNodes.forEach((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const width = node.width || defaultNodeWidth;
    const height = node.height || defaultNodeHeight;

    let x: number;
    let y: number;

    if (direction === 'LR') {
      x = padding + col * (defaultNodeWidth + spacingX);
      y = padding + row * (defaultNodeHeight + spacingY);
    } else {
      // TB direction
      x = padding + col * (defaultNodeWidth + spacingX);
      y = padding + row * (defaultNodeHeight + spacingY);
    }

    nodePositions[node.id] = { x, y, width, height };
  });

  // Route edges with simple straight lines
  const edgeRoutes = computeEdgeRoutes(graph, nodePositions, direction);

  // Calculate total dimensions
  const width =
    padding * 2 + cols * defaultNodeWidth + (cols - 1) * spacingX;
  const height =
    padding * 2 + rows * defaultNodeHeight + (rows - 1) * spacingY;

  return {
    nodePositions,
    edgeRoutes,
    width,
    height,
  };
}

/**
 * Computes edge routes for grid layout
 */
function computeEdgeRoutes(
  graph: NormalizedGraph,
  nodePositions: Record<string, NodePosition>,
  direction: 'LR' | 'TB'
): Record<string, { points: Point[]; labelPoint?: Point }> {
  const routes: Record<string, { points: Point[]; labelPoint?: Point }> = {};

  for (const edge of graph.edges) {
    const fromPos = nodePositions[edge.from];
    const toPos = nodePositions[edge.to];

    if (!fromPos || !toPos) {
      continue; // Skip edges with missing nodes
    }

    // Calculate connection points based on direction
    let startPoint: Point;
    let endPoint: Point;

    if (direction === 'LR') {
      // Connect from right of source to left of target
      startPoint = {
        x: fromPos.x + fromPos.width,
        y: fromPos.y + fromPos.height / 2,
      };
      endPoint = {
        x: toPos.x,
        y: toPos.y + toPos.height / 2,
      };
    } else {
      // TB: Connect from bottom of source to top of target
      startPoint = {
        x: fromPos.x + fromPos.width / 2,
        y: fromPos.y + fromPos.height,
      };
      endPoint = {
        x: toPos.x + toPos.width / 2,
        y: toPos.y,
      };
    }

    // Create orthogonal path with one intermediate point
    const midPoint = createMidPoint(startPoint, endPoint, direction);
    const points = [startPoint, midPoint, endPoint];

    // Label position at midpoint
    const labelPoint = midPoint;

    routes[edge.id!] = { points, labelPoint };
  }

  return routes;
}

/**
 * Creates a midpoint for orthogonal routing
 */
function createMidPoint(
  start: Point,
  end: Point,
  direction: 'LR' | 'TB'
): Point {
  if (direction === 'LR') {
    const midX = (start.x + end.x) / 2;
    return { x: midX, y: start.y };
  } else {
    const midY = (start.y + end.y) / 2;
    return { x: start.x, y: midY };
  }
}
