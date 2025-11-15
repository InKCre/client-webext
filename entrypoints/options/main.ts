import { createApp } from "vue";
import { setupApp } from "@/logic/common-setup";
import Options from "./Options.vue";

const app = createApp(Options);
setupApp(app);
app.mount("#app");
