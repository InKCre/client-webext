<script setup lang="ts">
import { onMessage } from "webext-bridge/popup";
import TakingNote from "@/components/sidepanel/TakingNote.vue";
import Explain from "@/components/sidepanel/Explain.vue";

const activeTab = ref("taking-note");
const url = ref<string>();

onMessage("set-sidepanel-params", ({ data }) => {
  activeTab.value = data.mode;
  url.value = data.url;
});
</script>

<template>
  <div class="tabs">
    <div class="tab-buttons">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'taking-note' }"
        @click="activeTab = 'taking-note'"
      >
        Taking Note
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'explain' }"
        @click="activeTab = 'explain'"
      >
        Explain
      </button>
    </div>
    <div class="tab-content">
      <TakingNote
        v-show="activeTab === 'taking-note'"
        :url="url"
        @activate="activeTab = $event"
      />
      <Explain
        v-show="activeTab === 'explain'"
        @activate="activeTab = $event"
      />
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.tab-button {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  border-bottom-color: #007acc;
}

.tab-content {
  flex: 1;
  overflow: auto;
}
</style>
