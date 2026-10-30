import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: 'test-only-not-a-real-secret',
      JWT_EXPIRES_IN: '2h',
    },
  },
});