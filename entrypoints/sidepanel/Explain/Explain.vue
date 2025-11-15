<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { onMessage, sendMessage } from "webext-bridge/popup";
import { onNewTask } from "@/logic/task";
import Response from "~/components/ai/Response/Response.vue";
import Loading from "~/components/common/loading.vue";
import ProviderPicker from "~/components/common/ProviderPicker/ProviderPicker.vue";
import { useExplainAgent } from "~/logic/explain";
import { defaultModel, llmProviders } from "~/logic/storage";

const emit = defineEmits<{ activate: [] }>();

const query = ref<string>("");
const tabId = ref<number>();

onNewTask("explain", (task) => {
    emit("activate");
    query.value = task.parameters.selectedText;
    tabId.value = task.sender.tabId;
});

// Direct refs
const explanation = ref("");
const isLoading = ref(false);
const isFinished = ref(false);
const errorMessage = ref("");
const selectedModel = ref(defaultModel.value);

const explainAgent = computed(() => {
    return useExplainAgent({
        modelString: selectedModel.value,
        providers: llmProviders.value,
        onUpdate: (update) => {
            if (update.content !== undefined)
                explanation.value = update.content;
            if (update.isLoading !== undefined)
                isLoading.value = update.isLoading;
            if (update.error !== undefined) errorMessage.value = update.error;
        },
        onError: (error) => {
            console.error("Streaming error:", error);
        },
        onFinish() {
            isFinished.value = true;
        },
    });
});

const fetchExplanation = async () => {
    if (!explainAgent.value) {
        return;
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
        // The stream will handle page content retrieval internally
        await explainAgent.value.explain(query.value, tabId.value);
    } catch (error) {
        console.error("Error fetching explanation:", error);
    }
};

const retryExplanation = () => {
    if (query.value && explainAgent.value) {
        explainAgent.value.reset();
        fetchExplanation();
    }
};

const stopExplanation = () => {
    if (explainAgent.value) {
        explainAgent.value.stop();
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

watch(
    query,
    () => {
        if (query.value) {
            fetchExplanation();
        }
    },
    { immediate: true },
);
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
            <ProviderPicker v-model="selectedModel" />
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
            <div v-if="isSummarizingPage" class="status-message">
                <i class="i-mdi-file-document-outline animate-pulse"></i>
                正在总结页面内容...
            </div>
            <div class="explanation-text">
                <Response :content="explanation" :is-loading="isLoading" />
                <div v-if="explanation || isLoading" class="action-buttons">
                    <span v-if="isFinished" class="provider-info">{{
                        selectedModel
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
