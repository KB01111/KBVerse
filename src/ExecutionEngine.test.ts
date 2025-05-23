import { describe, it, expect, vi } from 'vitest';
import { generateExecutionPlan } from './ExecutionEngine';
import type { Node, Edge } from 'reactflow';

vi.mock('./db', () => ({
  db: { getAPIConfig: vi.fn().mockResolvedValue(null) }
}));

describe('generateExecutionPlan', () => {
  it('uses LiteLLM URL when node config specifies litellm', async () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'baseLlmNode',
        data: { config: { apiType: 'litellm', litellmUrl: 'http://lite.url', apiKey: 'key' } },
        position: { x: 0, y: 0 }
      } as unknown as Node
    ];
    const plan = await generateExecutionPlan(nodes, [] as Edge[]);
    expect(plan.config.type).toBe('litellm');
    expect(plan.config.baseUrl).toBe('http://lite.url');
  });
});
