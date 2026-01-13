# Repository Specification

## Overview

**Purpose**: Define coding standards, formatting rules, and best practices for all TypeScript/React code in the flowcn repository.

**Scope**: All TypeScript code, React components, and development practices in the repository.

**Version**: 0.0.0

## TypeScript Standards

### Language Configuration

**TypeScript Version**: 5.x+

**Strict Mode**: Required (`strict: true` in tsconfig.json)

**Target**: ES2022 for modern JavaScript features

### Type Safety Rules

**Requirements**:
- No `any` types unless absolutely necessary and documented
- Prefer `unknown` over `any` for truly unknown types
- Use strict null checks (`strictNullChecks: true`)
- Export types alongside implementations

**Anti-patterns**:
```typescript
// Bad: Using any
function process(data: any) { }

// Good: Use proper types
function process(data: GraphDoc) { }

// Good: Use unknown for truly unknown
function parse(input: unknown): GraphDoc {
  // Validate and narrow type
}
```

### Type Definitions

**Naming Conventions**:
- Interfaces and Types: PascalCase (`GraphDoc`, `LayoutOptions`)
- Type parameters: Single uppercase letter or PascalCase (`T`, `TNode`)
- Enums: PascalCase with PascalCase members

**Interface vs Type**:
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and mapped types

**Example**:
```typescript
// Interface for extendable object shapes
export interface Node {
  id: string;
  label: string;
  type?: string;
}

// Type for unions
export type LayoutKind = 'layered' | 'grid';

// Type for complex mapped types
export type NodePositions = Record<string, NodePosition>;
```

## Code Formatting

### Prettier Configuration

**Standard Settings**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Import Organization

**Order**:
1. React imports
2. External library imports
3. Internal package imports (`@flowcn/*`)
4. Relative imports
5. Type-only imports (at the end)

**Example**:
```typescript
import React, { useMemo, useState, useCallback } from 'react';
import type { GraphDoc, Node, LayoutOptions } from '@flowcn/core';
import { layoutGraph, normalizeGraph } from '@flowcn/core';
import { NodeCard } from './NodeCard';
import { EdgeSvg } from './EdgeSvg';
```

### Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Files (components) | PascalCase | `NodeCard.tsx` |
| Files (utilities) | camelCase | `utils.ts` |
| Functions | camelCase | `layoutGraph()` |
| Components | PascalCase | `function Diagram()` |
| Interfaces/Types | PascalCase | `interface GraphDoc` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_SPACING` |
| Variables | camelCase | `nodePositions` |

## React Component Standards

### Component Structure

**Functional Components**: Required (no class components)

**Standard Pattern**:
```typescript
export interface ComponentProps {
  /** Prop description */
  propName: string;
  /** Optional prop description */
  optionalProp?: number;
  /** Callback description */
  onEvent?: (data: EventData) => void;
}

/**
 * Component description.
 */
export function ComponentName({
  propName,
  optionalProp = defaultValue,
  onEvent,
}: ComponentProps) {
  // Hooks first
  const [state, setState] = useState<StateType>(initialValue);
  
  // Memoized values
  const computed = useMemo(() => {
    return expensiveComputation(propName);
  }, [propName]);
  
  // Callbacks
  const handleEvent = useCallback(() => {
    onEvent?.({ data: computed });
  }, [computed, onEvent]);
  
  // Effects
  useEffect(() => {
    // Side effect
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Hook Usage

**Rules**:
- Use `useCallback` for functions passed to child components
- Use `useMemo` for expensive computations
- Always include all dependencies in dependency arrays
- Clean up side effects in `useEffect`

### Props Interface

**Requirements**:
- Define as a named interface (not inline)
- Export the interface for consumers
- Document each prop with JSDoc comments
- Use `?` for optional props with sensible defaults

### Forwarding Refs

**When to Use**: When the component needs to expose a DOM element or imperative handle

**Pattern**:
```typescript
export interface DiagramRef {
  addNode: () => void;
  deleteSelected: () => void;
}

export const Diagram = forwardRef<DiagramRef, DiagramProps>(
  function Diagram(props, ref) {
    useImperativeHandle(ref, () => ({
      addNode: handleAddNode,
      deleteSelected: handleDeleteSelected,
    }), [handleAddNode, handleDeleteSelected]);
    
    // ...
  }
);
```

## Function Standards

### Pure Functions

**Preferred**: Pure functions with no side effects for core logic

**Requirements**:
- Same input always produces same output
- No mutation of input parameters
- No external state dependencies

**Example**:
```typescript
// Pure function for layout computation
export function layoutGraph(
  doc: GraphDoc,
  options?: Partial<LayoutOptions>
): LayoutResult {
  // Deterministic computation
  return result;
}
```

### Function Signatures

**Multi-line Formatting** (for long signatures):
```typescript
export function complexFunction(
  param1: ComplexType,
  param2: AnotherType,
  options?: Partial<OptionsType>
): ReturnType {
  // Implementation
}
```

**Single-line Formatting** (for short signatures):
```typescript
export function simpleFunction(id: string): Node | undefined {
  return nodes.find(n => n.id === id);
}
```

## Error Handling

### Validation Errors

**Pattern**: Return diagnostics array, don't throw

**Example**:
```typescript
export function validateGraph(doc: GraphDoc): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  
  // Check for errors
  if (condition) {
    diagnostics.push({
      level: 'error',
      message: 'Description of the error',
      nodeId: relevantNodeId,
    });
  }
  
  return diagnostics;
}
```

### Runtime Errors

**Pattern**: Use specific error messages

**Example**:
```typescript
if (!layout.nodePositions[nodeId]) {
  throw new Error(`Node position not found for ID: ${nodeId}`);
}
```

## Documentation

### JSDoc Requirements

**Required For**:
- All exported functions
- All exported types/interfaces
- All React components
- All component props

**Format**:
```typescript
/**
 * Brief one-line description.
 *
 * Extended description if needed.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * const result = functionName(arg);
 * ```
 */
```

## Testing Standards

### Test File Location

**Pattern**: Co-located with source files

**Example**:
```
packages/core/src/
├── layout/
│   ├── grid.ts
│   ├── layered.ts
│   └── layout.test.ts
├── normalize.ts
├── normalize.test.ts
├── validate.ts
└── validate.test.ts
```

### Test Structure

**Framework**: Vitest

**Pattern**:
```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module';

describe('functionToTest', () => {
  it('should handle basic case', () => {
    const result = functionToTest(input);
    expect(result).toEqual(expected);
  });
  
  it('should handle edge case', () => {
    const result = functionToTest(edgeInput);
    expect(result).toEqual(edgeExpected);
  });
});
```

### Determinism Tests

**Required For**: All layout algorithms

**Pattern**:
```typescript
it('should produce deterministic output', () => {
  const result1 = layoutGraph(doc);
  const result2 = layoutGraph(doc);
  expect(result1).toEqual(result2);
});
```

## Accessibility Standards

### ARIA Attributes

**Requirements**:
- Interactive elements have proper roles
- Labels provided for screen readers
- Focus management handled

**Example**:
```tsx
<div
  role="button"
  tabIndex={0}
  aria-selected={isSelected}
  aria-label={`Node: ${node.label}`}
  onKeyDown={handleKeyDown}
>
  {/* Content */}
</div>
```

### Keyboard Navigation

**Requirements**:
- Tab navigation between interactive elements
- Enter/Space for activation
- Escape to cancel/close

## References

- [Architecture Specification](./architecture_spec.md)
- [Documentation Specification](../00-governance/docs_spec.md)
- [React Package Specification](../30-packages/react_spec.md)
