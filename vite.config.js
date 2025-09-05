import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/sora-prompt-builder/" // ← GitHub Pages のサブパス（リポ名）に合わせる
});
