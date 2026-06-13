import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/move/' // Обязательно для GitHub Pages, так как проект развернут в подпапке /move/
})
