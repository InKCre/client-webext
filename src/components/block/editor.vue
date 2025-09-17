<script setup lang="ts">
import { BlockForm } from "./index";

interface Props {
  modelValue: BlockForm;
  placeholder?: string;
  class?: string;
  height?: string;
  borderColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  class: "",
  height: "h-32",
  borderColor: "border-gray-300",
});

const textareaRef = ref<HTMLTextAreaElement>();

defineExpose({
  focus: (preventScroll: boolean) =>
    textareaRef.value?.focus({ preventScroll }),
  isFocusing: () => textareaRef.value === document.activeElement,
});
</script>

<template>
  <textarea
    ref="textareaRef"
    :value="modelValue.content"
    :placeholder="placeholder"
    :class="[
      'w-full bg-transparent rounded-lg p-3 text-black placeholder-black/50 focus:outline-none resize-none',
      props.height,
      `border ${props.borderColor}`,
      'focus:border-opacity-70',
      props.class,
    ]"
  ></textarea>
</template>
