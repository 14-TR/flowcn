# Protocols Specification

## Overview

**Purpose**: Provide a centralized, machine-readable registry of available protocols and how to execute them. This enables the IDE agent to enumerate protocols, resolve them by name/alias, and execute their linked specifications.

**Scope**: Protocols orchestrate repeatable workflows (e.g., adding components, creating examples). Each protocol references the authoritative specification that governs its behavior.

**Version**: 0.0.0

## Protocol Registry

The following protocols are available. Each entry defines a canonical name, intent, command phrases (aliases), the governing spec, and execution semantics.

---

### Protocol: list protocols

**Canonical Name**: protocols.list

**Intent**: Return the list of all available protocols with their canonical name, short description, and command phrases.

**Command Phrases (aliases)**:
- "list protocols"
- "show protocols"
- "what can you do"

**Governing Spec**: this document (protocols_spec.md)

**Execution**:
1. Enumerate all protocol entries defined under Protocol Registry in this file.
2. Return structured data: `[{ name, description, command_phrases, spec_path }]`.

---

### Protocol: add component

**Canonical Name**: react.add_component

**Intent**: Add a new React component to the `@flowcn/react` package following repository standards.

**Command Phrases (aliases)**:
- "add component"
- "create component"
- "new component"

**Governing Spec**: `project_specs/30-packages/react_spec.md`

**Execution**:
1. Prompt for component name, purpose, and props interface.
2. Validate naming follows PascalCase convention.
3. Create component file in `packages/react/src/`.
4. Add export to `packages/react/src/index.ts`.
5. Create basic unit test structure.

**Validation**: Component file created, exports updated, TypeScript compiles.

---

### Protocol: add layout algorithm

**Canonical Name**: core.add_layout

**Intent**: Add a new layout algorithm to the `@flowcn/core` package.

**Command Phrases (aliases)**:
- "add layout"
- "create layout algorithm"
- "new layout"

**Governing Spec**: `project_specs/30-packages/core_spec.md`

**Execution**:
1. Prompt for algorithm name and type (layered, grid, force, etc.).
2. Create algorithm file in `packages/core/src/layout/`.
3. Export from `packages/core/src/layout/index.ts`.
4. Add test file with determinism verification.

**Validation**: Algorithm file created, exports working, tests pass.

---

### Protocol: add demo example

**Canonical Name**: demo.add_example

**Intent**: Add a new example page to the demo application.

**Command Phrases (aliases)**:
- "add example"
- "create demo"
- "new example page"

**Governing Spec**: `project_specs/30-packages/demo_spec.md`

**Execution**:
1. Prompt for example name, description, and graph complexity.
2. Create page file in `apps/demo/src/app/examples/[name]/page.tsx`.
3. Add navigation entry if applicable.
4. Create sample GraphDoc for the example.

**Validation**: Page renders without errors, navigation works.

---

### Protocol: perform audit

**Canonical Name**: audit.perform

**Intent**: Perform comprehensive code audit of specified component following repository standards and best practices.

**Command Phrases (aliases)**:
- "audit code"
- "audit component"
- "perform audit"
- "code review"

**Governing Spec**: `project_specs/00-governance/audit_spec.md`

**Execution**:
1. Identify target component(s) from user input.
2. Determine audit type (Code/Package/Component).
3. Load relevant specifications and perform comprehensive checks.
4. Generate structured audit report with findings categorized by severity.
5. Provide actionable recommendations for each issue identified.

**Validation**: Apply Validation Checklist from `audit_spec.md`.

---

### Protocol: docker operations

**Canonical Name**: docker.ops

**Intent**: Assist with Docker development environment operations.

**Command Phrases (aliases)**:
- "docker help"
- "start dev"
- "run tests"
- "build project"

**Governing Spec**: `project_specs/20-operations/docker_ops_spec.md`

**Execution**:
1. Identify the requested Docker operation.
2. Provide the appropriate docker compose command.
3. Explain any prerequisites or considerations.

**Validation**: Command executes successfully.

---

### Protocol: generate spec

**Canonical Name**: spec.generate

**Intent**: Generate a new specification file based on the template.

**Command Phrases (aliases)**:
- "generate spec"
- "create spec"
- "new specification"

**Governing Spec**: `project_specs/90-templates/spec_template.md`

**Execution**:
1. Prompt for spec name, purpose, and scope.
2. Create spec file from template.
3. Place in appropriate `project_specs/` subdirectory.

**Validation**: Spec follows template format, references are valid.

---

## Protocol Resolution Rules

1. Match by canonical name first; if no match, match by case-insensitive alias.
2. If multiple protocols share an alias, ask for disambiguation by returning candidates with descriptions.
3. Return the `spec_path` and `section` (if applicable) that governs execution.

## Agent Behavior for Protocol Execution

When a user invokes a protocol (explicitly or via an alias):
1. Resolve the protocol via the rules above.
2. Load and follow the governing spec exactly.
3. Provide a brief status update, then perform required prompts/edits.
4. Validate outcomes using the spec's validation checklist.
5. Summarize changes and surface follow-ups.

## Checklist Gate

**Requirement**: If the governing spec defines a Prompt Checklist, the agent MUST enforce a hard gate before any edits or file generation.

**Rules**:
- Collect checklist answers and echo back a concise summary for confirmation.
- Block ALL edits until the user explicitly confirms the summary.
- If an edit is attempted without a confirmed checklist, abort the edit and return to prompting.

## Data Shape for "list protocols"

The IDE agent MUST return the following structure for the `protocols.list` protocol:

```json
[
  {
    "name": "react.add_component",
    "description": "Add a new React component to @flowcn/react",
    "command_phrases": ["add component", "create component", "new component"],
    "spec_path": "documentation/project_specs/30-packages/react_spec.md"
  }
]
```

## References

- [Documentation Specification](./docs_spec.md)
- [Specification Formatting Standards](./formatting_spec.md)
- [IDE Agent Specification](./ide_agent.md)
- [Core Package Specification](../30-packages/core_spec.md)
- [React Package Specification](../30-packages/react_spec.md)
