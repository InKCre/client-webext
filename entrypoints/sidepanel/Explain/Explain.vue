<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { onMessage, sendMessage } from "webext-bridge/popup";
import Loading from "~/components/common/loading.vue";
import ProviderPicker from "~/components/common/ProviderPicker/ProviderPicker.vue";
import Response from "~/components/ai/Response/Response.vue";
import { useExplainStream } from "~/composables/useExplainStream";
import { llmProviders, selectedModel, defaultModel } from "~/logic/storage";
import { ArcForm, StarGraphForm } from "~/logic/info-base/root";
import { BlockForm } from "~/logic/info-base/block";
import { RelationForm } from "~/logic/info-base/relation";
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

<style scoped lang="scss" src="./Explain.scss"></style>
