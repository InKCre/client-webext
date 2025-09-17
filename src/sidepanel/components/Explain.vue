<script setup lang="ts">
import VueMarkdownRender from "vue-markdown-render";
import { onMessage, sendMessage } from "webext-bridge/popup";
import { watch } from "vue";
import Loading from "~/components/common/loading.vue";
import { inkcreApi } from "~/logic/storage";

const emit = defineEmits<{ activate: [tab: string] }>();

const explanation = ref<string>("");
const isLoading = ref<boolean>(false);
const query = ref<string>("");
const contextBlockId = ref<number>();

onMessage("set-explain-params", ({ data }) => {
  query.value = data.text;
  contextBlockId.value = data.pageBlockId;
  emit("activate", "explain");
});

watch(query, () => {
  if (query.value) {
    fetchExplanation();
  }
});

const fetchExplanation = () => {
  isLoading.value = true;
  const url = new URL("/sink/rag", inkcreApi.value);
  url.searchParams.set(
    "query",
    encodeURIComponent(`结合语境，简单明了地解释：${query.value}`)
  );
  url.searchParams.set("retrieve_mode", "reasoning");
  if (contextBlockId.value) {
    url.searchParams.set("context_blocks", contextBlockId.value.toString());
  }
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      explanation.value = data.message;
      isLoading.value = false;
    })
    .catch((error) => {
      console.error("Error fetching explanation:", error);
      explanation.value = "Error fetching explanation.";
      isLoading.value = false;
    });
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
    </header>
    <main class="explain-content">
      <div v-if="isLoading" class="loading-indicator">
        <Loading />
      </div>
      <div v-else-if="explanation" class="explanation-text">
        <vue-markdown-render :source="explanation" />
        <div class="action-buttons">
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
  margin: 0;
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
