# flowcn DSL Documentation

## Overview

flowcn uses a JSON-based document format called `GraphDoc` to describe flow diagrams. This document describes the format with examples.

## GraphDoc Structure

```typescript
interface GraphDoc {
  meta?: GraphMeta;
  nodes: Node[];
  edges: Edge[];
  groups?: Group[];
  layout?: LayoutOptions;
}
```

## Core Types

### Node

A node in the graph.

```typescript
interface Node {
  id: string;              // Required: Unique identifier
  label: string;           // Required: Display text
  type?: string;           // Optional: Semantic type
  group?: string;          // Optional: Group membership
  data?: Record<string, unknown>; // Optional: Custom data
  width?: number;          // Optional: Width hint (default 200)
  height?: number;         // Optional: Height hint (default 80)
}
```

**Example**:

```json
{
  "id": "start",
  "label": "Start Process",
  "type": "entry",
  "data": {
    "handler": "webhook",
    "timeout": 30
  }
}
```

### Edge

An edge connecting two nodes.

```typescript
interface Edge {
  id?: string;    // Optional: Auto-generated if missing
  from: string;   // Required: Source node ID
  to: string;     // Required: Target node ID
  label?: string; // Optional: Display text
  kind?: string;  // Optional: 'solid' or 'dashed'
  data?: Record<string, unknown>; // Optional: Custom data
}
```

**Example**:

```json
{
  "from": "start",
  "to": "validate",
  "label": "begin",
  "kind": "solid"
}
```

**Auto-generated IDs**: If `id` is not provided, it will be generated as `from->to#index`.

### Group

A group (cluster) of nodes.

**Note**: Types are defined but rendering is not yet implemented in MVP. Nodes can reference groups via the `group` field.

```typescript
interface Group {
  id: string;      // Required: Unique identifier
  label: string;   // Required: Display text
  parent?: string; // Optional: Parent group for nesting
  data?: Record<string, unknown>; // Optional: Custom data
}
```

**Example**:

```json
{
  "id": "frontend",
  "label": "Frontend Layer"
}
```

### GraphMeta

Metadata for the document.

```typescript
interface GraphMeta {
  title?: string;
  description?: string;
  created?: string;
  modified?: string;
  [key: string]: unknown; // Any additional fields
}
```

### LayoutOptions

Configuration for layout algorithm.

```typescript
interface LayoutOptions {
  kind: 'layered' | 'grid';     // Layout algorithm
  direction: 'LR' | 'TB';       // Direction
  spacingX?: number;            // Horizontal spacing (default 100)
  spacingY?: number;            // Vertical spacing (default 80)
  padding?: number;             // Diagram padding (default 40)
  defaultNodeWidth?: number;    // Default node width (default 200)
  defaultNodeHeight?: number;   // Default node height (default 80)
}
```

## Complete Examples

### Example 1: Simple Flowchart

```json
{
  "meta": {
    "title": "Simple Flowchart",
    "description": "A basic flowchart with decision nodes"
  },
  "nodes": [
    { "id": "start", "label": "Start", "type": "start" },
    { "id": "input", "label": "Get User Input", "type": "process" },
    { "id": "validate", "label": "Validate Input", "type": "decision" },
    { "id": "process", "label": "Process Data", "type": "process" },
    { "id": "save", "label": "Save to Database", "type": "process" },
    { "id": "error", "label": "Show Error", "type": "process" },
    { "id": "end", "label": "End", "type": "end" }
  ],
  "edges": [
    { "from": "start", "to": "input" },
    { "from": "input", "to": "validate" },
    { "from": "validate", "to": "process", "label": "valid" },
    { "from": "validate", "to": "error", "label": "invalid" },
    { "from": "process", "to": "save" },
    { "from": "save", "to": "end" },
    { "from": "error", "to": "end" }
  ],
  "layout": {
    "kind": "layered",
    "direction": "LR"
  }
}
```

**Layout**: Layered layout with left-to-right flow.

**Visualization**:
```
start → input → validate → process → save → end
                    ↓                           ↑
                  error ─────────────────────────
```

### Example 2: Clustered Diagram

```json
{
  "meta": {
    "title": "Three-Tier Architecture",
    "description": "Frontend, backend, and data layers"
  },
  "nodes": [
    { "id": "react-app", "label": "React App", "type": "component", "group": "frontend" },
    { "id": "vue-app", "label": "Vue App", "type": "component", "group": "frontend" },
    { "id": "rest-api", "label": "REST API", "type": "service", "group": "backend" },
    { "id": "graphql-api", "label": "GraphQL API", "type": "service", "group": "backend" },
    { "id": "postgres", "label": "PostgreSQL", "type": "database", "group": "data" },
    { "id": "redis", "label": "Redis Cache", "type": "database", "group": "data" }
  ],
  "edges": [
    { "from": "react-app", "to": "rest-api" },
    { "from": "vue-app", "to": "graphql-api" },
    { "from": "rest-api", "to": "postgres" },
    { "from": "graphql-api", "to": "postgres" },
    { "from": "rest-api", "to": "redis" },
    { "from": "graphql-api", "to": "redis" }
  ],
  "groups": [
    { "id": "frontend", "label": "Frontend Layer" },
    { "id": "backend", "label": "Backend Layer" },
    { "id": "data", "label": "Data Layer" }
  ],
  "layout": {
    "kind": "layered",
    "direction": "TB"
  }
}
```

**Layout**: Top-to-bottom layered layout.

**Note**: Group boxes are not yet rendered in MVP, but nodes reference their groups.

### Example 3: Cyclic Graph (Grid Fallback)

```json
{
  "meta": {
    "title": "State Machine",
    "description": "A state machine with cycles"
  },
  "nodes": [
    { "id": "idle", "label": "Idle" },
    { "id": "running", "label": "Running" },
    { "id": "paused", "label": "Paused" },
    { "id": "stopped", "label": "Stopped" }
  ],
  "edges": [
    { "from": "idle", "to": "running", "label": "start" },
    { "from": "running", "to": "paused", "label": "pause" },
    { "from": "paused", "to": "running", "label": "resume" },
    { "from": "running", "to": "stopped", "label": "stop" },
    { "from": "paused", "to": "stopped", "label": "stop" },
    { "from": "stopped", "to": "idle", "label": "reset" }
  ],
  "layout": {
    "kind": "layered",
    "direction": "LR"
  }
}
```

**Layout**: Attempted layered layout, but falls back to grid due to cycle.

### Example 4: Complex Workflow

```json
{
  "meta": {
    "title": "AI Agent Pipeline",
    "description": "Request processing pipeline with AI models"
  },
  "nodes": [
    {
      "id": "receive",
      "label": "Receive Request",
      "type": "entry",
      "data": { "handler": "webhook" }
    },
    {
      "id": "parse",
      "label": "Parse Input",
      "type": "transform",
      "data": { "parser": "json" }
    },
    {
      "id": "classify",
      "label": "Classify Intent",
      "type": "ai-model",
      "data": { "model": "gpt-4", "temperature": 0.7 }
    },
    {
      "id": "route",
      "label": "Route to Handler",
      "type": "router"
    },
    {
      "id": "query-db",
      "label": "Query Database",
      "type": "data-access"
    },
    {
      "id": "call-api",
      "label": "Call External API",
      "type": "integration"
    },
    {
      "id": "generate",
      "label": "Generate Response",
      "type": "ai-model",
      "data": { "model": "gpt-4" }
    },
    {
      "id": "format",
      "label": "Format Output",
      "type": "transform"
    },
    {
      "id": "send",
      "label": "Send Response",
      "type": "exit"
    },
    {
      "id": "log",
      "label": "Log Activity",
      "type": "logging"
    }
  ],
  "edges": [
    { "from": "receive", "to": "parse" },
    { "from": "parse", "to": "classify" },
    { "from": "classify", "to": "route" },
    { "from": "route", "to": "query-db", "label": "data query" },
    { "from": "route", "to": "call-api", "label": "api call" },
    { "from": "query-db", "to": "generate" },
    { "from": "call-api", "to": "generate" },
    { "from": "generate", "to": "format" },
    { "from": "format", "to": "send" },
    { "from": "receive", "to": "log", "kind": "dashed" },
    { "from": "send", "to": "log", "kind": "dashed" }
  ],
  "layout": {
    "kind": "layered",
    "direction": "TB",
    "spacingY": 100
  }
}
```

**Features**:
- Custom node data fields
- Dashed edges for logging
- Increased vertical spacing

## Validation Rules

When using `validateGraph(doc)`, the following rules are enforced:

### Errors

- Nodes must have unique IDs
- Nodes must have an `id` field
- Edges must have `from` and `to` fields
- Edges must reference existing nodes
- Edges with explicit IDs must have unique IDs

### Warnings

- Nodes referencing non-existent groups (if groups are defined)

### Example with Errors

```json
{
  "nodes": [
    { "id": "a", "label": "Node A" },
    { "id": "a", "label": "Node A Duplicate" }
  ],
  "edges": [
    { "from": "a", "to": "nonexistent" }
  ]
}
```

**Diagnostics**:
```json
[
  {
    "level": "error",
    "message": "Duplicate node ID: a",
    "nodeId": "a"
  },
  {
    "level": "error",
    "message": "Edge references non-existent target node: nonexistent"
  }
]
```

## Best Practices

### Node IDs

- Use descriptive, kebab-case IDs: `user-input`, `validate-email`
- Keep IDs short but meaningful
- Avoid special characters besides hyphens and underscores

### Edge Labels

- Keep labels concise (1-2 words)
- Use consistent terminology
- Omit labels for obvious connections

### Layout Direction

- **LR (Left to Right)**: Best for linear workflows, pipelines
- **TB (Top to Bottom)**: Best for hierarchical structures, call stacks

### Node Types

While arbitrary, consider using consistent types:
- `entry`, `exit` for start/end nodes
- `process` for processing steps
- `decision` for conditional branches
- `data` for data stores
- `integration` for external calls

### Custom Data

Use the `data` field for:
- Configuration parameters
- Runtime information
- Integration metadata

Avoid storing large objects or arrays.

## Loading Documents

### TypeScript

```typescript
import type { GraphDoc } from '@flowcn/core';

const doc: GraphDoc = {
  // ... document content
};
```

### From JSON File

```typescript
import { readFileSync } from 'fs';
import type { GraphDoc } from '@flowcn/core';

const json = readFileSync('diagram.json', 'utf-8');
const doc: GraphDoc = JSON.parse(json);
```

### Runtime Validation

```typescript
import { validateGraph, hasErrors } from '@flowcn/core';

const diagnostics = validateGraph(doc);

if (hasErrors(diagnostics)) {
  console.error('Graph has errors:');
  diagnostics.forEach(d => {
    console.error(`  ${d.level}: ${d.message}`);
  });
} else {
  // Safe to render
}
```

## Future Extensions

### Planned Features

- **Group box rendering**: Visual rectangles around grouped nodes
- **Node ports**: Specify exact connection points
- **Custom edge paths**: Override automatic routing
- **Nested groups**: Hierarchical clustering
- **Edge bundling**: Combine parallel edges

### Proposed Additions

```typescript
// Future: Node ports
interface Node {
  // ... existing fields
  ports?: {
    in?: string[];   // Input port IDs
    out?: string[];  // Output port IDs
  };
}

// Future: Edge ports
interface Edge {
  // ... existing fields
  fromPort?: string;
  toPort?: string;
}

// Future: Custom routing
interface Edge {
  // ... existing fields
  route?: {
    points: Point[];
    type: 'custom';
  };
}
```

These extensions are not yet implemented but are under consideration.

## Summary

The flowcn GraphDoc format provides a simple, JSON-based way to describe flow diagrams. It supports nodes, edges, groups, and layout options with validation and deterministic processing. The format is designed for both hand-authoring and programmatic generation.
