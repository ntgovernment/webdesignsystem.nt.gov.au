import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isComponentMode = mode === 'components'
  
  return {
    plugins: [react()],
    build: {
      outDir: isComponentMode ? 'dist/components' : 'dist',
      rollupOptions: isComponentMode ? {
        input: {
          'two-column': path.resolve(__dirname, 'src/components/TwoColumn/index.ts'),
          'theme-switcher': path.resolve(__dirname, 'src/components/ThemeSwitcher/index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      } : undefined,
      lib: isComponentMode ? {
        entry: {},
        formats: ['es', 'umd'],
        name: 'NTDesignSystem',
      } : undefined,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
