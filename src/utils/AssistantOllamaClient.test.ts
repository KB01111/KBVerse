import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AssistantOllamaClient } from './AssistantOllamaClient';

function mockFetch(json: any) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(json)
  } as Response);
}

function createStream(lines: string[]) {
  return {
    getReader() {
      let index = 0;
      return {
        read() {
          if (index < lines.length) {
            const value = new TextEncoder().encode(lines[index]);
            index++;
            return Promise.resolve({ value, done: false });
          }
          return Promise.resolve({ value: undefined, done: true });
        }
      };
    }
  } as any;
}

describe('AssistantOllamaClient image generation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses OpenAI flow when type is openai', async () => {
    (fetch as any).mockImplementation(() =>
      mockFetch({ choices: [{ message: { content: 'hi' } }], usage: { total_tokens: 5 } })
    );

    const client = new AssistantOllamaClient('https://api.test', { apiKey: 'key', type: 'openai' });
    const result = await client.generateWithImages('model', 'prompt', ['img']);

    expect(fetch).toHaveBeenCalledOnce();
    expect((fetch as any).mock.calls[0][0]).toBe('https://api.test/chat/completions');
    expect(result).toEqual({ response: 'hi', eval_count: 5 });
  });

  it('uses OpenAI flow when type is litellm', async () => {
    (fetch as any).mockImplementation(() =>
      mockFetch({ choices: [{ message: { content: 'hi' } }], usage: { total_tokens: 5 } })
    );

    const client = new AssistantOllamaClient('https://api.test', { apiKey: 'key', type: 'litellm' });
    const result = await client.generateWithImages('model', 'prompt', ['img']);

    expect(fetch).toHaveBeenCalledOnce();
    expect((fetch as any).mock.calls[0][0]).toBe('https://api.test/chat/completions');
    expect(result).toEqual({ response: 'hi', eval_count: 5 });
  });

  it('streams responses when type is openai', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      body: createStream(['data: {"choices":[{"delta":{"content":"hello"}}]}\n'])
    });

    const client = new AssistantOllamaClient('https://api.test', { apiKey: 'key', type: 'openai' });
    const gen = client.streamGenerateWithImages('model', 'prompt', ['img']);
    const chunks: any[] = [];
    for await (const chunk of gen) {
      chunks.push(chunk);
    }

    expect(fetch).toHaveBeenCalledOnce();
    expect((fetch as any).mock.calls[0][0]).toBe('https://api.test/chat/completions');
    expect(chunks).toEqual([{ response: 'hello', eval_count: 0 }]);
  });

  it('streams responses when type is litellm', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      body: createStream(['data: {"choices":[{"delta":{"content":"hello"}}]}\n'])
    });

    const client = new AssistantOllamaClient('https://api.test', { apiKey: 'key', type: 'litellm' });
    const gen = client.streamGenerateWithImages('model', 'prompt', ['img']);
    const chunks: any[] = [];
    for await (const chunk of gen) {
      chunks.push(chunk);
    }

    expect(fetch).toHaveBeenCalledOnce();
    expect((fetch as any).mock.calls[0][0]).toBe('https://api.test/chat/completions');
    expect(chunks).toEqual([{ response: 'hello', eval_count: 0 }]);
  });
});
