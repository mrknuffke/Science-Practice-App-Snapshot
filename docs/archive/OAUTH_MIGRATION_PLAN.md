# Migration Plan: Replace Classroom Code with Google OAuth (Workspace Domain-Restricted)

**Audience for this document:** an implementing engineer/agent with no prior context on this conversation. Everything needed to execute this migration is below — exact file contents for new files, exact before/after text for edited files, and the manual (non-code) setup steps required before this can be deployed.

**Goal:** Replace the classroom-code gate entirely with Google Sign-In restricted to specific Workspace email domains (e.g. `sas.edu.sg`, extensible to more domains via an env var, no code changes needed to add a domain later). There is **no fallback to a class code** — once this ships, Google sign-in is the only way into the app. Free interactive simulations remain accessible with no sign-in at all, unchanged.

**Repo root:** `/Users/davidknuffke/Documents/Programming/SciencePracticeApp`

---

## 0. Why this design (read before implementing)

This is a Vite SPA (not Next.js) deployed on Vercel using Vercel Edge Functions in `/api`. There is no database and no real user-accounts system — per `CLAUDE.md`, this is intentional ("no backend/accounts for privacy") and there's a hard rule: **never store PII in localStorage**. The OAuth mechanism below preserves that spirit: it proves "this is a real Google account from an approved school domain" and stores nothing more identifying than that domain string, client-side.

**Sign-in method:** Google Identity Services (GIS) — the modern "Sign In With Google" JS button. It uses an ID-token flow: no client secret, no redirect/callback route, just a public Client ID and a list of allowed origins registered in Google Cloud Console. This is far simpler than porting a framework-specific library like NextAuth (used in a sibling Next.js project) into a Vite SPA that can't run it.

**High-level flow:**
1. Gatekeeper renders a Google Sign-In button.
2. User picks their school Google account → GIS hands the browser a signed ID token (JWT).
3. Browser POSTs that token to a new endpoint, `api/auth-google.ts`.
4. Server verifies the token is genuinely from Google (signature check against Google's public keys) and that the account's email domain is in `OAUTH_ALLOWED_DOMAINS` (comma-separated env var — add more domains later without touching code).
5. Server mints its **own** small signed session token (contains only the verified domain — never the email or name, since JWTs are signed but not encrypted, and this is a shared-device/school-Chromebook context) and returns it.
6. Browser stores that opaque token and sends it on every subsequent request, replacing today's classroom-code header.

This keeps the actual per-AI-request authorization check fast and local (no outbound call to Google on every AI call — Google is only contacted once, at login).

**Important DX tradeoff, intentional:** Today, local development (`npm run dev`) lets you type *any* string as a class code and get in, because the dev-server middleware skips real verification on localhost. After this migration, **local development requires the same real Google OAuth setup as production** (the manual setup below includes registering `http://localhost:5173` as an allowed origin specifically for this reason). There is no "bypass button." This is deliberate — the whole point of this migration is to stop having a soft, guessable gate. Once Google Cloud OAuth is configured (a one-time, ~10 minute setup), signing in locally is a single click and the session persists for 90 days, so this is a one-time cost, not ongoing friction.

---

## 1. Manual setup steps (do these BEFORE writing any code — deployment order matters)

Because there is no fallback once class code is removed, **Google OAuth must be fully configured and verified working before the code that removes the class code path is merged/deployed.** If you deploy the code changes below without first completing this section, users (including you) will be locked out with no way in.

### 1a. Google Cloud Console

1. Go to console.cloud.google.com. Use an existing project or create a new one for this app.
2. APIs & Services → Credentials → **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Authorized JavaScript origins — add both:
   - `https://sciencepractice.app` (confirmed production domain)
   - `http://localhost:5173` (Vite's default dev port for this project — confirmed no custom port override in `vite.config.ts`)
5. Leave "Authorized redirect URIs" blank — this flow doesn't use one.
6. Create it. Copy the generated **Client ID** (looks like `xxxxxxxxxx.apps.googleusercontent.com`). Ignore any client-secret field — it's not used.
7. **Known limitation:** Vercel Preview deployments get random `*.vercel.app` URLs per PR. Google doesn't support wildcard origins, so the Google button will not initialize on Preview URLs unless each one is manually added (impractical). This is expected — treat "Google button doesn't render on a PR preview link" as normal, not a bug. Test auth changes against `localhost` or Production.

### 1b. Vercel dashboard → Project Settings → Environment Variables

Add these three (Production scope at minimum; add Preview too if desired, understanding the limitation above):

| Variable | Value |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | the Client ID from step 1a |
| `OAUTH_ALLOWED_DOMAINS` | `sas.edu.sg` (comma-separate more later, e.g. `sas.edu.sg,otherschool.edu` — no redeploy of code needed, just edit this value and redeploy) |
| `AUTH_SECRET` | a random secret — generate with `openssl rand -base64 32` in a terminal, paste the output |

**Do not add `GOOGLE_CLIENT_SECRET` anywhere — it isn't used by this flow.**
**Never prefix `AUTH_SECRET` or `OAUTH_ALLOWED_DOMAINS` with `VITE_`** — that would ship them into the public JS bundle. Only `VITE_GOOGLE_CLIENT_ID` gets that prefix (Client IDs aren't secret; the prefix is what makes Vite expose the value to browser code — server-side edge functions read `process.env.VITE_GOOGLE_CLIENT_ID` too, since Vercel exposes every dashboard variable to `process.env` server-side regardless of prefix).

After adding these, trigger a redeploy — existing deployments don't pick up new env vars retroactively.

### 1c. Local `.env.local`

Add the same three lines (with your own values) to the project's local `.env.local` file (already gitignored — confirmed via `.gitignore` lines 72-76/123). A new `.env.local.example` (with empty placeholders, no real values) is added to the repo as part of this migration — see §4.

Once this is done, verify locally: run `npm run dev`, confirm the Gatekeeper shows a working Google button, and that signing in with an allowed-domain account gets you into the app before proceeding to remove any code.

---

## 2. New dependency

Add to `package.json` `dependencies` (insert alphabetically, between `"html2canvas"` and `"jspdf"`):

```json
    "jose": "^5.9.6",
```

Why pinned explicitly: `jose` is currently only present in `node_modules` as a transitive dependency of the `vercel` devDependency. Relying on that transitive copy is fragile — if `vercel`'s own dependency tree changes, it could silently disappear and break both the edge functions and the Vite dev middleware. `jose` handles both verifying Google's ID tokens (RS256, remote JWKS) and signing/verifying our own session tokens (HS256) — it's small and works in both the Edge runtime and plain Node (used by the Vite dev middleware).

After editing `package.json`, run `npm install`.

---

## 3. New shared helper: `utils/jwt.ts`

This is imported by `api/auth-google.ts`, `api/verify.ts`, `api/gemini.ts` (all Edge functions), and by `vite.config.ts` (plain Node, `vite dev`). Keeping the JWT logic in exactly one place means it can't drift between those four call sites.

Create `utils/jwt.ts`:

```ts
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
}

/**
 * Verifies a Google Identity Services ID token (the `credential` string handed
 * to the browser by the Sign In With Google button) against Google's public keys.
 * Throws if the signature, issuer, audience, or expiry don't check out.
 */
export async function verifyGoogleCredential(credential: string, clientId: string): Promise<GoogleProfile> {
  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId,
  });

  const email = typeof payload.email === 'string' ? payload.email : '';
  const emailVerified = payload.email_verified === true;

  if (!email) {
    throw new Error('Google token did not include an email address');
  }

  return { email, emailVerified };
}

function getSecretKey(authSecret: string): Uint8Array {
  return new TextEncoder().encode(authSecret);
}

/**
 * Mints our own session token after a successful Google verification.
 * Payload intentionally contains ONLY the verified domain — never email or
 * name — since JWTs are signed, not encrypted, and this app runs on shared
 * school devices. Anyone with local device access can base64-decode the
 * payload; it must never be able to identify the specific user.
 */
export async function signSession(domain: string, authSecret: string): Promise<string> {
  return new SignJWT({ dom: domain })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(getSecretKey(authSecret));
}

/** Verifies a session token minted by signSession. Returns false on any failure (expired, tampered, wrong secret). */
export async function verifySession(token: string, authSecret: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey(authSecret));
    return true;
  } catch {
    return false;
  }
}
```

---

## 4. New file: `api/auth-google.ts`

The login-exchange endpoint. Mirrors the shape of the current `api/verify.ts` (Edge runtime, same response conventions). This endpoint **always performs real verification** — no local-dev bypass — since verification is its entire purpose.

```ts
import { verifyGoogleCredential, signSession } from '../utils/jwt';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const authSecret = process.env.AUTH_SECRET;
  const allowedDomainsEnv = process.env.OAUTH_ALLOWED_DOMAINS;

  if (!clientId || !authSecret || !allowedDomainsEnv || allowedDomainsEnv.trim() === '') {
    return new Response(JSON.stringify({ error: 'Server misconfiguration: Google sign-in is not fully configured.' }), { status: 500 });
  }

  const allowedDomains = allowedDomainsEnv.split(',').map(d => d.trim().toLowerCase()).filter(d => d !== '');

  try {
    const { credential } = await req.json();
    if (!credential || typeof credential !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing credential' }), { status: 400 });
    }

    const profile = await verifyGoogleCredential(credential, clientId);

    if (!profile.emailVerified) {
      return new Response(JSON.stringify({ error: 'Your Google account email is not verified.' }), { status: 401 });
    }

    const domain = profile.email.split('@')[1]?.toLowerCase();
    if (!domain || !allowedDomains.includes(domain)) {
      return new Response(JSON.stringify({ error: `Sign-in is restricted to approved school Google accounts. "${domain || 'your account'}" is not on the approved list.` }), { status: 403 });
    }

    const session = await signSession(domain, authSecret);
    return new Response(JSON.stringify({ status: 'ok', session }), { status: 200 });
  } catch (e) {
    console.error('Google auth verification failed', e);
    return new Response(JSON.stringify({ error: 'Could not verify Google sign-in. Please try again.' }), { status: 401 });
  }
}
```

---

## 5. Rewrite `api/verify.ts`

Its old job (validate a submitted class code) is gone — `api/auth-google.ts` now owns login. Its remaining job is what `App.tsx` calls on every page load to silently re-check a *stored* session (e.g. it may have expired, or its domain may have been removed from `OAUTH_ALLOWED_DOMAINS`). Replace the entire file contents with:

```ts
import { verifySession } from '../utils/jwt';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { oauthSession } = await req.json();
    const authSecret = process.env.AUTH_SECRET;

    const host = req.headers.get('host') || '';
    const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV === 'development';

    if (isLocalDev) {
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    }

    if (!authSecret || !oauthSession || !(await verifySession(oauthSession, authSecret))) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired session' }), { status: 401 });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
  }
}
```

(This file's `isLocalDev` bypass only matters if this Edge function is ever hit directly via `vercel dev` or a deployed-but-localhost-hostname scenario — the primary `npm run dev` workflow goes through the Vite middleware in §8 instead, which has no such bypass by design; see §0.)

---

## 6. Modify `api/gemini.ts`

Replace the class-code security check (current lines 14-27) with a session check. Full new file:

```ts

import { GoogleGenAI } from "@google/genai";
import { verifySession } from "../utils/jwt";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    // --- SECURITY CHECK (GOOGLE OAUTH SESSION) ---
    const authSecret = process.env.AUTH_SECRET;
    const sessionHeader = req.headers.get('x-oauth-session');

    const host = req.headers.get('host') || '';
    const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV === 'development';

    if (!isLocalDev) {
      if (!authSecret || !sessionHeader || !(await verifySession(sessionHeader, authSecret))) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Please sign in again' }), { status: 401 });
      }
    }

    const { model, contents, config } = await req.json();

    // Initialize GoogleGenAI with the key from the SERVER environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use generateContentStream instead of generateContent
    // This allows us to send chunks back immediately, preventing Vercel timeouts
    const geminiStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: config
    });

    // Create a ReadableStream to pipe the text chunks to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of geminiStream) {
            // chunk is a GenerateContentResponse object
            // The .text property is a getter that extracts the text
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (e) {
          console.error("Streaming error", e);
          controller.error(e);
        }
      },
    });

    // Return the stream as text/plain
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('Gemini API Setup Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
```

---

## 7. `index.html`

Add the Google Identity Services script tag in `<head>`, right after the existing service-worker-unregister `<script>` block (ends around line 39):

```html
    <!-- Google Identity Services (Sign In With Google) -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## 8. Rewrite `vite.config.ts`

Replace the whole file. This mirrors §5/§6 in the hand-written dev middleware (Vercel Edge Functions don't run under plain `vite dev`, hence the duplication — same reason the original file duplicated the class-code logic). Note there's no `isLocalDev` special-casing needed here: this middleware only ever runs locally by definition, and per §0 it performs the *real* checks, matching production behavior exactly.

```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';
import { verifyGoogleCredential, verifySession, signSession } from './utils/jwt';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      open: true
    },
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
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
                const authSecret = env.AUTH_SECRET;
                const allowedDomainsEnv = env.OAUTH_ALLOWED_DOMAINS;

                if (!clientId || !authSecret || !allowedDomainsEnv || allowedDomainsEnv.trim() === '') {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Server misconfiguration: Google sign-in is not fully configured. Add VITE_GOOGLE_CLIENT_ID, AUTH_SECRET, and OAUTH_ALLOWED_DOMAINS to .env.local.' }));
                  return;
                }

                const allowedDomains = allowedDomainsEnv.split(',').map((d: string) => d.trim().toLowerCase()).filter((d: string) => d !== '');

                const profile = await verifyGoogleCredential(credential, clientId);

                if (!profile.emailVerified) {
                  res.statusCode = 401;
                  res.end(JSON.stringify({ error: 'Your Google account email is not verified.' }));
                  return;
                }

                const domain = profile.email.split('@')[1]?.toLowerCase();
                if (!domain || !allowedDomains.includes(domain)) {
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
                const authSecret = env.AUTH_SECRET;

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
                const authSecret = env.AUTH_SECRET;
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
                    model: model,
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
                } catch (apiError: any) {
                  console.error("Gemini SDK Error:", apiError);
                  // If headers sent, we can't change status, just end
                  if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: apiError.message || "Upstream AI Error" }));
                  }
                }

              } catch (error: any) {
                console.error("Middleware Error:", error);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message || 'Internal Middleware Error' }));
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
            three: ['@react-three/fiber', '@react-three/drei', 'three'],
            charts: ['recharts'],
            genai: ['@google/genai', '@google/generative-ai'],
          },
        },
      },
    },
  };
});
```

---

## 9. New file: `utils/googleAuth.ts`

Thin, defensively-coded wrapper around the GIS global (`window.google`), which only exists once the async script tag from §7 finishes loading — every function here must tolerate it being undefined.

```ts
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfiguration {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

let initialized = false;

export function isGoogleSignInConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

export function initGoogleSignIn(onCredential: (credential: string) => void): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const accountsId = window.google?.accounts?.id;
  if (!clientId || !accountsId || initialized) return;

  accountsId.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
  });
  initialized = true;
}

export function renderGoogleButton(container: HTMLElement): void {
  const accountsId = window.google?.accounts?.id;
  if (!accountsId) return;

  container.innerHTML = '';
  accountsId.renderButton(container, {
    theme: 'outline',
    size: 'large',
    width: 320,
    text: 'signin_with',
    shape: 'pill',
  });
}
```

---

## 10. Rewrite `components/Gatekeeper.tsx`

Replaces the class-code form with the Google button, and rewords the help panel from "how to find your class code" to "how to sign in." **Copy note:** the help-panel wording below is a functional draft — the project owner may want to adjust the exact phrasing after reviewing it (this is user-facing copy, not just plumbing), but it should be technically complete/working as written.

Full new file:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import ContactModal from './ContactModal';
import { initGoogleSignIn, isGoogleSignInConfigured, renderGoogleButton } from '../utils/googleAuth';

interface GatekeeperProps {
  onGoogleUnlock: (sessionToken: string) => void;
  onShowHowItWorks?: () => void;
  onOpenFeatures?: () => void;
  onOpenTeachers?: () => void;
  onOpenSupport?: () => void;
  onFeedback?: () => void;
  onOpenSimulations?: () => void;
  onOpenChangelog?: () => void;
}

const Gatekeeper: React.FC<GatekeeperProps> = ({
  onGoogleUnlock,
  onShowHowItWorks,
  onOpenFeatures,
  onOpenTeachers,
  onOpenSupport,
  onFeedback,
  onOpenSimulations,
  onOpenChangelog,
}) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const configured = isGoogleSignInConfigured();

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;

    const handleCredential = async (credential: string) => {
      setIsVerifying(true);
      setError(null);
      try {
        const response = await fetch('/api/auth-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.session) {
          onGoogleUnlock(data.session);
        } else {
          setError(data.error || "We couldn't verify that Google account. Please try again.");
        }
      } catch {
        setError('Network error — please check your connection and try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    const tryRender = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        initGoogleSignIn(handleCredential);
        renderGoogleButton(buttonContainerRef.current);
      } else {
        setTimeout(tryRender, 150);
      }
    };
    tryRender();

    return () => { cancelled = true; };
  }, [configured, onGoogleUnlock]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 dark:bg-[#0A0C10] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#1E212A] border border-slate-100 dark:border-slate-800 rounded-bento p-8 md:p-12 shadow-2xl relative overflow-hidden text-left">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

        {/* Playful Central Mascot Dialogue Greeting */}
        <div className="flex flex-col items-center gap-6 mb-8 select-none">
          <div className="relative">
            <div className="absolute w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-xl -top-1 left-1"></div>
            <ScienceBuddyMascot size={110} mood={error ? "sad" : isHelpMode ? "thinking" : "happy"} />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-3xl relative text-slate-600 dark:text-slate-300 text-xs font-bold text-center leading-relaxed max-w-xs shadow-md">
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-50 dark:border-b-slate-900"></div>
            {error ? (
              <span className="text-rose-500 dark:text-rose-400">{error}</span>
            ) : isHelpMode ? (
              <span>Ah, need a hand signing in? Let's sort it out! 🎒</span>
            ) : (
              <span>Psst! Sign in with your school Google account to unlock our full practice session space together! 🚀</span>
            )}
          </div>
        </div>

        {isHelpMode ? (
          <div className="space-y-6">
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/40">
              <h3 className="text-[10px] font-black text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider mb-1">SAS Students & Staff</h3>
              <p className="text-slate-650 dark:text-slate-355 text-xs leading-relaxed">
                Sign in with the Google account issued by your school (your @sas.edu.sg email). If the button doesn't respond, make sure you're already signed into that account in this browser.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-405 uppercase tracking-wider mb-1">Not an SAS Account?</h3>
              <p className="text-slate-650 dark:text-slate-355 text-xs leading-relaxed">
                Have your teacher contact Dr. Knuffke at <button onClick={() => setIsContactOpen(true)} className="text-indigo-600 dark:text-[#818CF8] font-bold hover:underline">davidknuffke.com/contact</button> to request access for your school's domain.
              </p>
            </div>

            <button
              onClick={() => setIsHelpMode(false)}
              className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-black text-slate-600 dark:text-slate-300 transition-all font-rounded"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {configured ? (
              <div className="flex flex-col items-center gap-3">
                <div ref={buttonContainerRef} className="min-h-[44px] flex items-center justify-center" />
                {isVerifying && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verifying...</p>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Google sign-in isn't configured yet. Contact your administrator.
                </p>
              </div>
            )}

            <button
              onClick={() => setIsHelpMode(true)}
              className="w-full text-indigo-600 dark:text-[#818CF8] text-xs font-black hover:underline transition-all text-center font-rounded"
            >
              Trouble signing in?
            </button>
          </div>
        )}

        {!isHelpMode && (
          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">EXPLORE WITHOUT SIGNING IN</p>

            {/* Public Access Links */}
            <div className="space-y-4">
              {onOpenSimulations && (
                <button
                  onClick={onOpenSimulations}
                  className="w-full btn-squishy bg-violet-600 hover:bg-violet-500 text-white dark:bg-violet-500/20 dark:text-violet-300 dark:border dark:border-violet-500/30 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  🧪 Explore Interactives (No Sign-In Required)
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
                <span className="text-[9px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">OR LEARN MORE</span>
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Other informational links */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-rounded">
                {onShowHowItWorks && (
                  <button onClick={onShowHowItWorks} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    How it Works
                  </button>
                )}
                {onOpenFeatures && (
                  <button onClick={onOpenFeatures} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    Features
                  </button>
                )}
                {onOpenTeachers && (
                  <button onClick={onOpenTeachers} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    For Teachers
                  </button>
                )}
                {onOpenSupport && (
                  <button onClick={onOpenSupport} className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                    Support
                  </button>
                )}
                {onOpenChangelog && (
                  <button onClick={onOpenChangelog} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    Changelog
                  </button>
                )}
                {onFeedback && (
                  <button onClick={() => setIsContactOpen(true)} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    Contact
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    </div>
  );
};

export default Gatekeeper;
```

---

## 11. Modify `App.tsx`

The auth state block currently sits around lines 266-313, and the `<Gatekeeper>` render call around lines 1563-1576. **Line numbers will drift as earlier edits in this same file land — locate by the code content shown, not by exact line number.**

### 11a. Replace the whole authentication state block

Find (this exact block):

```tsx
  // --- AUTHENTICATION STATE ---
  // Auth version - increment this when the authentication system changes
  // This forces all users to re-authenticate with the new system
  const AUTH_VERSION = 3; // Bumped for 2026-27 school year code rotation

  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    // Check if auth version matches - if not, clear stale data and force re-auth
    const storedVersion = localStorage.getItem('auth_version');
    if (storedVersion !== String(AUTH_VERSION)) {
      // Clear old auth data and update version
      localStorage.removeItem('classroom_code');
      localStorage.setItem('auth_version', String(AUTH_VERSION));
      return false;
    }
    // Check local storage on initial load
    return !!localStorage.getItem('classroom_code');
  });

  // Re-validate stored class code against the server on app load.
  // If the code is no longer valid (e.g. rotated for a new school year),
  // politely bounce the user back to the Gatekeeper.
  useEffect(() => {
    const storedCode = localStorage.getItem('classroom_code');
    if (!storedCode || !isAuthenticated) return;

    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: storedCode })
    })
      .then(res => {
        if (!res.ok) {
          // Code is no longer valid — clear it and bounce to Gatekeeper
          localStorage.removeItem('classroom_code');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // Network error — don't lock the user out, they may be offline
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnlock = (code: string) => {
    localStorage.setItem('classroom_code', code);
    localStorage.setItem('auth_version', String(AUTH_VERSION));
    setIsAuthenticated(true);
  };
```

Replace with:

```tsx
  // --- AUTHENTICATION STATE ---
  // Auth version - increment this when the authentication system changes
  // This forces all users to re-authenticate with the new system
  const AUTH_VERSION = 4; // Bumped: migrated from Classroom Code to Google OAuth sign-in

  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    // Check if auth version matches - if not, clear stale data and force re-auth
    const storedVersion = localStorage.getItem('auth_version');
    if (storedVersion !== String(AUTH_VERSION)) {
      // Clear old auth data and update version
      localStorage.removeItem('classroom_code');
      localStorage.removeItem('oauth_session');
      localStorage.setItem('auth_version', String(AUTH_VERSION));
      return false;
    }
    // Check local storage on initial load
    return !!localStorage.getItem('oauth_session');
  });

  // Re-validate the stored Google sign-in session against the server on app load.
  // If it's no longer valid (expired, or the account's domain was removed from
  // OAUTH_ALLOWED_DOMAINS), politely bounce the user back to the Gatekeeper.
  useEffect(() => {
    const storedSession = localStorage.getItem('oauth_session');
    if (!storedSession || !isAuthenticated) return;

    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oauthSession: storedSession })
    })
      .then(res => {
        if (!res.ok) {
          // Session is no longer valid — clear it and bounce to Gatekeeper
          localStorage.removeItem('oauth_session');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // Network error — don't lock the user out, they may be offline
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOAuthUnlock = (sessionToken: string) => {
    localStorage.setItem('oauth_session', sessionToken);
    localStorage.setItem('auth_version', String(AUTH_VERSION));
    setIsAuthenticated(true);
  };
```

(The `AUTH_VERSION` bump to 4 is deliberate and important: it forces every existing user — everyone currently unlocked via a stored class code — to hit the Gatekeeper again and sign in with Google. This is the exact mechanism this constant was built for.)

### 11b. Update the Gatekeeper render call

Find:

```tsx
      <Gatekeeper
        onUnlock={handleUnlock}
        onShowHowItWorks={() => setState(prev => ({ ...prev, view: 'how_it_works' }))}
```

Replace with:

```tsx
      <Gatekeeper
        onGoogleUnlock={handleOAuthUnlock}
        onShowHowItWorks={() => setState(prev => ({ ...prev, view: 'how_it_works' }))}
```

(The rest of that `<Gatekeeper ... />` call — `onOpenFeatures`, `onOpenTeachers`, `onOpenSupport`, `onFeedback`, `onOpenSimulations`, `onOpenChangelog` — is unchanged.)

---

## 12. Modify `services/ai/core.ts`

Find (inside `callAI`):

```ts
    // --- AUTHENTICATION ---
    const classCode = localStorage.getItem('classroom_code') || '';
```

and

```ts
      headers: {
        'Content-Type': 'application/json',
        'x-classroom-code': classCode
      },
```

Replace with:

```ts
    // --- AUTHENTICATION ---
    const oauthSession = localStorage.getItem('oauth_session') || '';
```

and

```ts
      headers: {
        'Content-Type': 'application/json',
        'x-oauth-session': oauthSession
      },
```

Nothing else in this file changes.

---

## 13. Modify `components/SettingsView.tsx`

Remove the "change your class code" sub-feature entirely — there's no class code to change anymore.

1. Delete these four state lines (currently ~lines 53-56):
   ```ts
   const [passcode, setPasscode] = useState(() => localStorage.getItem('classroom_code') || '');
   const [passcodeSuccess, setPasscodeSuccess] = useState(false);
   const [passcodeError, setPasscodeError] = useState(false);
   const [passcodeLoading, setPasscodeLoading] = useState(false);
   ```

2. Delete the `handleSavePasscode` function (currently ~lines 58-89):
   ```ts
   const handleSavePasscode = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!passcode.trim() || passcodeLoading) return;

     setPasscodeLoading(true);
     setPasscodeError(false);
     setPasscodeSuccess(false);

     try {
       const response = await fetch('/api/verify', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ code: passcode.trim() })
       });

       if (response.ok) {
         localStorage.setItem('classroom_code', passcode.trim());
         setPasscodeSuccess(true);
         setTimeout(() => setPasscodeSuccess(false), 2000);
       } else {
         setPasscodeError(true);
         setTimeout(() => setPasscodeError(false), 3000);
       }
     } catch {
       // Network error — save locally anyway (offline-friendly)
       localStorage.setItem('classroom_code', passcode.trim());
       setPasscodeSuccess(true);
       setTimeout(() => setPasscodeSuccess(false), 2000);
     } finally {
       setPasscodeLoading(false);
     }
   };
   ```

3. Delete the entire "Passcode / Access Key Management" JSX block (currently ~lines 165-208), from the opening comment through its closing `</div>`:
   ```tsx
   {/* Passcode / Access Key Management */}
   <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-6">
     ...
   </div>
   ```
   (This sits between the username-change `</form>` and the `{/* 2. COMPANION SELECTOR BAR */}` block — remove only this one `<div>` and its contents, leave its siblings untouched.)

4. After the above, run `npm run lint` and remove any import in this file that ESLint now flags as unused as a result of this deletion (e.g. `CheckCircle` was used both by the passcode "Updated!" state and possibly the username-save success state — check before removing; only drop an import if it truly has zero remaining usages in the file).

---

## 14. Delete `contexts/AuthContext.tsx`

This file duplicates the classroom-code auth logic but is **dead code** — confirmed via repo-wide grep that nothing imports `AuthProvider` or calls `useAuth()` anywhere; `App.tsx` has always managed auth state itself, independently. Since it exists solely to manage the concept being removed, delete the file outright rather than updating it.

---

## 15. New file: `.env.local.example`

This project doesn't currently have an example env file (unlike the sibling `ap-tutors-app` project, which does). Add one:

```
# Copy this file to .env.local and fill in your values.
# NEVER commit .env.local to git (it's already gitignored).

# Google Gemini API key — https://aistudio.google.com/
GEMINI_API_KEY=

# Google OAuth Client ID (Web application type — no client secret is used).
# Create one at: Google Cloud Console > APIs & Services > Credentials.
# Safe to expose client-side; must keep the VITE_ prefix so Vite bundles it
# into the frontend. The same value is also read server-side by api/auth-google.ts.
VITE_GOOGLE_CLIENT_ID=

# Comma-separated list of email domains allowed to sign in.
# Add more later by editing this value — no code changes needed.
OAUTH_ALLOWED_DOMAINS=sas.edu.sg

# Secret used to sign our own session tokens after a successful Google sign-in.
# Generate with: openssl rand -base64 32
# NEVER prefix this with VITE_ — it must stay server-only.
AUTH_SECRET=
```

---

## 16. Documentation updates

### `CLAUDE.md`

Apply these exact text replacements (all are current-state descriptions, not historical changelog entries — do not touch anything under existing dated changelog bullets, those are a historical record and stay as-is):

- `- **Security**: DOMPurify for XSS prevention, Classroom Code gatekeeper`
  → `- **Security**: DOMPurify for XSS prevention, Google OAuth (Workspace domain-restricted) gatekeeper`

- `- NEVER store PII in localStorage - only classroom codes allowed`
  → `- NEVER store PII in localStorage - the OAuth session token must contain only a verified email domain, never the user's email or name`

- `- [ ] **Gatekeeper Check**: Open incognito window → verify app blocks access until code entered`
  → `- [ ] **Gatekeeper Check**: Open incognito window → verify app blocks access until signed in with an approved Google account`

- `- [ ] **Data Hygiene**: Verify no PII stored in localStorage (only classroom codes)`
  → `- [ ] **Data Hygiene**: Verify no PII stored in localStorage (only an opaque OAuth session token containing a domain, no email/name)`

- `│   │   ├── Gatekeeper.tsx         # Class code authentication modal`
  → `│   │   ├── Gatekeeper.tsx         # Google OAuth sign-in modal`

- `- **Gatekeeper**: Classroom code required for access (check in incognito before commits)`
  → `- **Gatekeeper**: Google OAuth sign-in required for access, domain-restricted via \`OAUTH_ALLOWED_DOMAINS\` (check in incognito before commits)`

- `- **No PII**: Never collect names/emails - localStorage only stores classroom codes and badges`
  → `- **No PII**: Never collect names/emails - localStorage only stores an opaque OAuth session token (verified domain only) and badges`

Then, following this file's own pre-commit convention: add a new dated entry at the top of the changelog list under "Recent Changes" describing this migration (once implemented and verified working — write the entry to match what was *actually* built, not this plan), and bump the "Last Updated" section at the bottom with today's date.

### `DEVELOPER_GUIDE.md`

In section "10. Security & Gatekeeper", replace:

```
**API Authentication:**
*   The app now requires a **Classroom Code** to function.
*   **Frontend:** `Gatekeeper.tsx` blocks the UI until a code is entered.
*   **Backend:** The API Router (`api/gemini`) checks the `x-classroom-code` header.
*   **Local Dev:** You can set the code in your `.env` file as `CLASSROOM_CODE`.
```

with:

```
**API Authentication:**
*   The app requires **Google Sign-In** (Workspace domain-restricted) to function — see `docs/OAUTH_MIGRATION_PLAN.md` for the full design.
*   **Frontend:** `Gatekeeper.tsx` blocks the UI until the user signs in with an approved Google account.
*   **Login exchange:** `api/auth-google.ts` verifies the Google ID token and mints a signed session token (never containing email/name — only the verified domain).
*   **Backend:** The API Router (`api/gemini`) checks the `x-oauth-session` header on every request.
*   **Local Dev:** Requires the same real Google OAuth setup as production (`http://localhost:5173` must be an Authorized JavaScript origin in Google Cloud Console) — there is no code-based bypass for local development.
```

### `TESTING_GUIDE.md`

Replace the "🔐 0. Public Landing & Authentication" section's `### Gatekeeper Modal` subsection:

```
### Gatekeeper Modal
- [ ] **Open Modal:** Click "Enter Class Code" button on public landing.
    - [ ] Does the Gatekeeper modal appear centered with backdrop blur?
    - [ ] Can you close it with the X button or ESC key?
- [ ] **Authentication:** Enter a wrong code.
    - [ ] Does it show "Please enter a valid code"?
- [ ] **Unlock Flow:** Enter the correct code.
    - [ ] Does modal close and transition to **internal LandingPage** (dashboard)?
    - [ ] Does the app *remember* you if you refresh (stays authenticated)?
- [ ] **Authenticated User:** Close and reopen the browser.
    - [ ] Do authenticated users skip PublicLandingPage and go straight to internal dashboard?
```

with:

```
### Gatekeeper Modal
- [ ] **Open Modal:** Click "Sign In" button on public landing.
    - [ ] Does the Gatekeeper modal appear centered with backdrop blur?
    - [ ] Does the Google Sign-In button render? (If not, check `window.google` in devtools console — script load failure vs. missing `VITE_GOOGLE_CLIENT_ID`.)
- [ ] **Rejected domain:** Sign in with a personal Gmail (or any non-approved-domain) account.
    - [ ] Does it show a clear "not an approved school domain" message, not a generic error?
- [ ] **Unlock Flow:** Sign in with an approved-domain (e.g. `@sas.edu.sg`) account.
    - [ ] Does modal close and transition to **internal LandingPage** (dashboard)?
    - [ ] Inspect `localStorage` in devtools: is `oauth_session` present with no readable email/name in it?
    - [ ] Does the app *remember* you if you refresh (stays authenticated)?
    - [ ] Trigger any AI feature (e.g. generate a quiz) — does it succeed? (Network tab: `x-oauth-session` header present, `200` response.)
- [ ] **Authenticated User:** Close and reopen the browser.
    - [ ] Do authenticated users skip PublicLandingPage and go straight to internal dashboard?

**Known limitation:** the "wrong domain correctly blocked from calling the AI" case can only be fully verified against a deployed URL (Production or a URL where `isLocalDev` doesn't apply) — see `docs/OAUTH_MIGRATION_PLAN.md` §0.
```

### `README.md`

- Line: `**Science Practice** is a React/TypeScript SPA with AI-powered practice tools (require class code) and free interactive simulations (public access, no account needed).`
  → `**Science Practice** is a React/TypeScript SPA with AI-powered practice tools (require Google sign-in) and free interactive simulations (public access, no account needed).`

- Line: `**AI-Powered Tools (require class code):**`
  → `**AI-Powered Tools (require Google sign-in):**`

### `RELEASE_CHECKLIST.md`

Replace:
```
- [ ] **Gatekeeper (`Gatekeeper.tsx`):**
    - Open Incognito window -> Verify app blocks access until code is entered.
    - Verify invalid codes are rejected.
```
with:
```
- [ ] **Gatekeeper (`Gatekeeper.tsx`):**
    - Open Incognito window -> Verify app blocks access until signed in with Google.
    - Verify a non-approved-domain Google account is rejected with a clear message.
```

Replace:
```
- [ ] **Data Hygiene:**
    - Verify we are NOT storing student PII (Personally Identifiable Information) in local storage.
    - Verify `class_code` is the only auth token stored.
```
with:
```
- [ ] **Data Hygiene:**
    - Verify we are NOT storing student PII (Personally Identifiable Information) in local storage.
    - Verify `oauth_session` (an opaque token containing only a verified domain) is the only auth token stored.
```

### `QUICK_START_TESTING.md`

- `- Enter classroom code` (under "2. Launch App")
  → `- Sign in with an approved Google account (requires Google Cloud OAuth already configured — see docs/OAUTH_MIGRATION_PLAN.md §1)`

- `- Ensure classroom code entered correctly` (under "If Simulations Don't Load")
  → `- Ensure you're signed in with an approved Google account`

### `components/TeachersView.tsx` — flag for owner review, don't auto-rewrite the compliance claim

Around the "Classroom Integration" card, this paragraph currently exists:

```
Science Practice uses a simple, account-free <strong>Gatekeeper Access Code</strong> structure (default is <code ...>SAS</code>). Students enter the code once on their browser to unlock all Socratic, math, and CER tools without passwords or sign-ups, completely avoiding COPPA/FERPA data liabilities.
```

This makes a specific compliance claim ("account-free... completely avoiding COPPA/FERPA data liabilities") that becomes **factually wrong** once students sign in with real Google accounts. This needs new copy, but the COPPA/FERPA characterization is a legal-ish statement the project owner should approve rather than have an implementer invent. A reasonable technical draft (school-managed Google Workspace accounts, not new PII collection by this app, since the school already manages those accounts) is:

```
Science Practice uses <strong>Google Sign-In</strong>, restricted to your school's Google Workspace domain (e.g. <code ...>@sas.edu.sg</code>). Students sign in once per browser with their existing school-issued Google account to unlock all Socratic, math, and CER tools — no new passwords, no new accounts, and no student data is collected or stored by this app beyond a sign-in check.
```

**Do not ship this replacement copy without the project owner explicitly signing off on the compliance framing** — flag it as an open question rather than silently committing it.

### `components/PublicLandingPage.tsx`

- `{/* LEFT HALF - AI-Powered Tools (Requires Class Code) */}` → `{/* LEFT HALF - AI-Powered Tools (Requires Google Sign-In) */}`
- Button text `🔐 Enter Class Code` → `🔐 Sign In with Google`
- Button text `I don't have a code →` → `I don't have access yet →`
- Line `Explore science concepts hands-on with interactive visualizations. No class code required!` → `Explore science concepts hands-on with interactive visualizations. No sign-in required!`
- The `onOpenGatekeeper` prop name and both `onClick={onOpenGatekeeper}` call sites are unchanged — they still open the same Gatekeeper modal, just its contents changed.

### `components/ChangelogView.tsx`

Per the project owner's decision: **draft a new changelog entry for this migration once it's implemented and verified working**, following this file's existing format and its "always preserve existing user credits" rule (see the in-file format comment) — present it for review rather than committing it unreviewed. Do not touch any existing entries, including the historical one at ~line 793 describing the original classroom-code rollout — that's a historical record and stays as-is.

---

## 17. Full verification checklist (do all of this before considering the migration complete)

1. `npm run build` — must complete with no TypeScript/Vite errors.
2. `npm run lint` — fix any errors (warnings are acceptable per project convention).
3. Local (`npm run dev`), with Google OAuth already configured per §1:
   - Gatekeeper shows the Google button (not a code field).
   - Sign in with an approved-domain account → unlocks the app.
   - Refresh the page → still authenticated (silent `/api/verify` re-check passes).
   - Trigger an AI feature (e.g. generate a quiz) → succeeds; devtools Network tab shows `x-oauth-session` header on the `/api/gemini` request.
   - Inspect `localStorage` in devtools → `oauth_session` is present, `classroom_code` is absent (or, for a pre-migration browser profile, gets cleared on load by the `AUTH_VERSION` bump), and nothing resembling an email address or name appears anywhere in storage.
4. Deployed (Preview or Production, since local dev's `isLocalDev` bypass in the two Edge functions can mask negative cases):
   - Sign in with a personal Gmail / non-approved-domain account → rejected with the specific "not an approved school domain" message, not a generic error.
   - Simulations Hub and other public views (`how_it_works`, `features`, `support`, `teachers`, `reflection`, `changelog`) remain reachable with zero sign-in, unchanged.
5. Confirm `CLASSROOM_CODE` is no longer read anywhere (`grep -rn "CLASSROOM_CODE\|classroom_code\|x-classroom-code"` across the repo should return nothing outside historical changelog/doc entries you intentionally left alone). The `CLASSROOM_CODE` Vercel env var itself can be removed from the dashboard once you're confident the migration is stable — not required for the code to work, just cleanup.

---

## 18. Summary of files touched

**New:**
- `utils/jwt.ts`
- `utils/googleAuth.ts`
- `api/auth-google.ts`
- `.env.local.example`
- `docs/OAUTH_MIGRATION_PLAN.md` (this file)

**Rewritten:**
- `api/verify.ts`
- `api/gemini.ts`
- `vite.config.ts`
- `components/Gatekeeper.tsx`

**Modified (targeted edits):**
- `App.tsx`
- `services/ai/core.ts`
- `components/SettingsView.tsx`
- `components/PublicLandingPage.tsx`
- `package.json`
- `CLAUDE.md`
- `DEVELOPER_GUIDE.md`
- `TESTING_GUIDE.md`
- `README.md`
- `RELEASE_CHECKLIST.md`
- `QUICK_START_TESTING.md`

**Deleted:**
- `contexts/AuthContext.tsx`

**Flagged for owner review, not auto-applied:**
- `components/TeachersView.tsx` compliance copy (§16)
- `components/ChangelogView.tsx` new entry (§16)
