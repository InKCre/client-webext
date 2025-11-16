<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { newTask } from "~/logic/task";
import { onNewTask } from "@/logic/task";
import Response from "~/components/ai/Response/Response.vue";
import ProviderPicker from "~/components/common/ProviderPicker/ProviderPicker.vue";
import { useExplainAgent } from "~/logic/explain";
import { defaultModel, llmProviders } from "~/logic/storage";
import { routeToTakingNote } from "~/entrypoints/sidepanel/router";

const query = ref<string>("");
const tabId = ref<number>();

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
      if (update.content !== undefined) explanation.value = update.content;
      if (update.isLoading !== undefined) isLoading.value = update.isLoading;
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
  try {
    if (!query.value) {
      throw new Error("Nothing to explain");
    } else {
      // The stream will handle page content retrieval internally
      await explainAgent.value.explain(query.value, tabId.value);
    }
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

const saveExplanation = async () => {
  // Create a Taking Note task with the generated explanation
  await newTask({
    type: "taking-note",
    parameters: { text: String(explanation.value || "") },
    from: "sidepanel",
  });
  // Open the dedicated Taking Note sidepanel page
  routeToTakingNote();
};

const saveQuery = (event: Event) => {
  const newText = (event.target as HTMLElement).innerText.trim();
  query.value = newText;
  // Auto-fetch when query changes
  if (newText) {
    fetchExplanation();
  }
};

watch(query, fetchExplanation, { immediate: true });

watch(selectedModel, fetchExplanation);

onNewTask("explain", (task) => {
  query.value = task.parameters.selectedText;
  tabId.value = task.sender.tabId;
});
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
        <p v-if="!llmProviders?.some((p) => p.apiKey)" class="config-hint">
          请在扩展选项中配置至少一个 LLM 提供商的 API Key。
        </p>
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
