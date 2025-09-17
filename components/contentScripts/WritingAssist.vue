<template>
  <div
    class="fixed bottom-4 right-6 flex flex-col gap-y2 items-end justify-end"
    style="width: 30vw; min-width: 200px; height: 60vh"
  >
    <div
      v-show="showAssist"
      class="bg-white rounded shadow-lg p-2 overflow-auto flex-1 w-full"
    >
      <div class="text-sm mb-2">写作建议：</div>
      <div v-if="suggestions.length > 0">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="mb-1 p-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
          @click="applySuggestion(suggestion)"
        >
          {{ suggestion }}
        </div>
      </div>
      <div v-else-if="isLoading" class="text-gray-500">加载中...</div>
      <div v-else class="text-gray-500">无建议</div>
    </div>
    <div
      class="cursor-pointer size-8 border-gray-300"
      @click="showAssist = !showAssist"
    >
      <img :src="logo" alt="Logo" class="size-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Root } from "~/logic/root";
import logo from "~/public/inkcre.svg";

const emit = defineEmits<{ apply: [text: string] }>();

const showAssist = ref(false);
const suggestions = ref<string[]>([]);
const isLoading = ref(false);
const currentElement = ref<HTMLElement | null>(null);
const editableElements = ref<HTMLElement[]>([]);

const fetchSuggestions = async (element: HTMLElement) => {
  const text = getTextFromElement(element);
  if (!text.trim()) return;

  isLoading.value = true;
  try {
    const result = await Root.RAG({
      query: `提供写作建议，将以下文本替换为更高级的版本：${text}`,
      retrieve_mode: "reasoning",
    });
    suggestions.value = [result];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
};

const applySuggestion = (suggestion: string) => {
  if (currentElement.value) {
    setTextToElement(currentElement.value, suggestion);
  }
};

const getTextFromElement = (element: HTMLElement): string => {
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    return (element as HTMLInputElement | HTMLTextAreaElement).value;
  } else if (element.contentEditable === "true") {
    return element.innerText;
  }
  return "";
};

const setTextToElement = (element: HTMLElement, text: string) => {
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    (element as HTMLInputElement | HTMLTextAreaElement).value = text;
  } else if (element.contentEditable === "true") {
    element.innerText = text;
  }
};

const scanEditableElements = () => {
  const inputs = document.querySelectorAll('input[type="text"], textarea');
  const contentEditables = document.querySelectorAll(
    '[contenteditable="true"]'
  );
  editableElements.value = Array.from(inputs).concat(
    Array.from(contentEditables)
  ) as HTMLElement[];
  editableElements.value.forEach((element) => {
    if (!element.hasAttribute("data-writing-assist")) {
      element.setAttribute("data-writing-assist", "true");
      element.addEventListener("focus", handleEditableFocus);
      //   element.addEventListener("input", handleEditableInput);
      //   element.addEventListener("blur", handleEditableBlur);
    }
  });
};

const handleEditableFocus = (event: Event) => {};

const showPanel = () => {
  showAssist.value = true;
  if (suggestions.value.length === 0 && currentElement.value) {
    fetchSuggestions(currentElement.value);
  }
};

onMounted(() => {
  scanEditableElements();
  // 动态监听新元素
  const observer = new MutationObserver(() => {
    scanEditableElements();
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
</script>
