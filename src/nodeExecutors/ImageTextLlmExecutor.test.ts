import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNodeExecutor } from './NodeExecutorRegistry';

vi.mock('../utils/OllamaClient', () => {
  return {
    OllamaClient: vi.fn().mockImplementation((baseUrl: string) => {
      return {
        baseUrl,
        getConfig: () => ({ baseUrl, type: 'openai', apiKey: '' }),
        generateWithImages: vi.fn().mockResolvedValue({ response: 'ok' })
      };
    })
  };
});

import './ImageTextLlmExecutor';
import { OllamaClient as MockOllamaClient } from '../utils/OllamaClient';

const executor = getNodeExecutor('imageTextLlmNode')!;

describe('ImageTextLlmExecutor with LiteLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses LiteLLM base URL when api type is litellm', async () => {
    const node = { id: '1', data: { config: { model: 'm' } } } as unknown as import('reactflow').Node;
    const context = {
      node,
      inputs: { src: 'data:image/png;base64,abc' },
      ollamaClient: null,
      apiConfig: { type: 'litellm', baseUrl: 'https://lite.server', apiKey: 'k' }
    } as import('./NodeExecutorRegistry').NodeExecutionContext;

    const result = await executor.execute(context);
    expect(result).toBe('ok');
    expect(MockOllamaClient).toHaveBeenCalledWith(
      'https://lite.server',
      expect.objectContaining({ apiKey: 'k', type: 'openai' })
    );
  });
});
