import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.test.ts",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run dev -- --port 5173 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
    },
    {
      command: "node tests/pages-server.mjs",
      url: "http://127.0.0.1:5174/volleyball/",
      reuseExistingServer: true,
    },
  ],
  reporter: "list",
});
