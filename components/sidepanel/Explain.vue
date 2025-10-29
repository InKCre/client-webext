<script setup lang="ts">
import VueMarkdownRender from "vue-markdown-render";
import { onMessage, sendMessage } from "webext-bridge/popup";
import { watch, onMounted } from "vue";
import Loading from "~/components/common/loading.vue";
import { createExplainAgent } from "~/logic/agents";
import { llmProviders, defaultLLMProviderIndex, openaiApiKey } from "~/logic/storage";
import { ArcForm, StarGraphForm } from "~/logic/root";
import { Block, BlockForm } from "~/logic/block";
import { RelationForm } from "~/logic/relation";
import type { LLMProviderConfig } from "~/logic/storage";

const emit = defineEmits<{ activate: [tab: string] }>();

const explanation = ref<string>("");
const isLoading = ref<boolean>(false);
const query = ref<string>("");
const contextBlockId = ref<number>();
const pageContent = ref<string>("");
const pageUrl = ref<string>("");
const pageBlockCreated = ref<boolean>(false);
const errorMessage = ref<string>("");
const usedProviderInfo = ref<string>("");
const selectedProviderIndex = ref<number | undefined>(undefined);

// Initialize the explain agent
const explainAgent = createExplainAgent();

// Migrate legacy OpenAI API key to new provider system
onMounted(() => {
  if (openaiApiKey.value && llmProviders.value[0]) {
    const openaiProvider = llmProviders.value[0];
    if (!openaiProvider.apiKey && openaiProvider.provider === "openai") {
      openaiProvider.apiKey = openaiApiKey.value;
      llmProviders.value = [...llmProviders.value];
    }
  }
});

onMessage("set-explain-params", ({ data }) => {
  query.value = data.text;
  pageContent.value = data.pageContent || "";
  pageUrl.value = data.url || "";
  emit("activate", "explain");
});

const createPageBlock = async () => {
  if (!pageContent.value || pageBlockCreated.value) return;
  const graph = new StarGraphForm(
    new BlockForm("webpage", pageUrl.value, "url"),
    [
      new ArcForm(
        new RelationForm("text content"),
        new StarGraphForm(new BlockForm("text", pageContent.value))
      ),
    ]
  );
  try {
    const response = await graph.create();
    const data = await response.json();
    const pageBlock: Block = data.blocks.find(
      (item: Block) => item.resolver === "webpage"
    );
    contextBlockId.value = pageBlock.id;
    pageBlockCreated.value = true;
  } catch (error) {
    console.error("Error creating page block:", error);
  }
};

watch(query, async (newQuery) => {
  if (newQuery) {
    createPageBlock().finally(() => {
      fetchExplanation();
    });
  }
});

const fetchExplanation = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  usedProviderInfo.value = "";
  
  try {
    // Execute the explain agent with context and providers
    const result = await explainAgent.execute({
      query: `结合语境，简单明了地解释：${query.value}`,
      pageContent: pageContent.value,
      pageUrl: pageUrl.value,
      contextBlockId: contextBlockId.value,
      providers: llmProviders.value,
      selectedProviderIndex: selectedProviderIndex.value ?? defaultLLMProviderIndex.value,
    });

    if (result.error) {
      errorMessage.value = result.error;
      explanation.value = "";
    } else {
      explanation.value = result.content;
      errorMessage.value = "";
      if (result.usedProvider && result.usedModel) {
        usedProviderInfo.value = `${result.usedProvider} (${result.usedModel})`;
      }
    }
  } catch (error) {
    console.error("Error fetching explanation:", error);
    errorMessage.value = `Error fetching explanation: ${error}`;
    explanation.value = "";
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
      <div v-if="llmProviders && llmProviders.length > 0" class="model-selector">
        <label for="model-select" class="model-label">模型:</label>
        <select 
          id="model-select" 
          v-model="selectedProviderIndex" 
          class="model-select"
          @change="() => { if (query && explanation) fetchExplanation(); }"
        >
          <option :value="undefined">默认 ({{ llmProviders[defaultLLMProviderIndex]?.provider || 'none' }})</option>
          <option 
            v-for="(provider, index) in llmProviders" 
            :key="index" 
            :value="index"
            :disabled="!provider.enabled || !provider.apiKey"
          >
            {{ provider.provider }} - {{ provider.model }}
            {{ !provider.enabled ? '(禁用)' : !provider.apiKey ? '(未配置)' : '' }}
          </option>
        </select>
      </div>
    </header>
    <main class="explain-content">
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
        <p v-if="!llmProviders?.some(p => p.enabled && p.apiKey)" class="config-hint">
          请在扩展选项中配置至少一个 LLM 提供商的 API Key。
        </p>
      </div>
      <div v-if="isLoading" class="loading-indicator">
        <Loading />
      </div>
      <div v-else-if="explanation" class="explanation-text">
        <vue-markdown-render :source="explanation" />
        <div class="action-buttons">
          <span v-if="usedProviderInfo" class="provider-info">{{ usedProviderInfo }}</span>
          <button v-if="query" @click="retryExplanation" class="retry-button">
            <i class="i-mdi-refresh"></i>
          </button>
          <button @click="saveExplanation" class="save-button">保存</button>
        </div>
      </div>
      <div v-else class="no-explanation">
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

.model-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.model-label {
  font-size: 0.9rem;
  color: #666;
}

.model-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #000;
  background: #fff;
  font-family: "Courier New", monospace;
  font-size: 0.85rem;
  cursor: pointer;
}

.model-select:focus {
  outline: none;
  border-color: #000;
  background: #f9f9f9;
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
</style>
