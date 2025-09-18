import { defineConfig } from "unocss/vite";
import { presetWind3, presetAttributify, transformerDirectives } from "unocss";
import presetIcons from "@unocss/preset-icons";

export default defineConfig({
  presets: [presetWind3(), presetAttributify(), presetIcons()],
  transformers: [transformerDirectives()],
});
