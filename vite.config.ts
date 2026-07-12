import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // preview.html must be a real build entry (not a public/ file copied verbatim) so its
      // `<script type="module" src="/src/preview/previewEntry.ts">` gets bundled and its src
      // rewritten to the built asset path — otherwise that path 404s in production and the
      // browser gets an HTML error page back instead of JS ("Expected a JavaScript module").
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'preview.html'),
      },
    },
  },
})
