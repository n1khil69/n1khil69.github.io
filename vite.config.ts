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
      output: {
        // split heavy vendors into cacheable chunks; `three` only loads via the
        // dynamic import in the WebGL module, so it never reaches lighter tiers.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/lenis')) return 'lenis';
        },
      },
    },
  },
})
