# Code Audit Specification

## Overview

**Purpose**: Define comprehensive code auditing standards and procedures for reviewing TypeScript/React code, packages, and components to ensure quality, security, maintainability, and compliance with repository standards.

**Scope**: All TypeScript code, React components, packages, and repository components that require auditing.

**Version**: 0.0.0

## Audit Framework

### Audit Types

**Summary**: Different types of audits that can be performed based on the target component.

**Code Audit**: Review individual TypeScript/React files for code quality, standards compliance, and best practices.

**Package Audit**: Review entire packages (`@flowcn/core`, `@flowcn/react`) for structure, architecture compliance, and integration quality.

**Component Audit**: Review specific React components for implementation quality, accessibility, and adherence to component patterns.

**Repository Audit**: Review repository-wide patterns, dependencies, and architectural compliance.

### Audit Scope Selection

**Process**: The audit protocol must determine the scope based on user input:
1. If user specifies a file path → Code Audit
2. If user specifies a package (`packages/core`, `packages/react`) → Package Audit
3. If user specifies a component → Component Audit
4. If user specifies repository-wide → Repository Audit

**Requirements**:
- Must identify target component(s) clearly
- Must determine audit depth (quick scan vs. comprehensive)
- Must respect user's explicit scope requests

## Code Quality Checks

### TypeScript Standards Compliance

**Summary**: Verify adherence to TypeScript best practices and repository standards.

**Checks**:
- Strict TypeScript mode enabled (`strict: true`)
- No `any` types unless explicitly justified
- Proper type exports alongside implementations
- Generic constraints properly defined
- Consistent naming conventions (PascalCase for types, camelCase for functions)

**Validation**:
- TypeScript compiler produces no errors
- ESLint produces no errors
- No type assertions (`as`) without justification

### React Component Standards

**Summary**: Verify React component quality and patterns.

**Checks**:
- Functional components with hooks (no class components)
- Props interfaces defined with JSDoc comments
- Proper `useCallback`/`useMemo` usage for performance
- Cleanup in `useEffect` hooks where needed
- `forwardRef` used when exposing DOM refs
- Accessibility attributes (ARIA, role, tabIndex)

**Validation**:
- Components render without errors
- No missing dependencies in hooks
- Proper key usage in lists

### Documentation Standards

**Summary**: Verify completeness and quality of documentation.

**Checks**:
- JSDoc comments on all exported functions/components
- Props interfaces have property-level documentation
- Module headers on package entry points
- README files present and current
- Examples provided for public APIs

**Validation**:
- All public APIs have documentation
- Documentation matches implementation
- Examples are runnable

### Code Structure & Organization

**Summary**: Verify code follows repository structure standards.

**Checks**:
- Single responsibility principle adherence
- Function/component size and complexity
- Modularization (no code duplication)
- Proper file organization within packages
- Clean imports (no circular dependencies)

**Validation**:
- Files are focused and not overly complex
- Shared operations extracted to utilities
- Code organization follows repository patterns

## Testing Standards

### Test Coverage

**Summary**: Verify adequate test coverage.

**Checks**:
- Unit tests for all pure functions
- Component tests for React components
- Determinism tests for layout algorithms
- Edge case coverage

**Validation**:
- Tests pass with `pnpm test`
- No skipped tests without justification
- Test names are descriptive

### Determinism Verification

**Summary**: Verify determinism guarantees for layout algorithms.

**Checks**:
- Same input produces identical output
- No random values in computation
- Collections sorted by ID before processing
- No timestamp-based calculations

**Validation**:
- Run layout multiple times and compare results
- Verify sorting is stable

## Security & Best Practices

### Security Checks

**Summary**: Identify potential security vulnerabilities.

**Checks**:
- No hardcoded secrets or credentials
- XSS prevention in React components
- Proper input validation
- No dangerous `dangerouslySetInnerHTML` without sanitization
- No `eval()` or dynamic code execution

**Validation**:
- No secrets in code or config files
- Input validation present for user-provided data
- Proper error handling that doesn't leak information

### Performance Considerations

**Summary**: Identify potential performance issues.

**Checks**:
- Memoization for expensive computations
- Proper React rendering optimization
- No unnecessary re-renders
- Efficient layout algorithms
- Proper use of `useMemo` and `useCallback`

**Validation**:
- Components use appropriate optimization patterns
- Layout computation is efficient for expected graph sizes

## Audit Execution Protocol

### Pre-Audit Assessment

**Process**:
1. Identify target component(s) from user input
2. Determine audit type (Code/Package/Component/Repository)
3. Identify relevant specifications to check against
4. Determine audit depth (quick/comprehensive)

**Required Information**:
- Target path or component name
- Audit scope (file, package, component, repository)
- Audit depth preference (if not specified, default to comprehensive)

### Audit Execution Steps

**Process**:
1. **Scope Identification**: Determine exact files/components to audit
2. **Specification Loading**: Load relevant specs (repo_spec.md, package specs, etc.)
3. **Code Analysis**: Perform TypeScript/ESLint checks
4. **Manual Review**: Review code against specification requirements
5. **Issue Identification**: Document findings with severity levels
6. **Report Generation**: Create structured audit report

**Requirements**:
- Must check against all relevant specifications
- Must provide actionable feedback
- Must prioritize issues by severity
- Must reference specific spec sections for violations

### Issue Severity Levels

**Critical**: Violations that cause security risks, data corruption, or system failures
**High**: Violations that cause bugs, performance issues, or maintainability problems
**Medium**: Violations that reduce code quality or deviate from standards
**Low**: Minor style issues or suggestions for improvement

### Audit Report Format

**Structure**:
```markdown
# Audit Report: [Component Name]

## Summary
- Total Issues: [count]
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

## Findings

### [Category Name]

#### [Issue Title] (Severity: [Level])
- **Location**: [file:line]
- **Specification**: [spec reference]
- **Description**: [detailed description]
- **Recommendation**: [how to fix]
```

## Validation Checklist

**Post-Audit Validation**:
- [ ] All relevant specifications checked
- [ ] All issues documented with severity
- [ ] Audit report generated and formatted correctly
- [ ] Recommendations provided for each issue
- [ ] Spec references included for violations
- [ ] Scope accurately identified and audited

## References

- [Repository Specification](../10-architecture/repo_spec.md)
- [Core Package Specification](../30-packages/core_spec.md)
- [React Package Specification](../30-packages/react_spec.md)
- [Documentation Specification](./docs_spec.md)
- [IDE Agent Specification](./ide_agent.md)
