# IDE Agent Specification

## Overview

**Purpose**: Define the behavior, protocols, and standards for IDE-based AI agents in flowcn development workflows.

**Scope**: All IDE agent interactions and development assistance.

**Version**: 0.0.0

## On Request Behavior

**Summary**: Guidelines for responsive and proactive agent behavior.

**Requirements**:
- **Responsive Mode**: Actively respond to user requests and queries
- **Proactive Suggestions**: Offer helpful recommendations when appropriate
- **Flexible Adaptation**: Adjust approach based on user preferences and needs

## Protocol Invocation and Routing

**Summary**: The agent must resolve and execute user intents via the protocol registry.

**Requirements**:
- **Start with Nav**: Before responding, consult `documentation/nav_spec.md` to select the correct specialized spec.
- **List Protocols**: When asked to enumerate capabilities (e.g., "list protocols"), execute `protocols.list` per `protocols_spec.md`.
- **Resolve Aliases**: When a user calls a protocol by alias, resolve via `protocols_spec.md` rules.
- **Follow Governing Spec**: After resolution, execute the linked spec exactly, including prompts, edits, and validation checklists.
- **Status Updates**: Provide brief progress notes at key steps and summarize outcomes.

## Checklist Gate (Mandatory Pre-Execution Prompts)

**Requirement**: If the governing spec defines a Prompt Checklist, the agent MUST enforce a hard gate before any edits or file generation.

**Rules**:
- Collect checklist answers and echo back a concise summary for confirmation.
- Block ALL edits until the user explicitly confirms the summary (Yes/Proceed).
- If an edit is attempted without a confirmed checklist, abort and return to prompting.

**Decision Rule**:
- Prompts confirmed? → proceed with edits.
- Prompts missing or unconfirmed? → do not edit; continue prompting.

## Status Updates and Task Tracking

**Summary**: Maintain lightweight progress visibility and track active tasks to completion.

**Requirements**:
- **Micro Status Updates**: Provide a 1–3 sentence update before major actions and after completing a step.
- **Task List**: Maintain a concise list of active tasks; update statuses as work progresses.
- **Completion Check**: When all tasks are finished, confirm completion, summarize changes, and surface any follow-ups.

## Code Generation Standards

### TypeScript Standards

**Requirements**:
- Use strict TypeScript with no `any` types unless absolutely necessary
- Export types and interfaces alongside implementations
- Use proper generic constraints where applicable
- Prefer `const` assertions for literal types

### React Component Standards

**Requirements**:
- Use functional components with hooks
- Define props interfaces with JSDoc comments
- Use `forwardRef` when exposing refs
- Implement proper cleanup in `useEffect`

### Test Generation

**Requirements**:
- Generate test files alongside new components
- Use Vitest for testing
- Include determinism tests for layout algorithms
- Test error cases and edge conditions

## Exception Handling

**Summary**: Standards for error handling and recovery procedures.

### Error Response Protocol

**Requirements**:
- **Graceful Degradation**: Handle errors without losing context
- **Clear Communication**: Explain issues and provide actionable solutions
- **Recovery Procedures**: Guide users through error resolution steps

### Common Error Scenarios

**TypeScript Compilation Errors**:
- Read the error message carefully
- Check type definitions and imports
- Verify interface compatibility

**Docker Issues**:
- Check if containers are running with `docker compose ps`
- Verify port availability
- Check Docker daemon status

**Build Failures**:
- Run `pnpm build` in the container to see full errors
- Check for circular dependencies
- Verify package exports

## Output Standards

**Summary**: Quality requirements for all code and documentation output.

### Code Quality Requirements

**Standards**:
- **Readability**: Clear, well-structured code that's easy to understand
- **Maintainability**: Modular design with proper separation of concerns
- **Performance**: Efficient algorithms and optimized execution
- **Documentation**: Comprehensive JSDoc comments

### Tool Output Formatting

**Requirements**:
- When a tool returns formatted output, use that format directly
- Preserve tool intent in formatting
- Use code blocks for all code output

## flowcn-Specific Guidelines

### Graph Document Handling

When working with `GraphDoc` objects:
- Always validate with `validateGraph()` before layout
- Use `normalizeGraph()` for deterministic processing
- Handle validation errors gracefully

### Layout Algorithm Work

When modifying layout algorithms:
- Maintain determinism guarantees
- Sort all collections by ID before processing
- Add determinism tests to verify same input → same output

### Component Development

When creating new components:
- Follow existing component patterns in `packages/react/src/`
- Use shadcn/ui primitives where applicable
- Maintain accessibility standards (ARIA, keyboard navigation)

## References

- [Documentation Specification](./docs_spec.md)
- [Protocols Specification](./protocols_spec.md)
- [Specification Formatting Standards](./formatting_spec.md)
- [Repository Specification](../10-architecture/repo_spec.md)
