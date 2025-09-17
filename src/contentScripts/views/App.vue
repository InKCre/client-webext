<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import "uno.css";
import ActionBar from "../components/ActionBar.vue";

const [showActionBar, toggleActionBar] = useToggle(false);
const actionBarPosition = ref({ x: 0, y: 0 });
const lastSelectionText = ref("");

const handleSelection = (event: MouseEvent) => {
  const selection = window.getSelection();
  const currentText = selection ? selection.toString().trim() : "";
  if (currentText && currentText !== lastSelectionText.value) {
    try {
      actionBarPosition.value = {
        x: event.clientX + 10,
        y: event.clientY + 10,
      };
      toggleActionBar(true);
      lastSelectionText.value = currentText;
    } catch (e) {
      // No valid range
      toggleActionBar(false);
      lastSelectionText.value = "";
    }
  }
};

const handleSelectionChange = () => {
  const selection = window.getSelection();
  const currentText = selection ? selection.toString().trim() : "";
  if (!currentText) {
    toggleActionBar(false);
    lastSelectionText.value = "";
  }
};

onMounted(() => {
  document.addEventListener("mouseup", handleSelection);
  document.addEventListener("selectionchange", handleSelectionChange);
});

onUnmounted(() => {
  document.removeEventListener("mouseup", handleSelection);
  document.removeEventListener("selectionchange", handleSelectionChange);
});
</script>

<template>
  <div
    v-show="showActionBar"
    class="fixed z-100"
    :style="{
      left: actionBarPosition.x + 'px',
      top: actionBarPosition.y + 'px',
    }"
  >
    <ActionBar />
  </div>
</template>
