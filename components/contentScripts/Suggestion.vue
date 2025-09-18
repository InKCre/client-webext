<template>
  <div
    class="suggestion relative p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors cursor-pointer flex flex-col gap-y1"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
    @click="applySuggestion"
  >
    <div class="original text-gray-700 text-sm">{{ original }}</div>
    <div class="replacement text-black font-medium text-sm">
      {{ replacement }}
    </div>
    <button
      v-show="isHovered"
      class="copy-btn absolute bottom-2 right-2 p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors cursor-pointer flex border-none"
      @click.stop="copyToClipboard"
      title="复制替换内容"
    >
      <i class="i-carbon-copy"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  original: string;
  replacement: string;
}>();

const emit = defineEmits<{
  apply: [text: string];
  copied: [];
}>();

const isHovered = ref(false);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.replacement);
    emit("copied");
  } catch (err) {
    console.error("复制失败:", err);
  }
};

const applySuggestion = () => {
  emit("apply", props.replacement);
};
</script>
