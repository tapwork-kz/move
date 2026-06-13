import { defineConfig } from 'vite'
import { default as react } from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './' // Гарантирует правильные относительные пути к файлам при деплое
})
