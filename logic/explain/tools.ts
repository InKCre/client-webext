// Knowledge base retrieval tools for InKCre using Vercel AI SDK

import { tool } from "ai";
import { z } from "zod";
import { Block } from "../block";

/**
 * Tool for retrieving relevant blocks from knowledge base using semantic search
 */
export const knowledgeBaseRetrievalTool = tool({
  description:
    "Search the user's knowledge base for relevant information using semantic similarity. Use this to find related notes, concepts, and previously stored information.",
  parameters: z.object({
    query: z.string().describe("The search query to find relevant information"),
    num: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 5)"),
  }),
  execute: async ({ query, num }) => {
    try {
      const blocks = await Block.fromEmbedding({
        query,
        num: num || 5,
        maxDistance: 0.7, // Threshold for semantic similarity
      });

      if (blocks.length === 0) {
        return {
          success: false,
          message: "No relevant information found in knowledge base.",
          blocks: [],
        };
      }

      return {
        success: true,
        message: `Found ${blocks.length} relevant items in knowledge base.`,
        blocks: blocks.map((block) => ({
          id: block.id,
          content: block.content,
          resolver: block.resolver,
          storage: block.storage,
        })),
      };
    } catch (error) {
      console.error("Error retrieving from knowledge base:", error);
      return {
        success: false,
        message: `Failed to retrieve from knowledge base: ${error}`,
        blocks: [],
      };
    }
  },
});

/**
 * Tool for retrieving context-specific blocks from knowledge base
 * Uses a specific block ID as context to find related information
 */
export const contextualRetrievalTool = tool({
  description:
    "Retrieve information from the knowledge base that's related to a specific block/context. Useful when you need information related to a particular page or topic.",
  parameters: z.object({
    blockId: z.number().describe("The block ID to use as context"),
    query: z
      .string()
      .optional()
      .describe("Optional additional query to refine the search"),
    num: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 5)"),
  }),
  execute: async ({ blockId, query, num }) => {
    try {
      const blocks = await Block.fromEmbedding({
        blockId,
        query,
        num: num || 5,
        maxDistance: 0.7,
      });

      if (blocks.length === 0) {
        return {
          success: false,
          message: "No relevant information found with given context.",
          blocks: [],
        };
      }

      return {
        success: true,
        message: `Found ${blocks.length} contextually relevant items.`,
        blocks: blocks.map((block) => ({
          id: block.id,
          content: block.content,
          resolver: block.resolver,
          storage: block.storage,
        })),
      };
    } catch (error) {
      console.error("Error in contextual retrieval:", error);
      return {
        success: false,
        message: `Failed to perform contextual retrieval: ${error}`,
        blocks: [],
      };
    }
  },
});
