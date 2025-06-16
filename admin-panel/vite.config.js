import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
      port: 1234,       // Set the port to 3000
     // strictPort: true, // Fail if the port is already in use
    }
})
