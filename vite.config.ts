import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 设置基础路径，用于 GitHub Pages 部署
  // 仓库名: WordRPGGame
  base: process.env.CI ? '/WordRPGGame/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // 输出目录
    outDir: 'dist',
    // 生成 sourcemap 用于调试（生产环境可设置为 false）
    sourcemap: false,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // chunk 大小警告限制（KB）
    chunkSizeWarningLimit: 1000
  }
})
