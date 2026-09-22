import { defineConfig } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:4321',
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: 'npm run preview -- --port 4321 --ignore-lock',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: !process.env.CI,
      },
});
