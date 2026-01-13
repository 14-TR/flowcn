/**
 * Layered layout algorithm for DAGs (Directed Acyclic Graphs)
 * Based on Sugiyama framework with simplified crossing minimization
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

interface GraphStructure {
  adjacency: Map<string, Set<string>>; // node -> outgoing neighbors
  inDegree: Map<string, number>;
  layers: string[][]; // layer index -> node IDs
  nodeLayer: Map<string, number>; // node -> layer index
}

/**
 * Detects cycles using DFS
 */
function hasCycle(
  graph: NormalizedGraph,
  adjacency: Map<string, Set<string>>
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Back edge found - cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Builds graph structure and assigns nodes to layers
 */
function buildGraphStructure(graph: NormalizedGraph): GraphStructure {
  const adjacency = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize
  for (const node of graph.nodes) {
    adjacency.set(node.id, new Set());
    inDegree.set(node.id, 0);
  }

  // Build adjacency and in-degree
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.add(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  }

  // Topological sort with layer assignment using Kahn's algorithm
  const layers: string[][] = [];
  const nodeLayer = new Map<string, number>();
  const queue: string[] = [];

  // Find all source nodes (in-degree = 0)
  for (const node of graph.nodes) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  }

  // Sort queue for determinism
  queue.sort();

  while (queue.length > 0) {
    // Process current layer
    const currentLayer = [...queue];
    currentLayer.sort(); // Deterministic ordering
    layers.push(currentLayer);

    const layerIndex = layers.length - 1;
    for (const nodeId of currentLayer) {
      nodeLayer.set(nodeId, layerIndex);
    }

    // Prepare next layer
    queue.length = 0;
    for (const nodeId of currentLayer) {
      const neighbors = adjacency.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);
        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }
    queue.sort();
  }

  return { adjacency, inDegree, layers, nodeLayer };
}

/**
 * Simple crossing minimization using barycenter heuristic
 */
function minimizeCrossings(
  layers: string[][],
  adjacency: Map<string, Set<string>>,
  nodeLayer: Map<string, number>
): string[][] {
  const optimizedLayers = layers.map(layer => [...layer]);

  // Multiple passes for better results
  for (let pass = 0; pass < 3; pass++) {
    // Forward pass
    for (let i = 1; i < optimizedLayers.length; i++) {
      const layer = optimizedLayers[i];
      const prevLayer = optimizedLayers[i - 1];

      // Calculate barycenter for each node in current layer
      const barycenters = layer.map(nodeId => {
        let sum = 0;
        let count = 0;

        // Find incoming edges from previous layer
        for (let j = 0; j < prevLayer.length; j++) {
          const prevNode = prevLayer[j];
          if (adjacency.get(prevNode)?.has(nodeId)) {
            sum += j;
            count++;
          }
        }

        return count > 0 ? sum / count : layer.indexOf(nodeId);
      });

      // Sort by barycenter (stable sort for determinism)
      const sorted = layer
        .map((nodeId, index) => ({ nodeId, barycenter: barycenters[index] }))
        .sort((a, b) => {
          if (a.barycenter === b.barycenter) {
            return a.nodeId.localeCompare(b.nodeId);
          }
          return a.barycenter - b.barycenter;
        })
        .map(item => item.nodeId);

      optimizedLayers[i] = sorted;
    }
  }

  return optimizedLayers;
}

/**
 * Computes layered layout for DAGs
 */
export function computeLayeredLayout(
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

  // Build graph structure
  const structure = buildGraphStructure(graph);

  // Minimize crossings
  const optimizedLayers = minimizeCrossings(
    structure.layers,
    structure.adjacency,
    structure.nodeLayer
  );

  // Update node layer mapping
  const nodeLayer = new Map<string, number>();
  optimizedLayers.forEach((layer, index) => {
    layer.forEach(nodeId => nodeLayer.set(nodeId, index));
  });

  // Calculate positions
  const nodePositions: Record<string, NodePosition> = {};

  optimizedLayers.forEach((layer, layerIndex) => {
    layer.forEach((nodeId, positionInLayer) => {
      const node = graph.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const width = node.width || defaultNodeWidth;
      const height = node.height || defaultNodeHeight;

      let x: number;
      let y: number;

      if (direction === 'LR') {
        // Layers are horizontal (left to right)
        x = padding + layerIndex * (defaultNodeWidth + spacingX);
        y = padding + positionInLayer * (defaultNodeHeight + spacingY);
      } else {
        // TB: Layers are vertical (top to bottom)
        x = padding + positionInLayer * (defaultNodeWidth + spacingX);
        y = padding + layerIndex * (defaultNodeHeight + spacingY);
      }

      nodePositions[nodeId] = { x, y, width, height };
    });
  });

  // Route edges
  const edgeRoutes = computeEdgeRoutes(graph, nodePositions, direction);

  // Calculate dimensions
  const maxLayerSize = Math.max(...optimizedLayers.map(l => l.length));
  let width: number;
  let height: number;

  if (direction === 'LR') {
    width =
      padding * 2 +
      optimizedLayers.length * defaultNodeWidth +
      (optimizedLayers.length - 1) * spacingX;
    height =
      padding * 2 +
      maxLayerSize * defaultNodeHeight +
      (maxLayerSize - 1) * spacingY;
  } else {
    width =
      padding * 2 +
      maxLayerSize * defaultNodeWidth +
      (maxLayerSize - 1) * spacingX;
    height =
      padding * 2 +
      optimizedLayers.length * defaultNodeHeight +
      (optimizedLayers.length - 1) * spacingY;
  }

  return {
    nodePositions,
    edgeRoutes,
    width,
    height,
  };
}

/**
 * Computes edge routes with orthogonal connectors
 */
export function computeEdgeRoutes(
  graph: NormalizedGraph,
  nodePositions: Record<string, NodePosition>,
  direction: 'LR' | 'TB'
): Record<string, { points: Point[]; labelPoint?: Point }> {
  const routes: Record<string, { points: Point[]; labelPoint?: Point }> = {};

  for (const edge of graph.edges) {
    const fromPos = nodePositions[edge.from];
    const toPos = nodePositions[edge.to];

    if (!fromPos || !toPos) {
      continue;
    }

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

    // Create orthogonal path
    const points = createOrthogonalPath(startPoint, endPoint, direction);

    // Label position at midpoint
    const midIndex = Math.floor(points.length / 2);
    const labelPoint = points[midIndex];

    routes[edge.id!] = { points, labelPoint };
  }

  return routes;
}

/**
 * Creates an orthogonal path between two points
 */
export function createOrthogonalPath(
  start: Point,
  end: Point,
  direction: 'LR' | 'TB'
): Point[] {
  if (direction === 'LR') {
    const midX = (start.x + end.x) / 2;
    return [
      start,
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      end,
    ];
  } else {
    const midY = (start.y + end.y) / 2;
    return [
      start,
      { x: start.x, y: midY },
      { x: end.x, y: midY },
      end,
    ];
  }
}

/**
 * Checks if graph is a DAG and can use layered layout
 */
export function canUseLayeredLayout(graph: NormalizedGraph): boolean {
  const adjacency = new Map<string, Set<string>>();

  for (const node of graph.nodes) {
    adjacency.set(node.id, new Set());
  }

  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.add(edge.to);
  }

  return !hasCycle(graph, adjacency);
}
