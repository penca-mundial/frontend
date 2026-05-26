import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Extends the Vite config (plugins, `@/` alias) with the test environment.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      // Phase 0 ships the harness without any tests yet.
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: [
          'src/test/**',
          'src/main.tsx',
          '**/*.d.ts',
          '**/*.config.{ts,js}',
        ],
      },
    },
  }),
)
