// Explain Agent implementation using Vercel AI SDK (browser-compatible)
// Uses the same AI SDK that VoltAgent is built on

import { generateText, stepCountIs } from "ai";
import { sendMessage } from "webext-bridge/background";
import { parseModelString } from "../provider-registry";
import type { AgentResult, AITools } from "./types";
import type { LLMProviderConfig } from "../storage";

export class ExplainAgent {
  private tools: AITools;
  private instructions: string;
  private name: string;

  constructor(
    name: string,
    instructions: string,
    tools: AITools
  ) {
    this.name = name;
    this.instructions = instructions;
    this.tools = tools;
  }

  /**
   * Get page context from content script
   */
  private async getPageContext(tabId?: number): Promise<{ pageUrl: string; pageContent: string } | null> {
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
            (tr) => tr.toolCallId === tc.toolCallId
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
        toolCalls: toolCallsWithResults.length > 0 ? toolCallsWithResults : undefined,
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
}
