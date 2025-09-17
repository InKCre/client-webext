<script setup lang="ts">
import { ref, watch } from "vue";
import { onMessage } from "webext-bridge/popup";
import BlockEditor from "~/components/block/editor.vue";
import ArcsEditor from "~/components/root/ArcsEditor.vue";
import { Block } from "~/logic/block";
import { ArcForm, StarGraphForm } from "~/logic/root";

const props = defineProps<{
  // 所在网页
  url?: string;
}>();
const emit = defineEmits<{ activate: [tab: string] }>();

const selectedText = ref("");
const form = ref(new StarGraphForm(new Block("text", "")));
const isFlashing = ref(false);

const incomingEditor = ref<typeof ArcsEditor>();
const outgoingEditor = ref<typeof ArcsEditor>();

watch(selectedText, (newText) => {
  if (newText) {
    form.value.block.content = newText;
    isFlashing.value = true;
    setTimeout(() => {
      isFlashing.value = false;
    }, 500);
  }
});

// watch props.url, update the webpage block
watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      const webpageArcIndex = form.value.in_relations.findIndex(
        (arc) => arc.relation.content === "节选"
      );

      if (webpageArcIndex !== -1) {
        // Update existing webpage block
        const webpageBlock =
          form.value.in_relations[webpageArcIndex].from_block?.block;
        if (webpageBlock) {
          webpageBlock.content = newUrl;
        }
      } else {
        // Add new webpage block
        form.value.in_relations.push(
          new ArcForm(
            { content: "节选" },
            null,
            new StarGraphForm(new Block("webpage", newUrl, "url"))
          )
        );
      }
    }
  }
);

onMessage("set-taking-note-params", ({ data, sender }) => {
  selectedText.value = data.text;
  emit("activate", "taking-note");
});

function handleKeydown(event: KeyboardEvent) {
  if (!event.altKey) {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      incomingEditor.value?.addArc();
    } else if (event.key === "Tab") {
      event.preventDefault();
      outgoingEditor.value?.addArc();
    }
  }
}

function submitText() {
  // 发送请求
  form.value
    .create()
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      // 处理成功响应
    })
    .catch((error) => {
      console.error("Error:", error);
      // 处理错误
    });
}
</script>

<template>
  <main
    class="bg-white flex flex-col p-4"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <div class="w-full flex flex-col">
      <!-- 第一行：入向关系及其 from block 编辑器 -->
      <ArcsEditor
        ref="incomingEditor"
        v-model="form.in_relations"
        type="incoming"
        relationType="y"
      />

      <!-- 第二行：主块编辑器 -->
      <BlockEditor
        v-model="form.block"
        placeholder="主块内容..."
        height="h-32"
        border-color="border-gray-300"
        :class="{ 'flash-border': isFlashing }"
        class="border-2 focus:border-gray-700"
      />

      <!-- 第三行：出向关系及其 to block 编辑器 -->
      <ArcsEditor
        ref="outgoingEditor"
        v-model="form.out_relations"
        type="outgoing"
        relationType="y"
      />

      <button
        @click="submitText"
        class="w-auto mt-4 py-2 px-4 bg-black text-white font-medium rounded-none hover:bg-gray-800 transition-all duration-300 shadow-none hover:shadow-none ml-auto"
      >
        Submit
      </button>
    </div>
  </main>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.pressed {
  background-color: #9ca3af !important;
  transform: scale(0.95);
  transition: all 0.2s ease;
}

.flash-border {
  animation: flash 0.5s ease-in-out;
}

@keyframes flash {
  0% {
    border-color: #6b7280;
  }
  50% {
    border-color: #ef4444;
  }
  100% {
    border-color: #6b7280;
  }
}
</style>
