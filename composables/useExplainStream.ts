// Composable for streaming explain responses using Vercel AI SDK
import { ref, type Ref } from 'vue';
import { streamText } from 'ai';
import { parseModelString } from '~/logic/ai/provider-registry';
import type { LLMProviderConfig } from '~/logic/storage';

export interface UseExplainStreamOptions {
  /**
   * Model string in format "provider:model"
   */
  modelString: string;
  /**
   * LLM provider configurations
   */
  providers: LLMProviderConfig[];
  /**
   * System instructions for the agent
   */
  instructions?: string;
  /**
   * Callback when streaming completes
   */
  onFinish?: (result: { text: string; finishReason: string }) => void;
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
}

export interface ExplainStreamResult {
  /**
   * The current streamed content
   */
  content: Ref<string>;
  /**
   * Whether the stream is currently active
   */
  isLoading: Ref<boolean>;
  /**
   * Error message if any
   */
  error: Ref<string>;
  /**
   * Provider and model information
   */
  usedProvider: Ref<string>;
  usedModel: Ref<string>;
  /**
   * Start streaming with the given text
   */
  explain: (text: string, context?: { pageUrl?: string; pageContent?: string }) => Promise<void>;
  /**
   * Stop the current stream
   */
  stop: () => void;
  /**
   * Reset the state
   */
  reset: () => void;
}

const DEFAULT_INSTRUCTIONS = `You are an intelligent explanation agent integrated into InKCre, a knowledge graph-based note-taking system.

Your role is to provide clear, concise, and context-aware explanations of concepts, terms, or text passages that users select.

When explaining:
1. Consider the page context (URL, content) if provided
2. Provide explanations in the same language as the query
3. Keep explanations simple and understandable
4. Format your response in Markdown for better readability
5. Be helpful, accurate, and concise

Always aim to synthesize information into a coherent, easy-to-understand explanation.`;

export function useExplainStream(options: UseExplainStreamOptions): ExplainStreamResult {
  const content = ref('');
  const isLoading = ref(false);
  const error = ref('');
  const usedProvider = ref('');
  const usedModel = ref('');

  let abortController: AbortController | null = null;

  const stop = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isLoading.value = false;
  };

  const reset = () => {
    content.value = '';
    error.value = '';
    usedProvider.value = '';
    usedModel.value = '';
    isLoading.value = false;
    stop();
  };

  const explain = async (
    text: string,
    context?: { pageUrl?: string; pageContent?: string }
  ) => {
    // Reset state
    content.value = '';
    error.value = '';
    isLoading.value = true;

    // Create new abort controller
    abortController = new AbortController();

    try {
      // Parse model string
      const model = parseModelString(options.modelString, options.providers);
      const [provider, modelName] = options.modelString.split(':');
      usedProvider.value = provider;
      usedModel.value = modelName;

      // Build the query with context
      let contextInfo = '';
      if (context) {
        if (context.pageUrl) {
          contextInfo += `Current page URL: ${context.pageUrl}\n`;
        }
        if (context.pageContent) {
          // Limit page content to avoid token overflow
          const truncatedContent = context.pageContent.slice(0, 2000);
          contextInfo += `\nPage content preview:\n${truncatedContent}\n`;
        }
      }

      const query = `结合语境，简单明了地解释：${text}`;
      const userMessage = contextInfo
        ? `${contextInfo}\n\nUser query: ${query}`
        : query;

      // Stream the response
      const result = await streamText({
        model,
        system: options.instructions || DEFAULT_INSTRUCTIONS,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        abortSignal: abortController.signal,
      });

      // Process the stream
      for await (const chunk of result.textStream) {
        content.value += chunk;
      }

      // Get final result
      const finalResult = await result.text;
      content.value = finalResult;

      // Call onFinish callback
      if (options.onFinish) {
        options.onFinish({
          text: finalResult,
          finishReason: 'stop',
        });
      }
    } catch (err: any) {
      // Check if it was aborted
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        error.value = 'Explanation stopped';
      } else {
        console.error('Error in explain stream:', err);
        error.value = `Failed to generate explanation: ${err.message || err}`;

        // Call onError callback
        if (options.onError) {
          options.onError(err);
        }
      }
    } finally {
      isLoading.value = false;
      abortController = null;
    }
  };

  return {
    content,
    isLoading,
    error,
    usedProvider,
    usedModel,
    explain,
    stop,
    reset,
  };
}
