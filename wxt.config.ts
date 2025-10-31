import { defineConfig } from "wxt";
import UnoCSS from "unocss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["storage"],
  },
  vite: () => ({
    plugins: [
      UnoCSS({
        configFile: "./uno.config.ts",
      }),
    ],
    build: {
      sourcemap: "inline",
    },
  }),
  webExt: {
    chromiumArgs: ["--remote-debugging-port=9222"],
  },
});
