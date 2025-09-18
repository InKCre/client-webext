import { createApp } from "vue";
import Options from "./Options.vue";
import { setupApp } from "@/logic/common-setup";

const app = createApp(Options);
setupApp(app);
app.mount("#app");
