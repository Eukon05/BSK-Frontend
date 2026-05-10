import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
        '/predict':'http://localhost:5000'
    }
  }
})