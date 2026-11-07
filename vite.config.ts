import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Enable network access for LAN testing (e.g., testing on phones)
    // Access at: http://<your-ip>:5173
    host: true,
    // Uncomment to use a specific port
    // port: 5173,
  },
})
