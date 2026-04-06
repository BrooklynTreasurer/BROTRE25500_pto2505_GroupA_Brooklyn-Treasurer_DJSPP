import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/**
 * Vite bundler configuration for the React app.
 * @type {import('vite').UserConfig}
 */
const config = {
  plugins: [react()],
}

export default defineConfig(config)
