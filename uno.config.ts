import presetIcons from "@unocss/preset-icons";
import { presetAttributify, presetWind3, transformerDirectives } from "unocss";
import { defineConfig } from "unocss/vite";

export default defineConfig({
  presets: [presetWind3(), presetAttributify(), presetIcons()],
  transformers: [transformerDirectives()],
});
