# flowcn

Interactive, deterministic flow/graph diagram renderer implemented as real UI using React + TypeScript + shadcn/ui components.

flowcn replaces static Mermaid diagrams by rendering nodes as shadcn Cards and edges as SVG connectors. It ships as a reusable package plus a demo app, all running from Docker.

## Features

- **Deterministic Layout**: Same input graph always yields the same positions
- **Real UI Components**: Nodes render as shadcn/ui Cards, not static SVG
- **Interactive**: Hover highlighting, click selection, keyboard navigation
- **Docker-First**: Everything runs in containers, no host dependencies
- **Layout Algorithms**: Layered layout for DAGs, grid fallback for cycles
- **Orthogonal Edge Routing**: Clean connectors with arrowheads

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

No need to install Node, npm, pnpm, or any build tools on your host machine.

### Getting Started (Linux/macOS)

```bash
# Clone the repository
git clone https://github.com/yourusername/flowcn.git
cd flowcn

# Start the development server
docker compose up dev

# Or use make
make dev
```

The demo app will be available at http://localhost:3000

### Getting Started (Windows PowerShell)

```powershell
# Clone the repository
git clone https://github.com/yourusername/flowcn.git
cd flowcn

# Start the development server
docker compose up dev
```

The demo app will be available at http://localhost:3000

## Development Commands

### Using Docker Compose

```bash
# Start development server with hot reload
docker compose up dev

# Run tests
docker compose run --rm dev pnpm test

# Build all packages
docker compose run --rm dev pnpm build

# Install dependencies
docker compose run --rm dev pnpm install

# Open a shell in the container
docker compose run --rm dev sh
```

### Using Makefile (Linux/macOS)

```bash
# Start development server
make dev

# Run tests
make test

# Build all packages
make build

# Install dependencies
make install

# Open a shell
make shell

# Clean up Docker volumes and images
make clean
```

## Project Structure

```
flowcn/
├── packages/
│   ├── core/          # Graph types, validation, layout algorithms
│   └── react/         # React renderer components
├── apps/
│   └── demo/          # Next.js demo application
├── docs/              # Documentation
├── Dockerfile         # Multi-stage Docker build
├── docker-compose.yml # Development environment
├── Makefile          # Development commands
└── pnpm-workspace.yaml # Workspace configuration
```

## Architecture

### packages/core

Core graph types, validation, and layout algorithms.

**Types**: `GraphDoc`, `Node`, `Edge`, `LayoutOptions`, `LayoutResult`

**Functions**:
- `normalizeGraph(doc)`: Validates and assigns stable IDs
- `validateGraph(doc)`: Returns diagnostics
- `layoutGraph(doc, options)`: Computes positions and routes

**Layout Algorithms**:
- **Layered**: Sugiyama-based layout for DAGs with crossing minimization
- **Grid**: Deterministic fallback for graphs with cycles

### packages/react

React components for rendering flowcn diagrams.

**Components**:
- `<Diagram>`: Main component that renders nodes and edges
- `<NodeCard>`: Renders a node as a shadcn Card
- `<EdgeSvg>`: Renders an edge as SVG path with arrowhead

**Interactions**:
- Hover: Highlights node and incident edges
- Click: Selects node and calls `onSelect` callback
- Keyboard: Tab to focus, Enter to select

### apps/demo

Next.js application showcasing flowcn diagrams.

**Pages**:
- `/`: Landing page with feature overview
- `/examples/flowchart`: Simple flowchart example
- `/examples/clusters`: Clustered diagram with groups
- `/examples/agent-workflow`: Complex AI workflow

**Components**:
- `ExampleViewer`: Wrapper with controls and inspector
- `DiagramControls`: Layout kind, direction, edge label toggles
- `NodeInspector`: Shows selected node details

## Usage Example

```typescript
import { Diagram } from '@flowcn/react';
import type { GraphDoc } from '@flowcn/core';

const doc: GraphDoc = {
  nodes: [
    { id: 'a', label: 'Start' },
    { id: 'b', label: 'Process' },
    { id: 'c', label: 'End' },
  ],
  edges: [
    { from: 'a', to: 'b', label: 'begin' },
    { from: 'b', to: 'c', label: 'finish' },
  ],
  layout: {
    kind: 'layered',
    direction: 'LR',
  },
};

function MyDiagram() {
  return (
    <Diagram
      doc={doc}
      onSelect={(node) => console.log('Selected:', node)}
    />
  );
}
```

## Testing

All tests run inside Docker containers:

```bash
# Run all tests
docker compose run --rm dev pnpm test

# Run tests in watch mode
docker compose run --rm dev pnpm --filter @flowcn/core test:watch

# Run specific test file
docker compose run --rm dev pnpm --filter @flowcn/core test normalize.test.ts
```

Tests verify:
- Determinism: Same input produces identical output
- Validation: Missing nodes and duplicate IDs are caught
- Layout: All nodes positioned, all edges routed

## Documentation

- [Design Documentation](docs/design.md): Architecture and determinism guarantees
- [DSL Documentation](docs/dsl.md): GraphDoc JSON format with examples

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test: `make test`
4. Build to verify: `make build`
5. Commit your changes: `git commit -m 'Add my feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

## Non-Goals (MVP)

- VS Code extension
- Drag-and-drop editing
- External diagram libraries (no mermaid, no react-flow, no d3)
- Database or backend services

## License

MIT

## Acknowledgments

Built with:
- React + TypeScript
- shadcn/ui components
- Next.js
- Tailwind CSS
- pnpm workspaces
- Docker + Docker Compose
