import { defineConfig, loadEnv } from 'vite';
import { randomBytes } from 'node:crypto';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';
import { verifyGoogleCredential, verifySession, signSession } from './utils/jwt';
import { DEFAULT_MODEL } from './services/ai/core';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Signing key for the dev server's local stand-ins for the edge functions.
  // Prefer the real AUTH_SECRET; otherwise derive one per process, so a fresh
  // clone still works offline without a fixed string living in the repo that
  // anyone could use to forge a session against a running dev server. Sessions
  // therefore do not survive a dev-server restart, which is the intent.
  const DEV_AUTH_SECRET = env.AUTH_SECRET || randomBytes(32).toString('hex');

  // /api/auth-dev issues a session with no credential at all, so it must only
  // ever answer this machine. Without this, `vite --host` puts it, and the
  // Gemini proxy sitting behind it, on the local network.
  const isLoopback = (req: { socket: { remoteAddress?: string | null } }): boolean => {
    const addr = req.socket.remoteAddress || '';
    return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
  };

  // The one canonical dev origin. Google matches the JavaScript origin exactly
  // (scheme, host and port), so the port must not move: unpinned, Vite silently
  // steps to 5174 when 5173 is busy and `open: true` then lands you on an origin
  // that was never registered, with no warning anywhere. strictPort makes that
  // refuse to start instead. `localhost` is the canonical host because that is
  // what Vite opens; note that on macOS it resolves to ::1, so a server bound
  // this way answers localhost and [::1] but NOT 127.0.0.1.
  const DEV_PORT = 5173;
  const DEV_ORIGIN = `http://localhost:${DEV_PORT}`;

  return {
    server: {
      open: true,
      port: DEV_PORT,
      strictPort: true,
    },
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
          // Report the sign-in setup at startup.
          //
          // A rejected JavaScript origin fails inside Google's own iframe, before
          // any callback runs, so utils/googleAuth.ts and Gatekeeper.tsx never
          // hear about it. Google's error page names the problem ("Error 400:
          // origin_mismatch") but never the origin it actually saw. The result is
          // a broken sign-in with no diagnosable signal on any surface we own,
          // which cost a long session on 2026-09-20. Printing the origin here
          // makes it a two-second read instead.
          server.httpServer?.once('listening', () => {
            const mark = (v: unknown) => (v ? '✓' : '✗ missing');
            const id = env.VITE_GOOGLE_CLIENT_ID;
            const shortId = id ? `${id.slice(0, 18)}…` : 'not set';
            server.config.logger.info(
              `\n  ▸ Google sign-in` +
              `\n    Origin to register: ${DEV_ORIGIN}` +
              `\n    Google Cloud Console → Credentials → your client → Authorized JavaScript origins.` +
              `\n    Must match exactly, including the port. Changes take 5 min to a few hours.` +
              `\n    client ${shortId}  ·  AUTH_SECRET ${mark(env.AUTH_SECRET)}  ·  OAUTH_ALLOWED_DOMAINS ${mark(env.OAUTH_ALLOWED_DOMAINS)}` +
              `\n    Sign-in blocked? Use the dev bypass button on the gate, and check the origin above first.\n`,
            );
          });

          // Ensure /chem and /chem/ serve public/chem/index.html instead of falling back to the root SPA index.html
          server.middlewares.use((req, res, next) => {
            const path = req.url ? req.url.split('?')[0] : '';
            if (path === '/chem' || path === '/chem/') {
              const query = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
              req.url = '/chem/index.html' + query;
            }
            if (path === '/physics' || path === '/physics/') {
              const query = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
              req.url = '/physics/index.html' + query;
            }
            next();
          });

          server.middlewares.use('/api/auth-dev', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }
            if (!isLoopback(req)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'The dev sign-in bypass only answers localhost.' }));
              return;
            }

            try {
              const authSecret = DEV_AUTH_SECRET;
              const allowedDomainsEnv = env.OAUTH_ALLOWED_DOMAINS || 'sas.edu.sg';
              const domain = allowedDomainsEnv.split(',').map((d: string) => d.trim().toLowerCase()).filter(Boolean)[0] || 'sas.edu.sg';

              const session = await signSession(domain, authSecret);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok', session }));
            } catch (e) {
              console.error('Local dev bypass authentication error:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to mint local dev session token.' }));
            }
          });

          server.middlewares.use('/api/auth-google', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const { credential } = JSON.parse(body);
                const clientId = env.VITE_GOOGLE_CLIENT_ID;
                const authSecret = DEV_AUTH_SECRET;
                const allowedDomainsEnv = env.OAUTH_ALLOWED_DOMAINS;

                if (!clientId || !authSecret || !allowedDomainsEnv || allowedDomainsEnv.trim() === '') {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Server misconfiguration: Google sign-in is not fully configured. Add VITE_GOOGLE_CLIENT_ID, AUTH_SECRET, and OAUTH_ALLOWED_DOMAINS to .env.local.' }));
                  return;
                }

                const allowedDomains = allowedDomainsEnv.split(',').map((d: string) => d.trim().toLowerCase()).filter((d: string) => d !== '');
                const allowedEmails = (env.OAUTH_ALLOWED_EMAILS ?? '')
                  .split(',').map((e: string) => e.trim().toLowerCase()).filter((e: string) => e !== '');

                const profile = await verifyGoogleCredential(credential, clientId);

                if (!profile.emailVerified) {
                  res.statusCode = 401;
                  res.end(JSON.stringify({ error: 'Your Google account email is not verified.' }));
                  return;
                }

                const email = profile.email.toLowerCase();
                const domain = email.split('@')[1];
                const domainAllowed = !!domain && allowedDomains.includes(domain);
                const emailAllowed = allowedEmails.includes(email);

                if (!domainAllowed && !emailAllowed) {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ error: `Sign-in is restricted to approved school Google accounts. "${domain || 'your account'}" is not on the approved list.` }));
                  return;
                }

                const session = await signSession(domain, authSecret);
                res.statusCode = 200;
                res.end(JSON.stringify({ status: 'ok', session }));
              } catch (e) {
                console.error('Google auth verification failed', e);
                res.statusCode = 401;
                res.end(JSON.stringify({ error: 'Could not verify Google sign-in. Please try again.' }));
              }
            });
          });

          server.middlewares.use('/api/verify', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const { oauthSession } = JSON.parse(body);
                const authSecret = DEV_AUTH_SECRET;

                if (!authSecret || !oauthSession || !(await verifySession(oauthSession, authSecret))) {
                  res.statusCode = 401;
                  res.end(JSON.stringify({ error: 'Unauthorized' }));
                  return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({ status: 'ok' }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Bad Request' }));
              }
            });
          });

          server.middlewares.use('/api/gemini', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                if (!body) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'No body provided' }));
                  return;
                }
                const { model, contents, config } = JSON.parse(body);

                // --- SECURITY CHECK (GOOGLE OAUTH SESSION) ---
                const authSecret = DEV_AUTH_SECRET;
                const sessionHeader = req.headers['x-oauth-session'];

                if (!authSecret || !sessionHeader || !(await verifySession(sessionHeader as string, authSecret))) {
                  res.statusCode = 401;
                  res.end(JSON.stringify({ error: 'Unauthorized: Please sign in again' }));
                  return;
                }

                // --- API CALL ---
                const apiKey = env.GEMINI_API_KEY;
                if (!apiKey) {
                  console.error("Missing GEMINI_API_KEY in environment variables.");
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Server configuration error: Missing API Key' }));
                  return;
                }

                const ai = new GoogleGenAI({ apiKey });

                try {
                  const geminiStream = await ai.models.generateContentStream({
                    model: model || DEFAULT_MODEL,
                    contents: contents,
                    config: config
                  });

                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.setHeader('Transfer-Encoding', 'chunked');

                  for await (const chunk of geminiStream) {
                    const text = chunk.text;
                    if (text) {
                      res.write(text);
                    }
                  }
                  res.end();
                } catch (apiError) {
                  console.error("Gemini SDK Error:", apiError);
                  // If headers sent, we can't change status, just end
                  if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: apiError instanceof Error && apiError.message ? apiError.message : "Upstream AI Error" }));
                  }
                }

              } catch (error) {
                console.error("Middleware Error:", error);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error instanceof Error && error.message ? error.message : 'Internal Middleware Error' }));
                }
              }
            });
          });
        }
      }
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            mermaid: ['mermaid'],
            charts: ['recharts'],
            genai: ['@google/genai'],
            pdf: ['jspdf', 'html2canvas'],
            math: ['katex'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});