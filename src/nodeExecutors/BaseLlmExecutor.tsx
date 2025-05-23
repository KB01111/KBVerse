import { registerNodeExecutor, NodeExecutionContext } from './NodeExecutorRegistry';
import { OllamaClient } from '../utils/OllamaClient';

const executeLlmPrompt = async (context: NodeExecutionContext) => {
  const { node, inputs, ollamaClient, apiConfig } = context;
  
  try {
    const textInput = inputs.text || inputs['text-in'] || '';
    if (!textInput) {
      return "No input provided to LLM";
    }

    const config = node.data.config || {};
    const model = config.model || 'llama2';
    const systemPrompt = config.prompt || '';
    const ollamaUrl = config.ollamaUrl || 'http://localhost:11434';
    const litellmUrl = config.litellmUrl || 'http://localhost:4000';
    
    // Determine which API to use (from node config or from global context)
    const useOpenAI = apiConfig?.type === 'openai' || apiConfig?.type === 'litellm' || config.apiType === 'openai' || config.apiType === 'litellm';
    
    console.log(`Executing LLM with model: ${model}, system prompt: ${systemPrompt}, API type: ${useOpenAI ? 'OpenAI' : 'Ollama'}`);
    
    // Prepare messages array
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: textInput });
    
    // Use the provided ollamaClient from context if available
    let client = ollamaClient;
    
    // If no client provided or we need to override the API type
    if (!client || (useOpenAI && client.getConfig().type !== 'openai')) {
      if (useOpenAI) {
        // Use OpenAI or LiteLLM configuration
        const baseUrl =
          apiConfig?.type === 'litellm' || config.apiType === 'litellm'
            ? apiConfig?.baseUrl || litellmUrl
            : apiConfig?.baseUrl || config.openaiUrl || 'https://api.openai.com/v1';
        client = new OllamaClient(
          baseUrl,
          {
            apiKey: apiConfig?.apiKey || config.apiKey || '',
            type: 'openai'
          }
        );
      } else {
        // Use Ollama configuration
        client = new OllamaClient(ollamaUrl, { type: 'ollama' });
      }
    }
    
    // Send chat request through our unified client
    const response = await client.sendChat(model, messages, { stream: false });
    
    return response.message?.content || "No response from model";
  } catch (error) {
    console.error("Error in LLM node execution:", error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

registerNodeExecutor('baseLlmNode', {
  execute: executeLlmPrompt
});
