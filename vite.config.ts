import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/parse-resume', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
              return;
            }

            let rawBody = '';
            req.on('data', (chunk) => {
              rawBody += chunk;
            });

            req.on('end', async () => {
              try {
                const currentEnv = loadEnv(mode, process.cwd(), '');
                process.env.GEMINI_API_KEYS =
                  currentEnv.GEMINI_API_KEYS ||
                  currentEnv.VITE_GEMINI_API_KEYS ||
                  process.env.GEMINI_API_KEYS ||
                  '';
                process.env.GEMINI_MODEL =
                  currentEnv.GEMINI_MODEL ||
                  currentEnv.VITE_GEMINI_MODEL ||
                  process.env.GEMINI_MODEL ||
                  '';

                const { default: handler } = await import('./api/parse-resume');

                const vReq = {
                  method: req.method,
                  body: rawBody ? JSON.parse(rawBody) : {},
                };

                const vRes = {
                  setHeader(name: string, value: string) {
                    res.setHeader(name, value);
                  },
                  status(code: number) {
                    res.statusCode = code;
                    return vRes;
                  },
                  json(data: unknown) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                };

                await handler(vReq, vRes);
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Dev server API error.';
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: message }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'supabase-vendor': ['@supabase/supabase-js'],
            'editor-vendor': [
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-underline',
              '@tiptap/extension-link',
            ],
            'icons-vendor': ['@tabler/icons-react'],
          },
        },
      },
    },
  };
});
