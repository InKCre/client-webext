// Explain Agent implementation using OpenAI
// Inspired by VoltAgent patterns but adapted for browser extension context

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { AgentConfig, AgentResult, Tool, ToolCall } from "./types";

export class ExplainAgent {
  private openai: OpenAI | null = null;
  private config: AgentConfig;

  constructor(config: AgentConfig, apiKey?: string) {
    this.config = config;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Required for browser context
      });
    }
  }

  /**
   * Update the OpenAI API key
   */
  setApiKey(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * Execute the agent with a given query and context
   */
  async execute(params: {
    query: string;
    pageContent?: string;
    pageUrl?: string;
    contextBlockId?: number;
  }): Promise<AgentResult> {
    if (!this.openai) {
      return {
        content: "",
        error: "OpenAI API key not configured. Please set your API key in the extension settings.",
      };
    }

    try {
      // Build the context message
      let contextInfo = "";
      if (params.pageUrl) {
        contextInfo += `Current page URL: ${params.pageUrl}\n`;
      }
      if (params.pageContent) {
        // Limit page content to avoid token overflow
        const truncatedContent = params.pageContent.slice(0, 2000);
        contextInfo += `\nPage content preview:\n${truncatedContent}\n`;
      }
      if (params.contextBlockId) {
        contextInfo += `\nContext block ID: ${params.contextBlockId}\n`;
      }

      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: this.config.instructions,
        },
      ];

      if (contextInfo) {
        messages.push({
          role: "system",
          content: `Context information:\n${contextInfo}`,
        });
      }

      messages.push({
        role: "user",
        content: params.query,
      });

      // Convert tools to OpenAI function format
      const tools =
        this.config.tools?.map((tool) => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })) || [];

      const toolCalls: ToolCall[] = [];
      let assistantMessage = "";
      let continueLoop = true;
      let maxIterations = 5; // Prevent infinite loops

      while (continueLoop && maxIterations > 0) {
        maxIterations--;

        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? "auto" : undefined,
        });

        const choice = response.choices[0];
        const message = choice.message;

        // Add assistant message to conversation
        messages.push(message);

        if (message.tool_calls && message.tool_calls.length > 0) {
          // Execute tool calls
          for (const toolCall of message.tool_calls) {
            const tool = this.config.tools?.find(
              (t) => t.name === toolCall.function.name
            );

            if (tool) {
              try {
                const params = JSON.parse(toolCall.function.arguments);
                const result = await tool.execute(params);

                toolCalls.push({
                  toolName: tool.name,
                  parameters: params,
                  result,
                });

                // Add tool result to messages
                messages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                });
              } catch (error) {
                console.error(`Error executing tool ${tool.name}:`, error);
                messages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({
                    error: `Failed to execute tool: ${error}`,
                  }),
                });
              }
            }
          }
        } else {
          // No more tool calls, we have the final answer
          assistantMessage = message.content || "";
          continueLoop = false;
        }
      }

      return {
        content: assistantMessage,
        toolCalls,
      };
    } catch (error: any) {
      console.error("Error in ExplainAgent:", error);
      return {
        content: "",
        error: `Failed to generate explanation: ${error.message || error}`,
      };
    }
  }
}
