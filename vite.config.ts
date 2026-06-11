import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: { port: 5173, host: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      input: {
        main: 'index.html',
        notFound: '404.html',
      },
    },
  },
})
