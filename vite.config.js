import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// リポ名が sora-prompt-builder の例。あなたのリポ名に必ず合わせてください。
export default defineConfig({
  plugins: [react()],
  base: "/sora-prompt-builder/"
});
