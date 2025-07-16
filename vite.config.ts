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
            // Prevent Node.js modules from being bundled - use empty modules
            'twilio': 'data:text/javascript,export default {}',
            'events': 'data:text/javascript,export default {}',
            'fs': 'data:text/javascript,export default {}',
            'path': 'data:text/javascript,export default {}',
            'crypto': 'data:text/javascript,export default {}',
        }
    },
    optimizeDeps: {
        exclude: ['twilio']
    }
});


