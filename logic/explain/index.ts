// Explain Agent factory using Vercel AI SDK (browser-compatible)
// Uses the same AI SDK that VoltAgent is built on

import { generateText, streamText, stepCountIs } from "ai";
import { sendMessage } from "webext-bridge/background";
import { parseModelString } from "../ai/provider-registry";
import type { AgentResult, AITools, StreamCallback } from "./types";
import type { LLMProviderConfig } from "../storage";
import { knowledgeBaseRetrievalTool, contextualRetrievalTool } from "./tools";

export class ExplainAgent {
  private tools: AITools;
  private instructions: string;
  private name: string;

  constructor(name: string, instructions: string, tools: AITools) {
    this.name = name;
    this.instructions = instructions;
    this.tools = tools;
  }

  /**
   * Get page context from content script
   */
  private async getPageContext(
    tabId?: number,
  ): Promise<{ pageUrl: string; pageContent: string } | null> {
    try {
      // Request page context from content script via webext-bridge
      const options: any = { context: "content-script" };
      if (tabId !== undefined) {
        options.tabId = tabId;
      }

      const response: any = await sendMessage("get-page-context", {}, options);

      if (!response || !response.data) {
        return null;
      }

      return response.data as { pageUrl: string; pageContent: string };
    } catch (error) {
      console.error("Failed to get page context:", error);
      return null;
    }
  }

  /**
   * Execute the agent with a given query
   * Automatically retrieves page context from content script
   */
  async execute(params: {
    text: string;
    modelString: string;
    providers: LLMProviderConfig[];
    tabId?: number;
  }): Promise<AgentResult> {
    const { text, modelString, providers, tabId } = params;

    // Get model from registry
    let model;
    try {
      model = parseModelString(modelString, providers);
    } catch (error: any) {
      return {
        content: "",
        error: `Failed to initialize model: ${error.message}`,
      };
    }

    // Get page context
    const pageContext = await this.getPageContext(tabId);

    // Build the query with context
    let contextInfo = "";
    if (pageContext) {
      if (pageContext.pageUrl) {
        contextInfo += `Current page URL: ${pageContext.pageUrl}\n`;
      }
      if (pageContext.pageContent) {
        // Limit page content to avoid token overflow
        const truncatedContent = pageContext.pageContent.slice(0, 2000);
        contextInfo += `\nPage content preview:\n${truncatedContent}\n`;
      }
    }

    const query = `结合语境，简单明了地解释：${text}`;
    const userMessage = contextInfo
      ? `${contextInfo}\n\nUser query: ${query}`
      : query;

    try {
      // Execute using Vercel AI SDK's generateText
      // Use stopWhen to enable multi-step execution (default is stepCountIs(1))
      const result = await generateText({
        model,
        system: this.instructions,
        messages: [{ role: "user", content: userMessage }],
        tools: this.tools,
        stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and final response
      });

      const [provider, modelName] = modelString.split(":");

      // Collect tool calls and results from all steps
      const toolCallsWithResults = result.steps.flatMap((step) => {
        // Match tool calls with their results
        return step.toolCalls.map((tc) => {
          // Find the corresponding result
          const toolResult = step.toolResults.find(
            (tr) => tr.toolCallId === tc.toolCallId,
          );

          return {
            toolName: tc.toolName,
            parameters: tc.input, // Use 'input' property, not 'args'
            result: toolResult?.output, // Use 'output' property, not 'result'
          };
        });
      });

      return {
        content: result.text,
        toolCalls:
          toolCallsWithResults.length > 0 ? toolCallsWithResults : undefined,
        usedProvider: provider,
        usedModel: modelName,
      };
    } catch (error: any) {
      console.error("Error in ExplainAgent:", error);
      return {
        content: "",
        error: `Failed to generate explanation: ${error.message || error}`,
      };
    }
  }

  /**
   * Execute the agent with streaming support
   * Provides real-time updates on tool calls and text generation
   */
  async executeStream(params: {
    text: string;
    modelString: string;
    providers: LLMProviderConfig[];
    tabId?: number;
    onUpdate: StreamCallback;
  }): Promise<AgentResult> {
    const { text, modelString, providers, tabId, onUpdate } = params;

    // Notify start
    onUpdate({ status: "thinking" });

    // Get model from registry
    let model;
    try {
      model = parseModelString(modelString, providers);
    } catch (error: any) {
      const errorMsg = `Failed to initialize model: ${error.message}`;
      onUpdate({ status: "error", error: errorMsg });
      return {
        content: "",
        error: errorMsg,
      };
    }

    // Get page context
    const pageContext = await this.getPageContext(tabId);

    // Build the query with context
    let contextInfo = "";
    if (pageContext) {
      if (pageContext.pageUrl) {
        contextInfo += `Current page URL: ${pageContext.pageUrl}\n`;
      }
      if (pageContext.pageContent) {
        // Limit page content to avoid token overflow
        const truncatedContent = pageContext.pageContent.slice(0, 2000);
        contextInfo += `\nPage content preview:\n${truncatedContent}\n`;
      }
    }

    const query = `结合语境，简单明了地解释：${text}`;
    const userMessage = contextInfo
      ? `${contextInfo}\n\nUser query: ${query}`
      : query;

    try {
      // Execute using Vercel AI SDK's streamText
      const result = await streamText({
        model,
        system: this.instructions,
        messages: [{ role: "user", content: userMessage }],
        tools: this.tools,
        maxSteps: 5, // Allow up to 5 steps for tool calls and final response
      });

      const toolCalls: any[] = [];
      let fullText = "";

      const [provider, modelName] = modelString.split(":");

      // Process the stream
      for await (const part of result.fullStream) {
        if (part.type === "step-start") {
          // Step started, could be tool call or text generation
          onUpdate({ status: "thinking" });
        } else if (part.type === "tool-call") {
          // Tool is being called
          onUpdate({
            status: "calling-tool",
            currentToolCall: {
              toolName: part.toolName,
              parameters: part.args,
            },
          });
        } else if (part.type === "tool-result") {
          // Tool result received
          toolCalls.push({
            toolName: part.toolName,
            parameters: part.args,
            result: part.result,
          });
          onUpdate({
            status: "thinking",
            toolCalls,
            currentToolCall: undefined,
          });
        } else if (part.type === "text-delta") {
          // Text is being generated
          fullText += part.textDelta;
          onUpdate({
            status: "generating",
            content: fullText,
          });
        } else if (part.type === "finish") {
          // Generation complete
          onUpdate({
            status: "complete",
            content: fullText,
            toolCalls,
          });
        } else if (part.type === "error") {
          // Error occurred
          const errorMsg = `Error during streaming: ${part.error}`;
          onUpdate({
            status: "error",
            error: errorMsg,
          });
          return {
            content: fullText,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            error: errorMsg,
            usedProvider: provider,
            usedModel: modelName,
          };
        }
      }

      return {
        content: fullText,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usedProvider: provider,
        usedModel: modelName,
      };
    } catch (error: any) {
      console.error("Error in ExplainAgent streaming:", error);
      const errorMsg = `Failed to generate explanation: ${error.message || error}`;
      onUpdate({ status: "error", error: errorMsg });
      return {
        content: "",
        error: errorMsg,
      };
    }
  }
}

/**
 * Create an Explain Agent instance using Vercel AI SDK
 * This agent combines page context and knowledge base retrieval to explain selected content
 */
export function createExplainAgent(): ExplainAgent {
  const instructions = `You are an intelligent explanation agent integrated into InKCre, a knowledge graph-based note-taking system.

Your role is to provide clear, concise, and context-aware explanations of concepts, terms, or text passages that users select.

When explaining, follow this workflow:
1. First, search the user's knowledge base using the available tools to find relevant information
2. Consider the page context (URL, content) if provided
3. After retrieving information from tools, synthesize a comprehensive explanation by combining:
   - Information from the user's knowledge base (if found)
   - Context from the current page
   - Your general knowledge
4. Provide explanations in the same language as the query
5. Keep explanations simple and understandable
6. When relevant information is found in the knowledge base, cite it in your explanation
7. Format your response in Markdown for better readability

IMPORTANT: After using tools to retrieve information, you MUST provide a final comprehensive explanation. Don't just stop after calling tools - synthesize the retrieved information into a coherent answer.

Available tools:
- search_knowledge_base: Search for relevant information in the user's personal knowledge base
- get_contextual_information: Retrieve information related to a specific context or topic

Always aim to be helpful, accurate, and concise.`;

  // Tools must be passed as object with explicit names for Vercel AI SDK
  const tools = {
    search_knowledge_base: knowledgeBaseRetrievalTool,
    get_contextual_information: contextualRetrievalTool,
  };

  return new ExplainAgent("explain-agent", instructions, tools);
}
