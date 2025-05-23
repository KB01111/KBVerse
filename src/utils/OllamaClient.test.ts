import { describe, it, expect, vi, afterEach } from 'vitest';
import { OllamaClient } from './OllamaClient';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('OllamaClient.checkConnection', () => {
  it('uses /api/tags for ollama type', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch as any;
    const client = new OllamaClient('http://localhost:11434', { type: 'ollama' });
    const result = await client.checkConnection();
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  it('uses /models for non-ollama type', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch as any;
    const client = new OllamaClient('https://api.example.com/v1', {
      type: 'openai',
      apiKey: 'secret'
    });
    const result = await client.checkConnection();
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer secret'
      }
    });
  });
});
