import { useWebExtensionStorage } from "~/composables/useWebExtensionStorage";

// INKCRE_API storage with default from environment variable
export const { data: inkcreApi, dataReady: inkcreApiReady } =
  useWebExtensionStorage(
    "inkcre-api",
    import.meta.env.VITE_INKCRE_API || "https://api.inkcre.com"
  );
