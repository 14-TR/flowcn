# flowcn Documentation Navigation Specification

## 1. Overview

**Purpose**: This document is the master guide to the `documentation` folder. Its sole purpose is to orchestrate the IDE agent's understanding of the available specifications, directing it to the correct document for any given task. It acts as a top-level index or "router" for the other specs.

**Scope**: This specification is limited to defining the structure and purpose of the files within the `documentation/project_specs/` directory. The agent should consult this file first to determine which specialized specification to use for a task.

**Version**: 0.0.0

## 2. IDE Configuration Snippet

To ensure the IDE agent always consults this orchestrator first, add the following rule to your `.cursorrules` or relevant agent configuration:

```markdown
Agent Preamble:
Before responding to any prompt, you MUST follow these steps:
1. Read the file `documentation/nav_spec.md`.
2. Use the "Specification Index" in that file to identify the correct, specialized specification for the user's request.
3. Strictly follow the rules and protocols outlined in the selected specification to complete the task.
```

## 3. Specification Directory (`documentation/project_specs/`)

This directory contains the full suite of specifications that define the standards and protocols for the `flowcn` repository. The agent must use the appropriate spec based on the context of the user's request.

### How to Use These Specifications

1. **Start Here**: Always begin by consulting this document (`nav_spec.md`) to identify the correct spec.
2. **Select the Right Tool**: Based on the user's request, navigate to the relevant specification listed below.
3. **Apply the Rules**: Adhere to the rules and protocols within the selected specification for the duration of the task.

### Specification Index

#### Governance (00-governance/)

- `00-governance/audit_spec.md`: Code auditing standards and procedures for reviewing TypeScript/React code, packages, and components.
- `00-governance/docs_spec.md`: Documentation standards (JSDoc, READMEs, specs).
- `00-governance/formatting_spec.md`: Spec file formatting standards.
- `00-governance/ide_agent.md`: Agent behavior, session/task management, error handling, output formatting.
- `00-governance/protocols_spec.md`: Protocol registry and execution routing.

#### Architecture (10-architecture/)

- `10-architecture/architecture_spec.md`: Monorepo architecture, package structure, Docker-first approach, and versioning.
- `10-architecture/repo_spec.md`: Core coding standards (TypeScript, React, Tailwind, ESLint, formatting).

#### Operations (20-operations/)

- `20-operations/docker_ops_spec.md`: Docker development environment, commands, and container lifecycle.
- `20-operations/monorepo_ops_spec.md`: pnpm workspace operations, package management, and build workflows.
- `20-operations/release_notes.md`: flowcn release history and version tracking.

#### Packages (30-packages/)

- `30-packages/core_spec.md`: `@flowcn/core` package specification (types, validation, layout algorithms).
- `30-packages/react_spec.md`: `@flowcn/react` package specification (components, interactions, rendering).
- `30-packages/demo_spec.md`: `apps/demo` application specification (Next.js demo, examples, controls).

#### Templates (90-templates/)

- `90-templates/spec_template.md`: Specification template and validation guidelines.

## 4. Quick Reference

| Task Type | Primary Spec | Secondary Specs |
|-----------|--------------|-----------------|
| Adding a new component | `30-packages/react_spec.md` | `10-architecture/repo_spec.md`, `00-governance/docs_spec.md` |
| Adding a layout algorithm | `30-packages/core_spec.md` | `10-architecture/repo_spec.md` |
| Docker troubleshooting | `20-operations/docker_ops_spec.md` | `10-architecture/architecture_spec.md` |
| Code review/audit | `00-governance/audit_spec.md` | `10-architecture/repo_spec.md` |
| Creating documentation | `00-governance/docs_spec.md` | `00-governance/formatting_spec.md` |
| Building/releasing | `20-operations/monorepo_ops_spec.md` | `20-operations/release_notes.md` |
| Adding demo examples | `30-packages/demo_spec.md` | `30-packages/react_spec.md` |

## 5. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.0.0 | 2026-01-12 | Initial documentation structure |
