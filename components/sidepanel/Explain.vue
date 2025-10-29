<script setup lang="ts">
import VueMarkdownRender from "vue-markdown-render";
import { onMessage, sendMessage } from "webext-bridge/popup";
import Loading from "~/components/common/loading.vue";
import ProviderPicker from "~/components/common/ProviderPicker.vue";
import { createExplainAgent } from "~/logic/agents";
import { llmProviders, selectedModel, defaultModel } from "~/logic/storage";
import { ArcForm, StarGraphForm } from "~/logic/root";
import { BlockForm } from "~/logic/block";
import { RelationForm } from "~/logic/relation";

const emit = defineEmits<{ activate: [tab: string] }>();

const explanation = ref<string>("");
const isLoading = ref<boolean>(false);
const query = ref<string>("");
const errorMessage = ref<string>("");
const usedProviderInfo = ref<string>("");

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
  
  try {
    // Use selected model or fall back to default
    const modelString = selectedModel.value || defaultModel.value;
    
    if (!modelString) {
      throw new Error("No model selected");
    }

    // Execute the explain agent
    const result = await explainAgent.execute({
      text: query.value,
      modelString,
      providers: llmProviders.value,
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
        <p v-if="!llmProviders?.some(p => p.apiKey)" class="config-hint">
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
