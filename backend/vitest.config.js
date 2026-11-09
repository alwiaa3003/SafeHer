import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    testTimeout: 30000,
    // The first run may download an in-memory MongoDB binary.
    hookTimeout: 300000,
  },
});
