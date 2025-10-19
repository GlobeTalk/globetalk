import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      external: ['cypress/**'],
      input: {
        main: resolve(__dirname, "index.html"),
        // add all the other static HTML pages you want copied into dist
        login: resolve(__dirname, "pages/login.html"),
        findPal: resolve(__dirname, "pages/findPal.html"),
        onboarding: resolve(__dirname, "pages/onboarding.html"),
        profile: resolve(__dirname, "pages/profile.html"),
        settings: resolve(__dirname, "pages/settings.html"),
        chats: resolve(__dirname, "pages/chats.html"),
        admin: resolve(__dirname, "pages/admin.html"),
        userdashboard: resolve(__dirname, "pages/userdashboard.html"),
        // add more entries as needed
      },
    },
  },
});
