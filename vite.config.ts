import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "./",
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            // Prevent Node.js modules from being bundled
            'twilio': false,
            'events': false,
            'fs': false,
            'path': false,
            'crypto': false,
        }
    },
    optimizeDeps: {
        exclude: ['twilio']
    }
});


