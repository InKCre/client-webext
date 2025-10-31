<script setup lang="ts">
import VueMarkdownRender from "vue-markdown-render";
import { onMessage, sendMessage } from "webext-bridge/popup";
import Loading from "~/components/common/loading.vue";
import ProviderPicker from "~/components/common/ProviderPicker.vue";
import { createExplainAgent } from "~/logic/explain";
import { llmProviders, selectedModel, defaultModel } from "~/logic/storage";
import { ArcForm, StarGraphForm } from "~/logic/root";
import { BlockForm } from "~/logic/block";
import { RelationForm } from "~/logic/relation";
import type { AgentState, ToolCall } from "~/logic/explain/types";

const emit = defineEmits<{ activate: [tab: string] }>();

const explanation = ref<string>("");
const isLoading = ref<boolean>(false);
const query = ref<string>("");
const errorMessage = ref<string>("");
const usedProviderInfo = ref<string>("");

// Agent state tracking
const agentState = ref<AgentState["status"]>("idle");
const currentToolCall = ref<{ toolName: string; parameters: any } | undefined>();
const toolCalls = ref<ToolCall[]>([]);

// Initialize the explain agent
const explainAgent = createExplainAgent();

onMessage("set-explain-params", ({ data }) => {
    query.value = data.text;
    emit("activate", "explain");
    // Trigger explanation when query is set
    if (query.value) {
        fetchExplanation();
    }
});

const fetchExplanation = async () => {
    isLoading.value = true;
    errorMessage.value = "";
    usedProviderInfo.value = "";
    explanation.value = "";
    toolCalls.value = [];
    currentToolCall.value = undefined;
    agentState.value = "thinking";

    try {
        // Use selected model or fall back to default
        const modelString = selectedModel.value || defaultModel.value;

        if (!modelString) {
            throw new Error("请在扩展选项中配置默认模型");
        }

        // Validate that the model string has the correct format
        if (!modelString.includes(":")) {
            throw new Error("模型配置格式错误，请重新配置");
        }

        // Execute the explain agent with streaming
        const result = await explainAgent.executeStream({
            text: query.value,
            modelString,
            providers: llmProviders.value,
            onUpdate: (state) => {
                // Update UI state in real-time
                if (state.status) {
                    agentState.value = state.status;
                }
                if (state.currentToolCall !== undefined) {
                    currentToolCall.value = state.currentToolCall;
                }
                if (state.toolCalls !== undefined) {
                    toolCalls.value = state.toolCalls;
                }
                if (state.content !== undefined) {
                    explanation.value = state.content;
                }
                if (state.error !== undefined) {
                    errorMessage.value = state.error;
                }
            },
        });

        if (result.error) {
            errorMessage.value = result.error;
            agentState.value = "error";
        } else {
            explanation.value = result.content;
            errorMessage.value = "";
            agentState.value = "complete";
            if (result.usedProvider && result.usedModel) {
                usedProviderInfo.value = `${result.usedProvider} (${result.usedModel})`;
            }
            if (result.toolCalls) {
                toolCalls.value = result.toolCalls;
            }
        }
    } catch (error) {
        console.error("Error fetching explanation:", error);
        errorMessage.value = `Error fetching explanation: ${error}`;
        explanation.value = "";
        agentState.value = "error";
    } finally {
        isLoading.value = false;
    }
};

const retryExplanation = () => {
    if (query.value) {
        fetchExplanation();
    }
};

const saveExplanation = () => {
    // FIXME 可能需要提供 context ，或者不能通过消息的方式
    sendMessage("set-sidepanel-mode", { mode: "taking-note" });
    sendMessage("set-taking-note-params", { text: explanation.value });
};

const saveQuery = (event: Event) => {
    const newText = (event.target as HTMLElement).innerText.trim();
    query.value = newText;
    // Auto-fetch when query changes
    if (newText) {
        fetchExplanation();
    }
};

const handleModelChange = () => {
    // Re-fetch explanation when model changes
    if (query.value && explanation.value) {
        fetchExplanation();
    }
};
</script>

<template>
    <div class="explain-container">
        <header class="explain-header">
            <h1 class="explain-title">
                解释
                <span
                    contenteditable
                    @blur="saveQuery"
                    @keydown.enter.prevent="saveQuery"
                    class="editable-text"
                    >{{ query }}</span
                >
            </h1>
            <!-- Model selector -->
            <ProviderPicker @change="handleModelChange" />
        </header>
        <main class="explain-content">
            <div v-if="errorMessage" class="error-message">
                <p>{{ errorMessage }}</p>
                <p
                    v-if="!llmProviders?.some((p) => p.apiKey)"
                    class="config-hint"
                >
                    请在扩展选项中配置至少一个 LLM 提供商的 API Key。
                </p>
            </div>

            <!-- Agent State Visualization -->
            <div v-if="isLoading" class="agent-state-container">
                <!-- Status Indicator -->
                <div class="status-indicator">
                    <div class="status-icon">
                        <i
                            v-if="agentState === 'thinking'"
                            class="i-mdi-brain animate-pulse"
                        ></i>
                        <i
                            v-else-if="agentState === 'calling-tool'"
                            class="i-mdi-hammer-wrench animate-pulse"
                        ></i>
                        <i
                            v-else-if="agentState === 'generating'"
                            class="i-mdi-pencil animate-pulse"
                        ></i>
                        <i v-else class="i-mdi-cog animate-spin"></i>
                    </div>
                    <span class="status-text">
                        <span v-if="agentState === 'thinking'">思考中...</span>
                        <span v-else-if="agentState === 'calling-tool'"
                            >调用工具...</span
                        >
                        <span v-else-if="agentState === 'generating'"
                            >生成回答...</span
                        >
                        <span v-else>处理中...</span>
                    </span>
                </div>

                <!-- Current Tool Call -->
                <div
                    v-if="currentToolCall"
                    class="current-tool-call"
                >
                    <div class="tool-call-header">
                        <i class="i-mdi-tools"></i>
                        <span class="tool-name">{{ currentToolCall.toolName }}</span>
                    </div>
                    <div class="tool-parameters">
                        {{ JSON.stringify(currentToolCall.parameters, null, 2) }}
                    </div>
                </div>

                <!-- Tool Call History -->
                <div v-if="toolCalls.length > 0" class="tool-calls-history">
                    <h3 class="history-title">工具调用记录</h3>
                    <div
                        v-for="(call, index) in toolCalls"
                        :key="index"
                        class="tool-call-item"
                    >
                        <div class="tool-call-name">
                            <i class="i-mdi-check-circle"></i>
                            {{ call.toolName }}
                        </div>
                        <div class="tool-call-result">
                            {{ typeof call.result === 'object' ? JSON.stringify(call.result, null, 2) : call.result }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Streaming or Final Explanation -->
            <div
                v-if="explanation"
                class="explanation-text"
                :class="{ streaming: isLoading }"
            >
                <vue-markdown-render :source="explanation" />
                <div v-if="!isLoading" class="action-buttons">
                    <span v-if="usedProviderInfo" class="provider-info">{{
                        usedProviderInfo
                    }}</span>
                    <button
                        v-if="query"
                        @click="retryExplanation"
                        class="retry-button"
                    >
                        <i class="i-mdi-refresh"></i>
                    </button>
                    <button @click="saveExplanation" class="save-button">
                        保存
                    </button>
                </div>
            </div>

            <div
                v-else-if="!isLoading && !errorMessage"
                class="no-explanation"
            >
                <p>No explanation available.</p>
            </div>
        </main>
    </div>
</template>

<style scoped>
.explain-container {
    padding: 16px;
    font-family: "Courier New", monospace;
}

.explain-header {
    margin-bottom: 16px;
}

.explain-title {
    font-size: 1.25rem;
    font-weight: normal;
    color: #000;
    margin: 0 0 8px 0;
}

.editable-text {
    border: 1px solid transparent;
    padding: 2px 4px;
    border-radius: 2px;
    cursor: text;
}

.editable-text:focus {
    border-color: #000;
    background: #f9f9f9;
    outline: none;
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    align-items: center;
    margin-top: 4px;
}

.provider-info {
    font-size: 0.75rem;
    color: #666;
    margin-right: auto;
}

.retry-button {
    background: #fff;
    border: 1px solid #000;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.save-button {
    background: #fff;
    border: 1px solid #000;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 8px;
    height: 24px;
}

.explain-content {
    padding: 16px 0;
}

.error-message {
    background: #fff;
    border: 1px solid #ff0000;
    padding: 12px;
    margin-bottom: 16px;
    color: #ff0000;
}

.error-message .config-hint {
    margin-top: 8px;
    color: #666;
    font-size: 0.9em;
}

.loading-indicator {
    text-align: center;
    padding: 16px 0;
}

.explanation-text {
    line-height: 1.5;
    color: #333;
}

.no-explanation {
    text-align: center;
    color: #666;
}

.explanation-text :deep(p) {
    margin: 8px 0;
}

.explanation-text :deep(h1),
.explanation-text :deep(h2),
.explanation-text :deep(h3) {
    color: #000;
    margin: 12px 0 8px 0;
}

.explanation-text :deep(code) {
    background: #f0f0f0;
    padding: 2px 4px;
    border-radius: 2px;
}

/* Agent State Visualization */
.agent-state-container {
    border: 1px solid #000;
    padding: 12px;
    margin-bottom: 16px;
    background: #fff;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 8px;
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
}

.status-icon {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-text {
    font-weight: bold;
    font-size: 14px;
}

.current-tool-call {
    border: 1px solid #000;
    padding: 8px;
    margin-bottom: 12px;
    background: #fff;
}

.tool-call-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: bold;
    margin-bottom: 6px;
}

.tool-name {
    font-family: "Courier New", monospace;
}

.tool-parameters {
    background: #f5f5f5;
    padding: 6px;
    font-family: "Courier New", monospace;
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-all;
    border-left: 2px solid #000;
}

.tool-calls-history {
    border-top: 1px solid #e0e0e0;
    padding-top: 12px;
}

.history-title {
    font-size: 12px;
    font-weight: bold;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tool-call-item {
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    padding: 8px;
    margin-bottom: 8px;
}

.tool-call-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 4px;
    color: #000;
}

.tool-call-name i {
    color: #00aa00;
}

.tool-call-result {
    background: #fff;
    padding: 6px;
    font-family: "Courier New", monospace;
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-all;
    border-left: 2px solid #00aa00;
    max-height: 150px;
    overflow-y: auto;
}

.explanation-text.streaming {
    opacity: 0.9;
}

/* Animations */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
