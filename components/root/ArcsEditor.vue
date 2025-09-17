<script setup lang="ts">
import { ref, nextTick, withDefaults } from "vue";
import ArcEditor from "~/components/root/ArcEditor.vue";
import { ArcForm, StarGraphForm } from "~/logic/root";
import { Block } from "~/logic/block";

const props = withDefaults(
  defineProps<{
    modelValue: ArcForm[];
    type: "incoming" | "outgoing";
    relationType?: "x" | "y";
  }>(),
  { relationType: "x" }
);

const container = ref<HTMLDivElement>();
const index = ref(0);
const prevButton = ref<HTMLButtonElement>();
const nextButton = ref<HTMLButtonElement>();
const arcEditors = ref<InstanceType<typeof ArcEditor>[]>([]);

function addArc() {
  const newBlock = new Block("text", "");
  const newArc = new ArcForm(
    { content: "" },
    props.type === "incoming" ? null : new StarGraphForm(newBlock),
    props.type === "incoming" ? new StarGraphForm(newBlock) : null
  );
  props.modelValue.push(newArc);
  // const newValue = [...props.modelValue, newArc];
  // emit("update:modelValue", newValue);
  nextTick(() => {
    index.value = props.modelValue.length - 1;
    scrollTo();
  });
}

function prev() {
  if (index.value > 0) {
    index.value--;
    scrollTo();
    prevButton.value?.classList.add("pressed");
    setTimeout(() => prevButton.value?.classList.remove("pressed"), 200);
  } else {
    prevButton.value?.classList.add("shake");
    setTimeout(() => prevButton.value?.classList.remove("shake"), 500);
  }
}

function next() {
  if (index.value < props.modelValue.length - 1) {
    index.value++;
    scrollTo();
    nextButton.value?.classList.add("pressed");
    setTimeout(() => nextButton.value?.classList.remove("pressed"), 200);
  } else {
    addArc();
    nextButton.value?.classList.add("pressed");
    setTimeout(() => nextButton.value?.classList.remove("pressed"), 200);
  }
}

function scrollTo() {
  if (container.value) {
    const children = container.value.children;
    if (children[index.value]) {
      children[index.value].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      nextTick(() => {
        arcEditors.value[index.value]?.focusBlock(true);
      });
    }
  }
}

function handleKeydown(event: KeyboardEvent) {
  const isBlockEditorFocused = arcEditors.value.some((editor) =>
    editor?.isFocusing()
  );
  if (!isBlockEditorFocused) return;

  if (event.altKey && event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      prev();
    } else {
      next();
    }
  }

  if (event.shiftKey && event.key === "Backspace") {
    event.preventDefault();
    if (props.modelValue.length > 0) {
      const newValue = props.modelValue.filter((_, i) => i !== index.value);
      // emit("update:modelValue", newValue);
      if (index.value >= newValue.length) {
        index.value = Math.max(0, newValue.length - 1);
      }
      scrollTo();
    }
  }

  if (event.shiftKey && event.key === "Delete") {
    event.preventDefault();
    if (props.modelValue.length > 0) {
      props.modelValue.splice(index.value, 1);
      if (index.value >= props.modelValue.length) {
        index.value = Math.max(0, props.modelValue.length - 1);
      }
      scrollTo();
    }
  }
}

defineExpose({ addArc, prev, next });
</script>

<template>
  <div
    :class="[
      'flex',
      type === 'incoming' ? 'flex-col-reverse' : 'flex-col',
      'gap-y-2',
    ]"
  >
    <div
      ref="container"
      class="flex flex-row overflow-x-auto items-center scrollbar-hide"
      tabindex="0"
      @keydown="handleKeydown"
    >
      <div
        v-for="(arc, index) in props.modelValue"
        :key="type + index.toString()"
        class="flex flex-col items-center flex-shrink-0 w-full"
      >
        <ArcEditor
          ref="arcEditors"
          :modelValue="arc"
          :type="type"
          :relationType="relationType"
        />
      </div>
    </div>
    <div
      v-if="props.modelValue.length > 1"
      class="flex justify-between items-center"
    >
      <span class="text-gray-600"
        >{{ index + 1 }}/{{ props.modelValue.length }}</span
      >
      <div class="flex space-x-1">
        <button
          ref="prevButton"
          @click="prev"
          class="w-12 h-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded"
          :disabled="index <= 0"
        >
          &larr;
        </button>
        <button
          ref="nextButton"
          @click="next"
          class="w-12 h-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded"
        >
          &rarr;
        </button>
      </div>
    </div>
  </div>
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

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}
</style>
