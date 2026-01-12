/**
 * Example graph documents for the demo
 */

import type { GraphDoc } from '@flowcn/core';

export const flowchartExample: GraphDoc = {
  meta: {
    title: 'Simple Flowchart',
    description: 'A basic flowchart demonstrating layered layout',
  },
  nodes: [
    { id: 'start', label: 'Start', type: 'start' },
    { id: 'input', label: 'Get User Input', type: 'process' },
    { id: 'validate', label: 'Validate Input', type: 'decision' },
    { id: 'process', label: 'Process Data', type: 'process' },
    { id: 'save', label: 'Save to Database', type: 'process' },
    { id: 'error', label: 'Show Error', type: 'process' },
    { id: 'end', label: 'End', type: 'end' },
  ],
  edges: [
    { from: 'start', to: 'input' },
    { from: 'input', to: 'validate' },
    { from: 'validate', to: 'process', label: 'valid' },
    { from: 'validate', to: 'error', label: 'invalid' },
    { from: 'process', to: 'save' },
    { from: 'save', to: 'end' },
    { from: 'error', to: 'end' },
  ],
  layout: {
    kind: 'layered',
    direction: 'LR',
  },
};

export const clustersExample: GraphDoc = {
  meta: {
    title: 'Clustered Diagram',
    description: 'Nodes organized in groups (basic layout, no group boxes yet)',
  },
  nodes: [
    { id: 'frontend1', label: 'React App', type: 'component', group: 'frontend' },
    { id: 'frontend2', label: 'Vue App', type: 'component', group: 'frontend' },
    { id: 'api1', label: 'REST API', type: 'service', group: 'backend' },
    { id: 'api2', label: 'GraphQL API', type: 'service', group: 'backend' },
    { id: 'db1', label: 'PostgreSQL', type: 'database', group: 'data' },
    { id: 'db2', label: 'Redis Cache', type: 'database', group: 'data' },
  ],
  edges: [
    { from: 'frontend1', to: 'api1' },
    { from: 'frontend2', to: 'api2' },
    { from: 'api1', to: 'db1' },
    { from: 'api2', to: 'db1' },
    { from: 'api1', to: 'db2' },
    { from: 'api2', to: 'db2' },
  ],
  groups: [
    { id: 'frontend', label: 'Frontend Layer' },
    { id: 'backend', label: 'Backend Layer' },
    { id: 'data', label: 'Data Layer' },
  ],
  layout: {
    kind: 'layered',
    direction: 'TB',
  },
};

export const agentWorkflowExample: GraphDoc = {
  meta: {
    title: 'AI Agent Workflow',
    description: 'A complex workflow showing an AI agent processing pipeline',
  },
  nodes: [
    {
      id: 'receive',
      label: 'Receive Request',
      type: 'entry',
      data: { handler: 'webhook' },
    },
    {
      id: 'parse',
      label: 'Parse Input',
      type: 'transform',
      data: { parser: 'json' },
    },
    {
      id: 'classify',
      label: 'Classify Intent',
      type: 'ai-model',
      data: { model: 'gpt-4' },
    },
    {
      id: 'route',
      label: 'Route to Handler',
      type: 'router',
    },
    {
      id: 'query-db',
      label: 'Query Database',
      type: 'data-access',
    },
    {
      id: 'call-api',
      label: 'Call External API',
      type: 'integration',
    },
    {
      id: 'generate',
      label: 'Generate Response',
      type: 'ai-model',
      data: { model: 'gpt-4' },
    },
    {
      id: 'format',
      label: 'Format Output',
      type: 'transform',
    },
    {
      id: 'send',
      label: 'Send Response',
      type: 'exit',
    },
    {
      id: 'log',
      label: 'Log Activity',
      type: 'logging',
    },
  ],
  edges: [
    { from: 'receive', to: 'parse' },
    { from: 'parse', to: 'classify' },
    { from: 'classify', to: 'route' },
    { from: 'route', to: 'query-db', label: 'data query' },
    { from: 'route', to: 'call-api', label: 'api call' },
    { from: 'query-db', to: 'generate' },
    { from: 'call-api', to: 'generate' },
    { from: 'generate', to: 'format' },
    { from: 'format', to: 'send' },
    { from: 'receive', to: 'log', kind: 'dashed' },
    { from: 'send', to: 'log', kind: 'dashed' },
  ],
  layout: {
    kind: 'layered',
    direction: 'TB',
  },
};

export const examples = {
  flowchart: flowchartExample,
  clusters: clustersExample,
  'agent-workflow': agentWorkflowExample,
};

export type ExampleKey = keyof typeof examples;
