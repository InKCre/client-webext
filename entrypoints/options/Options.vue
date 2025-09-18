<script setup lang="ts">
import logo from "@/assets/inkcre.svg";
import { inkcreApi, stopwords } from "@/logic/storage";
import "uno.css";

// Computed property to handle stopwords array/string conversion
const stopwordsText = computed({
  get: () => (Array.isArray(stopwords.value) ? stopwords.value.join(", ") : ""),
  set: (value: string) => {
    const words = value
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
    stopwords.value = words;
  },
});
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <img :src="logo" class="icon-btn mx-2 text-2xl" alt="InKCre Logo" />

    <!-- Environment Variables Display -->
    <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Environment Variables</h3>
      <div class="text-left space-y-4">
        <div class="flex items-center space-x-2">
          <label for="inkcre-api" class="font-medium">INKCRE_API:</label>
          <input
            id="inkcre-api"
            v-model="inkcreApi"
            type="url"
            class="flex-1 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            placeholder="https://api.inkcre.com"
          />
        </div>

        <div class="space-y-2">
          <label for="stopwords" class="font-medium block"
            >Stopwords (comma-separated):</label
          >
          <textarea
            id="stopwords"
            v-model="stopwordsText"
            rows="6"
            class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
            placeholder="Enter stopwords separated by commas..."
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            These words will be excluded from writing suggestions. Changes are
            saved automatically.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
