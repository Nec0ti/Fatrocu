import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env file in the root directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      // This plugin enables React support in Vite (e.g., JSX compilation).
      react()
    ],
    
    // This sets the base path for deployment. It's crucial for GitHub Pages.
    // It should match your repository name.
    base: '/Fatrocu/', 

    define: {
      // This makes the API key available in your app's code as `process.env.API_KEY`.
      // In your local .env file, you should have a variable like:
      // GEMINI_API_KEY=your_actual_api_key_here
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        // This sets up a convenient alias. You can use it to simplify import paths.
        // Example: import { Header } from '@/components/Header';
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
