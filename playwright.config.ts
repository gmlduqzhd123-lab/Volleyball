import { defineConfig } from "@playwright/test";
import { APP_PORT, APP_URL, BUILD_URL } from './tests/urls';
export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.test.ts",
  fullyParallel: false,
  use: {
    baseURL: APP_URL,
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: `npm run dev -- --port ${APP_PORT} --strictPort`,
      url: APP_URL,
      reuseExistingServer: process.env.VOLLEYBALL_REUSE_SERVER === '1',
    },
    {
      command: "node tests/pages-server.mjs",
      url: BUILD_URL,
      reuseExistingServer: process.env.VOLLEYBALL_REUSE_SERVER === '1',
    },
  ],
  reporter: "list",
});
