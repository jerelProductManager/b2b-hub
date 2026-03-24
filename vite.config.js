import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For a user/org GitHub Pages site (username.github.io),
// the base URL is "/" — no subdirectory needed.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
