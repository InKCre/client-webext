<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { onMessage, sendMessage } from "webext-bridge/popup";
import Loading from "~/components/common/loading.vue";
import ProviderPicker from "~/components/common/ProviderPicker.vue";
import Response from "~/components/ai/Response.vue";
import { useExplainStream } from "~/composables/useExplainStream";
import { llmProviders, selectedModel, defaultModel } from "~/logic/storage";
import { ArcForm, StarGraphForm } from "~/logic/root";
import { BlockForm } from "~/logic/block";
import { RelationForm } from "~/logic/relation";
import type { AgentState, ToolCall } from "~/logic/explain/types";

const emit = defineEmits<{ activate: [tab: string] }>();

const query = ref<string>("");
const pageContext = ref<{ pageUrl?: string; pageContent?: string }>({});

// Initialize streaming composable
let stream: ReturnType<typeof useExplainStream> | null = null;

// Direct refs from the stream
const explanation = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const usedProviderInfo = ref("");

// Initialize stream when model changes
const initializeStream = () => {
    const modelString = selectedModel.value || defaultModel.value;

    if (!modelString) {
        return;
    }

    stream = useExplainStream({
        modelString,
        providers: llmProviders.value,
        onError: (error) => {
            console.error("Streaming error:", error);
        },
    });

    // Sync refs
    explanation.value = stream.content.value;
    isLoading.value = stream.isLoading.value;
    errorMessage.value = stream.error.value;
    usedProviderInfo.value =
        stream.usedProvider.value && stream.usedModel.value
            ? `${stream.usedProvider.value} (${stream.usedModel.value})`
            : "";

    // Watch for changes
    watch(stream.content, (val) => (explanation.value = val));
    watch(stream.isLoading, (val) => (isLoading.value = val));
    watch(stream.error, (val) => (errorMessage.value = val));
    watch([stream.usedProvider, stream.usedModel], () => {
        usedProviderInfo.value =
            stream?.usedProvider.value && stream?.usedModel.value
                ? `${stream.usedProvider.value} (${stream.usedModel.value})`
                : "";
    });
};

// Initialize on mount
onMounted(() => {
    initializeStream();
});

// Reinitialize when model changes
watch(
    [selectedModel, defaultModel, llmProviders],
    () => {
        initializeStream();
    },
    { deep: true },
);

onMessage("set-explain-params", ({ data }) => {
    query.value = data.text;
    pageContext.value = {
        pageUrl: data.url,
        pageContent: data.pageContent,
    };
    emit("activate", "explain");
    // Trigger explanation when query is set
    if (query.value) {
        fetchExplanation();
    }
});

const fetchExplanation = async () => {
    if (!stream) {
        initializeStream();
        if (!stream) {
            return;
        }
    }

    // Validate model configuration
    const modelString = selectedModel.value || defaultModel.value;
    if (!modelString) {
        errorMessage.value = "请在扩展选项中配置默认模型";
        return;
    }

    if (!modelString.includes(":")) {
        errorMessage.value = "模型配置格式错误，请重新配置";
        return;
    }

    try {
        await stream.explain(query.value, pageContext.value);
    } catch (error) {
        console.error("Error fetching explanation:", error);
    }
};

const retryExplanation = () => {
    if (query.value && stream) {
        stream.reset();
        fetchExplanation();
    }
};

const stopExplanation = () => {
    if (stream) {
        stream.stop();
    }
};

const saveExplanation = () => {
    // FIXME 可能需要提供 context ，或者不能通过消息的方式
    sendMessage("set-sidepanel-mode", { mode: "taking-note" });
    sendMessage("set-taking-note-params", {
        text: String(explanation.value || ""),
    });
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

// Safe JSON stringification to handle circular references
const safeStringify = (obj: any): string => {
    try {
        return JSON.stringify(obj, null, 2);
    } catch (error) {
        return String(obj);
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
            <div class="explanation-text">
                <Response :content="explanation" :is-loading="isLoading" />
                <div v-if="explanation || isLoading" class="action-buttons">
                    <span v-if="usedProviderInfo" class="provider-info">{{
                        usedProviderInfo
                    }}</span>
                    <button
                        v-if="isLoading"
                        @click="stopExplanation"
                        class="stop-button"
                        title="Stop generation"
                    >
                        <i class="i-mdi-stop"></i>
                    </button>
                    <button
                        v-if="query && !isLoading"
                        @click="retryExplanation"
                        class="retry-button"
                        title="Retry"
                    >
                        <i class="i-mdi-refresh"></i>
                    </button>
                    <button
                        v-if="explanation && !isLoading"
                        @click="saveExplanation"
                        class="save-button"
                    >
                        保存
                    </button>
                </div>
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

.retry-button,
.stop-button {
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

.stop-button {
    border-color: #ff0000;
    color: #ff0000;
}

.stop-button:hover {
    background: #ff0000;
    color: #fff;
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
    0%,
    100% {
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
