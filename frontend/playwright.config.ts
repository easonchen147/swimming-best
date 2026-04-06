import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3001",
    launchOptions: {
      executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    },
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "cmd /c \"set NEXT_PUBLIC_E2E_BYPASS_AUTH=1&& npm run dev -- --hostname 127.0.0.1 --port 3001\"",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:3001",
  },
});
