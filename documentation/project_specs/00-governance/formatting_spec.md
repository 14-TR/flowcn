# Specification Formatting Standards

## Overview

**Purpose**: Define consistent formatting standards for all specifications in the repository.

**Scope**: All specification files in `documentation/project_specs/` directory.

**Version**: 0.0.0

## File Structure

### Content Organization

**Header Hierarchy**:
- `#` - Main specification title
- `##` - Major sections
- `###` - Subsections
- `####` - Detailed subsections (use sparingly)

**Section Patterns**:
1. **Overview** - Always start with this (Purpose, Scope, Version)
2. **Core Rules/Protocols** - Main content
3. **Examples/Implementation** - Code and usage examples
4. **Validation Checklist** - Verification criteria
5. **References** - Related documents

## Content Formatting

### Protocol Definitions

**Standard Format**:
```markdown
**Protocol Name**: [Brief description]

**Process**: [Step-by-step description]

**Requirements**:
- [Requirement 1]
- [Requirement 2]

**Example**:
```typescript
// Code example
```

**Notes**:
- [Important note 1]
- [Important note 2]
```

### Code Examples

**TypeScript Formatting**:
```typescript
export function exampleFunction(
  param1: string,
  param2: number,
): boolean {
  /** Example JSDoc following standards */
  return true;
}
```

**React Component Formatting**:
```tsx
export interface ExampleProps {
  /** Prop description */
  value: string;
}

export function ExampleComponent({ value }: ExampleProps) {
  return <div>{value}</div>;
}
```

### Tables

**Format**: Use markdown tables for structured data

**Example**:
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value A  | Value B  | Value C  |
```

### Lists

**Bullet Points**: Use for requirements, features, and general lists
**Numbered Lists**: Use for procedures, steps, and ordered processes

## Language Standards

### Terminology

**Consistent Terms**:
- Use **bold** for key terms and concepts
- Use `code` for technical terms, file names, and code references
- Use *italics* sparingly for emphasis

### Code Block Languages

- **TypeScript**: Use ` ```typescript ` for TypeScript code
- **TSX**: Use ` ```tsx ` for React/JSX code
- **JSON**: Use ` ```json ` for JSON examples
- **Shell**: Use ` ```bash ` for command examples
- **Mermaid**: Use ` ```mermaid ` for diagrams

## Quality Standards

### Completeness Requirements

**Every Spec Must Include**:
- Clear purpose statement
- Scope definition
- Version information
- Related references

### Readability Standards

**Line Length**: Maximum 100 characters for prose
**Paragraphs**: Keep under 3-4 sentences
**Sections**: Use clear, descriptive headings

### Maintenance Standards

**Update Frequency**: Review with each release
**Version Control**: Update version numbers for significant changes
**Deprecation**: Mark old specs as deprecated before removal

## Validation Checklist

- [ ] Content follows header hierarchy
- [ ] Code examples are properly formatted
- [ ] References section is complete
- [ ] No broken links or references
- [ ] Consistent terminology throughout
- [ ] Examples are executable/testable
- [ ] Purpose/Scope/Version present in Overview

## References

- [Documentation Specification](./docs_spec.md)
- [IDE Agent Specification](./ide_agent.md)
- [Repository Specification](../10-architecture/repo_spec.md)
