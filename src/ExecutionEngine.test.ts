import { describe, it, expect, vi } from 'vitest';
import { generateExecutionPlan, executeFlow } from './ExecutionEngine';

vi.mock('./nodeExecutors/NodeExecutorRegistry', () => ({
  getNodeExecutor: () => undefined
}));

const mockClient = vi.fn();
vi.mock('./utils/OllamaClient', () => ({
  OllamaClient: vi.fn().mockImplementation((baseUrl: string, config: any) => {
    mockClient(baseUrl, config);
    return {
      listModels: vi.fn(),
      sendChat: vi.fn(),
      streamChat: vi.fn()
    };
  })
}));

describe('ExecutionEngine litellm support', () => {
  it('uses litellm config when apiType is litellm', async () => {
    const nodes = [
      {
        id: '1',
        type: 'baseLlmNode',
        data: { config: { apiType: 'litellm', litellmUrl: 'http://litellm.local' } }
      }
    ] as any;

    const plan = generateExecutionPlan(nodes, []);
    expect(plan.config.type).toBe('litellm');
    expect(plan.config.baseUrl).toBe('http://litellm.local');

    await executeFlow(plan);
    expect(mockClient).toHaveBeenCalledWith('http://litellm.local', { type: 'litellm', baseUrl: 'http://litellm.local' });
  });
});
