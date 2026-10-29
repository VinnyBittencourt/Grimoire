import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Portas configuráveis por ambiente (permite rodar uma segunda instância sem conflito)
const WEB_PORT = Number(process.env.GRIMOIRE_WEB_PORT ?? 3003)
const API = `http://127.0.0.1:${process.env.GRIMOIRE_API_PORT ?? 3005}`

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: WEB_PORT,
    proxy: { '/api': API, '/photos': API },
    watch: { ignored: ['**/data/**', '**/docs/livros/**'] },
  },
  test: {
    include: ['tests/**/*.test.{js,jsx}'],
    environment: 'node',
  },
})
