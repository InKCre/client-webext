// Explain Agent implementation using Vercel AI SDK (browser-compatible)
// Uses the same AI SDK that VoltAgent is built on

import { generateText, tool as createTool } from "ai";
import { openai } from "@ai-sdk/openai";
import type { AgentResult, AITool } from "./types";

export class ExplainAgent {
  private model: ReturnType<typeof openai> | null = null;
  private apiKey: string | undefined;
  private tools: AITool[];
  private instructions: string;
  private name: string;

  constructor(
    name: string,
    instructions: string,
    tools: AITool[],
    apiKey?: string
  ) {
    this.name = name;
    this.instructions = instructions;
    this.tools = tools;
    this.apiKey = apiKey;
    
    if (apiKey) {
      this.initializeModel(apiKey);
    }
  }

  /**
   * Initialize the AI model with the given API key
   */
  private initializeModel(apiKey: string) {
    try {
      this.model = openai("gpt-4o-mini", {
        apiKey,
      });
    } catch (error) {
      console.error("Failed to initialize AI model:", error);
      this.model = null;
    }
  }

  /**
   * Update the OpenAI API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.initializeModel(apiKey);
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
    if (!this.model) {
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

      // Build the system message
      const systemMessage = this.instructions;
      const userMessage = contextInfo
        ? `${contextInfo}\n\nUser query: ${params.query}`
        : params.query;

      // Execute using Vercel AI SDK's generateText (same as VoltAgent uses)
      const result = await generateText({
        model: this.model,
        system: systemMessage,
        messages: [{ role: "user", content: userMessage }],
        tools: this.tools.reduce((acc, tool) => {
          acc[tool.name] = tool;
          return acc;
        }, {} as Record<string, AITool>),
        maxSteps: 5,
      });

      return {
        content: result.text,
        toolCalls: result.steps
          ?.flatMap((step) =>
            step.toolCalls?.map((tc) => ({
              toolName: tc.toolName,
              parameters: tc.args,
              result: tc.result,
            }))
          )
          .filter((tc): tc is NonNullable<typeof tc> => tc !== undefined),
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
