import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(), // ИСПРАВЛЕНО: Сначала Tailwind сканирует App.jsx на наличие классов, и только потом React собирает код
    react()
  ],
  base: '/move/' 
});
