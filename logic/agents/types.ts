// Agent framework types inspired by VoltAgent patterns

import { z } from "zod";

/**
 * Tool definition for agents
 */
export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (params: any) => Promise<any>;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  name: string;
  instructions: string;
  tools?: Tool[];
}

/**
 * Agent execution result
 */
export interface AgentResult {
  content: string;
  toolCalls?: ToolCall[];
  error?: string;
}

/**
 * Tool call record
 */
export interface ToolCall {
  toolName: string;
  parameters: any;
  result: any;
}
